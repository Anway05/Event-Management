"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import RegisterModal from "./_components/register-modal";

// Utility function to darken a color
function darkenColor(color, amount) {
  const colorWithoutHash = color.replace("#", "");
  const num = parseInt(colorWithoutHash, 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount * 255);
  const b = Math.max(0, (num & 0x0000ff) - amount * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function isGradient(val) {
  return typeof val === "string" && val.startsWith("linear-gradient");
}
function isHex(val) {
  return typeof val === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val);
}

export default function EventDetailsPage(){
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    //Fetch event details
    const { data: event, isLoading } = useConvexQuery(
        api.events.getEventBySlug,
        { slug: params.slug }
    );

    // Get current user from Convex to check organizer status
    const { data: currentUser } = useConvexQuery(api.users.getCurrentUser, {});

    // Check if user is already registered for the event
    const { data: registration } = useConvexQuery(
        api.registrations.checkRegistration,
        event?._id ? { eventId: event._id } : "skip"
    );

    // Derived flags
    const now = Date.now();
    const isEventPast = event?.endDate ? event.endDate < now : false;
    const isEventFull = event ? event.registrationCount >= event.capacity : false;
    const isOrganizer = event && currentUser ? event.organizerId === currentUser._id : false;

    if (!isLoading && !event) {
        return notFound();
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!event) {
        return null;
    }

    const handleShare = async () => {
        const url = window.location.href;
        if(navigator.share){
            try {
                await navigator.share({
                    title: event.title,
                    text: event.description.slice(0, 100) + "...",
                    url: url,
                });
            } catch (error) {
                // User cancelled or error occurred
                console.error("Error sharing:", error);
            }
        } else{
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleRegister = () => {
        if(!user){
            toast.error("Please sign in to register for the event.");
            return;
        }
        setShowRegisterModal(true);
    }

    return(
<div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden group">
        {event.coverImage ? (
          <Image src={event.coverImage} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
        ) : (
          <div className="absolute inset-0" style={isGradient(event.themeColor) ? { backgroundImage: event.themeColor } : { backgroundColor: event.themeColor }} />
        )}
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="px-4 md:px-12 py-6 md:py-12 space-y-3 md:space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="brand-gradient text-white text-sm px-4 py-1.5 border-0">
                {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
              </Badge>
              {event.ticketType === "free" && (
                <Badge className="bg-green-500/80 text-white text-sm px-4 py-1.5 border-0">
                  Free Entry
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/90 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">{format(event.startDate, "EEEE, MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">
                  {format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 -mt-16 md:-mt-24 relative z-10">
        {/* Content */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 md:gap-12">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Description */}
            <Card className="pt-0 glass border border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
              <CardContent className="pt-8 space-y-4">
                <h2 className="text-3xl font-bold">About This Event</h2>
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="pt-0 glass border border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
              <CardContent className="pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Location</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">City</p>
                    <p className="text-lg font-semibold">
                      {event.city}, {event.state || event.country}
                    </p>
                  </div>
                  {event.address && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p className="text-base">
                        {event.address}
                      </p>
                    </div>
                  )}
                  {event.venue && (
                    <Button variant="outline" asChild className="gap-2 w-full">
                      <a
                        href={event.venue}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Map
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card className="pt-0 glass border border-white/10 backdrop-blur-xl hover:border-white/20 transition-colors">
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold mb-6">Event Organizer</h2>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Avatar className="w-16 h-16 border-2 border-purple-500/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                      {event.organizerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{event.organizerName}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration Card */}
          <div className="lg:sticky lg:top-32 h-fit space-y-6">
            {/* Main CTA Card */}
            <Card className="overflow-hidden glass border border-white/10 backdrop-blur-xl shadow-2xl">
              <div 
                className="h-2 w-full" 
                style={isGradient(event.themeColor) ? { backgroundImage: event.themeColor } : { backgroundColor: event.themeColor }}
              />
              <CardContent className="p-8 space-y-6">
                {/* Price Section */}
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">TICKET PRICE</p>
                  <p className="text-4xl font-bold">
                    {event.ticketType === "free"
                      ? "Free"
                      : `₹${event.ticketPrice}`}
                  </p>
                  {event.ticketType === "paid" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💳 Pay at event (offline)
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Attendees</div>
                    <div className="text-xl font-bold">{event.registrationCount}</div>
                    <div className="text-xs text-muted-foreground">of {event.capacity}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Capacity</div>
                    <div className="text-xl font-bold">{Math.round((event.registrationCount / event.capacity) * 100)}%</div>
                    <div className="text-xs text-muted-foreground">filled</div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date</span>
                    </div>
                    <span className="font-semibold">{format(event.startDate, "MMM dd")}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                    <span className="font-semibold">{format(event.startDate, "h:mm a")}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-semibold">{event.registrationCount}/{event.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full brand-gradient rounded-full transition-all duration-500"
                      style={{ width: `${(event.registrationCount / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Registration Button */}
                {registration ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-4 rounded-lg border border-green-200 dark:border-green-500/30">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">You&apos;re Registered!</span>
                    </div>
                    <Button
                      variant="brand"
                      size="lg"
                      className="w-full gap-2 text-base font-semibold"
                      onClick={() => router.push("/my-tickets")}
                    >
                      <Ticket className="w-5 h-5" />
                      View Your Ticket
                    </Button>
                  </div>
                ) : isEventPast ? (
                  <Button variant="outline" size="lg" className="w-full" disabled>
                    Event Ended
                  </Button>
                ) : isEventFull ? (
                  <Button variant="outline" size="lg" className="w-full" disabled>
                    Event Full
                  </Button>
                ) : isOrganizer ? (
                  <Button
                    variant="brand"
                    size="lg"
                    className="w-full text-base font-semibold"
                    onClick={() => router.push(`/events/${event.slug}/manage`)}
                  >
                    Manage Event
                  </Button>
                ) : (
                  <Button variant="brand" size="lg" className="w-full text-base font-semibold gap-2" onClick={handleRegister}>
                    <Ticket className="w-5 h-5" />
                    Register Now
                  </Button>
                )}

                {/* Share Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 text-base"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          event={event}
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}