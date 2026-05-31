interface ActivitySparklineProps {
  /** Per-day study-touch counts, oldest → newest. */
  data: number[]
}

// Fixed viewBox; the SVG scales to the container via w-full/h-12.
const VIEW_W = 280
const VIEW_H = 48
const PAD_X = 4
const PAD_TOP = 6
const PAD_BOTTOM = 6

/**
 * Compact JARVIS-style activity sparkline: a cyan polyline over a soft area
 * fill on the void background. Deterministic — no clock reads, no randomness.
 * Normalizes to the max value; all-zero data renders a flat baseline.
 */
export function ActivitySparkline({ data }: ActivitySparklineProps) {
  const peak = data.reduce((m, v) => Math.max(m, v), 0)
  const baselineY = VIEW_H - PAD_BOTTOM
  const usableH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const usableW = VIEW_W - PAD_X * 2

  // x positions are evenly spaced; a single point sits at the left edge.
  const stepX = data.length > 1 ? usableW / (data.length - 1) : 0
  const points = data.map((v, i) => {
    const x = PAD_X + i * stepX
    // When peak is 0, every point pins to the baseline (flat line).
    const ratio = peak > 0 ? v / peak : 0
    const y = baselineY - ratio * usableH
    return { x, y }
  })

  const linePoints = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  // Area: trace the line, then drop to the baseline and close back to the start.
  const first = points[0]
  const last = points[points.length - 1]
  const areaPath = first
    ? `M ${first.x.toFixed(2)} ${baselineY} ` +
      points.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') +
      ` L ${last.x.toFixed(2)} ${baselineY} Z`
    : ''

  return (
    <svg
      role="img"
      aria-label={`${data.length}-day study activity, peak ${peak} touches`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className="block h-12 w-full"
    >
      <defs>
        <linearGradient id="jarvis-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* faint baseline so an empty/flat series still reads as a HUD trace */}
      <line
        x1={PAD_X}
        y1={baselineY}
        x2={VIEW_W - PAD_X}
        y2={baselineY}
        stroke="rgb(0 240 255 / 0.18)"
        strokeWidth={1}
      />

      {peak > 0 && areaPath && (
        <path d={areaPath} fill="url(#jarvis-spark-fill)" stroke="none" />
      )}

      <polyline
        points={linePoints}
        fill="none"
        stroke="#00f0ff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: 'drop-shadow(0 0 4px rgb(0 240 255 / 0.7))' }}
      />
    </svg>
  )
}
