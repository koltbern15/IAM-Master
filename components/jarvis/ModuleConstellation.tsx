import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import type { ModuleId } from '@/lib/types'
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
  1: {
    ring: 'border-cyan',
    text: 'text-cyan',
    glow: 'shadow-[0_0_14px_rgb(0_240_255/0.5)]',
    label: 'text-cyan/70',
    line: 'rgb(0 240 255 / 0.18)'
  },
  2: {
    ring: 'border-warn/60',
    text: 'text-warn',
    glow: 'shadow-[0_0_10px_rgb(255_184_0/0.4)]',
    label: 'text-warn/60',
    line: 'rgb(255 184 0 / 0.14)'
  },
  3: {
    ring: 'border-text-dim/40',
    text: 'text-text-dim',
    glow: '',
    label: 'text-text-dim',
    line: 'rgb(255 255 255 / 0.08)'
  }
} as const

const SHORT_LABEL: Record<ModuleId, string> = {
  '01-foundations': 'FOUNDATIONS',
  '02-protocols': 'PROTOCOLS',
  '03-microsoft-identity': 'MS IDENTITY',
  '04-pam': 'PAM',
  '05-iga': 'IGA',
  '06-powershell': 'POWERSHELL',
  '07-cloud-iam': 'CLOUD IAM',
  '08-security-detection': 'SECURITY',
  '09-compliance': 'COMPLIANCE',
  '10-program-leadership': 'LEADERSHIP',
  '11-cert-roadmap': 'CERTS',
  '12-labs': 'LABS'
}

export function ModuleConstellation({
  totalMasteryPercent,
  size = 520
}: ModuleConstellationProps) {
  const modules = getAllModules()
  const radius = size * 0.42
  const coreRadius = size * 0.18 // half of RadialRing size (size * 0.36)

  const phaseCounts = modules.reduce(
    (acc, m) => {
      acc[m.phase as 1 | 2 | 3] += 1
      return acc
    },
    { 1: 0, 2: 0, 3: 0 } as Record<1 | 2 | 3, number>
  )

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Connection lines + decorative dashed rings (one SVG canvas, layered z-0) */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 motion-reduce:hidden"
      >
        {/* Dashed connection lines from core to each node */}
        {modules.map((m, i) => {
          const angleDeg = i * 30 - 90
          const rad = (angleDeg * Math.PI) / 180
          const phase = m.phase as 1 | 2 | 3
          const cosA = Math.cos(rad)
          const sinA = Math.sin(rad)
          const x1 = size / 2 + coreRadius * cosA
          const y1 = size / 2 + coreRadius * sinA
          const x2 = size / 2 + (radius - 28) * cosA
          const y2 = size / 2 + (radius - 28) * sinA
          return (
            <line
              key={`line-${m.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={PHASE_COLOR[phase].line}
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          )
        })}
        {/* Outer rotating dashed rings */}
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
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/40 tabular-nums">
                P1 0/{phaseCounts[1]} · P2 0/{phaseCounts[2]} · P3 0/{phaseCounts[3]}
              </div>
            </div>
          }
        />
      </div>

      {/* 12 module nodes + outward labels */}
      {modules.map((m, i) => {
        const angleDeg = i * 30 - 90 // start at top, clockwise
        const rad = (angleDeg * Math.PI) / 180
        const x = size / 2 + radius * Math.cos(rad)
        const y = size / 2 + radius * Math.sin(rad)
        const labelX = size / 2 + (radius + 28) * Math.cos(rad)
        const labelY = size / 2 + (radius + 28) * Math.sin(rad)
        const phase = m.phase as 1 | 2 | 3
        const c = PHASE_COLOR[phase]
        return (
          <div key={m.id}>
            <Link
              href={`/modules/${m.id}`}
              data-jarvis-module-node={m.id}
              data-phase={String(phase)}
              aria-label={`${m.order}. ${m.title}`}
              className={cn(
                'absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-void/80 backdrop-blur-sm transition-all',
                'hover:scale-110 hover:z-10',
                'animate-[jarvis-node-pulse_4s_ease-in-out_infinite] motion-reduce:animate-none',
                c.ring,
                c.text,
                c.glow
              )}
              style={{
                left: x,
                top: y,
                animationDelay: `${(i * 200) % 4000}ms`
              }}
              title={m.title}
            >
              <span className="font-display text-base font-bold tabular-nums">
                {String(m.order).padStart(2, '0')}
              </span>
            </Link>
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.15em]',
                c.label
              )}
              style={{ left: labelX, top: labelY }}
            >
              {SHORT_LABEL[m.id]}
            </span>
          </div>
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
