"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full opacity-60">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-9 h-9 rounded-full border-border/50 bg-background/80 backdrop-blur-md hover:bg-accent transition-all duration-300 shadow-sm"
          aria-label="Select theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-purple-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 p-1.5 rounded-xl border border-border/60 bg-background/95 backdrop-blur-md shadow-xl">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              theme === "light"
                ? "bg-accent text-accent-foreground font-semibold"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-accent text-accent-foreground font-semibold"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-purple-400" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              theme === "system"
                ? "bg-accent text-accent-foreground font-semibold"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-blue-400" />
            <span>System</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
