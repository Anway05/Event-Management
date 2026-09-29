"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { createLocationSlug } from "@/lib/location-utils";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CATEGORIES } from "@/lib/data";
import Autoplay from "embla-carousel-autoplay";
import EventCard from "@/components/event-card";
import { EventItem } from "@/types";

export default function ExplorePage() {
  const router = useRouter();
  const plugin = useRef(Autoplay({ delay: 3500, stopOnInteraction: true }));

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
    api.explore.getFeaturedEvents,
    { limit: 3 }
  );

  const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
    api.explore.getEventsByLocation,
    {
      city: currentUser?.location?.city || "Kolkata",
      state: currentUser?.location?.state || "West Bengal",
      limit: 4,
    }
  );

  const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
    api.explore.getPopularEvents,
    { limit: 6 }
  );

  const { data: categoryCounts } = useConvexQuery(
    api.explore.getCategoryCounts
  );

  const handleEventClick = (slug: string) => {
    router.push(`/events/${slug}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explore/${categoryId}`);
  };

  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Kolkata";
    const state = currentUser?.location?.state || "West Bengal";
    const slug = createLocationSlug(city, state);
    router.push(`/explore/${slug}`);
  };

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="-mt-6 md:-mt-16 space-y-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/60 via-slate-900/80 to-pink-900/60 border border-purple-500/30 py-16 md:py-24 px-6 text-center overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="relative max-w-4xl mx-auto space-y-4">
          <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-1.5 text-xs font-semibold">
            Explore Experiences & Local Meetups
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover What&apos;s Happening <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Around You.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Find workshops, conferences, sports tournaments, and live music performances curated just for you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16 pb-16">
        {/* Featured Carousel */}
        {featuredEvents && (featuredEvents as EventItem[]).length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Highlights</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top-rated handpicked experiences</p>
            </div>
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {(featuredEvents as EventItem[]).map((event) => (
                  <CarouselItem key={event._id}>
                    <div
                      className="relative h-[420px] rounded-3xl overflow-hidden cursor-pointer group border border-border/50 shadow-xl"
                      onClick={() => handleEventClick(event.slug)}
                    >
                      {event.coverImage ? (
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          priority
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: event.themeColor || "#6b21a8" }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-6 md:p-10 space-y-3">
                        <Badge className="w-fit bg-background/80 backdrop-blur-md text-foreground border border-border/50 text-xs px-3 py-1">
                          <MapPin className="w-3 h-3 mr-1 text-pink-400" />
                          {event.city}, {event.state || event.country}
                        </Badge>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight line-clamp-1">
                          {event.title}
                        </h2>
                        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-border/50">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span>{format(event.startDate, "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-border/50">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span>{event.registrationCount} attending</span>
                          </div>
                          <Button size="sm" className="ml-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5">
                            View Event <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-background/80 backdrop-blur-md" />
              <CarouselNext className="right-4 bg-background/80 backdrop-blur-md" />
            </Carousel>
          </div>
        )}

        {/* Local Events */}
        {localEvents && (localEvents as EventItem[]).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Near You</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Events happening in {currentUser?.location?.city || "your region"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleViewLocalEvents} className="text-purple-400 hover:text-purple-300 text-xs font-semibold">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(localEvents as EventItem[]).map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  action="event"
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Filter events by what interests you most</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categoriesWithCounts.map((category) => (
              <Card
                key={category.id}
                className="bg-card/70 backdrop-blur-md hover:border-purple-500/50 cursor-pointer transition-all duration-300 group hover:-translate-y-1 rounded-2xl border-border/50"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-xs text-foreground group-hover:text-purple-400 transition-colors">
                      {category.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {category.count} Event{category.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Events */}
        {popularEvents && (popularEvents as EventItem[]).length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Popular Events</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Trending events with highest attendee interest</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(popularEvents as EventItem[]).map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  variant="list"
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
