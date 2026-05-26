import { cn } from '@/lib/utils'

export interface Segment {
  id: string
  /** 0–1 fill */
  value: number
  /** Hex/CSS color for this segment fill */
  color: string
  /** Optional label tooltip text (not rendered yet — reserved for Plan 2B hover) */
  label?: string
}

interface RadialSegmentRingProps {
  segments: Segment[]
  size?: number
  thickness?: number
  /** Gap between segments in degrees (default 2) */
  gapDegrees?: number
  className?: string
  /** Optional center label slot */
  label?: React.ReactNode
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, endDeg)
  const end = polar(cx, cy, r, startDeg)
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function RadialSegmentRing({
  segments,
  size = 200,
  thickness = 6,
  gapDegrees = 2,
  className,
  label
}: RadialSegmentRingProps) {
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const segDeg = 360 / segments.length

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const startDeg = i * segDeg + gapDegrees / 2
          const endDeg = (i + 1) * segDeg - gapDegrees / 2
          const fillEndDeg = startDeg + (endDeg - startDeg) * Math.max(0, Math.min(1, seg.value))
          return (
            <g key={seg.id}>
              <path
                d={arcPath(cx, cy, r, startDeg, endDeg)}
                fill="none"
                stroke={seg.color}
                strokeOpacity={0.15}
                strokeWidth={thickness}
                strokeLinecap="butt"
              />
              <path
                d={arcPath(cx, cy, r, startDeg, fillEndDeg)}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="butt"
                style={{ filter: `drop-shadow(0 0 4px ${seg.color})` }}
              />
            </g>
          )
        })}
      </svg>
      {label && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">{label}</div>}
    </div>
  )
}
