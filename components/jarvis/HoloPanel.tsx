import { cn } from '@/lib/utils'
import { CornerBrackets } from './CornerBrackets'

interface HoloPanelProps {
  children: React.ReactNode
  intent?: 'default' | 'warn' | 'threat'
  glow?: boolean
  /** Render all four corner brackets instead of just diag. */
  cornersAll?: boolean
  /** When true, applies a slow rotating conic-gradient halo around the panel border. */
  ambientBorder?: boolean
  /** Small uppercase mono label rendered in the top-left "tag" position. */
  label?: string
  className?: string
}

const intentBorder = {
  default: 'border-panel-border',
  warn: 'border-warn/50',
  threat: 'border-threat/60'
} as const

const intentCorner = {
  default: 'border-cyan',
  warn: 'border-warn',
  threat: 'border-threat'
} as const

export function HoloPanel({
  children,
  intent = 'default',
  glow = false,
  cornersAll = false,
  ambientBorder = false,
  label,
  className
}: HoloPanelProps) {
  return (
    <div className="relative">
      {ambientBorder && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[2px] opacity-60 motion-reduce:hidden"
          style={{
            background:
              'conic-gradient(from var(--jarvis-panel-angle, 0deg), transparent 0deg, rgb(0 240 255 / 0.45) 60deg, transparent 120deg, transparent 360deg)',
            animation: 'jarvis-panel-rotate 9s linear infinite'
          }}
        />
      )}
      <div
        className={cn(
          'relative border bg-panel-bg backdrop-blur-md p-4 rounded-[2px]',
          intentBorder[intent],
          glow && 'ring-glow-cyan',
          className
        )}
      >
        {label && (
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/70">
            ▸ {label}
          </div>
        )}
        {children}
        <CornerBrackets
          corners={cornersAll ? 'all' : 'diag'}
          className={intentCorner[intent]}
        />
      </div>
    </div>
  )
}
