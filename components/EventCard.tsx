"use client";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  BadgeCheck,
  Calendar,
  Check,
  CircleArrowRight,
  ClockAlert,
  Crown,
  DollarSign,
  LoaderCircle,
  MapPin,
  Ticket,
  XCircle,
} from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import PurchaseTicket from "./PurchaseTicket";

function EventCard({
  eventId,
  clickable = true,
}: {
  eventId: Id<"events">;
  clickable: boolean;
}) {
  const { user } = useUser();
  const router = useRouter();

  const event: Doc<"events"> | null | undefined = useQuery(
    api.events.getEventById,
    { eventId }
  );
  const availability = useQuery(api.events.getEventAvailability, { eventId });

  const userTicket: Doc<"tickets"> | null | undefined = useQuery(
    api.tickets.getUserTickerForEvent,
    {
      eventId,
      userId: user?.id ?? "",
    }
  );
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  const imageUrl =
    useStorageUrl(event?.imageStorageId) ??
    "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2023/03/31183929/Ww3Mdl8Cft88XSXhja8nLENrIVoxFEKqDaHwYPVb-972x597.jpeg";

  const isPastEvent = event?.eventDate ? event.eventDate < Date.now() : false;
  const isEventOwner = user?.id === event?.userId;

  const renderQueueposition = () => {
    if (!queuePosition || queuePosition?.status !== "waiting") return null;

    if (
      (availability?.purchasedCount ?? 0) >= (availability?.totalTickets ?? 0)
    ) {
      return (
        <div className="flex items-center justify-between gap-1 px-2 py-1 bg-pink-100/60 rounded-lg border border-pink-500 text-pink-500">
          <Ticket className="w-5 h-5" />
          <span>Event is sold out</span>
        </div>
      );
    }

    if (queuePosition?.position === 2) {
      return (
        <div className="w-full space-y-3 flex flex-col items-center justify-between px-2 py-1 bg-yellow-100 rounded-lg border border-yellow-500">
          <div className="flex items-center text-yellow-500 gap-1">
            <CircleArrowRight className="w-5 h-5 " />
            <span className="">
              you&apos;re net in line! (Queue position:{" "}
              {queuePosition?.position}
            </span>
          </div>
          <div className="flex items-center text-yellow-500">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            <span className="">waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between px-2 py-1 bg-blue-100 rounded-lg border border-blue-500">
        <div className="flex items-center text-blue-500">
          <LoaderCircle className="w-6 h-6 animate-spin duration-500" />
          &nbsp;<span>Queue Position</span>
        </div>
        <div className="bg-blue-100/60 text-blue-500 font-bold px-2 py-1 rounded-full">
          #{queuePosition?.position}
        </div>
      </div>
    );
  };
  const renderTicketStatus = () => {
    if (!user) return null;

    if (isEventOwner) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/events/${eventId}/edit`);
          }}
          className="z-50 text-blue-500 px-3 py-2 rounded-xl bg-white transition-colors duration-200 shadow-sm absolute top-2 right-2 group-hover:visible invisible"
        >
          Edit
        </button>
      );
    }

    if (userTicket) {
      return (
        <div className="z-50 w-full flex items-center justify-between px-2 py-1 bg-blue-50 rounded-lg border border-blue-500">
          <div className="flex items-center">
            {" "}
            <Check className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-lg font-body tracking-tighter">
              You have a ticket!
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tickets/${userTicket?._id}`);
            }}
            className="bg-blue-500 text-blue-200 px-2 py-1 rounded-xl"
          >
            View
          </button>
        </div>
      );
    }

    if (queuePosition) {
      return (
        <div>
          {queuePosition?.status === "offered" && (
            <PurchaseTicket eventId={eventId} />
          )}
          {renderQueueposition()}
          {queuePosition?.status === "expired" && (
            <div className="font-body flex justify-start items-center gap-1 px-2 py-1 bg-pink-100/60 rounded-lg border border-pink-500 text-pink-500 font-semibold">
              <XCircle className="w-5 h-5" /> <span>Offer Expired</span>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div
      onClick={() => clickable && router.push(`/event/${eventId}`)}
      className={`rounded-xl hover:shadow-2xl transition-all duration-500 hover:border-yellow-400 ${clickable && "cursor-pointer"} overflow-hidden relative ${isPastEvent ? "opacity-80" : ""} group `}
    >
      {/* Image banner */}
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={
              imageUrl ??
              "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2023/03/31183929/Ww3Mdl8Cft88XSXhja8nLENrIVoxFEKqDaHwYPVb-972x597.jpeg"
            }
            alt={event?.name ?? "event banner"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}

      {/* tags */}
      <div className="flex justify-start items-start px-2 gap-2 absolute top-0 left-0">
        {isEventOwner && (
          <span className="inline-flex items-center justify-center gap-1 font-heading px-2 p-1 text-sm text-pink-600 bg-pink-100 font-semibold rounded-lg mt-2">
            <Crown className="w-4 h-4" />
            Your Event
          </span>
        )}
        {(availability?.purchasedCount ?? 0) >=
          (availability?.totalTickets ?? 0) && (
          <span className="inline-flex items-center justify-center gap-1 font-heading px-2 py-1 text-sm bg-blue-100 text-blue-600 font-semibold rounded-lg mt-2">
            <BadgeCheck className="w-4 h-4" /> Sold Out
          </span>
        )}
      </div>

      {/* event name and price */}
      <div className={`p-2 lg:p-3 ${imageUrl ? "relative" : ""}`}>
        <div className="flex items-start justify-between gap-5">
          <div className="w-80 font-heading font-bold md:text-lg lg:text-xl !leading-8 overflow-hidden text-ellipsis max-w-[80%] line-clamp-2">
            {event?.name}
          </div>{" "}
          <div
            className={`inline-flex items-center justify-center font-heading px-1 py-[2px] font-bold rounded-xl text-lg ${isPastEvent ? "bg-gray-100/70 text-gray-500" : "bg-green-100/90 text-green-500"}`}
          >
            <DollarSign className="w-4 h-4 font-bold" />
            {event?.price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* event details */}

      <div className="flex flex-col items-start justify-start space-y-3 px-4 py-2">
        <div
          className={`inline-flex items-center justify-center gap-2 font-body font-semibold`}
        >
          <MapPin className="w-4 h-4" /> {event?.location}
        </div>
        <div
          className={`inline-flex items-center justify-center gap-2 font-body font-semibold`}
        >
          <Calendar className="w-4 h-4" />{" "}
          <span>
            {event?.eventDate
              ? new Date(event.eventDate).toLocaleDateString()
              : "TBD"}{" "}
            {isPastEvent && "(Ended)"}
          </span>
        </div>
        <div
          className={`inline-flex items-center justify-center gap-2 font-bodyfont-semibold`}
        >
          <Ticket className="w-4 h-4" />{" "}
          {(availability?.totalTickets ?? 0) -
            (availability?.purchasedCount ?? 0)}
          /{event?.totalTickets} available{" "}
        </div>

        {!isPastEvent && (availability?.activeOffers ?? 0) > 0 && (
          <div className="w-full bg-yellow-200 text-pink-500 inline-flex items-center justify-start gap-1 font-body px-2 animate-pulse duration-700 py-1 font-bold rounded-lg">
            <ClockAlert className="w-4 h-4  text-pink-500" />
            {availability?.activeOffers}{" "}
            {availability?.activeOffers === 1 ? "person" : "people"} trying to
            buy
          </div>
        )}

        {/* event description */}

        {clickable && (
          <div className="line-clamp-2 font-body text-sm overflow-hidden text-ellipsis">
            {event?.description}
          </div>
        )}

        {/* edit event */}
        {renderTicketStatus()}

        {/* view your ticket */}
      </div>
    </div>
  );
}

export default EventCard;
