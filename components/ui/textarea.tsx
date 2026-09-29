import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "placeholder:text-muted-foreground border-border/60 flex min-h-[90px] w-full rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm shadow-xs transition-all duration-200 outline-none focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
