"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EventItem } from "@/types";

interface RegisterModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ event, isOpen, onClose }: RegisterModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await registerForEvent({
        eventId: event._id,
        attendeename: name,
        attendeeEmail: email,
      } as any);
      setIsSuccess(true);
      toast.success("Successfully registered for the event!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">You&apos;re Confirmed!</h2>
              <p className="text-xs text-muted-foreground">
                Your pass is saved in your Tickets. Show your QR code at entrance for check-in.
              </p>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl" onClick={handleViewTicket}>
                <Ticket className="w-4 h-4" />
                View My Ticket
              </Button>
              <Button variant="outline" className="w-full rounded-xl" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Register for Event</DialogTitle>
          <DialogDescription className="text-xs">
            Confirm your details to claim a pass for {event.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card/70 border border-border/60 p-4 rounded-xl space-y-1">
            <p className="font-semibold text-xs text-foreground line-clamp-1">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {event.ticketType === "free" ? (
                <span className="text-emerald-400 font-semibold">Free Registration</span>
              ) : (
                <span className="text-purple-400 font-semibold">
                  Price: ${event.ticketPrice} <span className="text-[10px] text-muted-foreground">(Pay at venue)</span>
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="text-xs rounded-xl"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            By registering, you confirm your attendance and agree to receive event updates.
          </p>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Confirm Pass
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
