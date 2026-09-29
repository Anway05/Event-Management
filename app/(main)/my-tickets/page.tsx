"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Loader2, Ticket } from "lucide-react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import EventCard from "@/components/event-card";
import { RegistrationItem } from "@/types";

export default function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<RegistrationItem | null>(null);
  const [localRegistrations, setLocalRegistrations] = useState<RegistrationItem[] | null>(null);

  const { data: registrations, isLoading } = useConvexQuery(
    api.registrations.getMyRegistrations
  );

  const { mutate: cancelRegistration } = useConvexMutation(
    api.registrations.cancelRegistrations
  );

  useEffect(() => {
    if (registrations) {
      setLocalRegistrations(registrations);
    }
  }, [registrations]);

  const handleCancelRegistration = async (registrationId: any) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      setLocalRegistrations((prev) =>
        prev
          ? prev.map((reg) =>
              reg._id === registrationId
                ? { ...reg, status: "cancelled" }
                : reg
            )
          : null
      );

      await cancelRegistration({ registrationId } as any);
      toast.success("Registration cancelled successfully!");
    } catch (error: any) {
      setLocalRegistrations(registrations);
      toast.error(error.message || "Failed to cancel registration.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const now = Date.now();
  const displayRegistrations: RegistrationItem[] = localRegistrations || registrations || [];

  const upcomingTickets = displayRegistrations.filter(
    (reg) =>
      reg.event && reg.event.startDate >= now && reg.status === "confirmed"
  );

  const pastTickets = displayRegistrations.filter(
    (reg) =>
      reg.event && (reg.event.startDate < now || reg.status === "cancelled")
  );

  return (
    <div className="min-h-screen pb-20 px-4 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">My Tickets</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          View your confirmed passes, show QR code for check-in, or manage registrations
        </p>
      </div>

      {/* Upcoming Tickets */}
      {upcomingTickets?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Upcoming Passes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTickets.map((registration) => (
              <EventCard
                key={registration._id}
                event={registration.event!}
                action="ticket"
                onClick={() => setSelectedTicket(registration)}
                onDelete={() => handleCancelRegistration(registration._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past / Cancelled Tickets */}
      {pastTickets?.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold tracking-tight text-muted-foreground">Past & Cancelled Passes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastTickets.map((registration) => (
              <div key={registration._id} className="relative">
                <EventCard
                  event={registration.event!}
                  action={null}
                  className="opacity-50"
                />
                {registration.status === "cancelled" && (
                  <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Cancelled
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!upcomingTickets?.length && !pastTickets?.length && (
        <Card className="p-12 text-center border-dashed border-border/60 bg-card/40 backdrop-blur-md">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">No tickets found</h2>
            <p className="text-xs text-muted-foreground">
              You haven't registered for any events yet. Explore upcoming events around you.
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
              <Link href="/explore">
                <Ticket className="w-4 h-4 mr-2" /> Browse Events
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <Dialog
          open={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
        >
          <DialogContent className="sm:max-w-md border-border/60 bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Event Entry Ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="text-center space-y-1">
                <p className="font-bold text-base text-foreground">
                  {selectedTicket.attendeeName}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {selectedTicket.event?.title}
                </p>
              </div>

              <div className="flex justify-center p-6 bg-white rounded-2xl shadow-inner border">
                <QRCode value={selectedTicket.qrCode} size={190} level="H" />
              </div>

              <div className="text-center bg-accent/40 p-2.5 rounded-xl border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">TICKET ID</p>
                <p className="font-mono text-xs font-bold text-purple-400">{selectedTicket.qrCode}</p>
              </div>

              <div className="bg-card p-4 rounded-xl space-y-2 text-xs border border-border/60">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>
                    {selectedTicket.event?.startDate && format(selectedTicket.event.startDate, "PPP, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  <span>
                    {selectedTicket.event?.locationType === "online"
                      ? "Online Event"
                      : `${selectedTicket.event?.city}, ${
                          selectedTicket.event?.state || selectedTicket.event?.country
                        }`}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Present this QR code at the event entrance for instant scan check-in
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
