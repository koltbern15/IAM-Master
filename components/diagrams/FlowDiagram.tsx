'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HoloPanel } from '@/components/jarvis/HoloPanel'

export interface FlowNode {
  id: string
  x: number
  y: number
  label: string
  /** Optional sub-label rendered under the actor name (e.g., role). */
  sublabel?: string
  /** Visual intent: default cyan; warn amber; threat red. */
  intent?: 'default' | 'warn' | 'threat'
}

export interface FlowStep {
  id: string
  from: string
  to: string
  label: string
  detail?: string
  /** Optional intent tint for the path + token. */
  intent?: 'default' | 'warn' | 'threat'
  /** When true, the path renders with a strikethrough/deprecated treatment. */
  deprecated?: boolean
}

export interface FlowDiagramProps {
  title: string
  width: number
  height: number
  nodes: FlowNode[]
  steps: FlowStep[]
  caption?: string
  toolbar?: React.ReactNode
  className?: string
}

const INTENT_STROKE: Record<NonNullable<FlowNode['intent']>, string> = {
  default: '#00f0ff',
  warn: '#ffb800',
  threat: '#ff2040'
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Build a quadratic-bezier arc path so tokens travel along a gentle curve. */
function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const bulge = Math.min(60, len * 0.18)
  const cx = mx + nx * bulge
  const cy = my + ny * bulge
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

export function FlowDiagram({
  title, width, height, nodes, steps, caption, toolbar, className
}: FlowDiagramProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  // Parallax is written straight to the group's transform via rAF instead of
  // React state, so a high-frequency mousemove can't trigger a render per event.
  const parallaxGroupRef = useRef<SVGGElement>(null)

  // Issue 1: per-instance unique IDs so multiple diagrams on the same page
  // don't produce duplicate SVG def IDs (which would break url(#...) lookups
  // and fail axe-core duplicate-id checks).
  const rawId = useId()
  const uid = rawId.replace(/:/g, '')
  const blurDepthId = `jarvis-blur-depth-${uid}`
  const softGlowId = `jarvis-soft-glow-${uid}`
  const arrowIdFor = (intent: NonNullable<FlowStep['intent']> = 'default') =>
    `jarvis-arrow-${intent}-${uid}`

  useEffect(() => { setMotionEnabled(!prefersReducedMotion()) }, [])

  useEffect(() => {
    if (!motionEnabled) return
    let rafId: number | null = null
    let pending: { x: number; y: number } | null = null
    const flush = () => {
      rafId = null
      const g = parallaxGroupRef.current
      if (!g || !pending) return
      g.setAttribute('transform', `translate(${pending.x} ${pending.y})`)
    }
    function onMove(e: MouseEvent) {
      const el = svgRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / rect.width
      const ny = (e.clientY - cy) / rect.height
      pending = { x: Math.max(-6, Math.min(6, nx * 12)), y: Math.max(-6, Math.min(6, ny * 12)) }
      if (rafId === null) rafId = requestAnimationFrame(flush)
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [motionEnabled])

  const nodeById = useMemo(() => {
    const m: Record<string, FlowNode> = {}
    for (const n of nodes) m[n.id] = n
    return m
  }, [nodes])

  const activeStep = activeStepId ? steps.find((s) => s.id === activeStepId) ?? null : null

  return (
    <figure className={cn('relative my-6 rounded-[3px] border border-cyan/25 bg-void-elevated/40 p-4 backdrop-blur-sm', className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">▸ {title}</figcaption>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>
      {caption && <div className="mb-3 text-xs text-text-muted">{caption}</div>}
      {/* Issue 3: removed role="img" — it made the SVG subtree presentational,
          hiding the keyboard-focusable step-label <g role="button"> elements
          from assistive tech. aria-label alone is sufficient; browsers assign
          a meaningful role to SVGs with an accessible name while preserving
          access to interactive children. */}
      <svg ref={svgRef} aria-label={title} viewBox={`0 0 ${width} ${height}`} className="block w-full" style={{ maxHeight: height }}>
        <defs>
          {/* Issue 1: filter IDs suffixed with uid */}
          <filter id={blurDepthId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6.0" result="b3" />
            <feMerge><feMergeNode in="b3" /><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={softGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Issue 4: one marker per intent so arrowheads match the step color.
              Issue 1: each marker ID also carries the uid suffix. */}
          {(['default', 'warn', 'threat'] as const).map((intent) => (
            <marker key={intent} id={arrowIdFor(intent)} viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={INTENT_STROKE[intent]} />
            </marker>
          ))}
        </defs>

        <g opacity={0.18} filter={`url(#${blurDepthId})`}>
          {nodes.map((n) => (
            <circle key={`bg-${n.id}`} cx={n.x} cy={n.y} r={42} fill={INTENT_STROKE[n.intent ?? 'default']} opacity={0.12} />
          ))}
        </g>

        {/* Parallax group — transform is written imperatively via
            parallaxGroupRef (rAF-throttled) so mousemove never re-renders this subtree. */}
        <g ref={parallaxGroupRef} transform="translate(0 0)" style={{ transition: 'transform 120ms ease-out' }}>
          {steps.map((s) => {
            const from = nodeById[s.from]; const to = nodeById[s.to]
            if (!from || !to) return null
            const stroke = INTENT_STROKE[s.intent ?? 'default']
            const isActive = activeStepId === s.id
            return (
              <path key={`path-${s.id}`} d={arcPath(from.x, from.y, to.x, to.y)} fill="none" stroke={stroke}
                strokeWidth={isActive ? 2 : 1.2}
                strokeOpacity={s.deprecated ? 0.3 : isActive ? 0.95 : 0.55}
                strokeDasharray={s.deprecated ? '4 4' : undefined}
                markerEnd={`url(#${arrowIdFor(s.intent ?? 'default')})`}
                filter={isActive ? `url(#${softGlowId})` : undefined} />
            )
          })}

          {motionEnabled && steps.map((s, i) => {
            const from = nodeById[s.from]; const to = nodeById[s.to]
            if (!from || !to) return null
            return (
              <motion.circle key={`tok-${s.id}`} data-jarvis-token r={4}
                fill={INTENT_STROKE[s.intent ?? 'default']} filter={`url(#${softGlowId})`}
                initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: '100%' }}
                transition={{ duration: 3.2, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ offsetPath: `path("${arcPath(from.x, from.y, to.x, to.y)}")`, offsetRotate: '0deg' }} />
            )
          })}

          {steps.map((s, i) => {
            const from = nodeById[s.from]; const to = nodeById[s.to]
            if (!from || !to) return null
            const lx = (from.x + to.x) / 2
            const ly = (from.y + to.y) / 2 - 14 - (i % 2) * 14
            // Width tracks label length so 20+ char labels (e.g. "Unsolicited Response")
            // don't overflow the background rect's color band.
            const rectWidth = Math.max(72, s.label.length * 6.6 + 10)
            const interactive = !!s.detail
            return (
              <g key={`label-${s.id}`}
                {...(interactive
                  ? {
                      role: 'button',
                      'aria-label': s.label,
                      tabIndex: 0,
                      onClick: () => setActiveStepId(s.id === activeStepId ? null : s.id),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setActiveStepId(s.id === activeStepId ? null : s.id)
                        }
                      },
                      style: { cursor: 'pointer' }
                    }
                  : {})}>
                <rect x={lx - rectWidth / 2} y={ly - 9} width={rectWidth} height={18} rx={2}
                  fill="rgba(10,10,15,0.85)"
                  stroke={INTENT_STROKE[s.intent ?? 'default']} strokeOpacity={0.55} />
                <text x={lx} y={ly + 4} textAnchor="middle" fill="#00f0ff"
                  fontFamily="JetBrains Mono, monospace" fontSize={9} letterSpacing="0.1em">
                  {s.label}
                </text>
              </g>
            )
          })}

          {/* Issue 2: node hover-zoom now uses CSS transform only (no SVG transform
              attribute) so CSS transition: transform actually fires. transform-box:
              fill-box keeps the scale anchor on the circle center. */}
          {nodes.map((n) => {
            const isHovered = hoveredNodeId === n.id
            const stroke = INTENT_STROKE[n.intent ?? 'default']
            return (
              <g key={`node-${n.id}`}
                onMouseEnter={() => setHoveredNodeId(n.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px) scale(${isHovered ? 1.08 : 1})`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transition: 'transform 160ms ease-out'
                }}>
                <circle r={28} fill="rgba(10,10,15,0.9)" stroke={stroke} strokeWidth={1.5}
                  filter={isHovered ? `url(#${softGlowId})` : undefined} />
                <text x={0} y={4} textAnchor="middle" fill={stroke}
                  fontFamily="Rajdhani, sans-serif" fontWeight={600} fontSize={11} letterSpacing="0.08em">
                  {n.label}
                </text>
                {n.sublabel && (
                  <text x={0} y={44} textAnchor="middle" fill={stroke} opacity={0.7}
                    fontFamily="JetBrains Mono, monospace" fontSize={9} letterSpacing="0.1em">
                    {n.sublabel}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {activeStep && activeStep.detail && (
        <div className="mt-4">
          <HoloPanel label={`${activeStep.label} // DETAIL`}>
            <div className="whitespace-pre-wrap text-sm text-foreground">{activeStep.detail}</div>
            <button type="button" onClick={() => setActiveStepId(null)}
              className="mt-3 rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70 hover:bg-cyan/10 hover:text-cyan">
              Close
            </button>
          </HoloPanel>
        </div>
      )}
    </figure>
  )
}
