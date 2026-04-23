import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, variant = "outline", ...props }) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

  const variants = {
    outline:
      "bg-background/30 border-border/50 text-foreground backdrop-blur-sm",
  };

  return (
    <span
      data-slot="badge"
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}

export { Badge };


