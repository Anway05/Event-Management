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

const ExplorePage = () => {

  const router = useRouter();

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
    api.explore.getFeaturedEvents,
    { limit: 3 }
  );

  const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
    api.explore.getEventsByLocation,
    {
      city: currentUser?.city || "Kolkata",
      state: currentUser?.state || "West Bengal",
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

  const handleEventClick = (slug) => {
    router.push(`/events/${slug}`);
  };

  const handleCategoryClick = (categoryId) => {
    router.push(`/explore/${categoryId}`);
  };

  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Kolkata";
    const state = currentUser?.location?.state || "West Bengal";
    const slug = createLocationSlug(city, state);
    router.push(`/explore/${slug}`);
  };

  // Format categories with counts
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  // Loading state
  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="-mt-6 md:-mt-16">
      {/* Hero Section */}
      <div className="relative brand-gradient py-20 md:py-28 px-6 mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-1.5">
              Discover Amazing Events
            </Badge>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            Find Your Next<br />Experience
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Curated highlights, local happenings, and trending events across the country.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-20 pb-16">
      {/* Featured Carousel */}
      {featuredEvents && featuredEvents.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-2">Featured Events</h2>
            <p className="text-lg text-muted-foreground">Handpicked experiences you won't want to miss</p>
          </div>
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {featuredEvents.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    className="relative h-[500px] rounded-3xl overflow-hidden cursor-pointer group"
                    onClick={() => handleEventClick(event.slug)}
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={
                          event.themeColor?.startsWith("linear-gradient")
                            ? { backgroundImage: event.themeColor }
                            : { backgroundColor: event.themeColor || "#4f46e5" }
                        }
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                      <Badge className="w-fit mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.city}, {event.state || event.country}
                      </Badge>
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-md">
                        {event.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 text-white">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Calendar className="w-5 h-5" />
                          <span className="font-medium">
                            {format(event.startDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">
                            {event.registrationCount} registered
                          </span>
                        </div>
                        <Button variant="brand" size="lg" className="ml-auto">
                          View Event <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      )}

      {/* Local Events */}
      {localEvents && localEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">Events Near You</h2>
              <p className="text-lg text-muted-foreground">
                Happening in {currentUser?.location?.city || "your area"}
              </p>
            </div>
            <Button variant="brand" size="lg" className="gap-2" onClick={handleViewLocalEvents}>
              View All <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {localEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="compact"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Browse by Category */}
      <div>
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Browse by Category</h2>
          <p className="text-lg text-muted-foreground">Explore events tailored to your interests</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categoriesWithCounts.map((category) => (
            <Card
              key={category.id}
              className="glass group cursor-pointer hover:scale-105 transition-all duration-300 border-2 hover:border-purple-400/50"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:brand-text transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {category.count} Event{category.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Events Across Country */}
      {popularEvents && popularEvents.length > 0 && (
        <div>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Popular Across India</h2>
            <p className="text-lg text-muted-foreground">Trending events nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularEvents.map((event) => (
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

      {/* Empty State */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular &&
        (!featuredEvents || featuredEvents.length === 0) &&
        (!localEvents || localEvents.length === 0) &&
        (!popularEvents || popularEvents.length === 0) && (
          <Card className="glass p-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold">No events yet</h2>
              <p className="text-lg text-muted-foreground">
                Be the first to create an event in your area!
              </p>
              <Button variant="brand" size="lg" asChild className="gap-2">
                <a href="/create-event">
                  Create Event <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ExplorePage