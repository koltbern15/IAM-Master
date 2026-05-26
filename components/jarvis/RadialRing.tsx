import { cn } from '@/lib/utils'

interface RadialRingProps {
  /** 0–1 fill */
  value: number
  /** SVG outer size in px (default 180) */
  size?: number
  /** Stroke width in px (default 4) */
  thickness?: number
  /** Optional center label */
  label?: React.ReactNode
  className?: string
  /** Use a stronger drop-shadow glow (default true) */
  glow?: boolean
}

export function RadialRing({
  value,
  size = 180,
  thickness = 4,
  label,
  className,
  glow = true
}: RadialRingProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - clamped)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(0 240 255 / 0.15)"
          strokeWidth={thickness}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#00f0ff"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={glow ? { filter: 'drop-shadow(0 0 6px #00f0ff)' } : undefined}
        />
      </svg>
      {label && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">{label}</div>}
    </div>
  )
}
