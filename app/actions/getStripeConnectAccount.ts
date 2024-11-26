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

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId,
    }
  );

  return { stripeConnectId: stripeConnectId };
}
