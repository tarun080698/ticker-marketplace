import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";
import { processQueue } from "./waitingList";
// import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

export type Metrics = {
  soldTickets: number;
  refundedTickets: number;
  cancelledTickets: number;
  revenue: number;
};

// Initialize rate limiter
// const rateLimiter = new RateLimiter(components.rateLimiter, {
//   queueJoin: {
//     kind: "fixed window",
//     rate: 3, // 3 joins allowed
//     period: 30 * MINUTE, // in 30 minutes
//   },
// });

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
    });
    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;

    // Get current event to check tickets sold
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    // Ensure new total tickets is not less than sold tickets
    if (updates.totalTickets < soldTickets.length) {
      throw new Error(
        `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(eventId, updates);
    return eventId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);

    if (!event) throw new Error("Event not found");

    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // ratelimitcheck
    // const status = await rateLimiter.limit(ctx, "queuejoin", { key: userId });
    // if (!status.ok) {
    //   throw new ConvexError(
    //     `You've joined the waiting list too many times. Please wait ${Math.ceil(status.retryAfter / (60 * 1000))} minutes befor trying again.`
    //   );
    // }

    // First check if user already has an active entry in waiting list for this event
    // Active means any status except EXPIRED
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    // Don't allow duplicate entries
    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Verify the event exists
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Check if there are any available tickets right now
    const { available } = await checkAvailability(ctx, { eventId });

    const now = Date.now();

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Schedule a job to expire this offer after the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId,
          eventId,
        }
      );
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? "Ticket offered - you have 15 minutes to purchase"
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    console.log("Purchase ticket", {
      eventId,
      userId,
      waitingListId,
      paymentInfo,
    });

    const waitingListEntry = await ctx.db.get(waitingListId);
    console.log("Waiting list entry", waitingListEntry);

    if (waitingListEntry?.status !== WAITING_LIST_STATUS.OFFERED) {
      console.error("Invalid waiting list status", { waitingListEntry });
      throw new Error("Ticket offer expired");
    }
    if (waitingListEntry.userId !== userId) {
      console.error("Invalid user", { waitingListEntry, userId });
      throw new Error("Invalid user");
    }

    const event = await ctx.db.get(eventId);
    console.log("Event", event);

    if (!event) {
      console.error("Event not found", { eventId });
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      console.error("Event is cancelled", { event });
      throw new Error("Event is cancelled");
    }

    try {
      console.log("Creating ticket with payemtns info", paymentInfo);
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount,
      });
      console.log("Ticket created");

      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });
      console.log("Waiting list entry updated");

      await processQueue(ctx, { eventId });

      console.log("Ticket purchased successfully");
    } catch (err) {
      console.error("Error purchasing ticket", err);
      throw new Error("Error purchasing ticket");
    }
  },
});

export const getUserTickets = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithevents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return { ...ticket, event };
      })
    );

    return ticketsWithevents;
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
      );
    });
  },
});

export const getSellerEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // For each event, get ticket sales data
    const eventsWithMetrics = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const validTickets = tickets.filter(
          (t) => t.status === "valid" || t.status === "used"
        );
        const refundedTickets = tickets.filter((t) => t.status === "refunded");
        const cancelledTickets = tickets.filter(
          (t) => t.status === "cancelled"
        );

        const metrics: Metrics = {
          soldTickets: validTickets.length,
          refundedTickets: refundedTickets.length,
          cancelledTickets: cancelledTickets.length,
          revenue: validTickets.length * event.price,
        };

        return {
          ...event,
          metrics,
        };
      })
    );

    return eventsWithMetrics;
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    if (tickets.length > 0) {
      throw new Error(
        "Cannot cancel event with active tickets. Please refund all tickets first."
      );
    }

    // Mark event as cancelled
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });

    // Delete any waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect();

    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});
