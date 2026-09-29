import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-purple-500/30 border-border/60 h-10 w-full min-w-0 rounded-xl border bg-background/80 px-3.5 py-1.5 text-sm shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
