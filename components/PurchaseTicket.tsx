"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { off } from "process";
import { Ticket } from "lucide-react";
import ReleaseTicket from "./ReleaseTicket";

function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { user } = useUser();

  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes > 0)
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${seconds === 1 ? "" : "s"}`
        );
      else setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
    };

    calculateTimeRemaining();

    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

  // create stripe checkout
  const handlePurchase = async () => {};

  if (!user || !queuePosition || queuePosition?.status !== "offered")
    return null;
  return (
    <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-yellow-400">
      <div className="space-y-4">
        <div className="bg-yellow-50/70 rounded-lg p-3 border border-yellow-100 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="font-heading font-semibold text-xl">
                  Ticket Reserved
                </div>
                <div className="text-base text-yellow-500 animate-bounce duration-1000">
                  Expires in {timeRemaining}
                </div>
              </div>
            </div>

            <div className="text-sm font-light leading-relaxed">
              {" "}
              A ticket has been reserved for you. Complete your purchase before
              the timer expires to secure you spot at this event.
            </div>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={isExpired || isLoading}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-lg font-bold font-heading shadow-md hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 disabled:text-gray-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed cursor-pointer disabled:hover:scale-100 text-lg"
        >
          {isLoading ? "Redirecting to checkout..." : "Complete your purchase"}
        </button>

        <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
      </div>
    </div>
  );
}

export default PurchaseTicket;
