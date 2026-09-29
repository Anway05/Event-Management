"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AIEventCreatorProps {
  onEventGenerated: (data: any) => void;
}

export default function AIEventCreator({ onEventGenerated }: AIEventCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateEvent = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your event");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      onEventGenerated(data);
      toast.success("Event details generated! Review and customize below.");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      toast.error("Failed to generate event. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl">
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Event Assistant
          </DialogTitle>
          <DialogDescription>
            Describe your event idea and let AI generate the title, description, and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: A tech meetup about React 19 for developers in Bangalore. It should cover new features like Actions and use hook improvements..."
            rows={5}
            className="resize-none rounded-xl"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={generateEvent}
              disabled={loading || !prompt.trim()}
              className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Details
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
