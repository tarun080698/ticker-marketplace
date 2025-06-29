import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import React from "react";
import Spinner from "./Spinner";
import { WAITING_LIST_STATUS } from "../convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const { toast } = useToast();

  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  const userTicket = useQuery(api.tickets.getUserTickerForEvent, {
    eventId,
    userId,
  });
  const event = useQuery(api.events.getEventById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const isEventOwner = userId === event?.userId;

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result.success) {
        console.log("Successfully joined waiting list");
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast({
          variant: "destructive",
          title: "Wait for the queue to process",
          description: error.data,
          duration: 5000,
        });
      } else {
        console.error("Error joining waiting list: ", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong!",
          description: "Failed to join queue, please try again later.",
        });
      }
    }
  };

  if (queuePosition === undefined || availability === undefined || !event)
    return <Spinner />;

  if (userTicket) return null;

  const isPastEvent = event?.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition?.offerExpiresAt !== undefined &&
            queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
              <OctagonXIcon className="w-5 h-5" />
              <span>You cannot buy a ticket for your own event</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
              <Clock className="w-5 h-5" />
              <span>Event has ended</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-red-600">
                Sorry, this event is sold out
              </p>
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              disabled={isPastEvent || isEventOwner}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-4 rounded-lg font-bold font-heading shadow-md hover:from-pink-500 hover:to-pink-400 transform hover:scale-105 transition-all duration-200 disabled:text-gray-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed cursor-pointer disabled:hover:scale-100 text-lg"
            >
              Buy Ticket
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default JoinQueue;
