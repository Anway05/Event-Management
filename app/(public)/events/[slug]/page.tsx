"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  Ticket,
  ExternalLink,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import RegisterModal from "./_components/register-modal";
import { EventItem } from "@/types";

function isGradient(val: any) {
  return typeof val === "string" && val.startsWith("linear-gradient");
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const slug = params.slug as string;

  const { data: event, isLoading } = useConvexQuery(
    api.events.getEventBySlug,
    { slug }
  );

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const { data: registration } = useConvexQuery(
    api.registrations.checkRegistration,
    event?._id ? ({ eventId: event._id } as any) : "skip"
  );

  const now = Date.now();
  const isEventPast = event?.endDate ? event.endDate < now : false;
  const isEventFull = event ? event.registrationCount >= event.capacity : false;
  const isOrganizer = event && currentUser ? event.organizerId === currentUser._id : false;

  if (!isLoading && !event) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const typedEvent = event as EventItem;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: typedEvent.title,
          text: typedEvent.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register for the event.");
      return;
    }
    setShowRegisterModal(true);
  };

  return (
    <div className="min-h-screen bg-background space-y-8 -mt-6 md:-mt-12 pb-20">
      {/* Hero Banner */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
        {typedEvent.coverImage ? (
          <Image
            src={typedEvent.coverImage}
            alt={typedEvent.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={
              isGradient(typedEvent.themeColor)
                ? { backgroundImage: typedEvent.themeColor }
                : { backgroundColor: typedEvent.themeColor || "#7e22ce" }
            }
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-background/80 backdrop-blur-md text-foreground border border-border/50 text-xs px-3 py-1">
              <span className="mr-1">{getCategoryIcon(typedEvent.category)}</span>
              {getCategoryLabel(typedEvent.category)}
            </Badge>
            {typedEvent.ticketType === "free" && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1">
                Free Pass
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight drop-shadow-md leading-tight">
            {typedEvent.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/50">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{format(typedEvent.startDate, "EEEE, MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/50">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>
                {format(typedEvent.startDate, "h:mm a")} - {format(typedEvent.endDate, "h:mm a")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-6">
            <CardContent className="space-y-4 p-0">
              <h2 className="text-xl font-bold tracking-tight text-foreground">About This Event</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {typedEvent.description}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-6">
            <CardContent className="space-y-4 p-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Location</h2>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">City & State</p>
                  <p className="font-semibold text-sm text-foreground">
                    {typedEvent.city}, {typedEvent.state || typedEvent.country}
                  </p>
                </div>
                {typedEvent.address && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Venue Address</p>
                    <p className="text-foreground">{typedEvent.address}</p>
                  </div>
                )}
                {typedEvent.venue && (
                  <Button variant="outline" asChild className="gap-2 w-full mt-2 text-xs rounded-xl">
                    <a href={typedEvent.venue} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      View Map & Directions
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl p-6">
            <CardContent className="space-y-4 p-0">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Event Organizer</h2>
              <div className="flex items-center gap-4 p-4 bg-accent/40 rounded-xl border border-border/40">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback>{typedEvent.organizerName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-foreground">{typedEvent.organizerName}</p>
                  <p className="text-xs text-muted-foreground">Host & Community Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right CTA Card */}
        <div className="space-y-6">
          <Card className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Price</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                {typedEvent.ticketType === "free" ? "Free" : `$${typedEvent.ticketPrice}`}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attending</span>
                <span className="font-semibold text-foreground">
                  {typedEvent.registrationCount} / {typedEvent.capacity}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (typedEvent.registrationCount / typedEvent.capacity) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {registration ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>You hold a confirmed pass!</span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-semibold shadow-md"
                    onClick={() => router.push("/my-tickets")}
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    View Ticket Pass
                  </Button>
                </div>
              ) : isEventPast ? (
                <Button variant="outline" size="lg" className="w-full rounded-xl" disabled>
                  Event Ended
                </Button>
              ) : isEventFull ? (
                <Button variant="outline" size="lg" className="w-full rounded-xl" disabled>
                  Event Full
                </Button>
              ) : isOrganizer ? (
                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold"
                  onClick={() => router.push(`/my-events/${typedEvent._id}`)}
                >
                  Manage Event Dashboard
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20"
                  onClick={handleRegister}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Claim Pass Now
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 text-xs rounded-xl border-border/60"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share Event
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {showRegisterModal && (
        <RegisterModal
          event={typedEvent}
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}
