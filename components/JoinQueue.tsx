import { Id } from "@/convex/_generated/dataModel";
import React from "react";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: Id<"users">;
}) {
  return <div>JoinQueue</div>;
}

export default JoinQueue;
