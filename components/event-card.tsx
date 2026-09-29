"use client";

import React from "react";
import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye, Share2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventItem } from "@/types";
import { toast } from "sonner";

interface EventCardProps {
  event: EventItem;
  onClick?: (e?: React.MouseEvent) => void;
  onDelete?: (id: any) => void;
  variant?: "grid" | "list";
  action?: "event" | "ticket" | null;
  className?: string;
}

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid",
  action = null,
  className = "",
}: EventCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on Nova Events!`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  const isSoldOut = event.capacity > 0 && event.registrationCount >= event.capacity;
  const isSellingFast = !isSoldOut && event.capacity > 0 && event.registrationCount / event.capacity >= 0.75;

  if (variant === "list") {
    return (
      <Card
        className={`py-0 group cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-purple-500/50 bg-card/80 backdrop-blur-md rounded-xl ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-3.5 flex gap-3.5 items-center">
          {/* Event Image */}
          <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden relative shadow-sm group-hover:scale-105 transition-transform duration-300">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl"
                style={{ backgroundColor: event.themeColor || "#9333ea" }}
              >
                {getCategoryIcon(event.category)}
              </div>
            )}
          </div>
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-purple-500/30 text-purple-400">
                {getCategoryLabel(event.category)}
              </Badge>
              {isSellingFast && (
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0">
                  Selling Fast
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {format(event.startDate, "EEE, dd MMM")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                <span className="line-clamp-1">
                  {event.locationType === "online" ? "Online" : event.city}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant - modern glassmorphic card design
  return (
    <Card
      className={`overflow-hidden group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="relative h-52 w-full overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundColor: event.themeColor || "#7e22ce" }}
          >
            {getCategoryIcon(event.category)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <Badge className="bg-background/80 backdrop-blur-md text-foreground border border-border/50 shadow-md font-medium text-xs px-2.5 py-1">
            <span className="mr-1.5">{getCategoryIcon(event.category)}</span>
            {getCategoryLabel(event.category)}
          </Badge>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-md"
              title="Share event"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md font-semibold text-xs px-3 py-1">
              {event.ticketType === "free" ? "Free" : `$${event.ticketPrice ?? 0}`}
            </Badge>
          </div>
        </div>

        {/* Bottom Floating Details */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-foreground text-lg font-bold drop-shadow-sm line-clamp-1 group-hover:text-purple-400 transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{format(event.startDate, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span className="line-clamp-1">
                {event.locationType === "online"
                  ? "Online Event"
                  : `${event.city || ""}${event.state ? `, ${event.state}` : ""}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {event.registrationCount} / {event.capacity} attending
            </span>
          </div>

          {isSoldOut ? (
            <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">
              Sold Out
            </Badge>
          ) : isSellingFast ? (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
              Almost Full
            </Badge>
          ) : (
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Spots Open
            </span>
          )}
        </div>

        {action && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
              }}
            >
              {action === "event" ? (
                <>
                  <Eye className="w-4 h-4" />
                  View Details
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Show Ticket
                </>
              )}
            </Button>

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                {action === "event" ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
