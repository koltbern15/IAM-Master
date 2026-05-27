'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [motionEnabled, setMotionEnabled] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => { setMotionEnabled(!prefersReducedMotion()) }, [])

  useEffect(() => {
    if (!motionEnabled) return
    function onMove(e: MouseEvent) {
      const el = svgRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / rect.width
      const ny = (e.clientY - cy) / rect.height
      setParallax({ x: Math.max(-6, Math.min(6, nx * 12)), y: Math.max(-6, Math.min(6, ny * 12)) })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
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
      <svg ref={svgRef} role="img" aria-label={title} viewBox={`0 0 ${width} ${height}`} className="block w-full" style={{ maxHeight: height }}>
        <defs>
          <filter id="jarvis-blur-depth" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6.0" result="b3" />
            <feMerge><feMergeNode in="b3" /><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="jarvis-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="jarvis-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" />
          </marker>
        </defs>

        <g opacity={0.18} filter="url(#jarvis-blur-depth)">
          {nodes.map((n) => (
            <circle key={`bg-${n.id}`} cx={n.x} cy={n.y} r={42} fill={INTENT_STROKE[n.intent ?? 'default']} opacity={0.12} />
          ))}
        </g>

        <g transform={`translate(${parallax.x} ${parallax.y})`} style={{ transition: 'transform 120ms ease-out' }}>
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
                markerEnd="url(#jarvis-arrow)"
                filter={isActive ? 'url(#jarvis-soft-glow)' : undefined} />
            )
          })}

          {motionEnabled && steps.map((s, i) => {
            const from = nodeById[s.from]; const to = nodeById[s.to]
            if (!from || !to) return null
            return (
              <motion.circle key={`tok-${s.id}`} data-jarvis-token r={4}
                fill={INTENT_STROKE[s.intent ?? 'default']} filter="url(#jarvis-soft-glow)"
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
            return (
              <g key={`label-${s.id}`} role="button" aria-label={s.label} tabIndex={0}
                onClick={() => setActiveStepId(s.id === activeStepId ? null : s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveStepId(s.id === activeStepId ? null : s.id)
                  }
                }}
                style={{ cursor: 'pointer' }}>
                <rect x={lx - 36} y={ly - 9} width={72} height={18} rx={2}
                  fill="rgba(10,10,15,0.85)"
                  stroke={INTENT_STROKE[s.intent ?? 'default']} strokeOpacity={0.55} />
                <text x={lx} y={ly + 4} textAnchor="middle" fill="#00f0ff"
                  fontFamily="JetBrains Mono, monospace" fontSize={9} letterSpacing="0.1em">
                  {s.label}
                </text>
              </g>
            )
          })}

          {nodes.map((n) => {
            const isHovered = hoveredNodeId === n.id
            const stroke = INTENT_STROKE[n.intent ?? 'default']
            return (
              <g key={`node-${n.id}`}
                transform={`translate(${n.x} ${n.y}) scale(${isHovered ? 1.08 : 1})`}
                style={{ transition: 'transform 160ms ease-out', transformOrigin: '0 0' }}
                onMouseEnter={() => setHoveredNodeId(n.id)}
                onMouseLeave={() => setHoveredNodeId(null)}>
                <circle r={28} fill="rgba(10,10,15,0.9)" stroke={stroke} strokeWidth={1.5}
                  filter={isHovered ? 'url(#jarvis-soft-glow)' : undefined} />
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
        <div className="mt-4 border-l-2 border-cyan/60 bg-cyan/5 px-4 py-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/70">
            ▸ {activeStep.label} // DETAIL
          </div>
          <div className="whitespace-pre-wrap text-sm text-foreground">{activeStep.detail}</div>
          <button type="button" onClick={() => setActiveStepId(null)}
            className="mt-3 rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70 hover:bg-cyan/10 hover:text-cyan">
            Close
          </button>
        </div>
      )}
    </figure>
  )
}
