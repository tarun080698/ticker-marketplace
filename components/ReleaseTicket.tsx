import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useMutation } from "convex/react";
import { XCircle } from "lucide-react";
import { useState } from "react";

function ReleaseTicket({
  eventId,
  waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) {
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);

  const handleRelease = async () => {
    if (!confirm("are you sure you want to release your ticket offer?")) return;

    try {
      setIsReleasing(true);
      await releaseTicket({ eventId, waitingListId });
    } catch (error) {
      console.log("error releasing ticket: ", error);
    } finally {
      setIsReleasing(false);
    }
  };
  return (
    <button
      onClick={handleRelease}
      disabled={isReleasing}
      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-4 rounded-lg font-bold font-heading shadow-md hover:from-pink-500 hover:to-pink-400 transform hover:scale-105 transition-all duration-200 disabled:text-gray-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed cursor-pointer disabled:hover:scale-100 text-lg"
    >
      <XCircle className="w-4 h-4" />
      {isReleasing ? "Releasing..." : "Release Ticket Offer"}
    </button>
  );
}

export default ReleaseTicket;
