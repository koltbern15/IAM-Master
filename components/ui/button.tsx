import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-medium uppercase tracking-[0.1em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-cyan/60 bg-cyan/10 text-cyan shadow-[0_0_12px_rgb(0_240_255/0.25)] hover:bg-cyan/20 hover:shadow-[0_0_18px_rgb(0_240_255/0.45)]",
        outline:
          "border border-cyan/30 bg-transparent text-foreground hover:border-cyan/60 hover:text-cyan",
        ghost:
          "border border-transparent bg-transparent text-text-muted hover:bg-cyan/10 hover:text-cyan",
        destructive:
          "border border-threat/60 bg-threat/15 text-threat shadow-[0_0_12px_rgb(255_32_64/0.3)] hover:bg-threat/25",
        warning:
          "border border-warn/60 bg-warn/15 text-warn shadow-[0_0_12px_rgb(255_184_0/0.3)] hover:bg-warn/25",
        link: "text-cyan underline-offset-4 hover:underline border-none"
      },
      size: {
        default: "h-9 px-4 py-1.5 rounded-[2px]",
        sm: "h-7 px-3 text-[10px] rounded-[2px]",
        lg: "h-11 px-6 text-sm rounded-[3px]",
        icon: "h-9 w-9 rounded-[2px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
