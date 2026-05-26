import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { cn } from '@/lib/utils'
import { RadialRing } from './RadialRing'
import { TelemetryValue } from './TelemetryValue'

interface ModuleConstellationProps {
  /** 0–100 — overall curriculum mastery */
  totalMasteryPercent: number
  /** SVG size in px (default 520) */
  size?: number
}

const PHASE_COLOR = {
  1: { ring: 'border-cyan', text: 'text-cyan', glow: 'shadow-[0_0_14px_rgb(0_240_255/0.5)]' },
  2: { ring: 'border-warn/60', text: 'text-warn', glow: 'shadow-[0_0_10px_rgb(255_184_0/0.4)]' },
  3: { ring: 'border-text-dim/40', text: 'text-text-dim', glow: '' }
} as const

export function ModuleConstellation({
  totalMasteryPercent,
  size = 520
}: ModuleConstellationProps) {
  const modules = getAllModules()
  const radius = size * 0.42

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer decorative dashed rings */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 motion-reduce:hidden"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 1.05}
          fill="none"
          stroke="rgb(0 240 255 / 0.18)"
          strokeWidth="1"
          strokeDasharray="3 4"
          className="origin-center animate-[jarvis-spin_24s_linear_infinite]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 1.22}
          fill="none"
          stroke="rgb(0 240 255 / 0.1)"
          strokeWidth="1"
          strokeDasharray="1 6"
          className="origin-center animate-[jarvis-spin-rev_38s_linear_infinite]"
        />
      </svg>

      {/* Central mastery core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <RadialRing
          value={totalMasteryPercent / 100}
          size={size * 0.36}
          thickness={5}
          label={
            <div className="text-center">
              <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong">
                <TelemetryValue value={totalMasteryPercent} />
                <span className="ml-1 text-2xl text-cyan/60">%</span>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
                CURRICULUM MASTERY
              </div>
            </div>
          }
        />
      </div>

      {/* 12 module nodes arrayed at fixed angles */}
      {modules.map((m, i) => {
        const angleDeg = i * 30 - 90 // start at top, clockwise
        const rad = (angleDeg * Math.PI) / 180
        const x = size / 2 + radius * Math.cos(rad)
        const y = size / 2 + radius * Math.sin(rad)
        const phase = m.phase as 1 | 2 | 3
        const c = PHASE_COLOR[phase]
        return (
          <Link
            key={m.id}
            href={`/modules/${m.id}`}
            data-jarvis-module-node={m.id}
            data-phase={String(phase)}
            aria-label={`${m.order}. ${m.title}`}
            className={cn(
              'absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-void/80 backdrop-blur-sm transition-all',
              'hover:scale-110',
              c.ring,
              c.text,
              c.glow
            )}
            style={{ left: x, top: y }}
            title={m.title}
          >
            <span className="font-display text-base font-bold tabular-nums">
              {String(m.order).padStart(2, '0')}
            </span>
          </Link>
        )
      })}

      {/* Hidden accessible nav for screen readers + keyboard tab order */}
      <nav aria-label="Module navigation" className="sr-only">
        <ul>
          {modules.map((m) => (
            <li key={m.id}>
              <Link href={`/modules/${m.id}`}>
                {m.order}. {m.title} (Phase {m.phase})
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
