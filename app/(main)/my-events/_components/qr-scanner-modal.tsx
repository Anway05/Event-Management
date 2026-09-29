"use client";

import { useState, useEffect } from "react";
import { QrCode, Loader2 } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [scannerReady, setScannerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: checkInAttendee } = useConvexMutation(
    api.registrations.checkInWithQRCode
  );

  const handleCheckIn = async (qrCode: string) => {
    try {
      const result = await checkInAttendee({ qrCode } as any);

      if (result.success) {
        toast.success("✅ Check-in successful!");
        onClose();
      } else {
        toast.error(result.message || "Check-in failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid QR code");
    }
  };

  useEffect(() => {
    let scanner: any = null;
    let mounted = true;

    const initScanner = async () => {
      if (!isOpen) return;

      try {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (permError) {
          setError("Camera permission denied. Please enable camera access.");
          return;
        }

        const { Html5QrcodeScanner } = await import("html5-qrcode");

        if (!mounted) return;

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            videoConstraints: {
              facingMode: "environment",
            },
          },
          false
        );

        const onScanSuccess = (decodedText: string) => {
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          handleCheckIn(decodedText);
        };

        const onScanError = (err: any) => {
          if (err && typeof err === "string" && !err.includes("NotFoundException")) {
            console.debug("Scan error:", err);
          }
        };

        scanner.render(onScanSuccess, onScanError);
        setScannerReady(true);
        setError(null);
      } catch (error: any) {
        setError(`Failed to start camera: ${error.message}`);
        toast.error("Camera failed. Please use manual entry.");
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scanner) {
        scanner.clear().catch(console.error);
      }
      setScannerReady(false);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <QrCode className="w-5 h-5 text-purple-500" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription className="text-xs">
            Scan attendee ticket QR code with camera
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="text-red-400 text-xs p-4 bg-red-500/10 rounded-xl border border-red-500/20">{error}</div>
        ) : (
          <>
            <div
              id="qr-reader"
              className="w-full rounded-2xl overflow-hidden border border-border/50"
              style={{ minHeight: "320px" }}
            ></div>
            {!scannerReady && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Starting camera feed...
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {scannerReady
                ? "Position ticket QR code within camera frame"
                : "Please allow camera access when prompted"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
