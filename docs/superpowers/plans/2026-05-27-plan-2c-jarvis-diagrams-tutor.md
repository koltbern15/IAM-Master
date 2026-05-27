# JARVIS Diagrams + Tutor (Plan 2C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the final chunk of Phase 2 by adding the five ambitious 2D animated flow diagrams (Kerberos, SAML, OAuth, Hybrid Identity, Ecosystem Map) on top of a shared `<FlowDiagram>` SVG primitive; the "Ask the Professor" AI Study Tutor right-pane with Anthropic streaming, per-section history persistence, and section-grounded context injection; the composed `/settings` page; the remaining NICE-tier polish (opt-in `ambientBorder` on HUD HoloPanels, `<GlitchText>` wiring in boot + ticker, and a reduced-motion-safe random panel glitch flicker); and a final a11y + reduced-motion + visual + bundle-budget verification pass.

**Architecture:** Diagrams live under `components/diagrams/`. The shared `<FlowDiagram>` primitive owns the heavy lifting — viewBox math, named-node positioning, arrow paths, Framer Motion `<motion.circle>` token traversal along arc paths, a layered SVG `<filter>` blur stack for pseudo-depth, hover-zoom on actor nodes, click-to-expand detail handler, and cursor parallax up to 6px. Each individual diagram (T2–T6) is a thin data-and-render wrapper on top of it. All five register through `mdx-components.tsx` so they are usable in any `.mdx` without imports. The tutor system is split into three layers: a thin `lib/anthropic-client.ts` SDK wrapper (testable in isolation), a `useTutorChat(sectionId)` hook that owns conversation state and persistence, and a `<TutorPanel>` right-edge slide-in HoloPanel mounted globally via `<AskProfessorRail>` in `ReadShell`. The Anthropic API key + tutor model both live in `settings.anthropicApiKey` and `settings.tutorModel` (already in `StoredState` since Plan 1). T9 extends `lib/progress.ts` with `appendTutorMessage()` + `loadTutorHistory()` helpers ONLY — the persisted state shape stays unchanged. `/settings` becomes three composed HoloPanel sections (Display, Tutor, Data) reading/writing through those helpers.

**Tech Stack:** Plan 2A + 2B stack (Next.js 16, TypeScript 5 strict, Tailwind 4, Framer Motion 12, Three.js + R3F + drei, cmdk, Howler, fuse.js, Vitest, Playwright, @axe-core/react + jest-axe). The Anthropic SDK (`@anthropic-ai/sdk@^0.40.0`) is already installed from Plan 1's preemptive dep list. **No new dependencies are added in Plan 2C.**

**Spec reference:** `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md` — §9.1 (five ambitious 2D flow diagrams), §10 (AI Study Tutor "Ask the Professor"), §6.7 (`/settings` page composition), §7.1 NICE-tier (ambient border, GlitchText accents, random panel glitch flicker).

**This plan delivers:**
- Shared `<FlowDiagram>` SVG primitive with motion-token traversal, layered blur depth, hover-zoom, click-to-expand handler, cursor parallax (T1).
- Five diagram components: `<KerberosFlowDiagram>`, `<SAMLFlowDiagram>`, `<OAuthFlowDiagram>`, `<HybridIdentityDiagram>`, `<EcosystemMap>` (T2–T6).
- All 5 diagrams auto-registered in `mdx-components.tsx` (T7).
- `lib/anthropic-client.ts` thin SDK wrapper exposing `streamTutorReply()` + test (T8).
- `hooks/use-tutor-chat.ts` hook returning `{ messages, sendMessage, streaming, error }` + test (T9).
- `<TutorPanel>` right-edge slide-in HoloPanel with cyan typewriter streaming + amber "STORED IN BROWSER" notice when no API key (T10).
- `<AskProfessorRail>` fixed right-edge launcher mounted in `ReadShell` so the tutor reaches every content page (T11).
- `/settings` page composed with three HoloPanel sections wired to `lib/progress.ts` (T12).
- NICE-tier: opt-in `ambientBorder` on home + `/progress` HoloPanels (T13).
- NICE-tier: `<GlitchText>` wired into `<BootSequence>` SYSTEM ONLINE text + `<TickerStrip>` event headers (T14).
- NICE-tier: `usePanelGlitch()` hook firing a brief chromatic flicker on a random HoloPanel every 15–30s on HUD pages, reduced-motion safe (T15).
- axe-core a11y coverage for any diagram + TutorPanel + `/settings` (T16).
- Reduced-motion coverage for `<FlowDiagram>` token animation, TutorPanel slide-in, and panel glitch hook (T16).
- Regenerated Playwright screenshots for `/`, `/progress`, `/settings`, and a sample section page that mounts a diagram (T17).
- Final verification: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, bundle budget check (≤ 200 KB gzipped on non-home routes), cross-task code review (T18).
- 18 git commits, one per task.

**Out of scope for Plan 2C** (deferred):
- Real MDX content authoring beyond a single integration smoke section (Plan 3 — curriculum seeding).
- Replacing the silent placeholder WAV sound stubs with real audio (Plan 3 polish).
- Vercel deploy + production env wiring (Plan 5).

---

## File structure produced by this plan

```
~/projects/iam-mastery/
├── app/
│   ├── page.tsx                                  # T13 (opt in ambientBorder)
│   ├── progress/page.tsx                         # T13 (opt in ambientBorder)
│   └── settings/page.tsx                         # T12 (full composition)
├── components/
│   ├── diagrams/
│   │   ├── FlowDiagram.tsx                       # T1
│   │   ├── FlowDiagram.test.tsx                  # T1
│   │   ├── KerberosFlowDiagram.tsx               # T2
│   │   ├── KerberosFlowDiagram.test.tsx          # T2
│   │   ├── SAMLFlowDiagram.tsx                   # T3
│   │   ├── SAMLFlowDiagram.test.tsx              # T3
│   │   ├── OAuthFlowDiagram.tsx                  # T4
│   │   ├── OAuthFlowDiagram.test.tsx             # T4
│   │   ├── HybridIdentityDiagram.tsx             # T5
│   │   ├── HybridIdentityDiagram.test.tsx        # T5
│   │   ├── EcosystemMap.tsx                      # T6
│   │   └── EcosystemMap.test.tsx                 # T6
│   ├── jarvis/
│   │   ├── TutorPanel.tsx                        # T10
│   │   ├── TutorPanel.test.tsx                   # T10
│   │   ├── AskProfessorRail.tsx                  # T11
│   │   ├── AskProfessorRail.test.tsx             # T11
│   │   ├── BootSequence.tsx                      # T14 (wire GlitchText into status line)
│   │   └── TickerStrip.tsx                       # T14 (wire GlitchText into event headers)
│   └── layout/
│       └── ReadShell.tsx                         # T11 (mount AskProfessorRail)
├── hooks/
│   ├── use-tutor-chat.ts                         # T9
│   ├── use-tutor-chat.test.ts                    # T9
│   ├── use-panel-glitch.ts                       # T15
│   └── use-panel-glitch.test.ts                  # T15
├── lib/
│   ├── anthropic-client.ts                       # T8
│   ├── anthropic-client.test.ts                  # T8
│   └── progress.ts                               # T9 (add appendTutorMessage + loadTutorHistory helpers)
├── mdx-components.tsx                            # T7 (add 5 diagrams)
├── tests/
│   ├── a11y/
│   │   └── diagrams-tutor-settings.test.tsx     # T16
│   └── motion/
│       └── reduced-motion-2c.test.tsx           # T16
└── tests/visual/screens/                         # T17 (regenerated)
```

Task numbers (T1–T18) indicate which task creates each file.

---

## Task 1: `<FlowDiagram>` shared SVG primitive

**Files:**
- Create: `components/diagrams/FlowDiagram.tsx`
- Create: `components/diagrams/FlowDiagram.test.tsx`

- [ ] **Step 1: Write failing test** — `components/diagrams/FlowDiagram.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'client', x: 80, y: 240, label: 'CLIENT' },
  { id: 'kdc', x: 460, y: 240, label: 'KDC' }
]

const STEPS: FlowStep[] = [
  { id: 's1', from: 'client', to: 'kdc', label: 'AS-REQ', detail: 'Pre-auth payload.' },
  { id: 's2', from: 'kdc', to: 'client', label: 'AS-REP', detail: 'TGT issued.' }
]

describe('FlowDiagram', () => {
  it('renders an svg with each node and step label', () => {
    render(<FlowDiagram title="TEST FLOW" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(screen.getByRole('img', { name: /TEST FLOW/i })).toBeInTheDocument()
    expect(screen.getByText('CLIENT')).toBeInTheDocument()
    expect(screen.getByText('KDC')).toBeInTheDocument()
    expect(screen.getByText('AS-REQ')).toBeInTheDocument()
    expect(screen.getByText('AS-REP')).toBeInTheDocument()
  })

  it('renders one motion-token <circle data-jarvis-token> per step', () => {
    const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(2)
  })

  it('opens a detail panel when a step is clicked', () => {
    render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(screen.queryByText('Pre-auth payload.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /AS-REQ/i }))
    expect(screen.getByText('Pre-auth payload.')).toBeInTheDocument()
  })

  it('exposes the blur filter stack on the <defs>', () => {
    const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(container.querySelector('filter#jarvis-blur-depth')).not.toBeNull()
  })

  describe('under prefers-reduced-motion: reduce', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: q.includes('reduce'),
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
    })
    afterEach(() => vi.unstubAllGlobals())

    it('still renders nodes + steps but emits no motion tokens', () => {
      const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
      expect(screen.getByText('CLIENT')).toBeInTheDocument()
      expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(0)
    })
  })
})
```

- [ ] **Step 2:** `pnpm test components/diagrams/FlowDiagram.test.tsx` → FAIL.

- [ ] **Step 3: Implement `components/diagrams/FlowDiagram.tsx`** (split below into header + body for clarity — write them into a single file):

```tsx
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
```

- [ ] **Step 4:** Run tests — expect 5/5 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 5: Commit**

```bash
git add components/diagrams/FlowDiagram.tsx components/diagrams/FlowDiagram.test.tsx
git commit -m "feat(diagrams): add FlowDiagram SVG primitive with motion tokens + blur depth + parallax"
```

---

## Task 2: `<KerberosFlowDiagram>`

**Files:**
- Create: `components/diagrams/KerberosFlowDiagram.tsx`
- Create: `components/diagrams/KerberosFlowDiagram.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KerberosFlowDiagram } from './KerberosFlowDiagram'

describe('KerberosFlowDiagram', () => {
  it('renders the five canonical Kerberos steps', () => {
    render(<KerberosFlowDiagram />)
    expect(screen.getByText('AS-REQ')).toBeInTheDocument()
    expect(screen.getByText('AS-REP')).toBeInTheDocument()
    expect(screen.getByText('TGS-REQ')).toBeInTheDocument()
    expect(screen.getByText('TGS-REP')).toBeInTheDocument()
    expect(screen.getByText('AP-REQ')).toBeInTheDocument()
  })

  it('renders CLIENT, KDC, and SERVICE actor nodes', () => {
    render(<KerberosFlowDiagram />)
    expect(screen.getByText('CLIENT')).toBeInTheDocument()
    expect(screen.getByText('KDC')).toBeInTheDocument()
    expect(screen.getByText('SERVICE')).toBeInTheDocument()
  })

  it('reveals TGT contents when AS-REP is clicked', () => {
    render(<KerberosFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /AS-REP/i }))
    expect(screen.getByText(/TGT/)).toBeInTheDocument()
    expect(screen.getByText(/session key/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/diagrams/KerberosFlowDiagram.tsx`**:

```tsx
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'client', x: 80, y: 240, label: 'CLIENT' },
  { id: 'kdc', x: 460, y: 240, label: 'KDC', sublabel: 'AS + TGS' },
  { id: 'service', x: 840, y: 240, label: 'SERVICE' }
]

const STEPS: FlowStep[] = [
  {
    id: 'as-req', from: 'client', to: 'kdc', label: 'AS-REQ',
    detail: 'Authentication Service Request.\n\nClient sends principal name + pre-auth data (encrypted timestamp using user password hash). No password ever crosses the wire.'
  },
  {
    id: 'as-rep', from: 'kdc', to: 'client', label: 'AS-REP',
    detail: 'Authentication Service Reply -- issues a TGT.\n\nTGT contents:\n  - Client principal\n  - Session key (client/KDC)\n  - Validity window\n  - Encrypted with the KDC krbtgt long-term key\n\nAlso returned: the session key encrypted with the user password hash so the client can decrypt it.'
  },
  {
    id: 'tgs-req', from: 'client', to: 'kdc', label: 'TGS-REQ',
    detail: 'Ticket-Granting Service Request.\n\nClient presents the TGT + an authenticator (timestamp encrypted with the client/KDC session key) + the target SPN.'
  },
  {
    id: 'tgs-rep', from: 'kdc', to: 'client', label: 'TGS-REP',
    detail: 'Ticket-Granting Service Reply -- issues a Service Ticket.\n\nService Ticket contents:\n  - Client principal\n  - Session key (client/service)\n  - Encrypted with the service account long-term key (this is what Kerberoasting harvests)\n  - Validity window'
  },
  {
    id: 'ap-req', from: 'client', to: 'service', label: 'AP-REQ',
    detail: 'Application Request.\n\nClient presents the Service Ticket + a fresh authenticator (timestamp encrypted with the client/service session key) directly to the target service. Mutual auth optional via AP-REP.'
  }
]

export function KerberosFlowDiagram() {
  return (
    <FlowDiagram
      title="KERBEROS // TICKET FLOW"
      width={920} height={420} nodes={NODES} steps={STEPS}
      caption="Five-message MIT Kerberos v5 exchange -- click any step to inspect ticket contents."
    />
  )
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/diagrams/KerberosFlowDiagram.tsx components/diagrams/KerberosFlowDiagram.test.tsx
git commit -m "feat(diagrams): add KerberosFlowDiagram (AS-REQ -> AS-REP -> TGS-REQ -> TGS-REP -> AP-REQ)"
```

---

## Task 3: `<SAMLFlowDiagram>` with SP-initiated / IdP-initiated toggle

**Files:**
- Create: `components/diagrams/SAMLFlowDiagram.tsx`
- Create: `components/diagrams/SAMLFlowDiagram.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SAMLFlowDiagram } from './SAMLFlowDiagram'

describe('SAMLFlowDiagram', () => {
  it('defaults to SP-initiated and shows AuthnRequest step', () => {
    render(<SAMLFlowDiagram />)
    expect(screen.getByText(/AuthnRequest/i)).toBeInTheDocument()
  })

  it('switches to IdP-initiated when the toggle is clicked', () => {
    render(<SAMLFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /IdP-initiated/i }))
    expect(screen.getByText(/Unsolicited Response/i)).toBeInTheDocument()
  })

  it('reveals SAML Assertion XML when the SAML Response step is clicked', () => {
    render(<SAMLFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /SAML Response/i }))
    expect(screen.getByText(/saml:Assertion/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/diagrams/SAMLFlowDiagram.tsx`**:

```tsx
'use client'

import { useState } from 'react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

type Mode = 'sp' | 'idp'

const NODES: FlowNode[] = [
  { id: 'browser', x: 80, y: 100, label: 'BROWSER' },
  { id: 'sp', x: 80, y: 340, label: 'SP', sublabel: 'Service Provider' },
  { id: 'idp', x: 720, y: 220, label: 'IDP', sublabel: 'Identity Provider' }
]
```

```tsx
const SP_STEPS: FlowStep[] = [
  { id: '1', from: 'browser', to: 'sp', label: 'GET resource', detail: 'User requests a protected resource at the SP with no SAML session.' },
  { id: '2', from: 'sp', to: 'browser', label: 'AuthnRequest', detail: 'samlp:AuthnRequest with Destination=IDP_SSO_URL and AssertionConsumerServiceURL=SP_ACS_URL. Redirected (HTTP-Redirect) or POSTed to the IdP via the browser.' },
  { id: '3', from: 'browser', to: 'idp', label: 'Forward to IdP', detail: 'Browser follows the redirect and POSTs/GETs the AuthnRequest to the IdP SSO endpoint.' },
  { id: '4', from: 'idp', to: 'browser', label: 'SAML Response', detail: 'samlp:Response wrapping a saml:Assertion that contains:\n  - saml:Issuer (the IdP entity ID)\n  - saml:Subject (NameID + SubjectConfirmation)\n  - saml:Conditions with NotBefore + NotOnOrAfter window\n  - saml:AuthnStatement with AuthnInstant\n  - saml:AttributeStatement (the claims)\n  - ds:Signature over the Assertion or the Response.' },
  { id: '5', from: 'browser', to: 'sp', label: 'POST to ACS', detail: 'Browser POSTs the signed SAML Response to the SP Assertion Consumer Service. SP validates the signature, applies AttributeStatement, issues a local session.' }
]

const IDP_STEPS: FlowStep[] = [
  { id: 'i1', from: 'browser', to: 'idp', label: 'Login at IdP', detail: 'User starts at the IdP portal (e.g., MyApps tile, Okta dashboard).' },
  { id: 'i2', from: 'idp', to: 'browser', label: 'Unsolicited Response', detail: 'IdP mints an unsolicited samlp:Response with no InResponseTo attribute and POSTs it to the SP via the browser.\n\nMust be explicitly allowed at the SP -- accepting unsolicited assertions is a frequent misconfiguration vector.' },
  { id: 'i3', from: 'browser', to: 'sp', label: 'POST to ACS', detail: 'SP validates signature, applies AttributeStatement, creates a local session, redirects to the configured RelayState target URL.' }
]
```

```tsx
export function SAMLFlowDiagram() {
  const [mode, setMode] = useState<Mode>('sp')
  const steps = mode === 'sp' ? SP_STEPS : IDP_STEPS
  return (
    <FlowDiagram
      title="SAML 2.0 // WEB BROWSER SSO"
      width={840} height={460} nodes={NODES} steps={steps}
      caption={mode === 'sp'
        ? 'SP-initiated flow -- user starts at the SP, gets bounced through the IdP.'
        : 'IdP-initiated flow -- user starts at the IdP, lands at the SP via an unsolicited Response.'}
      toolbar={
        <div className="flex gap-1">
          {(['sp','idp'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={[
                'rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                mode === m ? 'border-cyan/60 bg-cyan/12 text-cyan' : 'border-panel-border text-text-muted hover:border-cyan/30'
              ].join(' ')}>
              {m === 'sp' ? 'SP-initiated' : 'IdP-initiated'}
            </button>
          ))}
        </div>
      }
    />
  )
}
```

> Note: The three code blocks above for `SAMLFlowDiagram.tsx` (the header, the steps, and the export) compose into ONE file. Concatenate them in order when authoring the file.

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/diagrams/SAMLFlowDiagram.tsx components/diagrams/SAMLFlowDiagram.test.tsx
git commit -m "feat(diagrams): add SAMLFlowDiagram with SP/IdP-initiated toggle + Assertion XML detail"
```

---

## Task 4: `<OAuthFlowDiagram>` -- Authorization Code + PKCE + struck Implicit

**Files:**
- Create: `components/diagrams/OAuthFlowDiagram.tsx`
- Create: `components/diagrams/OAuthFlowDiagram.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OAuthFlowDiagram } from './OAuthFlowDiagram'

describe('OAuthFlowDiagram', () => {
  it('renders Authorization Code + PKCE + refresh steps', () => {
    render(<OAuthFlowDiagram />)
    expect(screen.getByText(/Authorize/i)).toBeInTheDocument()
    expect(screen.getByText(/Token Exchange/i)).toBeInTheDocument()
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument()
  })

  it('renders an Implicit Grant marker with deprecated treatment', () => {
    const { container } = render(<OAuthFlowDiagram />)
    expect(screen.getByText(/Implicit Grant/i)).toBeInTheDocument()
    expect(container.querySelector('path[stroke-dasharray="4 4"]')).not.toBeNull()
  })

  it('reveals PKCE code verifier detail when Token Exchange is clicked', () => {
    render(<OAuthFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Token Exchange/i }))
    expect(screen.getByText(/code_verifier/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/diagrams/OAuthFlowDiagram.tsx`**:

```tsx
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'user', x: 80, y: 120, label: 'USER AGENT' },
  { id: 'client', x: 80, y: 360, label: 'CLIENT', sublabel: 'SPA / native' },
  { id: 'authz', x: 520, y: 120, label: 'AUTHZ', sublabel: 'Authorization Server' },
  { id: 'token', x: 520, y: 360, label: 'TOKEN', sublabel: 'Token Endpoint' },
  { id: 'api', x: 880, y: 240, label: 'RESOURCE API' }
]

const STEPS: FlowStep[] = [
  {
    id: '1', from: 'client', to: 'user', label: 'PKCE Setup',
    detail: 'Client generates a high-entropy code_verifier (43-128 chars), derives code_challenge = BASE64URL(SHA256(code_verifier)).'
  },
  {
    id: '2', from: 'user', to: 'authz', label: 'Authorize',
    detail: 'GET /authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256'
  },
  {
    id: '3', from: 'authz', to: 'user', label: 'Code',
    detail: 'After user consent, the AS redirects back with ?code=AUTHORIZATION_CODE&state=...\n\nThe code is single-use, short-lived (~60s), and bound to the redirect_uri + client_id.'
  },
  {
    id: '4', from: 'client', to: 'token', label: 'Token Exchange',
    detail: 'POST /token\n  grant_type=authorization_code\n  code=AUTHORIZATION_CODE\n  redirect_uri=...\n  client_id=...\n  code_verifier=ORIGINAL_VERIFIER\n\nThe token endpoint hashes code_verifier and compares to the stored code_challenge. Mismatch = reject. This is what stops authorization-code interception.'
  },
  {
    id: '5', from: 'token', to: 'client', label: 'Tokens',
    detail: 'Returns: access_token (JWT or opaque), id_token (OIDC), refresh_token (if offline_access scope granted), expires_in, token_type=Bearer.'
  },
  {
    id: '6', from: 'client', to: 'api', label: 'API Call',
    detail: 'Authorization: Bearer ACCESS_TOKEN header.'
  },
  {
    id: '7', from: 'client', to: 'token', label: 'Refresh',
    detail: 'POST /token\n  grant_type=refresh_token\n  refresh_token=...\n  client_id=...\n\nMany authorization servers rotate the refresh_token on each use; the previous token is invalidated and reuse triggers session revocation.'
  },
  {
    id: 'implicit', from: 'user', to: 'authz', label: 'Implicit Grant',
    intent: 'warn', deprecated: true,
    detail: 'response_type=token returns the access_token directly in the URL fragment.\n\nDeprecated by OAuth 2.1 + RFC 9700 BCP. Replaced by Authorization Code + PKCE for all client types including SPAs and native apps.'
  }
]

export function OAuthFlowDiagram() {
  return (
    <FlowDiagram
      title="OAUTH 2.1 // AUTHORIZATION CODE + PKCE"
      width={980} height={500} nodes={NODES} steps={STEPS}
      caption="Authorization Code + PKCE with refresh rotation. Implicit Grant rendered struck-through (deprecated)."
    />
  )
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/diagrams/OAuthFlowDiagram.tsx components/diagrams/OAuthFlowDiagram.test.tsx
git commit -m "feat(diagrams): add OAuthFlowDiagram (Authorization Code + PKCE + refresh; Implicit deprecated)"
```

---

## Task 5: `<HybridIdentityDiagram>` -- PHS / PTA / Federation mode toggle

**Files:**
- Create: `components/diagrams/HybridIdentityDiagram.tsx`
- Create: `components/diagrams/HybridIdentityDiagram.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HybridIdentityDiagram } from './HybridIdentityDiagram'

describe('HybridIdentityDiagram', () => {
  it('defaults to PHS mode', () => {
    render(<HybridIdentityDiagram />)
    expect(screen.getByText(/Password Hash Sync/i)).toBeInTheDocument()
  })

  it('switches to PTA and shows the PTA Agent node', () => {
    render(<HybridIdentityDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /^PTA$/i }))
    expect(screen.getByText(/Pass-Through/i)).toBeInTheDocument()
    expect(screen.getByText(/PTA AGENT/i)).toBeInTheDocument()
  })

  it('switches to Federation and shows ADFS', () => {
    render(<HybridIdentityDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Federation/i }))
    expect(screen.getByText(/ADFS/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/diagrams/HybridIdentityDiagram.tsx`**:

```tsx
'use client'

import { useState } from 'react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

type Mode = 'phs' | 'pta' | 'fed'

const BASE_NODES: FlowNode[] = [
  { id: 'user', x: 80, y: 100, label: 'USER' },
  { id: 'aad', x: 720, y: 100, label: 'ENTRA ID', sublabel: 'Azure AD' },
  { id: 'connect', x: 400, y: 260, label: 'AAD CONNECT', sublabel: 'Sync Engine' },
  { id: 'adds', x: 80, y: 420, label: 'AD DS', sublabel: 'On-prem' }
]

const PHS_STEPS: FlowStep[] = [
  { id: 'p1', from: 'adds', to: 'connect', label: 'Hash of Hash', detail: 'AAD Connect extracts the unicodePwd hash, re-hashes it (PBKDF2-HMAC-SHA256, 1000 iterations) and ships the resulting double-hashed value to Entra ID every ~2 minutes.' },
  { id: 'p2', from: 'connect', to: 'aad', label: 'Password Hash Sync', detail: 'The double-hashed password lives in Entra ID. Authentication happens entirely in the cloud -- on-prem AD outage does NOT break sign-in.' },
  { id: 'p3', from: 'user', to: 'aad', label: 'Sign-in', detail: 'User sends credentials directly to Entra ID; Entra validates against the synced hash.' }
]

const PTA_NODES: FlowNode[] = [
  ...BASE_NODES,
  { id: 'pta', x: 720, y: 420, label: 'PTA AGENT', sublabel: 'on-prem' }
]

const PTA_STEPS: FlowStep[] = [
  { id: 't1', from: 'user', to: 'aad', label: 'Sign-in', detail: 'User submits credentials to Entra ID.' },
  { id: 't2', from: 'aad', to: 'pta', label: 'Pass-Through Validate', detail: 'Entra encrypts the credentials with a public key and queues them on a service bus. The on-prem PTA Agent pulls the request, decrypts with its private key, and validates against on-prem AD DS via standard Windows auth.' },
  { id: 't3', from: 'pta', to: 'adds', label: 'AD Validate', detail: 'PTA Agent performs LogonUser() against the local DC. Pass/fail is returned through the service bus back to Entra ID.' }
]

const FED_NODES: FlowNode[] = [
  ...BASE_NODES,
  { id: 'fed', x: 720, y: 420, label: 'ADFS', sublabel: 'Federation Server', intent: 'warn' }
]

const FED_STEPS: FlowStep[] = [
  { id: 'f1', from: 'user', to: 'aad', label: 'Sign-in (HRD)', detail: 'Entra ID performs Home Realm Discovery on the user upn-suffix and finds it is federated.' },
  { id: 'f2', from: 'aad', to: 'fed', label: 'Redirect to ADFS', detail: 'Browser is redirected to the on-prem ADFS WS-Federation or SAML endpoint.' },
  { id: 'f3', from: 'fed', to: 'adds', label: 'AD Validate', detail: 'ADFS performs Windows auth against AD DS, mints a SAML token with the user claims.' },
  { id: 'f4', from: 'fed', to: 'aad', label: 'SAML Assertion', detail: 'ADFS posts the signed SAML token back to Entra ID. Entra trusts the signature (configured via Convert-MsolDomainToFederated trust) and issues its own tokens to the user.', intent: 'warn' }
]
```

```tsx
export function HybridIdentityDiagram() {
  const [mode, setMode] = useState<Mode>('phs')
  const data = mode === 'phs'
    ? { nodes: BASE_NODES, steps: PHS_STEPS, caption: 'Password Hash Sync -- cloud-authoritative, outage-resilient.' }
    : mode === 'pta'
    ? { nodes: PTA_NODES, steps: PTA_STEPS, caption: 'Pass-Through Authentication -- on-prem validates each sign-in via PTA Agent.' }
    : { nodes: FED_NODES, steps: FED_STEPS, caption: 'Federation (ADFS) -- Entra ID delegates authentication to an on-prem federation server.' }

  return (
    <FlowDiagram
      title="HYBRID IDENTITY // SIGN-IN METHOD"
      width={840} height={520}
      nodes={data.nodes} steps={data.steps}
      caption={data.caption}
      toolbar={
        <div className="flex gap-1">
          {(['phs','pta','fed'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={[
                'rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                mode === m ? 'border-cyan/60 bg-cyan/12 text-cyan' : 'border-panel-border text-text-muted hover:border-cyan/30'
              ].join(' ')}>
              {m === 'phs' ? 'PHS' : m === 'pta' ? 'PTA' : 'Federation'}
            </button>
          ))}
        </div>
      }
    />
  )
}
```

> Note: Both code blocks above for `HybridIdentityDiagram.tsx` compose into ONE file -- concatenate in order.

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/diagrams/HybridIdentityDiagram.tsx components/diagrams/HybridIdentityDiagram.test.tsx
git commit -m "feat(diagrams): add HybridIdentityDiagram with PHS/PTA/Federation mode toggle"
```

---

## Task 6: `<EcosystemMap>` -- pan/zoom IAM landscape with click-to-highlight

**Files:**
- Create: `components/diagrams/EcosystemMap.tsx`
- Create: `components/diagrams/EcosystemMap.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EcosystemMap } from './EcosystemMap'

describe('EcosystemMap', () => {
  it('renders core ecosystem nodes', () => {
    render(<EcosystemMap />)
    expect(screen.getByText(/Entra ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Okta/i)).toBeInTheDocument()
    expect(screen.getByText(/SailPoint/i)).toBeInTheDocument()
    expect(screen.getByText(/CyberArk/i)).toBeInTheDocument()
  })

  it('highlights node connections when clicked', () => {
    const { container } = render(<EcosystemMap />)
    fireEvent.click(screen.getByText(/Entra ID/i))
    expect(container.querySelectorAll('[data-jarvis-edge-active="true"]').length).toBeGreaterThan(0)
  })

  it('zoom-in button changes the stage transform', () => {
    const { container } = render(<EcosystemMap />)
    const stage = container.querySelector('[data-jarvis-ecosystem-stage]') as HTMLElement
    const before = stage.style.transform
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }))
    expect(stage.style.transform).not.toBe(before)
  })
})
```

- [ ] **Step 2: Implement `components/diagrams/EcosystemMap.tsx`** (header + data first):

```tsx
'use client'

import { useMemo, useRef, useState } from 'react'

interface EcoNode {
  id: string
  x: number
  y: number
  label: string
  category: 'idp' | 'iga' | 'pam' | 'cloud' | 'directory' | 'mdm'
}

interface EcoEdge { a: string; b: string }

const NODES: EcoNode[] = [
  { id: 'entra', x: 480, y: 240, label: 'Entra ID', category: 'idp' },
  { id: 'okta', x: 260, y: 180, label: 'Okta', category: 'idp' },
  { id: 'ping', x: 700, y: 180, label: 'Ping Identity', category: 'idp' },
  { id: 'sailpoint', x: 200, y: 380, label: 'SailPoint', category: 'iga' },
  { id: 'saviynt', x: 360, y: 440, label: 'Saviynt', category: 'iga' },
  { id: 'cyberark', x: 600, y: 420, label: 'CyberArk', category: 'pam' },
  { id: 'beyondtrust', x: 760, y: 360, label: 'BeyondTrust', category: 'pam' },
  { id: 'aws', x: 880, y: 240, label: 'AWS IAM', category: 'cloud' },
  { id: 'gcp', x: 900, y: 360, label: 'GCP IAM', category: 'cloud' },
  { id: 'addc', x: 120, y: 280, label: 'AD DS', category: 'directory' },
  { id: 'intune', x: 480, y: 80, label: 'Intune', category: 'mdm' },
  { id: 'jamf', x: 660, y: 80, label: 'Jamf', category: 'mdm' }
]

const EDGES: EcoEdge[] = [
  { a: 'entra', b: 'okta' },
  { a: 'entra', b: 'ping' },
  { a: 'entra', b: 'aws' },
  { a: 'entra', b: 'gcp' },
  { a: 'entra', b: 'addc' },
  { a: 'entra', b: 'intune' },
  { a: 'entra', b: 'jamf' },
  { a: 'sailpoint', b: 'entra' },
  { a: 'sailpoint', b: 'okta' },
  { a: 'sailpoint', b: 'addc' },
  { a: 'saviynt', b: 'entra' },
  { a: 'cyberark', b: 'addc' },
  { a: 'cyberark', b: 'entra' },
  { a: 'beyondtrust', b: 'addc' },
  { a: 'okta', b: 'aws' },
  { a: 'okta', b: 'gcp' }
]

const CATEGORY_COLOR: Record<EcoNode['category'], string> = {
  idp: '#00f0ff',
  iga: '#ffb800',
  pam: '#ff2040',
  cloud: '#00ff88',
  directory: '#888888',
  mdm: '#9b8cff'
}
```

```tsx
export function EcosystemMap() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const nodeById = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), [])
  const neighborsOf = useMemo(() => {
    const m: Record<string, Set<string>> = {}
    for (const n of NODES) m[n.id] = new Set()
    for (const e of EDGES) { m[e.a].add(e.b); m[e.b].add(e.a) }
    return m
  }, [])

  function isEdgeActive(e: EcoEdge): boolean {
    if (!activeId) return false
    return e.a === activeId || e.b === activeId
  }

  function onMouseDown(e: React.MouseEvent) {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy })
  }
  function onMouseUp() { dragRef.current = null }

  return (
    <figure className="relative my-6 rounded-[3px] border border-cyan/25 bg-void-elevated/40 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">
          ▸ IAM ECOSYSTEM // INTEGRATION MAP
        </figcaption>
        <div className="flex gap-1">
          <button type="button" aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2.5, s * 1.2))}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] text-cyan/80 hover:bg-cyan/10">+</button>
          <button type="button" aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.5, s / 1.2))}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] text-cyan/80 hover:bg-cyan/10">-</button>
          <button type="button" aria-label="Reset"
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); setActiveId(null) }}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/80 hover:bg-cyan/10">Reset</button>
        </div>
      </div>
      <div className="relative h-[520px] cursor-grab overflow-hidden rounded-[2px] border border-cyan/15 bg-void/70 active:cursor-grabbing"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <div data-jarvis-ecosystem-stage className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '50% 50%',
            transition: 'transform 120ms ease-out'
          }}>
          <svg viewBox="0 0 1000 520" className="block h-full w-full">
            {EDGES.map((e) => {
              const a = nodeById[e.a]; const b = nodeById[e.b]
              const active = isEdgeActive(e)
              return (
                <line key={`${e.a}-${e.b}`} data-jarvis-edge-active={active ? 'true' : 'false'}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={active ? '#00f0ff' : 'rgba(0, 240, 255, 0.18)'}
                  strokeWidth={active ? 2 : 1} />
              )
            })}
            {NODES.map((n) => {
              const color = CATEGORY_COLOR[n.category]
              const isActive = activeId === n.id
              const isNeighbor = !!activeId && neighborsOf[activeId].has(n.id)
              const dim = !!activeId && !isActive && !isNeighbor
              return (
                <g key={n.id} transform={`translate(${n.x} ${n.y})`}
                  style={{ cursor: 'pointer', opacity: dim ? 0.3 : 1, transition: 'opacity 160ms' }}
                  onClick={(e) => { e.stopPropagation(); setActiveId((c) => c === n.id ? null : n.id) }}>
                  <circle r={22} fill="rgba(10,10,15,0.9)" stroke={color} strokeWidth={isActive ? 2.2 : 1.4} />
                  <text x={0} y={38} textAnchor="middle" fill={color}
                    fontFamily="JetBrains Mono, monospace" fontSize={10} letterSpacing="0.08em">{n.label}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
        {(['idp', 'iga', 'pam', 'cloud', 'directory', 'mdm'] as const).map((c) => (
          <span key={c} className="inline-flex items-center gap-1">
            <span className="inline-block size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {c}
          </span>
        ))}
      </div>
    </figure>
  )
}
```

> Note: Both code blocks above for `EcosystemMap.tsx` compose into ONE file -- concatenate in order.

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/diagrams/EcosystemMap.tsx components/diagrams/EcosystemMap.test.tsx
git commit -m "feat(diagrams): add EcosystemMap with pan/zoom + click-to-highlight connections"
```

---

## Task 7: Register all 5 diagrams in `mdx-components.tsx`

**Files:**
- Modify: `mdx-components.tsx`

- [ ] **Step 1: Update `mdx-components.tsx`** — add the 5 diagram imports + register them in the returned record (the file already registers all 8 Plan 2B content components; do not remove any):

```tsx
import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/content/Quiz'
import { Flashcard } from '@/components/content/Flashcard'
import { WarStory } from '@/components/content/WarStory'
import { ProTip } from '@/components/content/ProTip'
import { SC300Badge } from '@/components/content/SC300Badge'
import { Definition } from '@/components/content/Definition'
import { PowerShellBlock } from '@/components/content/PowerShellBlock'
import { CommandReference } from '@/components/content/CommandReference'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { SAMLFlowDiagram } from '@/components/diagrams/SAMLFlowDiagram'
import { OAuthFlowDiagram } from '@/components/diagrams/OAuthFlowDiagram'
import { HybridIdentityDiagram } from '@/components/diagrams/HybridIdentityDiagram'
import { EcosystemMap } from '@/components/diagrams/EcosystemMap'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    Flashcard,
    WarStory,
    ProTip,
    SC300Badge,
    Definition,
    PowerShellBlock,
    CommandReference,
    KerberosFlowDiagram,
    SAMLFlowDiagram,
    OAuthFlowDiagram,
    HybridIdentityDiagram,
    EcosystemMap
  }
}
```

- [ ] **Step 2:** `pnpm typecheck` — PASS. `pnpm build` — PASS (sanity check that MDX still compiles).

- [ ] **Step 3: Commit**

```bash
git add mdx-components.tsx
git commit -m "feat(mdx): auto-register all 5 flow diagrams for use inside any .mdx"
```

---

## Task 8: `lib/anthropic-client.ts` -- `streamTutorReply` SDK wrapper

**Files:**
- Create: `lib/anthropic-client.ts`
- Create: `lib/anthropic-client.test.ts`

- [ ] **Step 1: Write failing test** — `lib/anthropic-client.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

const streamMock = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation((opts: { apiKey: string; dangerouslyAllowBrowser?: boolean }) => ({
      __ctorOpts: opts,
      messages: { stream: streamMock }
    }))
  }
})

import Anthropic from '@anthropic-ai/sdk'
import { streamTutorReply } from './anthropic-client'

describe('streamTutorReply', () => {
  it('instantiates the SDK with apiKey + dangerouslyAllowBrowser=true per call', async () => {
    streamMock.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } }
      }
    })
    const chunks: string[] = []
    for await (const c of streamTutorReply({
      apiKey: 'sk-test-123',
      model: 'claude-sonnet-4-6',
      systemPrompt: 'You are a professor.',
      history: [],
      userMessage: 'Hello',
      sectionContent: 'Kerberos uses tickets.'
    })) { chunks.push(c) }
    expect(Anthropic).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'sk-test-123', dangerouslyAllowBrowser: true })
    )
    expect(chunks.join('')).toBe('hi')
  })

  it('passes section content embedded in the final user message', async () => {
    streamMock.mockReturnValue({ async *[Symbol.asyncIterator]() { /* empty */ } })
    const iter = streamTutorReply({
      apiKey: 'sk-x',
      model: 'claude-sonnet-4-6',
      systemPrompt: 'sys',
      history: [{ role: 'user', content: 'older' }, { role: 'assistant', content: 'reply' }],
      userMessage: 'follow up',
      sectionContent: 'Section MDX body...'
    })
    for await (const _ of iter) { /* drain */ }
    const args = streamMock.mock.calls.at(-1)![0]
    expect(args.model).toBe('claude-sonnet-4-6')
    expect(args.system).toBe('sys')
    const lastUser = args.messages.at(-1)
    expect(lastUser.role).toBe('user')
    expect(String(lastUser.content)).toContain('follow up')
    expect(String(lastUser.content)).toContain('Section MDX body...')
  })

  it('yields nothing when the stream is empty', async () => {
    streamMock.mockReturnValue({ async *[Symbol.asyncIterator]() { /* empty */ } })
    const chunks: string[] = []
    for await (const c of streamTutorReply({
      apiKey: 'sk-x', model: 'claude-sonnet-4-6', systemPrompt: '',
      history: [], userMessage: 'q', sectionContent: ''
    })) { chunks.push(c) }
    expect(chunks).toEqual([])
  })
})
```

- [ ] **Step 2: Implement `lib/anthropic-client.ts`**:

```ts
import Anthropic from '@anthropic-ai/sdk'

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamTutorReplyOptions {
  apiKey: string
  model: string
  systemPrompt: string
  history: TutorMessage[]
  userMessage: string
  /** Current section MDX (or trimmed plain-text projection) injected into the final user message for grounding. */
  sectionContent: string
  /** Max output tokens. Defaults to 1024 so streaming feels responsive. */
  maxTokens?: number
}

const MAX_SECTION_CONTEXT_CHARS = 12_000

function buildFinalUserContent(userMessage: string, sectionContent: string): string {
  if (!sectionContent.trim()) return userMessage
  const trimmed = sectionContent.length > MAX_SECTION_CONTEXT_CHARS
    ? `${sectionContent.slice(0, MAX_SECTION_CONTEXT_CHARS)}\n\n[content truncated for context window]`
    : sectionContent
  return `${userMessage}\n\n---\n\nCURRENT SECTION CONTEXT (use this as the source of truth -- quote, build on, or correct it as needed):\n\n${trimmed}`
}

/** Streams an Anthropic Messages reply, yielding text deltas as they arrive. */
export async function* streamTutorReply(opts: StreamTutorReplyOptions): AsyncGenerator<string> {
  const client = new Anthropic({
    apiKey: opts.apiKey,
    dangerouslyAllowBrowser: true
  })

  const messages = [
    ...opts.history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: buildFinalUserContent(opts.userMessage, opts.sectionContent) }
  ]

  const stream = client.messages.stream({
    model: opts.model,
    system: opts.systemPrompt,
    messages,
    max_tokens: opts.maxTokens ?? 1024
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const text = (event.delta as { text?: string }).text
      if (text) yield text
    }
  }
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/anthropic-client.ts lib/anthropic-client.test.ts
git commit -m "feat(tutor): add streamTutorReply Anthropic SDK wrapper with section context injection"
```

---

## Task 9: `useTutorChat` hook + tutor history helpers in `lib/progress.ts`

**Files:**
- Modify: `lib/progress.ts` (append two helper functions ONLY -- do NOT alter `StoredState` shape)
- Create: `hooks/use-tutor-chat.ts`
- Create: `hooks/use-tutor-chat.test.ts`

- [ ] **Step 1: Add helpers to `lib/progress.ts`** — append at the bottom of the existing file (do not modify anything above):

```ts
/** Returns the persisted message history for a section (empty array if none). */
export function loadTutorHistory(sectionId: string): { role: 'user' | 'assistant'; content: string; at: string }[] {
  const s = loadState()
  return s.tutorHistory[sectionId]?.messages ?? []
}

/** Appends a tutor message to the section history and persists. */
export function appendTutorMessage(
  sectionId: string,
  message: { role: 'user' | 'assistant'; content: string }
): void {
  const s = loadState()
  const existing = s.tutorHistory[sectionId] ?? { sectionId, messages: [] }
  existing.messages = [...existing.messages, { ...message, at: new Date().toISOString() }]
  s.tutorHistory[sectionId] = existing
  saveState(s)
}
```

- [ ] **Step 2: Write failing test for `useTutorChat`** — `hooks/use-tutor-chat.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('@/lib/anthropic-client', () => ({
  streamTutorReply: vi.fn()
}))

import { useTutorChat } from './use-tutor-chat'
import { streamTutorReply } from '@/lib/anthropic-client'
import { loadTutorHistory, appendTutorMessage, loadState, saveState } from '@/lib/progress'

const streamMock = streamTutorReply as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  window.localStorage.clear()
  streamMock.mockReset()
})

function setKey(key = 'sk-test') {
  const s = loadState()
  s.settings.anthropicApiKey = key
  saveState(s)
}

describe('useTutorChat', () => {
  it('loads persisted history for the given sectionId on mount', () => {
    appendTutorMessage('mod/sect', { role: 'user', content: 'first' })
    appendTutorMessage('mod/sect', { role: 'assistant', content: 'reply' })
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    expect(result.current.messages.map((m) => m.content)).toEqual(['first', 'reply'])
  })

  it('appends user message + streamed assistant reply, persisting both', async () => {
    setKey()
    async function* fake() { yield 'Hel'; yield 'lo!' }
    streamMock.mockReturnValue(fake())
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'section body') })
    await waitFor(() => expect(result.current.streaming).toBe(false))
    expect(result.current.messages.map((m) => m.content)).toEqual(['hi', 'Hello!'])
    expect(loadTutorHistory('mod/sect').map((m) => m.content)).toEqual(['hi', 'Hello!'])
  })

  it('surfaces an error when no API key is configured', async () => {
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'body') })
    expect(result.current.error).toMatch(/API key/i)
    expect(streamMock).not.toHaveBeenCalled()
  })

  it('surfaces an error when the stream throws', async () => {
    setKey()
    streamMock.mockImplementation(async function* () { throw new Error('boom') })
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'body') })
    expect(result.current.error).toMatch(/boom/)
    expect(result.current.streaming).toBe(false)
  })
})
```

- [ ] **Step 3: Implement `hooks/use-tutor-chat.ts`** (header + impl below; concatenate into one file):

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { streamTutorReply, type TutorMessage } from '@/lib/anthropic-client'
import { appendTutorMessage, loadState, loadTutorHistory } from '@/lib/progress'

export const TUTOR_SYSTEM_PROMPT = `You are an Ivy-League IAM professor -- passionate, precise, and deeply opinionated about identity engineering.

For every answer:
1. Lead with what the concept IS, in one or two sharp sentences.
2. Then WHY it exists (the historical or threat context that forced the design).
3. Then HOW it actually works under the hood -- names, RFCs, protocols, payload shapes.
4. Close with a brief WAR STORY: a real incident, misconfiguration, or production-grade pitfall the learner should burn into memory.

Tone: confident, technical, no fluff, no marketing speak. Cite the relevant RFC / Microsoft doc / vendor doc names by number when you can. If the student is wrong, correct them gently but directly.

You will receive the current section content as context -- treat it as the source of truth for the lesson, build on it, and quote from it when grounding an answer.`

interface UseTutorChatReturn {
  messages: TutorMessage[]
  streaming: boolean
  error: string | null
  sendMessage: (text: string, sectionContent: string) => Promise<void>
  clear: () => void
}
```

```ts
export function useTutorChat(sectionId: string): UseTutorChatReturn {
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const partialRef = useRef<string>('')

  useEffect(() => {
    const persisted = loadTutorHistory(sectionId).map((m) => ({ role: m.role, content: m.content }))
    setMessages(persisted)
    setError(null)
    setStreaming(false)
    partialRef.current = ''
  }, [sectionId])

  const sendMessage = useCallback(
    async (text: string, sectionContent: string) => {
      setError(null)
      const trimmed = text.trim()
      if (!trimmed) return
      const state = loadState()
      const apiKey = state.settings.anthropicApiKey
      if (!apiKey) {
        setError('No Anthropic API key configured. Add one in /settings.')
        return
      }
      const model = state.settings.tutorModel

      const userMsg: TutorMessage = { role: 'user', content: trimmed }
      setMessages((prev) => [...prev, userMsg])
      appendTutorMessage(sectionId, userMsg)

      partialRef.current = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
      setStreaming(true)

      try {
        const history = loadTutorHistory(sectionId)
          .slice(0, -1) // drop the just-appended user message (already passed as userMessage)
          .map((m) => ({ role: m.role, content: m.content }))
        const iter = streamTutorReply({
          apiKey,
          model,
          systemPrompt: TUTOR_SYSTEM_PROMPT,
          history,
          userMessage: trimmed,
          sectionContent
        })
        for await (const chunk of iter) {
          partialRef.current += chunk
          const snapshot = partialRef.current
          setMessages((prev) => {
            const next = prev.slice()
            next[next.length - 1] = { role: 'assistant', content: snapshot }
            return next
          })
        }
        if (partialRef.current.length > 0) {
          appendTutorMessage(sectionId, { role: 'assistant', content: partialRef.current })
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Stream failed.'
        setError(msg)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.content === '') return prev.slice(0, -1)
          return prev
        })
      } finally {
        setStreaming(false)
        partialRef.current = ''
      }
    },
    [sectionId]
  )

  const clear = useCallback(() => { setMessages([]); setError(null) }, [])

  return { messages, streaming, error, sendMessage, clear }
}
```

> Note: Both `useTutorChat` code blocks above compose into ONE file -- concatenate in order.

- [ ] **Step 4:** Run tests — `pnpm test hooks/use-tutor-chat.test.ts` — 4/4 PASS. Run `pnpm test lib/progress` to confirm existing progress tests still pass. `pnpm typecheck` — PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/progress.ts hooks/use-tutor-chat.ts hooks/use-tutor-chat.test.ts
git commit -m "feat(tutor): add useTutorChat hook + loadTutorHistory/appendTutorMessage progress helpers"
```

---

## Task 10: `<TutorPanel>` right-edge slide-in HoloPanel

**Files:**
- Create: `components/jarvis/TutorPanel.tsx`
- Create: `components/jarvis/TutorPanel.test.tsx`
- Modify: `app/globals.css` (add `jarvis-slide-in-right` keyframe)

- [ ] **Step 1: Write failing test** — `components/jarvis/TutorPanel.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/hooks/use-tutor-chat', () => ({
  useTutorChat: vi.fn()
}))

import { TutorPanel } from './TutorPanel'
import { useTutorChat } from '@/hooks/use-tutor-chat'
import { loadState, saveState } from '@/lib/progress'

const useTutorChatMock = useTutorChat as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  window.localStorage.clear()
  useTutorChatMock.mockReset()
  useTutorChatMock.mockReturnValue({
    messages: [], streaming: false, error: null,
    sendMessage: vi.fn(), clear: vi.fn()
  })
})

describe('TutorPanel', () => {
  it('does not render when closed', () => {
    render(<TutorPanel open={false} onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.queryByPlaceholderText(/ask the professor/i)).not.toBeInTheDocument()
  })

  it('renders the panel with input + ASK PROFESSOR header when open', () => {
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByPlaceholderText(/ask the professor/i)).toBeInTheDocument()
    expect(screen.getByText(/ASK PROFESSOR/i)).toBeInTheDocument()
  })

  it('shows the amber STORED IN BROWSER notice when no API key is set', () => {
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByText(/STORED IN BROWSER/i)).toBeInTheDocument()
  })

  it('hides the no-key notice once a key is set', () => {
    const s = loadState()
    s.settings.anthropicApiKey = 'sk-x'
    saveState(s)
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.queryByText(/STORED IN BROWSER/i)).not.toBeInTheDocument()
  })

  it('renders rendered conversation messages', () => {
    useTutorChatMock.mockReturnValue({
      messages: [
        { role: 'user', content: 'What is a TGT?' },
        { role: 'assistant', content: 'A Ticket-Granting Ticket...' }
      ],
      streaming: false, error: null,
      sendMessage: vi.fn(), clear: vi.fn()
    })
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByText(/What is a TGT/)).toBeInTheDocument()
    expect(screen.getByText(/A Ticket-Granting Ticket/)).toBeInTheDocument()
  })

  it('calls sendMessage on form submit with section content', () => {
    const sendMessage = vi.fn()
    useTutorChatMock.mockReturnValue({
      messages: [], streaming: false, error: null,
      sendMessage, clear: vi.fn()
    })
    const s = loadState()
    s.settings.anthropicApiKey = 'sk-x'
    saveState(s)
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="SECTION-MDX" />)
    fireEvent.change(screen.getByPlaceholderText(/ask the professor/i), { target: { value: 'why?' } })
    fireEvent.submit(screen.getByTestId('tutor-form'))
    expect(sendMessage).toHaveBeenCalledWith('why?', 'SECTION-MDX')
  })
})
```

- [ ] **Step 2: Implement `components/jarvis/TutorPanel.tsx`** (header + render below; concatenate into one file):

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { HoloPanel } from './HoloPanel'
import { useTutorChat } from '@/hooks/use-tutor-chat'
import { loadState } from '@/lib/progress'

interface TutorPanelProps {
  open: boolean
  onClose: () => void
  sectionId: string
  sectionContent: string
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

```tsx
export function TutorPanel({ open, onClose, sectionId, sectionContent }: TutorPanelProps) {
  const { messages, streaming, error, sendMessage } = useTutorChat(sectionId)
  const [draft, setDraft] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasKey(!!loadState().settings.anthropicApiKey)
    setReduceMotion(prefersReducedMotion())
    function onChange() { setHasKey(!!loadState().settings.anthropicApiKey) }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || streaming) return
    setDraft('')
    void sendMessage(text, sectionContent)
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-y-0 right-0 z-[80] flex w-full max-w-[40vw] flex-col bg-void/85 backdrop-blur-md max-md:max-w-full',
        !reduceMotion && 'animate-[jarvis-slide-in-right_220ms_ease-out_both]'
      )}
    >
      <HoloPanel ambientBorder cornersAll label="ASK PROFESSOR" className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ SECTION {sectionId}
          </div>
          <button type="button" onClick={onClose} aria-label="Close tutor"
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 hover:bg-cyan/10 hover:text-cyan">
            x ESC
          </button>
        </div>

        {!hasKey && (
          <div className="mb-3 flex items-start gap-2 border-l-2 border-warn bg-warn/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
            <span>● STORED IN BROWSER</span>
            <span className="normal-case tracking-normal">-- add an Anthropic API key in /settings to enable the tutor.</span>
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto pr-1">
          {messages.length === 0 && !streaming && (
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
              ▸ Ask anything about this section. The professor will use the current section as context.
            </div>
          )}
          <ul className="space-y-3">
            {messages.map((m, i) => (
              <li key={i}
                className={cn(
                  'rounded-[2px] border px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'border-cyan/30 bg-cyan/4 text-foreground'
                    : 'border-nominal/30 bg-nominal/4 text-foreground'
                )}>
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/60">
                  ▸ {m.role === 'user' ? 'YOU' : 'PROFESSOR'}
                </div>
                <div className={cn(
                  'whitespace-pre-wrap',
                  m.role === 'assistant' && streaming && i === messages.length - 1 && 'text-cyan after:ml-0.5 after:inline-block after:h-3 after:w-2 after:align-middle after:bg-cyan after:animate-pulse'
                )}>
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
          {error && (
            <div className="mt-2 border-l-2 border-threat bg-threat/8 px-3 py-2 font-mono text-xs text-threat">
              ▸ {error}
            </div>
          )}
        </div>

        <form data-testid="tutor-form" onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Ask the professor... (Enter to send, Shift+Enter for newline)"
            rows={2} disabled={streaming}
            className="min-h-[44px] flex-1 resize-none rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground placeholder:text-text-dim placeholder:font-sans focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan disabled:opacity-50" />
          <button type="submit" disabled={streaming || !draft.trim()}
            className="rounded-[2px] border border-cyan/60 bg-cyan/12 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-cyan hover:bg-cyan/20 disabled:opacity-40">
            {streaming ? '▸ ...' : '▸ SEND'}
          </button>
        </form>
      </HoloPanel>
    </div>
  )
}
```

> Note: Both `TutorPanel.tsx` code blocks above compose into ONE file -- concatenate in order.

- [ ] **Step 3: Add the `jarvis-slide-in-right` keyframe** — append to `app/globals.css` inside the existing `@layer utilities` block:

```css
  @keyframes jarvis-slide-in-right {
    from { transform: translateX(40px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
```

- [ ] **Step 4:** Run tests — `pnpm test components/jarvis/TutorPanel.test.tsx` — 6/6 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/TutorPanel.tsx components/jarvis/TutorPanel.test.tsx app/globals.css
git commit -m "feat(tutor): add TutorPanel slide-in HoloPanel with cyan typewriter streaming"
```

---

## Task 11: `<AskProfessorRail>` + mount in `ReadShell`

**Files:**
- Create: `components/jarvis/AskProfessorRail.tsx`
- Create: `components/jarvis/AskProfessorRail.test.tsx`
- Modify: `components/layout/ReadShell.tsx`

- [ ] **Step 1: Write failing test** — `components/jarvis/AskProfessorRail.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskProfessorRail } from './AskProfessorRail'

describe('AskProfessorRail', () => {
  it('renders a fixed right-edge launcher button', () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="" />)
    expect(screen.getByRole('button', { name: /ASK PROFESSOR/i })).toBeInTheDocument()
  })

  it('opens the tutor panel when clicked', () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="ctx" />)
    expect(screen.queryByPlaceholderText(/ask the professor/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ASK PROFESSOR/i }))
    expect(screen.getByPlaceholderText(/ask the professor/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/jarvis/AskProfessorRail.tsx`**:

```tsx
'use client'

import { useState } from 'react'
import { TutorPanel } from './TutorPanel'

interface AskProfessorRailProps {
  sectionId: string
  sectionContent: string
}

export function AskProfessorRail({ sectionId, sectionContent }: AskProfessorRailProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Ask Professor"
        className="fixed right-0 top-1/2 z-[70] -translate-y-1/2 rounded-l-[3px] border border-r-0 border-cyan/50 bg-cyan/10 px-2 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan shadow-[0_0_12px_rgb(0_240_255/0.35)] hover:bg-cyan/20 hover:text-cyan motion-reduce:transition-none">
        ▸ ASK<br />PROFESSOR
      </button>
      <TutorPanel
        open={open} onClose={() => setOpen(false)}
        sectionId={sectionId} sectionContent={sectionContent}
      />
    </>
  )
}
```

- [ ] **Step 3: Mount the rail in `ReadShell`** — replace `components/layout/ReadShell.tsx`:

```tsx
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AskProfessorRail } from '@/components/jarvis/AskProfessorRail'

interface ReadShellProps {
  children: React.ReactNode
  /** Optional -- when set, the AskProfessorRail wires the tutor to this section. */
  tutorSectionId?: string
  /** Optional -- current section content (MDX-as-text) for grounding the tutor. */
  tutorSectionContent?: string
}

export function ReadShell({
  children,
  tutorSectionId,
  tutorSectionContent = ''
}: ReadShellProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">{children}</main>
      </div>
      {tutorSectionId && (
        <AskProfessorRail sectionId={tutorSectionId} sectionContent={tutorSectionContent} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update the existing `ReadShell.test.tsx`** if it exists — verify the rail does NOT mount unless `tutorSectionId` is passed. (If no test file exists, skip; the new behavior is opt-in and backwards-compatible.)

- [ ] **Step 5:** Run `pnpm test components/jarvis/AskProfessorRail.test.tsx` — 2/2 PASS. Run `pnpm test components/layout/ReadShell` — confirm no regression. `pnpm typecheck` — PASS.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/AskProfessorRail.tsx components/jarvis/AskProfessorRail.test.tsx components/layout/ReadShell.tsx
git commit -m "feat(tutor): add AskProfessorRail launcher + mount in ReadShell when sectionId is supplied"
```

---

## Task 12: `/settings` page -- three HoloPanel sections composed

**Files:**
- Modify: `app/settings/page.tsx`

- [ ] **Step 1: Replace `app/settings/page.tsx` entirely** (header first; full file is split into header + body below — concatenate into a single file):

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ReadShell } from '@/components/layout/ReadShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { loadState, saveState, resetState } from '@/lib/progress'

const MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'claude-opus-4-7', label: 'claude-opus-4-7 (maximum capability)' },
  { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6 (default)' },
  { value: 'claude-haiku-4-5-20251001', label: 'claude-haiku-4-5 (fast)' }
]
```

```tsx
export default function SettingsPage() {
  const [state, setState] = useState(() => loadState())
  const [exportData, setExportData] = useState<string>('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    function onChange() { setState(loadState()) }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  function updateSettings(patch: Partial<typeof state.settings>) {
    const next = loadState()
    next.settings = { ...next.settings, ...patch }
    saveState(next)
  }

  function handleExport() { setExportData(JSON.stringify(loadState(), null, 2)) }

  function handleImport(text: string) {
    setImportError(null)
    setImportSuccess(false)
    try {
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        setImportError('Unrecognized payload -- expected iam-mastery v1 state.')
        return
      }
      window.localStorage.setItem('iam-mastery:v1', JSON.stringify(parsed))
      window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
      setImportSuccess(true)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON.')
    }
  }

  function handleReset() { resetState(); setResetConfirm(false) }

  return (
    <ReadShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.06em] text-cyan glow-cyan">
          ▸ SETTINGS
        </h1>

        <HoloPanel label="DISPLAY">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">Sound effects (flashcard flips, quiz feedback)</span>
              <input type="checkbox" checked={state.settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="size-4 accent-cyan" />
            </label>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dim">
              ▸ Motion intensity follows the OS prefers-reduced-motion setting.
            </div>
          </div>
        </HoloPanel>

        <HoloPanel label="TUTOR">
          <div className="space-y-4">
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ ANTHROPIC API KEY
              </div>
              <input type="password" autoComplete="off" spellCheck={false}
                placeholder="sk-ant-..." value={state.settings.anthropicApiKey ?? ''}
                onChange={(e) => updateSettings({ anthropicApiKey: e.target.value || undefined })}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground placeholder:text-text-dim focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan" />
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
                ● STORED IN BROWSER -- never transmitted to any server other than Anthropic.
              </div>
            </label>
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ MODEL
              </div>
              <select value={state.settings.tutorModel}
                onChange={(e) => updateSettings({ tutorModel: e.target.value })}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan">
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
          </div>
        </HoloPanel>
```

```tsx
        <HoloPanel label="DATA">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExport}
                className="rounded-[2px] border border-cyan/50 bg-cyan/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-cyan hover:bg-cyan/20">
                ▸ EXPORT STATE
              </button>
              <button type="button" onClick={() => setResetConfirm((c) => !c)}
                className="rounded-[2px] border border-threat/50 bg-threat/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-threat hover:bg-threat/20">
                ▸ RESET ALL
              </button>
            </div>

            {resetConfirm && (
              <div className="border-l-2 border-threat bg-threat/5 px-3 py-2">
                <div className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-threat">
                  ▸ This will erase all progress, flashcards, streak, tutor history. Sure?
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleReset}
                    className="rounded-[2px] border border-threat bg-threat/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-threat">
                    Yes, wipe
                  </button>
                  <button type="button" onClick={() => setResetConfirm(false)}
                    className="rounded-[2px] border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {exportData && (
              <textarea readOnly rows={6} value={exportData}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-[11px] text-cyan" />
            )}

            <div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ IMPORT STATE (paste exported JSON, blur to apply)
              </div>
              <textarea rows={4} placeholder='{"version":1,...}'
                onBlur={(e) => e.target.value.trim() && handleImport(e.target.value)}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-[11px] text-foreground focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan" />
              {importError && (
                <div className="mt-1 font-mono text-[11px] text-threat">▸ {importError}</div>
              )}
              {importSuccess && (
                <div className="mt-1 font-mono text-[11px] text-nominal">▸ Imported.</div>
              )}
            </div>
          </div>
        </HoloPanel>
      </div>
    </ReadShell>
  )
}
```

> Note: All three `SettingsPage` code blocks above compose into ONE file -- concatenate in order.

- [ ] **Step 2:** Verify the route renders: `pnpm dev`, open `http://localhost:3000/settings`, confirm three HoloPanel sections render, sound toggle persists across reload, API key + model persist, Export shows JSON, Reset wipes after confirm. Stop server.

- [ ] **Step 3:** `pnpm test` (existing tests should still pass) + `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add app/settings/page.tsx
git commit -m "feat(settings): compose /settings with Display + Tutor + Data HoloPanel sections"
```

---

## Task 13: NICE -- opt-in `ambientBorder` on home + `/progress` HoloPanels

**Files:**
- Modify: `app/page.tsx` (any HoloPanels rendered there get `ambientBorder`)
- Modify: `app/progress/page.tsx` (per-module + streak panels get `ambientBorder`)
- Verify: `app/globals.css` already has `jarvis-panel-rotate` keyframe (added in Plan 2B Task 5)

- [ ] **Step 1: Verify `jarvis-panel-rotate` keyframe exists in `app/globals.css`** — run `grep "jarvis-panel-rotate" app/globals.css`. If present (it should be, from Plan 2B Task 5), proceed. If not, add inside the existing `@layer utilities` block:

```css
  @keyframes jarvis-panel-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
```

- [ ] **Step 2: Opt in `ambientBorder` on the home page** — open `app/page.tsx`. Wherever `<HoloPanel>` is rendered for the mini status row (`STREAK`, `CARDS DUE`, `RESUME` per spec section 6.1) or anywhere else, add the `ambientBorder` prop. If `app/page.tsx` does not currently render mini HoloPanels and only renders `<ModuleConstellation>`, this step is a no-op for `app/page.tsx`.

Concretely, locate any `<HoloPanel ...>` in `app/page.tsx` and change it to `<HoloPanel ambientBorder ...>`.

- [ ] **Step 3: Opt in `ambientBorder` on `/progress`** — open `app/progress/page.tsx`. Find the per-module HoloPanel loop and the three streak/longest/quiz panels at the bottom. Add the `ambientBorder` prop to all of them:

```diff
- <HoloPanel key={m.id} label={`MOD ${String(m.order).padStart(2, '0')}`}>
+ <HoloPanel key={m.id} ambientBorder label={`MOD ${String(m.order).padStart(2, '0')}`}>
```

and similarly:

```diff
- <HoloPanel label="STREAK">
+ <HoloPanel ambientBorder label="STREAK">
- <HoloPanel label="LONGEST STREAK">
+ <HoloPanel ambientBorder label="LONGEST STREAK">
- <HoloPanel label="QUIZ ATTEMPTS">
+ <HoloPanel ambientBorder label="QUIZ ATTEMPTS">
```

- [ ] **Step 4:** Run `pnpm test components/jarvis/HoloPanel.test.tsx` — confirm no regression (Plan 2B already covers `ambientBorder=true` rendering). Run `pnpm typecheck` — PASS.

- [ ] **Step 5: Manual visual check** — `pnpm dev`, visit `/` and `/progress`, confirm the conic-gradient halo rotates slowly behind opt-in panels. Stop server.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/progress/page.tsx app/globals.css
git commit -m "feat(jarvis): opt in ambientBorder on home + progress HoloPanels"
```

---

## Task 14: NICE -- wire `<GlitchText>` into BootSequence + TickerStrip

**Files:**
- Modify: `components/jarvis/BootSequence.tsx` (the file already wraps the IAM MASTERY brand in `<GlitchText glitch>`; swap the `INITIALIZING SYSTEM...` status line to `SYSTEM ONLINE` and wrap it in `<GlitchText>` too)
- Modify: `components/jarvis/TickerStrip.tsx` (wrap the leading event of each track in `<GlitchText>` so the first event flickers on mount)

- [ ] **Step 1: Update `components/jarvis/BootSequence.tsx`** — wrap the status text in `<GlitchText>` so the SYSTEM ONLINE transition flickers on its way in.

Find:
```tsx
<div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan/60 animate-[jarvis-boot-type_2500ms_steps(20,end)_500ms_forwards] overflow-hidden whitespace-nowrap">
  INITIALIZING SYSTEM...
</div>
```

Replace with:
```tsx
<div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan/60 animate-[jarvis-boot-type_2500ms_steps(20,end)_500ms_forwards] overflow-hidden whitespace-nowrap">
  <GlitchText glitch>SYSTEM ONLINE</GlitchText>
</div>
```

- [ ] **Step 2: Update `components/jarvis/TickerStrip.tsx`** — wrap the FIRST event of each looped track in `<GlitchText>` so events "flash in." Replace the existing file with:

```tsx
import { cn } from '@/lib/utils'
import { GlitchText } from './GlitchText'

interface TickerStripProps {
  events: string[]
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
```

- [ ] **Step 3:** Run `pnpm test components/jarvis/TickerStrip.test.tsx` and `pnpm test components/jarvis/BootSequence.test.tsx`. If any existing test asserts the exact string content of the ticker track or boot status line, update the assertion to match the new wrapped output (the `▸ EVENT` content is still present as text, but now wrapped in a `<span>`). Re-run — PASS.

- [ ] **Step 4:** `pnpm typecheck` — PASS.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/BootSequence.tsx components/jarvis/TickerStrip.tsx
git commit -m "feat(jarvis): wire GlitchText into BootSequence status + TickerStrip first event"
```

---

## Task 15: NICE -- `usePanelGlitch` random-panel flicker hook

**Files:**
- Create: `hooks/use-panel-glitch.ts`
- Create: `hooks/use-panel-glitch.test.ts`
- Modify: `components/jarvis/HoloPanel.tsx` (add `data-jarvis-panel` marker to the inner panel div)
- Modify: `app/globals.css` (add `[data-jarvis-glitch="true"]` rule)
- Modify: `app/page.tsx`, `app/progress/page.tsx` (call `usePanelGlitch()` from inside the page component)

- [ ] **Step 1: Write failing test** — `hooks/use-panel-glitch.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePanelGlitch } from './use-panel-glitch'

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('usePanelGlitch', () => {
  it('toggles data-jarvis-glitch on a random HoloPanel on its interval', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div data-jarvis-panel="1"></div>
      <div data-jarvis-panel="2"></div>
      <div data-jarvis-panel="3"></div>
    `
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 100, maxMs: 100 }))
    vi.advanceTimersByTime(120)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(1)
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
  })

  it('is a no-op under prefers-reduced-motion: reduce', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    const root = document.createElement('div')
    root.innerHTML = `<div data-jarvis-panel="1"></div>`
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 100, maxMs: 100 }))
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
  })
})
```

- [ ] **Step 2: Implement `hooks/use-panel-glitch.ts`**:

```ts
'use client'

import { useEffect } from 'react'

interface PanelGlitchOptions {
  minMs?: number
  maxMs?: number
  /** How long the data-jarvis-glitch attribute stays on the picked panel before clearing. */
  glitchDurationMs?: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePanelGlitch({
  minMs = 15_000,
  maxMs = 30_000,
  glitchDurationMs = 280
}: PanelGlitchOptions = {}) {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let scheduled = 0
    let clearTimer = 0

    function scheduleNext() {
      const wait = Math.floor(minMs + Math.random() * Math.max(0, maxMs - minMs))
      scheduled = window.setTimeout(tick, wait)
    }

    function tick() {
      const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-jarvis-panel]'))
      if (panels.length > 0) {
        const pick = panels[Math.floor(Math.random() * panels.length)]
        pick.setAttribute('data-jarvis-glitch', 'true')
        clearTimer = window.setTimeout(() => {
          pick.removeAttribute('data-jarvis-glitch')
        }, glitchDurationMs)
      }
      scheduleNext()
    }

    scheduleNext()
    return () => {
      window.clearTimeout(scheduled)
      window.clearTimeout(clearTimer)
      document
        .querySelectorAll<HTMLElement>('[data-jarvis-glitch="true"]')
        .forEach((el) => el.removeAttribute('data-jarvis-glitch'))
    }
  }, [minMs, maxMs, glitchDurationMs])
}
```

- [ ] **Step 3: Add the `data-jarvis-panel` marker to `<HoloPanel>`** — open `components/jarvis/HoloPanel.tsx` and add `data-jarvis-panel=""` to the inner panel div so the hook can find them. Find the inner panel div opening tag and add the attribute:

```diff
       <div
+        data-jarvis-panel=""
         className={cn(
           'relative border bg-panel-bg backdrop-blur-md p-4 rounded-[2px]',
```

Add a CSS rule in `app/globals.css` (inside the existing `@layer utilities` block) so the `data-jarvis-glitch="true"` attribute triggers a brief chromatic flicker:

```css
  [data-jarvis-glitch="true"] {
    animation: jarvis-glitch 280ms steps(4, end) 1;
  }
```

(The `jarvis-glitch` keyframe already exists from Plan 2A.)

- [ ] **Step 4: Mount the hook on HUD pages** — call `usePanelGlitch()` from inside both `app/page.tsx` and `app/progress/page.tsx` at the top of each component body:

```tsx
import { usePanelGlitch } from '@/hooks/use-panel-glitch'
// ...inside the component:
usePanelGlitch()
```

- [ ] **Step 5:** Run hook tests — `pnpm test hooks/use-panel-glitch.test.ts` — 2/2 PASS. Run the full suite — confirm no regression. `pnpm typecheck` — PASS.

- [ ] **Step 6: Commit**

```bash
git add hooks/use-panel-glitch.ts hooks/use-panel-glitch.test.ts components/jarvis/HoloPanel.tsx app/globals.css app/page.tsx app/progress/page.tsx
git commit -m "feat(jarvis): add usePanelGlitch random-panel flicker hook, reduced-motion safe"
```

---

## Task 16: a11y + reduced-motion coverage for new surfaces

**Files:**
- Create: `tests/a11y/diagrams-tutor-settings.test.tsx`
- Create: `tests/motion/reduced-motion-2c.test.tsx`

- [ ] **Step 1: Implement `tests/a11y/diagrams-tutor-settings.test.tsx`**:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import SettingsPage from '@/app/settings/page'

expect.extend(toHaveNoViolations)

describe('a11y -- Plan 2C surfaces', () => {
  it('KerberosFlowDiagram has no axe violations', async () => {
    const { container } = render(<KerberosFlowDiagram />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TutorPanel (open) has no axe violations', async () => {
    const { container } = render(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('SettingsPage has no axe violations', async () => {
    const { container } = render(<SettingsPage />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Implement `tests/motion/reduced-motion-2c.test.tsx`**:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import { FlowDiagram, type FlowNode, type FlowStep } from '@/components/diagrams/FlowDiagram'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const NODES: FlowNode[] = [
  { id: 'a', x: 80, y: 100, label: 'A' },
  { id: 'b', x: 480, y: 100, label: 'B' }
]
const STEPS: FlowStep[] = [{ id: 's', from: 'a', to: 'b', label: 'STEP', detail: 'd' }]

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('reduced-motion -- Plan 2C surfaces', () => {
  it('FlowDiagram emits no motion tokens under reduced-motion', () => {
    const { container } = render(
      <FlowDiagram title="t" width={600} height={300} nodes={NODES} steps={STEPS} />
    )
    expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(0)
  })

  it('TutorPanel renders without the slide-in animation class under reduced-motion', () => {
    const { container } = render(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    const outer = container.firstChild as HTMLElement
    expect(outer.className).not.toMatch(/jarvis-slide-in-right/)
  })

  it('usePanelGlitch is a no-op under reduced-motion', () => {
    vi.useFakeTimers()
    const root = document.createElement('div')
    root.innerHTML = `<div data-jarvis-panel="1"></div>`
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 50, maxMs: 50 }))
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 3:** Run both files:

```
pnpm test tests/a11y/diagrams-tutor-settings.test.tsx
pnpm test tests/motion/reduced-motion-2c.test.tsx
```

Expected: 3/3 + 3/3 PASS. If `SettingsPage` renders with violations, fix the underlying labels (typical issues: `<input type="checkbox">` without an associated `<label>` text -- already handled by wrapping the input in `<label>`).

- [ ] **Step 4: Commit**

```bash
git add tests/a11y/diagrams-tutor-settings.test.tsx tests/motion/reduced-motion-2c.test.tsx
git commit -m "test(a11y+motion): cover FlowDiagram + TutorPanel + SettingsPage + usePanelGlitch"
```

---

## Task 17: Regenerate Playwright screenshots

**Files:**
- Modify: `tests/visual/screens/*.png` (regenerated)

- [ ] **Step 1: Regenerate** — the existing Playwright spec at `tests/visual/screens.spec.ts` already covers `/`, `/progress`, `/settings`, and a section route (`/modules/02-protocols/01-kerberos`). Run:

```
pnpm test:visual
```

All 8 screenshots should pass. The home + progress shots now show ambient-bordered HoloPanels. The settings shot now shows the three composed HoloPanel sections. The section shot will only show a diagram if the seeded MDX for `02-protocols/01-kerberos` mounts `<KerberosFlowDiagram />`; if it does not yet (Plan 3 authors content), that is fine -- the screenshot still captures the chrome.

- [ ] **Step 2: Confirm new PNGs**:

```bash
ls -la tests/visual/screens/
```

mtimes should reflect the current run.

- [ ] **Step 3: Commit**

```bash
git add tests/visual/screens
git commit -m "test(visual): regenerate Playwright screenshots for Plan 2C surfaces"
```

---

## Task 18: Final full-suite verification + bundle budget + cross-task review

**Files:** None (verification-only -- only commits if a fix is required)

- [ ] **Step 1: Run all gates**:

```
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

All four MUST pass. Any failures are blockers — fix before reviewing.

- [ ] **Step 2: Bundle budget check** — In the `pnpm build` output, confirm First Load JS per route:

- `/` route: <= ~550 KB gzipped (3D constellation chunk allowed; same budget as Plan 2B)
- Any other route (`/modules/*`, `/flashcards/*`, `/search`, `/progress`, `/settings`): <= ~200 KB gzipped — the diagram chunk + Anthropic SDK should NOT inflate non-home routes past 200 KB. The Anthropic SDK lazy-loads only when `streamTutorReply` is invoked from `useTutorChat`, so it should land in a route chunk only for routes that import `TutorPanel` directly (mostly section pages via `ReadShell`). If `/progress` or `/settings` is over budget because of leaked Anthropic SDK pulls, audit imports -- `TutorPanel` should only be loaded inside `AskProfessorRail`, which is itself mounted only when `tutorSectionId` is passed to `ReadShell`.

If a non-home route exceeds budget, the most likely fixes are:
- Dynamic-import the diagrams: `const KerberosFlowDiagram = dynamic(() => import(...))` for any diagram-heavy route.
- Dynamic-import `TutorPanel`: change `AskProfessorRail` to use `dynamic(() => import('./TutorPanel').then(m => m.TutorPanel), { ssr: false })`.

- [ ] **Step 3 (only if bundle audit found a fix):** Apply the fix in a new commit:

```bash
git add <files>
git commit -m "perf(bundle): <describe fix>"
```

- [ ] **Step 4: Cross-task code review** — Dispatch a final code reviewer subagent over the entire Plan 2C branch diff. Reviewer checks:

- All 5 diagrams render against the JARVIS palette + use the shared `<FlowDiagram>` primitive consistently
- `streamTutorReply` always instantiates a new `Anthropic` client per call with `dangerouslyAllowBrowser: true` and uses `settings.tutorModel`
- `useTutorChat` correctly drops the empty placeholder assistant message on error
- `TutorPanel` honors `prefers-reduced-motion` (no slide-in animation class), respects `Escape` to close, and surfaces the no-key amber notice exactly when `settings.anthropicApiKey` is empty
- `AskProfessorRail` only mounts when `tutorSectionId` is passed to `ReadShell` (so the home + progress HUD pages do not get the rail)
- `usePanelGlitch` is a no-op under reduced-motion and cleans up its timers + DOM attributes on unmount
- `ambientBorder` opt-ins are only on HUD pages (home + `/progress`), not on reading pages (where it would distract from prose)
- `mdx-components.tsx` registers all 5 diagrams + all 8 Plan 2B content components
- No silent setTimeout/rAF/event-listener leaks (every `useEffect` has a cleanup)
- No regressions in Plan 2A / 2B primitives

- [ ] **Step 5:** Address any reviewer findings with targeted commits.

- [ ] **Step 6:** No final commit — the per-task commits are the deliverable record.

---

## Plan 2C acceptance criteria

Plan 2C is done when:

1. ✅ `<FlowDiagram>` primitive renders SVG + animated tokens + click-to-expand details + cursor parallax; no tokens under reduced-motion
2. ✅ `<KerberosFlowDiagram>` renders all 5 steps with ticket-contents detail panels
3. ✅ `<SAMLFlowDiagram>` toggles between SP-initiated and IdP-initiated with rerouted arrows + AuthnRequest / Response / Assertion detail
4. ✅ `<OAuthFlowDiagram>` renders Authorization Code + PKCE flow with PKCE detail + refresh rotation + struck-through Implicit Grant
5. ✅ `<HybridIdentityDiagram>` toggles PHS / PTA / Federation; arrows reroute on mode switch
6. ✅ `<EcosystemMap>` renders 12 ecosystem nodes with category color coding; click highlights connections; pan + zoom work
7. ✅ All 5 diagrams auto-register via `mdx-components.tsx` and render inside MDX without imports
8. ✅ `streamTutorReply` opens an Anthropic streaming session with the configured model, system prompt, history, and section context; tests pass with the SDK mocked
9. ✅ `useTutorChat(sectionId)` loads + persists history under `tutorHistory[sectionId]`, streams replies, surfaces errors, and is no-op when no API key
10. ✅ `<TutorPanel>` renders a right-edge slide-in HoloPanel with cyan typewriter streaming + amber "STORED IN BROWSER" notice when no key
11. ✅ `<AskProfessorRail>` is mounted by `ReadShell` only when `tutorSectionId` is passed
12. ✅ `/settings` renders three HoloPanel sections (Display, Tutor, Data) wired to `lib/progress.ts` -- sound toggle, API key, model selector, export, import, reset all work
13. ✅ Opt-in `ambientBorder` rotates on home + `/progress` HoloPanels
14. ✅ `<GlitchText>` wired into BootSequence SYSTEM ONLINE line + TickerStrip first event
15. ✅ `usePanelGlitch()` flickers a random HoloPanel every 15–30s on HUD pages; no-op under reduced motion
16. ✅ axe-core a11y tests pass for KerberosFlowDiagram + TutorPanel + SettingsPage
17. ✅ Reduced-motion tests pass for FlowDiagram tokens + TutorPanel slide-in + usePanelGlitch
18. ✅ Playwright smoke screenshots regenerated and committed
19. ✅ Bundle budget met (non-home routes <= 200 KB gzipped; `/` <= ~550 KB)
20. ✅ `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` all clean
21. ✅ 18 git commits, one per task

---

## Self-review notes

**Spec coverage check (against `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md`):**

| Spec section | Covered by | Notes |
|---|---|---|
| §9.1 — ambitious 2D `<FlowDiagram>` primitive | T1 | Motion tokens, layered blur, hover-zoom, click-to-expand, cursor parallax all in the primitive |
| §9.1 — `<KerberosFlowDiagram>` | T2 | AS-REQ -> AS-REP -> TGS-REQ -> TGS-REP -> AP-REQ + ticket-contents details |
| §9.1 — `<SAMLFlowDiagram>` | T3 | SP-initiated + IdP-initiated toggle + AuthnRequest/Response/Assertion XML details |
| §9.1 — `<OAuthFlowDiagram>` | T4 | Authorization Code + PKCE + refresh rotation + struck Implicit Grant |
| §9.1 — `<HybridIdentityDiagram>` | T5 | PHS / PTA / Federation mode toggle with rerouted arrows |
| §9.1 — `<EcosystemMap>` | T6 | Pan/zoom + click-to-highlight connections |
| §10 — AI Study Tutor "Ask the Professor" | T8, T9, T10, T11 | SDK wrapper + hook + slide-in panel + rail |
| §10 — default model `claude-sonnet-4-6` | T8, T12 | Default in StoredState, exposed in settings selector |
| §10 — per-section `tutorHistory[sectionId]` persistence | T9 | `appendTutorMessage` + `loadTutorHistory` helpers |
| §10 — API key in localStorage with amber warning | T10, T12 | Notice in TutorPanel + warning in Settings |
| §10 — section MDX content grounding | T8, T9, T10 | `sectionContent` plumbed from rail -> panel -> hook -> SDK wrapper |
| §10 — streaming responses, cyan typewriter | T10 | streaming flag + pulsing block cursor |
| §6.7 — `/settings` page composed with three HoloPanels | T12 | Display + Tutor + Data |
| §7.1 NICE — opt-in `ambientBorder` on HoloPanels | T13 | Opted in on home + `/progress` |
| §7.1 NICE — `<GlitchText>` accent reveals | T14 | Wired into BootSequence + TickerStrip |
| §7.1 NICE — random panel glitch flicker every 15–30s | T15 | `usePanelGlitch` hook, reduced-motion safe |
| §12 — axe-core a11y for tutor + new surfaces | T16 | Diagrams + TutorPanel + SettingsPage |
| §12 — reduced-motion coverage | T16 | FlowDiagram tokens + TutorPanel slide-in + usePanelGlitch |
| §12 — Playwright visual regression | T17 | Regenerated for home, progress, settings, section |
| §12 — bundle budget verification | T18 | Per-route audit |

**Placeholder scan:** No `TBD`, `TODO`, or `similar to Task N` placeholders. Each step has runnable commands and complete code blocks.

**Type / API consistency check:**
- `streamTutorReply` is defined in `lib/anthropic-client.ts` (T8) and called from `hooks/use-tutor-chat.ts` (T9) — name + arg shape identical.
- `TutorMessage` exported from `lib/anthropic-client.ts` (T8) and re-used in `hooks/use-tutor-chat.ts` (T9).
- `FlowNode` and `FlowStep` exported from `components/diagrams/FlowDiagram.tsx` (T1) and consumed by T2–T6.
- `appendTutorMessage` + `loadTutorHistory` defined in `lib/progress.ts` (T9 Step 1) and consumed by `useTutorChat` (T9 Step 3) and tests.
- `useTutorChat(sectionId)` consumed by `<TutorPanel>` (T10) and `<TutorPanel>` mounted by `<AskProfessorRail>` (T11).
- `tutorSectionId` + `tutorSectionContent` props on `ReadShell` (T11) flow through to `<AskProfessorRail>` then `<TutorPanel>` unchanged.
- `data-jarvis-panel` attribute added to HoloPanel inner div (T15 Step 3) and queried by `usePanelGlitch` (T15 Step 2).
- Default model `'claude-sonnet-4-6'` matches the value already in `StoredState.settings.tutorModel` default (verified in `lib/progress.ts`).

**Scope check:** 18 tasks. Each task is self-contained with one purpose. Subagents can dispatch independently. No new npm deps.

**Non-mutation check on `StoredState`:** T9 Step 1 only appends helper functions; the `StoredState` interface, `defaultState()` shape, and storage key (`iam-mastery:v1`) all stay unchanged.

---

## Next plan

After Plan 2C completes via `superpowers:subagent-driven-development`:

- **Plan 3 — Curriculum Authoring + Real Sound Files** — author the 12 modules of MDX content under `content/modules/**/*.mdx`, replace the placeholder silent WAV stubs in `public/sounds/` with the real cinematic tick/chime/tone-down/boot files, seed the flashcard deck and quiz banks, and wire `tutorSectionId` + `tutorSectionContent` into the section page so the AskProfessorRail picks up the live MDX body.
- **Plan 4 — Search Index + Flashcard SRS Algorithm** — build the Fuse.js search index over the seeded content; flesh out the Leitner box review scheduler.
- **Plan 5 — Vercel Deploy + Production Polish** — env wiring, custom domain, OG images, real-user monitoring, final bundle audit.
