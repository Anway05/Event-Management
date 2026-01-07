"use client"

import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid", // "grid" or "list"
  action = null, // "event" | "ticket" | null
  className = "",
}) {

    if(variant === "list"){
        return(
            <Card
                className={`py-0 group cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50 ${className}`}
        onClick={onClick}
        >
            <CardContent className="p-3 flex gap-3">
                {/* Event Image */}
                <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden relative">
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
                        style={{ backgroundColor: event.themeColor }}
                        >
                            {getCategoryIcon(event.category)}
                        </div>
                    )}
                </div>
                {/* Event Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">
              {format(event.startDate, "EEE, dd MMM, HH:mm")}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">
                {event.locationType === "online" ? "Online Event" : event.city}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{event.registrationCount} attending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Grid variant - modern overlay design
  return (
    <Card
      className={`overflow-hidden group pt-0 ${onClick ? "cursor-pointer transition-all hover:shadow-xl" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="relative h-56">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
            width={600}
            height={224}
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ backgroundColor: event.themeColor }}>
            {getCategoryIcon(event.category)}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-white text-xl font-semibold drop-shadow-md line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Calendar className="w-4 h-4" />
              <span>{format(event.startDate, "PPP")}</span>
              <span className="mx-2">•</span>
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {event.locationType === "online" ? "Online" : `${event.city}, ${event.state || event.country}`}
              </span>
            </div>
          </div>
          <Badge className="brand-gradient text-white">{event.ticketType === "free" ? "Free" : "Paid"}</Badge>
        </div>
      </div>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{event.registrationCount} / {event.capacity} registered</span>
        </div>

        {action && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="brand"
              size="sm"
              className="flex-1 gap-2"
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
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                {action === "event" ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
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
