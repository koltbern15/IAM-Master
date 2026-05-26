import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-1 focus:ring-cyan rounded-full",
  {
    variants: {
      variant: {
        default: "border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_8px_rgb(0_240_255/0.2)]",
        secondary: "border-panel-border bg-card text-text-muted",
        destructive: "border-threat/60 bg-threat/15 text-threat",
        warning: "border-warn/60 bg-warn/15 text-warn",
        outline: "border-panel-border text-foreground"
      }
    },
    defaultVariants: { variant: "default" }
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
