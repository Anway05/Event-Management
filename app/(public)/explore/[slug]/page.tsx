"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/lib/data";
import { parseLocationSlug } from "@/lib/location-utils";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/event-card";
import { EventItem } from "@/types";

export default function DynamicExplorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;

  const { city, state, isValid } = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

  if (!isCategory && !isValid) {
    notFound();
  }

  const { data: events, isLoading } = useConvexQuery(
    isCategory
      ? api.explore.getEventsByCategory
      : api.explore.getEventsByLocation,
    isCategory
      ? ({ category: slug, limit: 50 } as any)
      : city && state
        ? ({ city, state, limit: 50 } as any)
        : "skip"
  );

  const handleEventClick = (eventSlug: string) => {
    router.push(`/events/${eventSlug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isCategory && categoryInfo) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b border-border/40 pb-6">
          <div className="text-5xl shrink-0 p-3 bg-card/60 rounded-2xl border border-border/50 shadow-md">
            {categoryInfo.icon}
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {categoryInfo.label}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {categoryInfo.description}
            </p>
            {events && (
              <p className="text-xs font-semibold text-purple-400 mt-2">
                {(events as EventItem[]).length} event{(events as EventItem[]).length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>

        {events && (events as EventItem[]).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(events as EventItem[]).map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No upcoming events found in this category right now.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border/40 pb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl">📍</div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Events in {city}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{state}, India</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Badge variant="secondary" className="gap-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <MapPin className="w-3.5 h-3.5" />
            {city}, {state}
          </Badge>
          {events && (
            <p className="text-xs text-muted-foreground font-medium">
              {(events as EventItem[]).length} event{(events as EventItem[]).length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {events && (events as EventItem[]).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events as EventItem[]).map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No events in {city}, {state} yet. Check back soon or create your own event!
        </div>
      )}
    </div>
  );
}
