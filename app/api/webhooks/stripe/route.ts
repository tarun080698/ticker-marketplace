import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";
import { StripeCheckoutMetaData } from "@/app/actions/createStripeCheckoutSession";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  console.log("Webhook received", signature ? "Present" : "Not present");

  let event: Stripe.Event;

  try {
    console.log("Trying web hook contruct event");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook event", event);
  } catch (err) {
    console.error("Stripe webhook error: ", { err });
    return new Response("Webhook Error", { status: 400 });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("Payment completed: checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as StripeCheckoutMetaData;
    console.log("Metadata", metadata);
    console.log("Convex", convex);

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          paymentIntentId: session.payment_intent as string,
          amount: (session.amount_total as number) ?? 0,
        },
      });

      console.log("Purchase ticket result", result);
    } catch (err) {
      console.log("Purchase ticket error", err);
      return new Response("Error processing webhook", { status: 500 });
    }
  }
  return new Response("Webhook received", { status: 200 });
}
