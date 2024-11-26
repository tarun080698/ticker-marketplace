"use server";

import { api } from "@/convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PULIC_CONVEX_URL) {
  throw new Error("CONVEX PUBLIC URL is not set");
}

const convex = new ConvexHttpClient(process.env.NEXT_PULIC_CONVEX_URL);

export async function createStripeConnectCustomer() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not logged in");

  const exisitingStripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId,
    }
  );

  if (exisitingStripeConnectId) return { account: exisitingStripeConnectId };

  const account = await stripe.accounts.create({
    type: "express",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
    userId,
    stripeConnectId: account.id,
  });

  return { account: account.id };
}
