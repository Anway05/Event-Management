"use client";

import { useRouter } from "next/navigation";
import { Plus, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EventCard from "@/components/event-card";
import { EventItem } from "@/types";

export default function MyEventsPage() {
  const router = useRouter();

  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents);
  const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);

  const handleDelete = async (eventId: any) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
      await deleteEvent({ eventId } as any);
      toast.success("Event deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/my-events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">My Hosted Events</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage ticket sales, check-in attendees, and track event stats
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-5">
          <Link href="/create-event">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/60 bg-card/40 backdrop-blur-md">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">No events created yet</h2>
            <p className="text-xs text-muted-foreground">
              Host your first virtual or physical event and start building your audience.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              <Link href="/create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events as EventItem[]).map((event) => (
            <EventCard
              key={event._id}
              event={event}
              action="event"
              onClick={() => handleEventClick(event._id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
