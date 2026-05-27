# Home Polish Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the two outstanding home-page gaps that Plan 2C deliberately deferred. Land the `STREAK / CARDS DUE / RESUME` HUD mini-panel row beneath the constellation, and fully rewrite the 3D `<ModuleConstellation3D>` as a "holographic command sphere" composition (wireframe dodecahedron core + 12 spherical module nodes + cubic-bezier arc connections + ambient particle wash + cursor camera parallax) wired back through the existing wrapper with the SVG fallback intact.

**Architecture:** Telemetry lives in a new pure `lib/home-telemetry.ts` consumed by a new `<HudMiniPanels>` client component (`components/jarvis/HudMiniPanels.tsx`). The three panels are `<HoloPanel ambientBorder>` blocks each wrapped in `<Link>` (the primitive does not accept `onClick`). The 3D rewrite tears down the existing `components/jarvis/ModuleConstellation3D.tsx` and rebuilds it around a `PerspectiveCamera` at `[0, 0, 12]`, a wireframe `dodecahedronGeometry` core, an inner pulsing `sphereGeometry`, 12 module nodes placed at the canonical 12 icosahedron vertices, cubic-bezier arc paths via drei `<Line>`, 300 ambient particles via drei `<Points>`, and a cursor parallax `useFrame` lerp. The mastery % overlay is hoisted OUT of R3F into an absolute-positioned `<div>` over the canvas (the `9cb015f` fix pattern). The existing `components/jarvis/ModuleConstellation.tsx` wrapper is re-enabled to select between 3D and the existing `<ModuleConstellationSVG>` fallback via `prefersReducedMotion()` + `hasWebGL()`; `app/page.tsx` switches its direct SVG import back to that wrapper. All Three.js + R3F + drei deps already ship with the home route from Plan 2B - bundle budget for `/` stays at the same ~550 KB ceiling.

**Tech Stack:** Plan 2A + 2B + 2C stack (Next.js 16, TypeScript 5 strict, Tailwind 4, Framer Motion 12, Three.js + R3F + drei, Vitest, Playwright, jest-axe). `three@^0.184.0`, `@react-three/fiber@^9.6.1`, `@react-three/drei@^10.7.7`, `framer-motion@^12.0.0` are already in `package.json`. **No new dependencies are added in this wave.** `next.config.mjs` keeps `reactStrictMode: false` (the Plan 2B workaround for R3F WebGL context-lost on double-mount).

**Spec reference:** `docs/superpowers/specs/2026-05-27-home-polish-wave-design.md` (commit `6abb05e`) - §3 (Home HUD mini-panels), §4 (3D `<ModuleConstellation>` revival).

**This plan delivers:**
- `lib/home-telemetry.ts` with `computeHomeTelemetry(state, modules)` returning `{ streakDays, cardsDue, resume }` (T1).
- `components/jarvis/HudMiniPanels.tsx` with three `<Link>`-wrapped `<HoloPanel ambientBorder>` panels reading from `computeHomeTelemetry` + subscribing to `iam-mastery:state-change` (T2).
- `<HudMiniPanels>` mounted inside `<HudShell>` on `/` (T3).
- Restored 3D-vs-SVG selector in `components/jarvis/ModuleConstellation.tsx` with `hasWebGL()` + `prefersReducedMotion()` gates and lazy-loaded `ModuleConstellation3D` (T4).
- Full rewrite of `components/jarvis/ModuleConstellation3D.tsx` scaffold - `<Canvas>`, `<PerspectiveCamera>`, lighting, mastery % overlay hoisted into a sibling `<div>`, hidden a11y `<nav>` outside the canvas (T5).
- The 3D scene layers - wireframe dodecahedron core, pulsing inner sphere, 12 module nodes at icosahedron vertices, billboarded module labels, cubic-bezier arc connections, 300-particle ambient field (T6).
- Hover + click + cursor parallax interactions on the 3D scene (T7).
- `app/page.tsx` switched from direct `<ModuleConstellationSVG>` import to the `<ModuleConstellation>` wrapper (T8).
- `HudMiniPanels` axe coverage + wrapper reduced-motion coverage (T9).
- Regenerated Playwright `home.png` (T10).
- Final verification + bundle budget check + cross-task code review (T11).
- 11 git commits, one per task.

**Out of scope for this wave** (deferred):
- Particle field count downshift on low-core devices (spec §6.2 NICE - defer to follow-up if real-device profiling demands it).
- Subtle conic-gradient halo BEHIND the canvas (spec §6.2 NICE - defer).
- Phase-color "current module" pulse signal (spec §9 open question - revisit when Plan 3 curriculum content lands).

---

## File structure produced by this plan

```
~/projects/iam-mastery/
├── app/
│   └── page.tsx                                  # T3 + T8 (mount HudMiniPanels; switch back to wrapper)
├── components/jarvis/
│   ├── HudMiniPanels.tsx                         # T2 - NEW
│   ├── HudMiniPanels.test.tsx                    # T2 - NEW
│   ├── ModuleConstellation.tsx                   # T4 - re-enable 3D selector path
│   ├── ModuleConstellation.test.tsx              # T4 (expand) + T9 (reduced-motion)
│   ├── ModuleConstellation3D.tsx                 # T5 + T6 + T7 - FULL REWRITE
│   └── ModuleConstellationSVG.tsx                # untouched (fallback)
├── lib/
│   ├── home-telemetry.ts                         # T1 - NEW
│   └── home-telemetry.test.ts                    # T1 - NEW
├── tests/
│   ├── a11y/
│   │   └── diagrams-tutor-settings.test.tsx     # T9 (extend with HudMiniPanels axe check)
│   └── motion/
│       └── home-polish.test.tsx                  # T9 - NEW (wrapper reduced-motion check)
└── tests/visual/screens/
    └── home.png                                  # T10 (regenerated)
```

Task numbers (T1-T11) indicate which task creates each file.

---
## Task 1: `lib/home-telemetry.ts` - `computeHomeTelemetry` pure helper

**Files:**
- Create: `lib/home-telemetry.ts`
- Create: `lib/home-telemetry.test.ts`

- [ ] **Step 1: Write failing test** - `lib/home-telemetry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeHomeTelemetry } from './home-telemetry'
import { getAllModules } from './content'
import type { StoredState } from './progress'

function baseState(): StoredState {
  return {
    version: 1,
    progress: { sections: {}, modules: {} },
    quizzes: {},
    flashcards: {},
    streak: { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: new Date().toISOString() },
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
}

describe('computeHomeTelemetry', () => {
  const modules = getAllModules()

  it('returns zero/start-fallback for empty state', () => {
    const t = computeHomeTelemetry(baseState(), modules)
    expect(t.streakDays).toBe(0)
    expect(t.cardsDue).toBe(0)
    expect(t.resume.href).toBe('/modules/01-foundations/01-identity-crisis')
    expect(t.resume.title).toMatch(/start|01-identity-crisis/i)
    expect(t.resume.crumb).toBe('01-foundations')
  })

  it('passes through streak.currentDays directly', () => {
    const s = baseState()
    s.streak.currentDays = 7
    expect(computeHomeTelemetry(s, modules).streakDays).toBe(7)
  })

  it('returns the most-recently-visited section as resume', () => {
    const s = baseState()
    s.progress.sections['02-protocols/01-kerberos'] = {
      visitedAt: '2026-05-20T10:00:00.000Z',
      timeSpentSeconds: 60
    }
    s.progress.sections['03-microsoft-identity/02-entra-id'] = {
      visitedAt: '2026-05-26T22:00:00.000Z',
      timeSpentSeconds: 120
    }
    s.progress.sections['01-foundations/02-lexicon'] = {
      visitedAt: '2026-05-15T08:00:00.000Z',
      timeSpentSeconds: 30
    }
    const t = computeHomeTelemetry(s, modules)
    expect(t.resume.href).toBe('/modules/03-microsoft-identity/02-entra-id')
    expect(t.resume.crumb).toBe('03-microsoft-identity')
  })

  it('counts only flashcards whose nextDue is at or before now', () => {
    const s = baseState()
    const past = new Date(Date.now() - 60_000).toISOString()
    const future = new Date(Date.now() + 60 * 60_000).toISOString()
    s.flashcards = {
      a: { leitnerBox: 1, lastReviewed: past, nextDue: past, correctStreak: 0 },
      b: { leitnerBox: 2, lastReviewed: past, nextDue: past, correctStreak: 1 },
      c: { leitnerBox: 3, lastReviewed: past, nextDue: future, correctStreak: 2 }
    }
    expect(computeHomeTelemetry(s, modules).cardsDue).toBe(2)
  })

  it('falls back to first-section href when the visited section key cannot be resolved to a known module', () => {
    const s = baseState()
    s.progress.sections['99-unknown/01-ghost'] = {
      visitedAt: new Date().toISOString(),
      timeSpentSeconds: 5
    }
    const t = computeHomeTelemetry(s, modules)
    expect(t.resume.href).toBe('/modules/01-foundations/01-identity-crisis')
  })
})
```

- [ ] **Step 2:** `pnpm test lib/home-telemetry.test.ts` -> FAIL (module does not exist).

- [ ] **Step 3: Implement `lib/home-telemetry.ts`**:

```ts
import type { StoredState } from './progress'
import type { ModuleMeta } from './types'

export interface HomeTelemetry {
  streakDays: number
  cardsDue: number
  resume: {
    href: string
    title: string
    crumb: string
  }
}

function firstSectionFallback(modules: ModuleMeta[]): HomeTelemetry['resume'] {
  const seeded = modules.find((m) => m.sections.length > 0)
  if (!seeded) {
    return { href: '/modules/01-foundations', title: 'START MODULE 01', crumb: '01-foundations' }
  }
  const sectionId = seeded.sections[0]
  return {
    href: `/modules/${seeded.id}/${sectionId}`,
    title: `START ${sectionId.toUpperCase()}`,
    crumb: seeded.id
  }
}

function resolveResumeTarget(
  sectionKey: string,
  modules: ModuleMeta[]
): HomeTelemetry['resume'] | null {
  const [moduleId, sectionId] = sectionKey.split('/')
  if (!moduleId || !sectionId) return null
  const mod = modules.find((m) => m.id === moduleId)
  if (!mod) return null
  if (!mod.sections.includes(sectionId)) return null
  return {
    href: `/modules/${moduleId}/${sectionId}`,
    title: sectionId.toUpperCase(),
    crumb: moduleId
  }
}

export function computeHomeTelemetry(state: StoredState, modules: ModuleMeta[]): HomeTelemetry {
  const streakDays = state.streak.currentDays

  const nowMs = Date.now()
  const cardsDue = Object.values(state.flashcards).filter((f) => {
    const due = Date.parse(f.nextDue)
    return Number.isFinite(due) && due <= nowMs
  }).length

  const visited = Object.entries(state.progress.sections)
    .map(([key, s]) => ({ key, visitedAt: s.visitedAt }))
    .filter((e) => typeof e.visitedAt === 'string' && e.visitedAt.length > 0)
    .sort((a, b) => (a.visitedAt < b.visitedAt ? 1 : -1))

  let resume: HomeTelemetry['resume'] | null = null
  for (const v of visited) {
    const candidate = resolveResumeTarget(v.key, modules)
    if (candidate) {
      resume = candidate
      break
    }
  }
  if (!resume) resume = firstSectionFallback(modules)

  return { streakDays, cardsDue, resume }
}
```

- [ ] **Step 4:** Run tests - expect 5/5 PASS. `pnpm typecheck` - PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/home-telemetry.ts lib/home-telemetry.test.ts
git commit -m "feat(home): add computeHomeTelemetry pure helper for streak/cards/resume"
```

---
## Task 2: `<HudMiniPanels>` component + tests

**Files:**
- Create: `components/jarvis/HudMiniPanels.tsx`
- Create: `components/jarvis/HudMiniPanels.test.tsx`

- [ ] **Step 1: Write failing test** - `components/jarvis/HudMiniPanels.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { HudMiniPanels } from './HudMiniPanels'

const STORAGE_KEY = 'iam-mastery:v1'

function seedState(patch: Record<string, unknown>) {
  const base = {
    version: 1,
    progress: { sections: (patch.sections as unknown) ?? {}, modules: {} },
    quizzes: {},
    flashcards: (patch.flashcards as unknown) ?? {},
    streak: (patch.streak as unknown) ?? { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: new Date().toISOString() },
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
}

beforeEach(() => {
  window.localStorage.clear()
})
afterEach(() => {
  window.localStorage.clear()
})

describe('HudMiniPanels', () => {
  it('renders the three panel labels (STREAK / CARDS DUE / RESUME)', () => {
    render(<HudMiniPanels />)
    expect(screen.getByText('STREAK')).toBeInTheDocument()
    expect(screen.getByText('CARDS DUE')).toBeInTheDocument()
    expect(screen.getByText('RESUME')).toBeInTheDocument()
  })

  it('each panel is a navigable link to its natural target', () => {
    seedState({ streak: { currentDays: 4, lastStudyDate: '2026-05-27', longestDays: 4 } })
    render(<HudMiniPanels />)
    const streak = screen.getByRole('link', { name: /streak/i })
    const cards = screen.getByRole('link', { name: /cards due/i })
    const resume = screen.getByRole('link', { name: /resume/i })
    expect(streak.getAttribute('href')).toBe('/progress')
    expect(cards.getAttribute('href')).toBe('/flashcards')
    expect(resume.getAttribute('href')).toMatch(/^\/modules\//)
  })

  it('reflects iam-mastery:state-change updates without unmount', () => {
    render(<HudMiniPanels />)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    act(() => {
      seedState({ streak: { currentDays: 9, lastStudyDate: '2026-05-27', longestDays: 9 } })
      window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
    })
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2:** `pnpm test components/jarvis/HudMiniPanels.test.tsx` -> FAIL (module does not exist).

- [ ] **Step 3: Implement `components/jarvis/HudMiniPanels.tsx`**:

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HoloPanel } from './HoloPanel'
import { TelemetryValue } from './TelemetryValue'
import { computeHomeTelemetry, type HomeTelemetry } from '@/lib/home-telemetry'
import { loadState } from '@/lib/progress'
import { getAllModules } from '@/lib/content'

function read(): HomeTelemetry {
  return computeHomeTelemetry(loadState(), getAllModules())
}

export function HudMiniPanels() {
  const [telemetry, setTelemetry] = useState<HomeTelemetry>(() => read())

  useEffect(() => {
    function onChange() {
      setTelemetry(read())
    }
    onChange()
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
      <Link
        href="/progress"
        aria-label={`STREAK: ${telemetry.streakDays} days. Open progress dashboard.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel ambientBorder label="STREAK">
          <div className="font-display text-3xl text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={telemetry.streakDays} suffix="d" />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ CURRENT
          </div>
        </HoloPanel>
      </Link>

      <Link
        href="/flashcards"
        aria-label={`CARDS DUE: ${telemetry.cardsDue} cards. Open flashcards.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel
          ambientBorder
          label="CARDS DUE"
          intent={telemetry.cardsDue === 0 ? 'default' : 'warn'}
        >
          <div className="font-display text-3xl text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={telemetry.cardsDue} />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ TODAY
          </div>
        </HoloPanel>
      </Link>

      <Link
        href={telemetry.resume.href}
        aria-label={`RESUME: ${telemetry.resume.title}. Continue in ${telemetry.resume.crumb}.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel ambientBorder label="RESUME">
          <div className="truncate font-display text-base text-cyan glow-cyan">
            {telemetry.resume.title}
          </div>
          <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ {telemetry.resume.crumb}
          </div>
        </HoloPanel>
      </Link>
    </div>
  )
}
```

- [ ] **Step 4:** Run tests - expect 3/3 PASS. `pnpm typecheck` - PASS.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/HudMiniPanels.tsx components/jarvis/HudMiniPanels.test.tsx
git commit -m "feat(home): add HudMiniPanels (STREAK/CARDS DUE/RESUME) with live state subscription"
```

---
## Task 3: Mount `<HudMiniPanels>` in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Edit `app/page.tsx`** - add the import and render the panels inside `<HudShell>` below the constellation. The full file should read:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  usePanelGlitch()
  const [mastery, setMastery] = useState(() => computeMastery(loadState()))

  useEffect(() => {
    function onChange() {
      setMastery(computeMastery(loadState()))
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <HudShell events={SAMPLE_TICKER}>
      <div className="flex flex-col items-center">
        <ModuleConstellationSVG totalMasteryPercent={mastery.totalPercent} />
        <HudMiniPanels />
      </div>
    </HudShell>
  )
}
```

> The `<ModuleConstellationSVG>` direct import stays in place for this task; T8 swaps it for the wrapper once the 3D rewrite is verified. Keeping the SVG live here means each task ships an independently-shippable diff.

- [ ] **Step 2:** `pnpm test` - full suite still green (no test should regress). `pnpm typecheck` - PASS.

- [ ] **Step 3:** `pnpm dev` smoke - load `/`, confirm three panels render in a row below the constellation, each click navigates to `/progress`, `/flashcards`, and a `/modules/...` route respectively. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): mount HudMiniPanels below the constellation in HudShell"
```

---

## Task 4: Restore `<ModuleConstellation>` wrapper 3D-vs-SVG selector

**Files:**
- Modify: `components/jarvis/ModuleConstellation.tsx`
- Modify: `components/jarvis/ModuleConstellation.test.tsx` (expand)

The wrapper already exists with the correct shape but `app/page.tsx` is currently bypassing it. This task hardens the wrapper, adds the `hasWebGL()` SSR guard, and expands its test coverage so the selector logic is locked in before T8 switches the home page over.

- [ ] **Step 1: Replace `components/jarvis/ModuleConstellation.tsx`** with the hardened version:

```tsx
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ModuleConstellationSVG } from './ModuleConstellationSVG'

const ModuleConstellation3D = dynamic(
  () => import('./ModuleConstellation3D').then((m) => m.ModuleConstellation3D),
  {
    ssr: false,
    loading: () => <ModuleConstellationSVG totalMasteryPercent={0} />
  }
)

interface ModuleConstellationProps {
  totalMasteryPercent: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const ctx =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    return !!ctx
  } catch {
    return false
  }
}

export function ModuleConstellation({ totalMasteryPercent }: ModuleConstellationProps) {
  const [mode, setMode] = useState<'svg' | '3d' | null>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) {
      setMode('svg')
    } else {
      setMode('3d')
    }
  }, [])

  if (mode === null || mode === 'svg') {
    return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  }
  return <ModuleConstellation3D totalMasteryPercent={totalMasteryPercent} />
}
```

- [ ] **Step 2: Expand `components/jarvis/ModuleConstellation.test.tsx`** - keep the existing reduced-motion case and add a no-WebGL case plus a hidden-nav assertion:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ModuleConstellation wrapper', () => {
  describe('under prefers-reduced-motion: reduce', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: q.includes('reduce'),
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
    })

    it('renders the SVG fallback (12 nodes, no <canvas>)', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
      expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
      expect(container.querySelector('canvas')).toBeNull()
    })

    it('hidden a11y nav with 12 module links is present in the SVG path', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={42} />)
      const nav = container.querySelector('nav[aria-label="Module navigation"]')
      expect(nav).not.toBeNull()
      expect(nav!.querySelectorAll('a').length).toBe(12)
    })
  })

  describe('when WebGL is unavailable', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null as never)
    })

    it('renders the SVG fallback (no canvas)', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
      expect(container.querySelector('canvas')).toBeNull()
      expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    })
  })
})
```

- [ ] **Step 3:** Run `pnpm test components/jarvis/ModuleConstellation.test.tsx` - expect 3/3 PASS. `pnpm typecheck` - PASS.

- [ ] **Step 4:** `pnpm test` - full suite still green. The wrapper does NOT yet render on `/` (T3 still uses the direct SVG import); this task just hardens the wrapper so T5-T7 can rebuild the 3D path against it.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/ModuleConstellation.tsx components/jarvis/ModuleConstellation.test.tsx
git commit -m "feat(constellation): harden 3D-vs-SVG selector with hasWebGL guard + nav coverage"
```

---
## Task 5: `<ModuleConstellation3D>` rewrite - scaffold + camera + mastery % overlay hoist

**Files:**
- Modify: `components/jarvis/ModuleConstellation3D.tsx` (FULL REWRITE - discard the existing implementation)

This task stands up the new file shell: `<Canvas>` + `<PerspectiveCamera>` + lighting + the mastery % overlay hoisted into a sibling `<div>` (drei `<Html>` is removed) + a hidden a11y `<nav>` outside the canvas. The 3D scene layers (core, nodes, arcs, particles) land in T6; interaction lands in T7.

- [ ] **Step 1: Replace `components/jarvis/ModuleConstellation3D.tsx`** with the scaffold:

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { TelemetryValue } from './TelemetryValue'

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const modules = getAllModules().slice(0, 12)

  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerspectiveCamera makeDefault fov={38} position={[0, 0, 12]} near={0.1} far={100} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} color="#00f0ff" intensity={1.2} />
        {/* Scene layers land in T6; interaction lands in T7. */}
      </Canvas>

      {/* Mastery % overlay -- hoisted OUT of R3F per the 9cb015f fix pattern. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={totalMasteryPercent} />
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </div>

      {/* Hidden accessible nav -- outside the canvas so keyboard + screen reader users get the same module list as the SVG fallback. */}
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
```

- [ ] **Step 2:** `pnpm typecheck` - PASS. `pnpm test components/jarvis/ModuleConstellation.test.tsx` - 3/3 PASS (the SVG-only branches still own the wrapper test). `pnpm build` - PASS (sanity check that R3F + drei still resolve correctly in the chunked import).

- [ ] **Step 3:** `pnpm dev` smoke - temporarily mount `<ModuleConstellation />` on `/` (do NOT commit this swap; we are only verifying the scaffold paints). Disable reduced-motion in OS settings if applicable. Confirm:
  - Canvas paints transparently (AmbientBackground gradient still visible behind it).
  - Mastery % overlay appears dead-center over the canvas.
  - No console errors about WebGL context loss or drei missing imports.
  Revert the temporary `app/page.tsx` swap before committing.

- [ ] **Step 4: Commit**

```bash
git add components/jarvis/ModuleConstellation3D.tsx
git commit -m "feat(constellation): rewrite ModuleConstellation3D scaffold with PerspectiveCamera + mastery overlay hoist"
```

---
## Task 6: 3D scene layers - core, nodes, arcs, particles

**Files:**
- Modify: `components/jarvis/ModuleConstellation3D.tsx` (extend T5 scaffold)

This task fills in the visual scene inside `<Canvas>` - wireframe dodecahedron core, pulsing inner sphere, 12 module nodes at icosahedron vertices, billboarded labels, cubic-bezier arc connections, and a 300-particle ambient field. Hover and click come in T7.

- [ ] **Step 1: Update `components/jarvis/ModuleConstellation3D.tsx`** - wire in the scene. The whole file (replacing the T5 scaffold) should read:

```tsx
'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, PerspectiveCamera, Points, PointMaterial, Text } from '@react-three/drei'
import Link from 'next/link'
import * as THREE from 'three'
import { getAllModules } from '@/lib/content'
import { TelemetryValue } from './TelemetryValue'
import type { ModuleMeta } from '@/lib/types'

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

const PHASE_COLOR: Record<1 | 2 | 3, string> = {
  1: '#00f0ff',
  2: '#ffb800',
  3: '#888888'
}

/** Returns the 12 vertices of an icosahedron of the given radius (golden-ratio derivation). */
function icosahedronVertices(radius: number): THREE.Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2
  const raw: [number, number, number][] = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ]
  const norm = Math.sqrt(1 + phi * phi)
  return raw.map(([x, y, z]) => new THREE.Vector3((x / norm) * radius, (y / norm) * radius, (z / norm) * radius))
}

/** Samples a cubic bezier curve through P0 -> C1 -> C2 -> P3 at `segments + 1` points. */
function cubicBezierPoints(
  p0: THREE.Vector3,
  c1: THREE.Vector3,
  c2: THREE.Vector3,
  p3: THREE.Vector3,
  segments: number
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const it = 1 - t
    const b0 = it * it * it
    const b1 = 3 * it * it * t
    const b2 = 3 * it * t * t
    const b3 = t * t * t
    pts.push(
      new THREE.Vector3(
        p0.x * b0 + c1.x * b1 + c2.x * b2 + p3.x * b3,
        p0.y * b0 + c1.y * b1 + c2.y * b2 + p3.y * b3,
        p0.z * b0 + c1.z * b1 + c2.z * b2 + p3.z * b3
      )
    )
  }
  return pts
}

/** Spherical-shell point cloud for the ambient particle wash. */
function shellParticles(count: number, rMin: number, rMax: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = rMin + Math.random() * (rMax - rMin)
    arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    arr[i * 3 + 2] = r * Math.cos(phi)
  }
  return arr
}

function CoreShell() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    // Y rotation, full revolution every 8s.
    ref.current.rotation.y = (clock.getElapsedTime() / 8) * Math.PI * 2
  })
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[1.8, 0]} />
      <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.85} />
    </mesh>
  )
}

function CorePulse() {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (!matRef.current) return
    // Sine pulse 0.15 <-> 0.35 over a 3s period.
    const t = clock.getElapsedTime()
    const k = 0.5 + 0.5 * Math.sin((t / 3) * Math.PI * 2)
    matRef.current.opacity = 0.15 + k * 0.2
    if (ref.current) ref.current.rotation.y = -t * 0.05
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshBasicMaterial ref={matRef} color="#00f0ff" transparent opacity={0.25} />
    </mesh>
  )
}

interface NodeData {
  module: ModuleMeta
  position: THREE.Vector3
  color: string
  arcPoints: THREE.Vector3[]
}

function buildNodes(modules: ModuleMeta[]): NodeData[] {
  const verts = icosahedronVertices(4.5)
  return modules.slice(0, 12).map((m, i) => {
    const p = verts[i]
    const mid = p.clone().multiplyScalar(0.5)
    const outward = mid.clone().normalize().multiplyScalar(1.2)
    const control = mid.clone().add(outward)
    const arc = cubicBezierPoints(new THREE.Vector3(0, 0, 0), control, control, p, 32)
    return {
      module: m,
      position: p,
      color: PHASE_COLOR[m.phase as 1 | 2 | 3],
      arcPoints: arc
    }
  })
}

function ModuleNodeGroup({ nodes }: { nodes: NodeData[] }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Counter-rotate the whole node ring; one revolution every 14s.
    groupRef.current.rotation.y = -(clock.getElapsedTime() / 14) * Math.PI * 2
  })
  return (
    <group ref={groupRef}>
      {nodes.map((n) => (
        <group key={n.module.id} position={n.position}>
          <mesh>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshBasicMaterial color={n.color} />
          </mesh>
          <Text
            position={[0, 0.42, 0]}
            fontSize={0.18}
            color={n.color}
            anchorX="center"
            anchorY="middle"
          >
            {String(n.module.order).padStart(2, '0')}
          </Text>
        </group>
      ))}
    </group>
  )
}

function ArcConnections({ nodes }: { nodes: NodeData[] }) {
  return (
    <>
      {nodes.map((n) => (
        <Line
          key={`arc-${n.module.id}`}
          points={n.arcPoints}
          color={n.color}
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
    </>
  )
}

function AmbientParticles() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => shellParticles(300, 6, 9), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    // Very slow tumble for the whole field.
    const t = clock.getElapsedTime()
    ref.current.rotation.x = t * 0.01
    ref.current.rotation.y = t * 0.015
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00f0ff" size={0.04} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  )
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const modules = getAllModules().slice(0, 12)
  const nodes = useMemo(() => buildNodes(modules), [modules])

  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerspectiveCamera makeDefault fov={38} position={[0, 0, 12]} near={0.1} far={100} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} color="#00f0ff" intensity={1.2} />
        <CoreShell />
        <CorePulse />
        <ArcConnections nodes={nodes} />
        <ModuleNodeGroup nodes={nodes} />
        <AmbientParticles />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={totalMasteryPercent} />
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </div>

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
```

- [ ] **Step 2:** `pnpm typecheck` - PASS. `pnpm build` - PASS.

- [ ] **Step 3:** `pnpm dev` smoke - temporarily mount `<ModuleConstellation />` on `/` and confirm:
  - Wireframe dodecahedron core rotates slowly on Y.
  - Inner sphere visibly pulses opacity.
  - 12 colored spheres are distributed in 3D space (NOT flat - verify by moving the dev tools overlay around; you should see depth).
  - Each node has a small two-digit order label that faces the camera.
  - Faint cyan arc curves connect each node back toward the origin.
  - A spherical halo of small cyan points washes around the whole composition.
  - Mastery % stays cleanly centered.
  Revert the temporary swap before committing.

- [ ] **Step 4: Commit**

```bash
git add components/jarvis/ModuleConstellation3D.tsx
git commit -m "feat(constellation): add core/nodes/arcs/particles layers to holographic command sphere"
```

---
## Task 7: Interaction - hover state + click nav + cursor parallax

**Files:**
- Modify: `components/jarvis/ModuleConstellation3D.tsx`

This task adds the three interactions: node hover (scale + glow + arc brighten + traveling token along the hovered arc), node click (router push to the module page), and cursor parallax (camera lerps toward the cursor offset). All motion-based interactions gate on `prefersReducedMotion()`.

- [ ] **Step 1: Update `components/jarvis/ModuleConstellation3D.tsx`** - keep the existing helpers (`icosahedronVertices`, `cubicBezierPoints`, `shellParticles`, `buildNodes`, `CoreShell`, `CorePulse`, `AmbientParticles`) untouched, and replace `ArcConnections`, `ModuleNodeGroup`, and `ModuleConstellation3D` with these interactive versions. Also add a `ParallaxCamera` component and a `prefersReducedMotion` helper.

Add near the other helpers at the top of the file:

```tsx
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

Replace `ArcConnections` with the hover-aware version (the `hoveredId` prop drives the brighten + the traveling token):

```tsx
function ArcConnections({ nodes, hoveredId }: { nodes: NodeData[]; hoveredId: string | null }) {
  return (
    <>
      {nodes.map((n) => {
        const active = hoveredId === n.module.id
        return (
          <Line
            key={`arc-${n.module.id}`}
            points={n.arcPoints}
            color={n.color}
            lineWidth={active ? 2 : 1}
            transparent
            opacity={active ? 0.85 : 0.25}
          />
        )
      })}
      {hoveredId && <ArcToken node={nodes.find((n) => n.module.id === hoveredId)!} />}
    </>
  )
}

function ArcToken({ node }: { node: NodeData }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const period = 1.8 // seconds
    const t = (clock.getElapsedTime() % period) / period
    const segments = node.arcPoints.length - 1
    const exact = t * segments
    const i0 = Math.floor(exact)
    const i1 = Math.min(segments, i0 + 1)
    const localT = exact - i0
    const a = node.arcPoints[i0]
    const b = node.arcPoints[i1]
    ref.current.position.set(
      a.x + (b.x - a.x) * localT,
      a.y + (b.y - a.y) * localT,
      a.z + (b.z - a.z) * localT
    )
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={node.color} />
    </mesh>
  )
}
```

Replace `ModuleNodeGroup` with the hover + click version. It accepts `onHover`, `onLeave`, and `onSelect` callbacks. Hover scales the node mesh to 1.3; click fires the router push (the parent passes a callback wrapping `router.push`):

```tsx
function ModuleNodeGroup({
  nodes,
  hoveredId,
  onHover,
  onLeave,
  onSelect
}: {
  nodes: NodeData[]
  hoveredId: string | null
  onHover: (id: string) => void
  onLeave: (id: string) => void
  onSelect: (id: string) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = -(clock.getElapsedTime() / 14) * Math.PI * 2
  })
  return (
    <group ref={groupRef}>
      {nodes.map((n) => {
        const isHovered = hoveredId === n.module.id
        const scale = isHovered ? 1.3 : 1
        return (
          <group key={n.module.id} position={n.position}>
            <mesh
              scale={scale}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
                onHover(n.module.id)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = ''
                onLeave(n.module.id)
              }}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(n.module.id)
              }}
            >
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshBasicMaterial color={n.color} />
            </mesh>
            <Text
              position={[0, 0.42, 0]}
              fontSize={0.18}
              color={n.color}
              anchorX="center"
              anchorY="middle"
            >
              {String(n.module.order).padStart(2, '0')}
            </Text>
          </group>
        )
      })}
    </group>
  )
}
```

Add the parallax camera controller (no-op under reduced motion). It reads `state.pointer` (R3F's normalized -1..1 cursor) and lerps the camera toward `pointer * 0.6` per axis at 8%/frame:

```tsx
function ParallaxCamera({ enabled }: { enabled: boolean }) {
  useFrame((state) => {
    if (!enabled) return
    const targetX = Math.max(-0.6, Math.min(0.6, state.pointer.x * 0.6))
    const targetY = Math.max(-0.6, Math.min(0.6, state.pointer.y * 0.6))
    state.camera.position.x += (targetX - state.camera.position.x) * 0.08
    state.camera.position.y += (targetY - state.camera.position.y) * 0.08
    state.camera.lookAt(0, 0, 0)
  })
  return null
}
```

Replace the exported `ModuleConstellation3D` component with the interactive version. It owns `hoveredId` state, uses `useRouter` for click navigation, and only mounts `<ParallaxCamera enabled />` when `prefersReducedMotion()` is false. Extend the React import to include `useState` and add `useRouter` from `next/navigation` at the top of the file:

```tsx
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ... helpers and sub-components above ...

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const router = useRouter()
  const modules = getAllModules().slice(0, 12)
  const nodes = useMemo(() => buildNodes(modules), [modules])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [parallaxEnabled] = useState(() => !prefersReducedMotion())

  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerspectiveCamera makeDefault fov={38} position={[0, 0, 12]} near={0.1} far={100} />
        <ParallaxCamera enabled={parallaxEnabled} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} color="#00f0ff" intensity={1.2} />
        <CoreShell />
        <CorePulse />
        <ArcConnections nodes={nodes} hoveredId={hoveredId} />
        <ModuleNodeGroup
          nodes={nodes}
          hoveredId={hoveredId}
          onHover={(id) => setHoveredId(id)}
          onLeave={(id) => setHoveredId((current) => (current === id ? null : current))}
          onSelect={(id) => router.push(`/modules/${id}`)}
        />
        <AmbientParticles />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={totalMasteryPercent} />
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </div>

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
```

> Ensure the file has exactly one `import { useMemo, useRef, useState } from 'react'` line (extend the T6 import rather than duplicating). The `next/navigation` import is new.

- [ ] **Step 2:** `pnpm typecheck` - PASS. `pnpm build` - PASS.

- [ ] **Step 3:** `pnpm dev` smoke - temporarily mount `<ModuleConstellation />` on `/` and verify:
  - Hovering a node scales it ~30% larger, brightens its arc, and a small traveling token loops along the arc.
  - Clicking a node navigates to `/modules/{id}` (verify URL bar).
  - Moving the cursor across the canvas tilts the camera with a buttery lerp (no jitter).
  - With OS reduced-motion enabled, the camera does NOT track the cursor (overall scene still paints).
  Revert the temporary swap before committing.

- [ ] **Step 4: Commit**

```bash
git add components/jarvis/ModuleConstellation3D.tsx
git commit -m "feat(constellation): add hover/click/parallax interactions to holographic command sphere"
```

---
## Task 8: Switch `app/page.tsx` back to the `<ModuleConstellation>` wrapper

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Edit `app/page.tsx`** - swap the direct SVG import for the wrapper. The full file should read:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  usePanelGlitch()
  const [mastery, setMastery] = useState(() => computeMastery(loadState()))

  useEffect(() => {
    function onChange() {
      setMastery(computeMastery(loadState()))
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <HudShell events={SAMPLE_TICKER}>
      <div className="flex flex-col items-center">
        <ModuleConstellation totalMasteryPercent={mastery.totalPercent} />
        <HudMiniPanels />
      </div>
    </HudShell>
  )
}
```

- [ ] **Step 2:** `pnpm test` - full suite green. `pnpm typecheck` - PASS. `pnpm lint` - PASS.

- [ ] **Step 3:** `pnpm dev` smoke - confirm on `/`:
  - The 3D constellation paints with all T6/T7 features (core, nodes, arcs, particles, hover, click, parallax).
  - The mini panels still render below the constellation and stay clickable.
  - With OS reduced-motion enabled, the SVG fallback paints (12 anchor circles, dashed rings) and the mini panels remain functional.
  Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): switch home page back to ModuleConstellation wrapper (3D + SVG fallback)"
```

---

## Task 9: a11y axe coverage for `HudMiniPanels` + reduced-motion coverage for the wrapper

**Files:**
- Modify: `tests/a11y/diagrams-tutor-settings.test.tsx` (extend)
- Create: `tests/motion/home-polish.test.tsx`

- [ ] **Step 1: Extend `tests/a11y/diagrams-tutor-settings.test.tsx`** - add a single `it()` block for `<HudMiniPanels>`. Keep every existing test untouched.

Add to the imports at the top of the file (alongside the existing `@/components/jarvis/*` imports):

```tsx
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
```

Add at the end of the existing `describe('a11y -- Plan 2C surfaces', ...)` block:

```tsx
  it('HudMiniPanels has no axe violations', async () => {
    const { container } = render(<HudMiniPanels />)
    expect(await axe(container)).toHaveNoViolations()
  })
```

- [ ] **Step 2: Create `tests/motion/home-polish.test.tsx`** - covers the wrapper's reduced-motion fallback and confirms no `<canvas>` ever paints under that signal:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('reduced-motion -- home polish wave', () => {
  it('ModuleConstellation wrapper picks the SVG fallback (no <canvas>)', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={50} />)
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
  })

  it('SVG fallback exposes the hidden a11y nav with 12 links', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={50} />)
    const nav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(nav).not.toBeNull()
    expect(nav!.querySelectorAll('a').length).toBe(12)
  })
})
```

- [ ] **Step 3:** Run both files:

```
pnpm test tests/a11y/diagrams-tutor-settings.test.tsx
pnpm test tests/motion/home-polish.test.tsx
```

Expected: existing axe suite still passes plus the new HudMiniPanels case (1 added), and home-polish motion suite passes 2/2.

- [ ] **Step 4: Commit**

```bash
git add tests/a11y/diagrams-tutor-settings.test.tsx tests/motion/home-polish.test.tsx
git commit -m "test(a11y+motion): cover HudMiniPanels axe + ModuleConstellation wrapper reduced-motion"
```

---

## Task 10: Regenerate Playwright `home.png`

**Files:**
- Modify: `tests/visual/screens/home.png` (regenerated)

- [ ] **Step 1: Regenerate** - the existing Playwright spec at `tests/visual/screens.spec.ts` covers `/`. The home shot now includes the three mini panels below the constellation; under the default Playwright env (no OS reduced-motion flag) the 3D canvas paints. Run:

```
pnpm test:visual
```

Only `home.png` should drift. If other screenshots drift, that is a regression - investigate before re-baselining anything else.

- [ ] **Step 2: Verify the new PNG**:

```bash
ls -la tests/visual/screens/home.png
```

mtime should reflect the current run. Open the PNG in an image viewer and confirm the mini panels appear below the constellation and the 3D canvas (or SVG fallback if Playwright is configured with reduced-motion) is visible.

- [ ] **Step 3: Commit**

```bash
git add tests/visual/screens/home.png
git commit -m "test(visual): regenerate home.png screenshot for HudMiniPanels + 3D constellation"
```

---

## Task 11: Final verification + bundle budget + cross-task review

**Files:** None (verification-only - only commits if a fix is required)

- [ ] **Step 1: Run all gates**:

```
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

All four MUST pass. Any failures are blockers - fix before reviewing.

- [ ] **Step 2: Bundle budget check** - In the `pnpm build` output, confirm First Load JS per route:

- `/` route: <= ~550 KB gzipped (3D chunk allowed; same budget as Plan 2B and Plan 2C).
- Any non-home route (`/modules/*`, `/flashcards/*`, `/search`, `/progress`, `/settings`): <= ~200 KB gzipped. The Three.js + R3F + drei chunk should remain code-split on `/` only via the `dynamic(() => import('./ModuleConstellation3D'), { ssr: false })` import in `ModuleConstellation.tsx`. If a non-home route inflated, the most likely cause is a stray `import { ModuleConstellation3D } ...` somewhere - audit `git grep "ModuleConstellation3D"` and confirm the only direct importer is the dynamic call inside `ModuleConstellation.tsx`.

If the home route exceeds ~550 KB, the most likely fixes are:
- Lower `<AmbientParticles>` from 300 to 200 points (drei `<Points>` is fine but each vertex costs a float32x3).
- Drop the `dpr={[1, 2]}` upper bound to `[1, 1.5]` on the `<Canvas>` (T6 + T7).

- [ ] **Step 3 (only if a fix was applied):** Commit:

```bash
git add <files>
git commit -m "perf(bundle): <describe fix>"
```

- [ ] **Step 4: Cross-task code review** - Dispatch a code reviewer subagent over the full Home Polish Wave branch diff. Reviewer checks:

- `computeHomeTelemetry` is pure (no `window`, no `Date.now()` outside the explicit `nowMs` variable, no I/O).
- `HudMiniPanels` cleans up its `iam-mastery:state-change` listener on unmount and never renders a `<button>` (per spec note: `HoloPanel` does not accept `onClick`, so navigation is done by wrapping in `<Link>`).
- `ModuleConstellation` wrapper selector path: reduced-motion OR no-WebGL -> SVG; otherwise lazy-load 3D. SSR path returns SVG synchronously (`mode === null`).
- `hasWebGL()` guards against `typeof document === 'undefined'` and probes `webgl2` before `webgl`.
- `ModuleConstellation3D` mounts the mastery % overlay OUTSIDE the `<Canvas>` (no drei `<Html>` anywhere).
- The hidden `<nav>` with 12 `<Link>`s is present in both the 3D path and the SVG fallback.
- Icosahedron vertex math: exactly 12 vertices, all at radius 4.5 (verify by running a quick `console.log(verts.map((v) => v.length()))` in dev if uncertain).
- Cubic-bezier arc helper: passing P0 = origin, C1 = C2 = `mid + normalize(mid) * 1.2`, P3 = node position; 32 sample segments.
- `ParallaxCamera` gates on reduced-motion via the `enabled` prop. Hover events still fire under reduced motion (R3F pointer events are independent of CSS-level motion), which is desired - we only suppress the camera lerp and avoid animating CSS.
- No silent `setTimeout` / `requestAnimationFrame` / event-listener leaks. Every `useEffect` has a cleanup. `useFrame` is the only animation driver and is managed by R3F.
- `app/page.tsx` final form imports `ModuleConstellation` (wrapper), not `ModuleConstellationSVG`.
- No regressions in Plan 2A / 2B / 2C primitives - particularly `<HoloPanel>` (no shape change), `<TelemetryValue>` (still drives the streak/cards counters), `<HudShell>` (still wraps the home page).

- [ ] **Step 5:** Address any reviewer findings with targeted commits.

- [ ] **Step 6:** No final wrap-up commit - the per-task commits are the deliverable record.

---
## Home Polish Wave acceptance criteria

The wave is done when:

1. ✅ `lib/home-telemetry.ts` exports `computeHomeTelemetry(state, modules)` with 5/5 unit tests passing.
2. ✅ `<HudMiniPanels>` renders three `<Link>`-wrapped `<HoloPanel ambientBorder>` panels: STREAK -> `/progress`, CARDS DUE -> `/flashcards`, RESUME -> resolved section href.
3. ✅ `<HudMiniPanels>` subscribes to `iam-mastery:state-change` and updates in place.
4. ✅ `app/page.tsx` mounts the mini panels inside `<HudShell>` below the constellation.
5. ✅ `<ModuleConstellation>` wrapper selects SVG under `prefers-reduced-motion: reduce` OR no-WebGL; otherwise lazy-loads `<ModuleConstellation3D>`.
6. ✅ `<ModuleConstellation3D>` renders the new holographic command sphere: wireframe dodecahedron core (8s rotation), pulsing inner sphere (3s opacity sine), 12 module nodes at icosahedron vertices (group counter-rotates at 14s), billboarded order labels, cubic-bezier arc connections, 300-point ambient particle wash.
7. ✅ Mastery % overlay is rendered as an absolute-positioned sibling `<div>` over the `<Canvas>` (no drei `<Html>`).
8. ✅ Hovering a node scales it ~30%, brightens its arc to opacity 0.85, and emits a 1.8s-loop traveling token along that arc.
9. ✅ Clicking a node fires `router.push('/modules/{id}')`.
10. ✅ Cursor parallax lerps the camera within ±0.6 units in X/Y at 8%/frame; disabled under reduced motion.
11. ✅ Hidden a11y `<nav>` with 12 `<Link>`s is present in both 3D and SVG paths.
12. ✅ axe-core a11y test passes for `<HudMiniPanels>`.
13. ✅ Reduced-motion test confirms wrapper picks SVG fallback (no `<canvas>`).
14. ✅ Playwright `home.png` regenerated and committed.
15. ✅ `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` all clean.
16. ✅ Bundle budget met (`/` <= ~550 KB gzipped; non-home routes <= 200 KB gzipped).
17. ✅ 11 git commits, one per task.

---

## Self-review notes

**Spec coverage check (against `docs/superpowers/specs/2026-05-27-home-polish-wave-design.md`):**

| Spec section | Covered by | Notes |
|---|---|---|
| §3.1 - `<HudMiniPanels>` component shape | T2 | Three `<Link>`-wrapped `<HoloPanel ambientBorder>` panels |
| §3.1 - mount inside `<HudShell>` below constellation | T3 | Wrapped in a column flex to stack constellation + panels |
| §3.2 - `lib/home-telemetry.ts` with `computeHomeTelemetry` | T1 | Pure function, no I/O; consumes `StoredState` + `ModuleMeta[]` |
| §3.2 - `resolveResumeTarget` + `firstSectionFallback` | T1 | Internal helpers within the module |
| §3.3 - empty-state, single-visited, multiple-visited, future-cutoff tests | T1 | All four cases covered + a "ghost module key" robustness case |
| §3.3 - render + click + reactivity tests | T2 | Three render-tier cases |
| §4.1 - scene composition (core, nodes, labels, arcs, particles, lighting) | T6 | All seven layers in the table |
| §4.2 - `PerspectiveCamera` FOV 38° at `[0, 0, 12]` + cursor parallax lerp + reduced-motion gate | T5 (camera), T7 (parallax) | Parallax via `state.pointer` and `useFrame` lerp |
| §4.3 - mastery % overlay outside `<Canvas>` | T5 | `<div className="absolute inset-0">` sibling to `<Canvas>` |
| §4.4 - hover state + click navigation + hidden a11y nav | T5 (nav), T7 (hover + click) | `useRouter().push('/modules/{id}')` |
| §4.5 - wrapper restores 3D-vs-SVG selector with `hasWebGL()` | T4 | Lazy-imported 3D component, SVG synchronous fallback |
| §4.6 - wrapper SVG-on-reduced-motion + 12-link nav tests | T4, T9 | Plus a "no-WebGL -> SVG" branch test |
| §6.1 MUST list (all 10 items) | T1-T11 | Each maps cleanly above |
| §7 testing strategy (unit / a11y / reduced-motion / visual / bundle) | T1 (unit), T9 (a11y + reduced-motion), T10 (visual), T11 (bundle) | |
| §8 acceptance criteria (9 items) | T1-T11 | Mirrored 1:1 in the section above |

**Placeholder scan:** No `TBD`, `TODO`, or "similar to Task N" placeholders. Each step has runnable commands and complete code blocks. The two heaviest tasks (T6 + T7) spell out the full R3F JSX - no "implement the scene" hand-waves.

**Type / API consistency check:**
- `HomeTelemetry` is defined in `lib/home-telemetry.ts` (T1) and imported by `components/jarvis/HudMiniPanels.tsx` (T2) under the exact same name.
- `computeHomeTelemetry(state, modules)` signature: `state: StoredState`, `modules: ModuleMeta[]`. T2 calls it as `computeHomeTelemetry(loadState(), getAllModules())`.
- `HudMiniPanels` is the component name used in T2, T3, T8, T9 - consistent.
- `ModuleConstellation` (wrapper) is the export name in T4 and the import name in T8 - consistent.
- `ModuleConstellation3D` (3D implementation) is the export name in T5/T6/T7 and the dynamic-import target in T4 - consistent.
- `NodeData` is internal to T6/T7 (`buildNodes` returns `NodeData[]`; `ModuleNodeGroup` + `ArcConnections` + `ArcToken` all accept it).
- `cubicBezierPoints(p0, c1, c2, p3, segments)` signature defined in T6, reused unchanged in T7's `ArcToken` (which interpolates between adjacent arc points rather than recomputing the bezier).
- `prefersReducedMotion()` helper is defined inside `ModuleConstellation3D.tsx` (T7) and inside `ModuleConstellation.tsx` (T4) as separate local helpers - duplication is intentional to keep each file self-contained.
- The 12 icosahedron vertices: T6 uses `icosahedronVertices(4.5)`, returning exactly 12 `THREE.Vector3` instances, each normalized to length 4.5. T7's `ParallaxCamera` operates on the camera directly and never touches the node positions, so the geometry remains consistent across tasks.
- Color mapping: `PHASE_COLOR[1] = '#00f0ff'` (cyan), `PHASE_COLOR[2] = '#ffb800'` (amber), `PHASE_COLOR[3] = '#888888'` (gray) - matches the spec verbatim.

**Scope check:** 11 tasks, each self-contained. T1-T2 land the mini panel pipeline. T3 mounts the panels (intermediate ship-able state - home still uses SVG). T4 hardens the wrapper without changing what the home page renders. T5-T7 fully rebuild the 3D scene. T8 atomically switches the home page over. T9-T11 verify. No new npm deps.

**Non-mutation check on `StoredState`:** Zero changes. `lib/progress.ts`, `lib/types.ts`, and the `iam-mastery:v1` storage key all stay untouched.

**Stability of the in-progress home page:** After each task, `/` still loads and works. T3 ships mini panels on top of the SVG-only constellation. T4 only changes the wrapper file (not imported by `/` yet). T5-T7 only change the 3D file (still not imported by `/`). T8 atomically swaps the import. This sequence lets a reviewer pause after any task and ship.

---

## Next plan

After Home Polish Wave completes via `superpowers:subagent-driven-development`:

- **Plan 3 - Curriculum Authoring + Real Sound Files** - author the 12 modules of MDX content under `content/modules/**/*.mdx`, replace the placeholder silent WAV stubs, seed the flashcard deck and quiz banks, wire `tutorSectionId` + `tutorSectionContent` into the section page so the AskProfessorRail picks up the live MDX body, and revisit the "phase-color current module pulse" open question once real activity signal exists.
