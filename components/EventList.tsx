"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Spinner from "./Spinner";
import { CalendarDays, Ticket } from "lucide-react";
import EventCard from "./EventCard";

function EventList() {
  const events = useQuery(api.events.get);

  if (!events) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const upcomingEvents = events
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);
  const pastEvents = events
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8 p-2 rounded-md">
        <div>
          <div className="tracking-wide text-3xl font-semibold text-blue-500 font-heading">
            Upcoming events
          </div>
          <div className="mt-2 font-body text-xl">
            Discover & Book tickets for amazing events
          </div>
        </div>
        <div className="px-4 py-2 rounded-lg border border-blue-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold">
              {upcomingEvents?.length} Upcoming Events
            </span>
          </div>
        </div>
      </div>

      {/* upcoming events grid */}

      {upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} eventId={event._id} clickable={true} />
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-12 text-center mb-12 ">
          <Ticket className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <div className="font-heading text-xl text-blue-400 font-semibold">
            No Upcoming events
          </div>
          <div className="font-body text-blue-400">
            check back later for new events
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 p-2 rounded-md">
        <div>
          <div className="tracking-wide text-3xl font-semibold text-blue-500 font-heading">
            Past events
          </div>
          <div className="mt-2 font-body text-xl">
            Thanks for your amazing contribution to such fun events
          </div>
        </div>
        <div className="px-4 py-2 rounded-lg border border-blue-500">
          <div className="flex items-center gap-2 text-blue-500">
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold">
              {pastEvents?.length} Past Events
            </span>
          </div>
        </div>
      </div>

      {/* past events grid */}

      {/* upcoming events grid */}

      {pastEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pastEvents.map((event) => (
            <EventCard key={event._id} eventId={event._id} clickable={true} />
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-12 text-center mb-12 ">
          <Ticket className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <div className="font-heading text-xl text-blue-400 font-semibold">
            No events found.
          </div>
          <div className="font-body text-blue-400">
            check back later for new events
          </div>
        </div>
      )}
    </div>
  );
}

export default EventList;
