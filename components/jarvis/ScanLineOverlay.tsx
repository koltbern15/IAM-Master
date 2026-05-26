import { cn } from '@/lib/utils'

interface ScanLineOverlayProps {
  className?: string
}

/**
 * Fixed-viewport overlay rendering the always-on scan-line pattern + dot grid.
 * Pointer-events: none so it never blocks interaction. aria-hidden because it's
 * pure decoration. Drift animation respects prefers-reduced-motion via the CSS.
 */
export function ScanLineOverlay({ className }: ScanLineOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-50',
        '[background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgb(0_240_255/0.025)_2px,rgb(0_240_255/0.025)_3px)]',
        '[animation:jarvis-scan-drift_30s_linear_infinite] motion-reduce:animate-none',
        className
      )}
      style={{
        backgroundSize: '100% 200%'
      }}
    />
  )
}
