import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full border border-panel-border bg-input px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-foreground placeholder:text-text-dim placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus-visible:outline-none focus-visible:border-cyan focus-visible:ring-1 focus-visible:ring-cyan focus-visible:shadow-[0_0_10px_rgb(0_240_255/0.3)] disabled:cursor-not-allowed disabled:opacity-50 rounded-[2px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
