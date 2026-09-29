import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { format } from "date-fns";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RegistrationItem } from "@/types";

export function AttendeeCard({ registration }: { registration: RegistrationItem }) {
  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInWithQRCode
  );

  const handleManualCheckIn = async () => {
    try {
      const result = await checkInAttendee({ qrCode: registration.qrCode } as any);
      if (result.success) {
        toast.success("Attendee checked in successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  return (
    <Card className="py-0 border border-border/50 bg-card/70 backdrop-blur-md rounded-xl">
      <CardContent className="p-4 flex items-start gap-4">
        <div
          className={`mt-1 p-2 rounded-full ${
            registration.checkedIn ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
          }`}
        >
          {registration.checkedIn ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{registration.attendeeName}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {registration.attendeeEmail}
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span>
              {registration.checkedIn ? "⏰ Checked in" : "📅 Registered"}{" "}
              {registration.checkedIn && registration.checkedInAt
                ? format(registration.checkedInAt, "PPp")
                : format(registration.registeredAt, "PPp")}
            </span>
            <span className="font-mono text-purple-400">QR: {registration.qrCode}</span>
          </div>
        </div>

        {!registration.checkedIn && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualCheckIn}
            disabled={isLoading}
            className="gap-1.5 rounded-lg text-xs"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Check In
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
