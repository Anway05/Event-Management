"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@clerk/nextjs";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "limit" | "header" | "color" | string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  trigger = "limit",
}: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            {trigger === "header" && "Create Unlimited Events with Pro! "}
            {trigger === "limit" && "You've reached your free event limit. "}
            {trigger === "color" && "Custom theme colors are a Pro feature. "}
            Unlock unlimited events and premium features!
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Cards */}
        <PricingTable
          checkoutProps={{
            appearance: {
              elements: {
                drawerRoot: {
                  zIndex: 2000,
                },
              },
            },
          }}
        />

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
