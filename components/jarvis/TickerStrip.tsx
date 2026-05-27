import { cn } from '@/lib/utils'
import { GlitchText } from './GlitchText'

interface TickerStripProps {
  events: string[]
  /** Pixels per second (default 40) */
  speedPxPerSec?: number
  className?: string
}

export function TickerStrip({ events, speedPxPerSec = 40, className }: TickerStripProps) {
  const items = events.length > 0 ? events : ['AWAITING TELEMETRY...']
  const flatLength = items.reduce((sum, e) => sum + e.length + 5, 0)
  const durationSec = Math.max(20, flatLength * 0.25 * (40 / speedPxPerSec))
  const tail = items.length > 1 ? `     ${items.slice(1).map((e) => `▸ ${e}`).join('     ')}` : ''

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
          <GlitchText glitch>{`▸ ${items[0]}`}</GlitchText>
          {tail}
        </span>
        <span
          data-jarvis-ticker-track
          aria-hidden="true"
          className="whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/60"
        >
          <GlitchText glitch>{`▸ ${items[0]}`}</GlitchText>
          {tail}
        </span>
      </div>
    </footer>
  )
}
