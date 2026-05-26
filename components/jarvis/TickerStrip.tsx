import { cn } from '@/lib/utils'

interface TickerStripProps {
  events: string[]
  /** Pixels per second (default 40) */
  speedPxPerSec?: number
  className?: string
}

export function TickerStrip({ events, speedPxPerSec = 40, className }: TickerStripProps) {
  const items = events.length > 0 ? events : ['AWAITING TELEMETRY...']
  const content = items.map((e) => `▸ ${e}`).join('     ')
  // Duration scales with content length so animation speed stays roughly constant.
  const durationSec = Math.max(20, content.length * 0.25 * (40 / speedPxPerSec))

  return (
    <footer
      className={cn(
        'sticky bottom-0 z-30 flex h-7 items-center overflow-hidden border-t border-panel-border bg-void/85 backdrop-blur-md',
        className
      )}
    >
      <div
        className="flex shrink-0 motion-reduce:animate-none"
        style={{ animation: `jarvis-ticker ${durationSec}s linear infinite` }}
      >
        <span
          data-jarvis-ticker-track
          className="whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/60"
        >
          {content}
        </span>
        <span
          data-jarvis-ticker-track
          aria-hidden="true"
          className="whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/60"
        >
          {content}
        </span>
      </div>
    </footer>
  )
}
