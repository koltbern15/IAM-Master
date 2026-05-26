# JARVIS 3D + Interactions (Plan 2B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer the JARVIS interaction system on top of the Plan 2A visual foundations: a real 3D React Three Fiber ModuleConstellation on the home page (with SVG fallback), a `cmdk`-driven command palette, keyboard shortcuts + `?` help overlay, opt-in Howler sound, Framer Motion page transitions, a canvas ParticleField on HUD pages, all 8 MDX content components (Quiz, Flashcard, WarStory, ProTip, SC300Badge, Definition, PowerShellBlock, CommandReference), the `/progress` HudShell composition, and a11y + reduced-motion test coverage.

**Architecture:** 3D Constellation lives in `components/jarvis/ModuleConstellation3D.tsx` (React Three Fiber + drei) and is dynamically imported via Next.js `dynamic({ ssr: false })` so it only loads on `/`. A new `<ModuleConstellation>` wrapper selects between the 3D and SVG versions based on `prefers-reduced-motion` + WebGL detection. Command palette wired through a global `<CommandPaletteProvider>` mounted in `app/layout.tsx`. Sound stays opt-in via a `useSound()` hook that no-ops unless `settings.soundEnabled === true`. MDX components auto-registered via `mdx-components.tsx` so they're usable in any `.mdx` without imports.

**Tech Stack:** Plan 2A stack (Next.js 16, TypeScript 5 strict, Tailwind 4, Framer Motion 12, Vitest, Playwright) + new dependencies: `three`, `@react-three/fiber`, `@react-three/drei`. `cmdk`, `howler`, `fuse.js`, `@anthropic-ai/sdk`, MDX libs are already installed from Plan 1 (preemptive deps).

**Spec reference:** `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md` (§5.2 — JARVIS primitives upgrades, §6.1 home page 3D, §6.6 progress page HUD, §7 motion + palette + keyboard + sound, §8 MDX components, §9.2 3D doctrine, §11.1 MUST scope — minus flow diagrams and AI Tutor which are Plan 2C).

**This plan delivers:**
- Three real new dependencies installed: `three`, `@react-three/fiber`, `@react-three/drei`. Bundle isolation: 3D chunk only loads on `/`.
- `<ParticleField>` canvas primitive (60–100 dots + constellation lines within 120px) — used on HUD pages only.
- `<ModuleConstellation3D>` — real React Three Fiber scene; 12 orbiting node meshes + glowing icosahedron core + rotating ring geometry + cursor-driven camera parallax.
- `<ModuleConstellation>` wrapper that selects between 3D and SVG fallback. Existing SVG component renamed to `<ModuleConstellationSVG>`.
- 4 sound files in `public/sounds/` (`tick.wav`, `chime.wav`, `tone-down.wav`, `boot.wav`).
- `useSound()` hook with Howler integration, opt-in via `settings.soundEnabled`.
- `useKeyboardShortcuts()` hook + `<KeyboardHelpOverlay>` triggered by `?`.
- `<CommandPalette>` with `cmdk` — fuzzy-search across sections + actions registry.
- `<PageTransition>` Framer Motion wrapper for route changes (200ms fade + 4px y-translate).
- `<MdxComponents>` auto-registration map exposing all 8 MDX components.
- `<Quiz>`, `<Flashcard>`, `<WarStory>`, `<ProTip>`, `<SC300Badge>`, `<Definition>`, `<PowerShellBlock>`, `<CommandReference>` — each with `.test.tsx`.
- `/progress` page composed in `<HudShell>` — `<RadialSegmentRing>` centerpiece + per-module breakdown grid + 90-day heatmap + streak history.
- Home page totalMasteryPercent + phase counts wired to real `lib/progress.ts` data.
- axe-core a11y tests for layout shells + Quiz + CommandPalette + tutor entry button.
- `prefers-reduced-motion` test coverage for new motion components (ParticleField, 3D scene fallback, PageTransition).
- Playwright screenshots regenerated to capture new visuals.
- 22 git commits, one per task.

**Out of scope for Plan 2B** (deferred):
- All 5 animated flow diagrams: `<KerberosFlowDiagram>`, `<SAMLFlowDiagram>`, `<OAuthFlowDiagram>`, `<HybridIdentityDiagram>`, `<EcosystemMap>` (Plan 2C).
- AI Study Tutor right-pane with streaming responses (Plan 2C).
- Real MDX content authoring (Plan 4 — curriculum seeding).
- Vercel deploy (Plan 5).
- Random panel glitch flicker — NICE tier (Plan 2C cleanup).
- AmbientBorder conic-gradient rotation on `<HoloPanel>` — NICE tier (Plan 2C cleanup).

---

## File structure produced by this plan

```
~/projects/iam-mastery/
├── app/
│   ├── layout.tsx                                # T17 (mount CommandPalette + PageTransition)
│   ├── page.tsx                                  # T4, T17 (wire real progress + select 3D/SVG)
│   └── progress/page.tsx                         # T16 (full HudShell composition)
├── components/
│   ├── jarvis/
│   │   ├── ParticleField.tsx                     # T2
│   │   ├── ParticleField.test.tsx                # T2
│   │   ├── ModuleConstellationSVG.tsx            # T3 (rename from existing)
│   │   ├── ModuleConstellationSVG.test.tsx       # T3 (rename from existing)
│   │   ├── ModuleConstellation3D.tsx             # T3 (RTF scene)
│   │   ├── ModuleConstellation.tsx               # T3 (wrapper)
│   │   ├── ModuleConstellation.test.tsx          # T3 (wrapper test)
│   │   ├── CommandPalette.tsx                    # T6
│   │   ├── CommandPalette.test.tsx               # T6
│   │   ├── KeyboardHelpOverlay.tsx               # T7
│   │   ├── KeyboardHelpOverlay.test.tsx          # T7
│   │   └── PageTransition.tsx                    # T9
│   ├── content/
│   │   ├── Quiz.tsx                              # T11
│   │   ├── Quiz.test.tsx                         # T11
│   │   ├── Flashcard.tsx                         # T12
│   │   ├── Flashcard.test.tsx                    # T12
│   │   ├── WarStory.tsx                          # T13
│   │   ├── ProTip.tsx                            # T13
│   │   ├── SC300Badge.tsx                        # T13
│   │   ├── Definition.tsx                        # T13
│   │   ├── callouts.test.tsx                     # T13
│   │   ├── PowerShellBlock.tsx                   # T14
│   │   ├── PowerShellBlock.test.tsx              # T14
│   │   ├── CommandReference.tsx                  # T15
│   │   └── CommandReference.test.tsx             # T15
├── hooks/
│   ├── use-sound.ts                              # T8
│   ├── use-sound.test.ts                         # T8
│   ├── use-keyboard-shortcuts.ts                 # T7
│   └── use-keyboard-shortcuts.test.ts            # T7
├── lib/
│   ├── command-actions.ts                        # T6 (palette action registry)
│   ├── mastery.ts                                # T17 (derive total + per-phase from progress)
│   └── mastery.test.ts                           # T17
├── public/sounds/
│   ├── tick.wav                                  # T1
│   ├── chime.wav                                 # T1
│   ├── tone-down.wav                             # T1
│   └── boot.wav                                  # T1
├── mdx-components.tsx                            # T10 (auto-register MDX content)
└── package.json                                  # T1 (+three, @react-three/fiber, @react-three/drei)
```

Task numbers (T1–T22) indicate which task creates each file.

---

## Task 1: Install 3D dependencies + add sound assets

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `public/sounds/tick.wav`, `chime.wav`, `tone-down.wav`, `boot.wav` (placeholder stubs)

- [ ] **Step 1: Install three.js stack**

Run: `pnpm add three @react-three/fiber @react-three/drei`
Then: `pnpm add -D @types/three`
Expected: 4 packages resolved + lockfile updated. Some peer-dep warnings ok.

- [ ] **Step 2: Create placeholder sound files**

The real sound files arrive in Plan 2C. For now, create 4 tiny silent WAV stubs so `useSound()` doesn't 404 in dev:

```bash
mkdir -p public/sounds
# 44-byte minimal WAV header + 0 samples = silent
printf 'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00' > public/sounds/tick.wav
cp public/sounds/tick.wav public/sounds/chime.wav
cp public/sounds/tick.wav public/sounds/tone-down.wav
cp public/sounds/tick.wav public/sounds/boot.wav
```

Verify: `ls -la public/sounds/` should show 4 WAV files at ~44 bytes each.

- [ ] **Step 3: Verify install**

Run: `pnpm list three @react-three/fiber @react-three/drei --depth=0`
Expected: all 3 listed with versions.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml public/sounds
git commit -m "chore: install three + react-three-fiber + drei; add sound placeholder stubs"
```

---

## Task 2: `<ParticleField>` canvas primitive

**Files:**
- Create: `components/jarvis/ParticleField.tsx`
- Create: `components/jarvis/ParticleField.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleField } from './ParticleField'

describe('ParticleField', () => {
  it('renders a canvas element with pointer-events:none', () => {
    const { container } = render(<ParticleField />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas?.className).toContain('pointer-events-none')
  })

  it('sets aria-hidden', () => {
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not render canvas when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')).toBeNull()
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 2:** `pnpm test components/jarvis/ParticleField.test.tsx` → FAIL.

- [ ] **Step 3: Implement `components/jarvis/ParticleField.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

interface ParticleFieldProps {
  count?: number
  connectionDistance?: number
  className?: string
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ParticleField({
  count = 80,
  connectionDistance = 120,
  className
}: ParticleFieldProps) {
  const [enabled, setEnabled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Downshift particle count on weak hardware
    const hwCores = navigator.hardwareConcurrency ?? 4
    const effectiveCount = hwCores < 4 ? Math.floor(count * 0.4) : count

    const particles: Particle[] = Array.from({ length: effectiveCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }))

    let rafId = 0
    function tick() {
      ctx!.clearRect(0, 0, width, height)
      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        ctx!.fillStyle = 'rgba(0, 240, 255, 0.22)'
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx!.fill()
      }
      // Constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.08
            ctx!.strokeStyle = `rgba(0, 240, 255, ${alpha})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
          }
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    function onResize() {
      width = canvas!.width = window.innerWidth
      height = canvas!.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled, count, connectionDistance])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-0', className)}
    />
  )
}
```

- [ ] **Step 4:** Run tests — expect 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/ParticleField.tsx components/jarvis/ParticleField.test.tsx
git commit -m "feat(jarvis): add ParticleField canvas with constellation lines + perf throttle"
```

---

## Task 3: Split ModuleConstellation into SVG fallback + 3D RTF + wrapper

**Files:**
- Rename: `components/jarvis/ModuleConstellation.tsx` → `ModuleConstellationSVG.tsx`
- Rename: `components/jarvis/ModuleConstellation.test.tsx` → `ModuleConstellationSVG.test.tsx`
- Create: `components/jarvis/ModuleConstellation3D.tsx`
- Create: `components/jarvis/ModuleConstellation.tsx` (new wrapper)
- Create: `components/jarvis/ModuleConstellation.test.tsx` (wrapper test)

- [ ] **Step 1: Rename existing SVG version**

```bash
git mv components/jarvis/ModuleConstellation.tsx components/jarvis/ModuleConstellationSVG.tsx
git mv components/jarvis/ModuleConstellation.test.tsx components/jarvis/ModuleConstellationSVG.test.tsx
```

- [ ] **Step 2: Update the export in `ModuleConstellationSVG.tsx`** — rename the function from `ModuleConstellation` to `ModuleConstellationSVG`:

Find: `export function ModuleConstellation({` → Replace with: `export function ModuleConstellationSVG({`

- [ ] **Step 3: Update the test import + assertion in `ModuleConstellationSVG.test.tsx`** — import the renamed export and update all references:

Find: `import { ModuleConstellation } from './ModuleConstellation'` → Replace with: `import { ModuleConstellationSVG } from './ModuleConstellationSVG'`

Find/replace ALL `<ModuleConstellation` → `<ModuleConstellationSVG` and `ModuleConstellation (SVG fallback)` describe label → `ModuleConstellationSVG`.

Run: `pnpm test components/jarvis/ModuleConstellationSVG.test.tsx` → expect 4/4 PASS.

- [ ] **Step 4: Create `components/jarvis/ModuleConstellation3D.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrthographicCamera, Text } from '@react-three/drei'
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import type { ModuleId } from '@/lib/types'
import * as THREE from 'three'

const PHASE_EMISSIVE: Record<1 | 2 | 3, string> = {
  1: '#00f0ff',
  2: '#ffb800',
  3: '#808080'
}

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

interface ModuleConstellation3DProps {
  totalMasteryPercent: number
}

function ParallaxCamera() {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    target.current.x = state.pointer.x * 0.3
    target.current.y = state.pointer.y * 0.3
    camera.position.x += (target.current.x - camera.position.x) * 0.05
    camera.position.y += (target.current.y - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

function MasteryCore({ percent }: { percent: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.07
  })
  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
      <Html center distanceFactor={8}>
        <div className="pointer-events-none whitespace-nowrap text-center">
          <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong tabular-nums">
            {Math.round(percent)}
            <span className="ml-1 text-2xl text-cyan/60">%</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
            CURRICULUM MASTERY
          </div>
        </div>
      </Html>
    </group>
  )
}

function ModuleNode({
  index,
  module: m
}: {
  index: number
  module: ReturnType<typeof getAllModules>[number]
}) {
  const angleDeg = index * 30 - 90
  const rad = (angleDeg * Math.PI) / 180
  const r = 4.2
  const x = r * Math.cos(rad)
  const y = -r * Math.sin(rad) // negate y so top is +y in Three's coord system
  const phase = m.phase as 1 | 2 | 3
  const color = PHASE_EMISSIVE[phase]

  return (
    <group position={[x, y, 0]}>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, 0, 0.5]}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {String(m.order).padStart(2, '0')}
      </Text>
      <Text
        position={[0, -0.85, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {SHORT_LABEL[m.id]}
      </Text>
      {/* Invisible HTML overlay for click + a11y */}
      <Html center>
        <Link
          href={`/modules/${m.id}`}
          aria-label={`${m.order}. ${m.title}`}
          className="block size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          title={m.title}
        />
      </Html>
    </group>
  )
}

function OrbitalRings() {
  const ringARef = useRef<THREE.Mesh>(null)
  const ringBRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringARef.current) ringARef.current.rotation.z = t * 0.15
    if (ringBRef.current) ringBRef.current.rotation.z = -t * 0.1
  })
  return (
    <group>
      <mesh ref={ringARef}>
        <ringGeometry args={[4.5, 4.55, 64]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringBRef}>
        <ringGeometry args={[5.1, 5.13, 96]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.08} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function ModuleConstellation3D({ totalMasteryPercent }: ModuleConstellation3DProps) {
  const modules = getAllModules()
  return (
    <div className="relative" style={{ width: 600, height: 600 }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 5]} color="#00f0ff" intensity={2} />
        <ParallaxCamera />
        <OrbitalRings />
        <MasteryCore percent={totalMasteryPercent} />
        {modules.map((m, i) => (
          <ModuleNode key={m.id} index={i} module={m} />
        ))}
      </Canvas>
      {/* Hidden accessible nav for screen readers */}
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

- [ ] **Step 5: Write failing wrapper test** — Create `components/jarvis/ModuleConstellation.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ModuleConstellation wrapper', () => {
  it('renders the SVG fallback when prefers-reduced-motion is set', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    // SVG fallback has 12 anchor nodes
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    // 3D path mounts a <canvas>; fallback path should NOT
    expect(container.querySelector('canvas')).toBeNull()
  })
})
```

- [ ] **Step 6: Implement `components/jarvis/ModuleConstellation.tsx`** (the wrapper):

```tsx
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ModuleConstellationSVG } from './ModuleConstellationSVG'

const ModuleConstellation3D = dynamic(
  () => import('./ModuleConstellation3D').then((m) => m.ModuleConstellation3D),
  { ssr: false, loading: () => <ModuleConstellationSVG totalMasteryPercent={0} /> }
)

interface ModuleConstellationProps {
  totalMasteryPercent: number
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
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

  if (mode === null) {
    // SSR fallback: render SVG synchronously so first paint shows something
    return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  }
  if (mode === 'svg') {
    return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  }
  return <ModuleConstellation3D totalMasteryPercent={totalMasteryPercent} />
}
```

- [ ] **Step 7:** Run wrapper test — 1/1 PASS. Run renamed SVG tests — 4/4 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 8:** Run `pnpm build` — verify it succeeds and the home route shows a separate 3D chunk in build output (look for a chunk name including `three` or `react-three-fiber`).

- [ ] **Step 9: Commit**

```bash
git add components/jarvis/ModuleConstellation.tsx components/jarvis/ModuleConstellation.test.tsx components/jarvis/ModuleConstellation3D.tsx components/jarvis/ModuleConstellationSVG.tsx components/jarvis/ModuleConstellationSVG.test.tsx
git commit -m "feat(jarvis): split ModuleConstellation into SVG fallback + 3D RTF + selector wrapper"
```

---

## Task 4: Verify 3D chunk isolation + add ParticleField to HudShell

**Files:**
- Modify: `components/layout/HudShell.tsx`

- [ ] **Step 1: Mount `<ParticleField>` in `HudShell`** — replace the file with:

```tsx
import { StatusStrip } from '@/components/jarvis/StatusStrip'
import { TickerStrip } from '@/components/jarvis/TickerStrip'
import { ParticleField } from '@/components/jarvis/ParticleField'

interface HudShellProps {
  children: React.ReactNode
  events: string[]
}

export function HudShell({ children, events }: HudShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ParticleField />
      <StatusStrip />
      <main className="flex flex-1 items-center justify-center px-6 py-8">{children}</main>
      <TickerStrip events={events} />
    </div>
  )
}
```

- [ ] **Step 2:** Run HudShell tests (`pnpm test components/layout/HudShell.test.tsx`) — should still pass (ParticleField is a passthrough additional element, doesn't break existing assertions).

- [ ] **Step 3: Verify chunk isolation** — Run `pnpm build`. In the build output, find the `/` route chunk size and confirm `three` / `react-three-fiber` / `drei` are NOT in the chunks for `/modules/*`, `/flashcards/*`, etc.

```bash
pnpm build 2>&1 | grep -E "(/|First Load)" | head -20
```

Expected: `/` route's first-load JS includes the 3D chunk (~300-600 KB gzipped); other routes do NOT. If 3D code leaks into other route chunks, the wrapper's `dynamic(..., { ssr: false })` config needs tightening.

- [ ] **Step 4:** `pnpm test` (full suite) + `pnpm typecheck` — all PASS.

- [ ] **Step 5: Commit**

```bash
git add components/layout/HudShell.tsx
git commit -m "feat(layout): mount ParticleField in HudShell for HUD-only particle background"
```

---

## Task 5: Conic-gradient ambient border rotation on HoloPanel (opt-in)

**Files:**
- Modify: `components/jarvis/HoloPanel.tsx`
- Modify: `components/jarvis/HoloPanel.test.tsx`
- Modify: `app/globals.css` (add `jarvis-panel-rotate` keyframe)

- [ ] **Step 1: Add `ambientBorder?: boolean` prop to HoloPanel** — read the file, then update props interface and render. The added prop wraps the panel with a `::before` pseudo-element (via Tailwind arbitrary `before:` utilities) that paints a conic gradient and rotates it.

Replace the `HoloPanel` function body's return JSX with this enhanced version (keep the props interface change too):

Add to the interface (after `cornersAll?: boolean`):
```ts
  /** When true, applies a slow rotating conic-gradient halo around the panel border. */
  ambientBorder?: boolean
```

Add to function signature default destructure: `ambientBorder = false,`

Replace the className composition + return so when `ambientBorder` is true, an extra div sits behind for the rotating gradient:

```tsx
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
      {/* existing label + children + CornerBrackets stay the same */}
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
```

- [ ] **Step 2: Add the keyframe to `app/globals.css`** — Inside the existing `@layer utilities` block, add at the end:

```css
  @keyframes jarvis-panel-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
```

Note: the conic-gradient applied via `background` doesn't natively support `from var(--angle)`. The simpler reliable approach is rotating the entire `::before` div via transform (which is what `jarvis-panel-rotate` does). The `var(--jarvis-panel-angle)` is unused in CSS but kept in JS in case future support lands; the actual rotation is via the transform animation.

- [ ] **Step 3: Add test for ambientBorder prop** — In `HoloPanel.test.tsx`, add at the end of the describe block:

```tsx
  it('renders the ambient border layer when ambientBorder=true', () => {
    const { container } = render(<HoloPanel ambientBorder>x</HoloPanel>)
    // The ambient layer is the first child div inside the wrapper
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
    const ambientLayer = wrapper.querySelector('div[aria-hidden]')
    expect(ambientLayer).not.toBeNull()
  })

  it('does NOT render the ambient border layer by default', () => {
    const { container } = render(<HoloPanel>x</HoloPanel>)
    const wrapper = container.firstChild as HTMLElement
    const ambientLayer = wrapper.querySelector('div[aria-hidden]')
    expect(ambientLayer).toBeNull()
  })
```

Note: existing tests assert `container.firstChild as HTMLElement` is the panel itself. With the new wrapping `<div className="relative">`, the firstChild is now that wrapper. Update the existing tests that check the panel's className to traverse into the inner panel:

For tests that check `panel.className` (intent classes, glow class), change:
```tsx
const panel = container.firstChild as HTMLElement
```
to:
```tsx
const panel = container.firstChild?.lastChild as HTMLElement
```

(The wrapper's children are: optional ambient layer + the panel. With `ambientBorder` false (default), `firstChild.firstChild === firstChild.lastChild === panel`. With it true, `firstChild.lastChild === panel`.)

- [ ] **Step 4:** Run `pnpm test components/jarvis/HoloPanel.test.tsx` — expect 9/9 (7 existing + 2 new) PASS.

- [ ] **Step 5:** `pnpm typecheck` — PASS.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/HoloPanel.tsx components/jarvis/HoloPanel.test.tsx app/globals.css
git commit -m "feat(jarvis): add opt-in ambient conic-gradient border rotation to HoloPanel"
```

---

## Task 6: Command palette (`cmdk`) + action registry

**Files:**
- Create: `lib/command-actions.ts`
- Create: `components/jarvis/CommandPalette.tsx`
- Create: `components/jarvis/CommandPalette.test.tsx`

- [ ] **Step 1: Create `lib/command-actions.ts`** — action registry for the palette:

```ts
import type { ModuleMeta } from './types'

export interface CommandAction {
  id: string
  label: string
  hint?: string
  /** Free-form keywords for fuzzy search */
  keywords?: string
  /** Either a route to navigate to OR a callback */
  href?: string
  run?: () => void
}

export function buildSectionActions(modules: ModuleMeta[]): CommandAction[] {
  const sectionActions: CommandAction[] = []
  for (const m of modules) {
    sectionActions.push({
      id: `module-${m.id}`,
      label: `${String(m.order).padStart(2, '0')} ${m.title}`,
      hint: 'MODULE',
      keywords: m.summary,
      href: `/modules/${m.id}`
    })
    for (const sectionId of m.sections) {
      sectionActions.push({
        id: `section-${m.id}-${sectionId}`,
        label: `${m.title} › ${sectionId}`,
        hint: 'SECTION',
        keywords: `${m.summary} ${sectionId}`,
        href: `/modules/${m.id}/${sectionId}`
      })
    }
  }
  return sectionActions
}

export function buildSystemActions(): CommandAction[] {
  return [
    { id: 'go-home', label: 'Go to home', hint: 'NAV', href: '/' },
    { id: 'go-flashcards', label: 'Review flashcards', hint: 'NAV', href: '/flashcards' },
    { id: 'go-search', label: 'Search', hint: 'NAV', href: '/search' },
    { id: 'go-progress', label: 'View progress', hint: 'NAV', href: '/progress' },
    { id: 'go-settings', label: 'Settings', hint: 'NAV', href: '/settings' }
  ]
}
```

- [ ] **Step 2: Write failing test** — `components/jarvis/CommandPalette.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

describe('CommandPalette', () => {
  it('does not render the dialog when closed', () => {
    render(<CommandPalette open={false} onOpenChange={() => {}} />)
    expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument()
  })

  it('renders the dialog + input when open', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument()
  })

  it('lists at least one module action when open with empty query', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    // "IAM Foundations" or any module title from the seeded modules.json
    expect(screen.getByText(/IAM Foundations/i)).toBeInTheDocument()
  })

  it('filters results as user types', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    const input = screen.getByPlaceholderText(/type a command/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'powershell' } })
    expect(screen.getByText(/PowerShell for IAM/i)).toBeInTheDocument()
    expect(screen.queryByText(/Microsoft Identity Platform/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3:** Run test — FAIL.

- [ ] **Step 4: Implement `components/jarvis/CommandPalette.tsx`**:

```tsx
'use client'

import { useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { getAllModules } from '@/lib/content'
import { buildSectionActions, buildSystemActions, type CommandAction } from '@/lib/command-actions'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const actions = useMemo<CommandAction[]>(() => {
    return [...buildSectionActions(getAllModules()), ...buildSystemActions()]
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  function handleSelect(action: CommandAction) {
    onOpenChange(false)
    if (action.href) router.push(action.href)
    else action.run?.()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-void/70 pt-[20vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <Command
        label="Command palette"
        className="w-full max-w-xl rounded-[3px] border border-cyan/40 bg-void-elevated/90 shadow-[0_0_24px_rgb(0_240_255/0.35)] backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-cyan/25 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/60">
          ▸ COMMAND
        </div>
        <Command.Input
          placeholder="Type a command or search…"
          className="w-full bg-transparent px-4 py-3 font-mono text-sm uppercase tracking-[0.05em] text-foreground outline-none placeholder:text-text-dim placeholder:normal-case placeholder:tracking-normal"
          autoFocus
        />
        <Command.List className="max-h-[50vh] overflow-y-auto px-2 pb-2">
          <Command.Empty className="px-3 py-4 font-mono text-xs uppercase tracking-[0.1em] text-text-muted">
            No results.
          </Command.Empty>
          {actions.map((a) => (
            <Command.Item
              key={a.id}
              value={`${a.label} ${a.keywords ?? ''}`}
              onSelect={() => handleSelect(a)}
              className="flex items-center justify-between gap-2 rounded-[2px] px-3 py-2 text-sm text-foreground aria-selected:bg-cyan/12 aria-selected:text-cyan"
            >
              <span>{a.label}</span>
              {a.hint && (
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/50">{a.hint}</span>
              )}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
```

- [ ] **Step 5:** Run tests — 4/4 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/command-actions.ts components/jarvis/CommandPalette.tsx components/jarvis/CommandPalette.test.tsx
git commit -m "feat(jarvis): add CommandPalette (cmdk) + action registry for sections + system nav"
```

---

## Task 7: `useKeyboardShortcuts` hook + `<KeyboardHelpOverlay>` + global `Cmd+K`/`?` registration

**Files:**
- Create: `hooks/use-keyboard-shortcuts.ts`
- Create: `hooks/use-keyboard-shortcuts.test.ts`
- Create: `components/jarvis/KeyboardHelpOverlay.tsx`
- Create: `components/jarvis/KeyboardHelpOverlay.test.tsx`

- [ ] **Step 1: Write failing test for hook** — `hooks/use-keyboard-shortcuts.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  it('fires the callback when the registered key is pressed', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ '/': cb }))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('respects modifier keys (cmd+k matches metaKey+k)', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ 'cmd+k': cb }))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('ignores keys when typing in an input', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ k: cb }))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true })
      input.dispatchEvent(event)
    })
    expect(cb).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })
})
```

- [ ] **Step 2: Implement `hooks/use-keyboard-shortcuts.ts`**:

```ts
'use client'

import { useEffect } from 'react'

type ShortcutMap = Record<string, () => void>

function normalizeEventKey(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('cmd')
  if (e.shiftKey) parts.push('shift')
  if (e.altKey) parts.push('alt')
  parts.push(e.key.toLowerCase())
  return parts.join('+')
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) {
        // Allow Escape and Cmd+K to fire even in inputs
        const k = normalizeEventKey(e)
        if (k !== 'escape' && k !== 'cmd+k') return
      }
      const k = normalizeEventKey(e)
      // Try the full chord first, then bare key
      const cb = shortcuts[k] ?? shortcuts[e.key.toLowerCase()]
      if (cb) {
        e.preventDefault()
        cb()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcuts])
}
```

- [ ] **Step 3:** Run hook tests — 3/3 PASS.

- [ ] **Step 4: Write failing test for `<KeyboardHelpOverlay>`** — `components/jarvis/KeyboardHelpOverlay.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyboardHelpOverlay } from './KeyboardHelpOverlay'

describe('KeyboardHelpOverlay', () => {
  it('does not render when closed', () => {
    render(<KeyboardHelpOverlay open={false} onClose={() => {}} />)
    expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument()
  })

  it('renders shortcut entries when open', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument()
    expect(screen.getByText(/cmd\+k/i)).toBeInTheDocument()
    expect(screen.getByText(/open command palette/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Implement `components/jarvis/KeyboardHelpOverlay.tsx`**:

```tsx
'use client'

interface KeyboardHelpOverlayProps {
  open: boolean
  onClose: () => void
}

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'Cmd+K', description: 'Open command palette' },
  { keys: 'J', description: 'Next section' },
  { keys: 'K', description: 'Previous section' },
  { keys: 'Space', description: 'Flip flashcard' },
  { keys: '1 / 2 / 3', description: 'Flashcard demote / repeat / promote' },
  { keys: 'Esc', description: 'Close any overlay' },
  { keys: '?', description: 'Open this shortcut help' }
]

export function KeyboardHelpOverlay({ open, onClose }: KeyboardHelpOverlayProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-void/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-md rounded-[3px] border border-cyan/40 bg-void-elevated/90 p-6 shadow-[0_0_24px_rgb(0_240_255/0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-[0.1em] text-cyan glow-cyan">
          KEYBOARD SHORTCUTS
        </h2>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-6">
              <span className="text-sm text-foreground">{s.description}</span>
              <kbd className="rounded-[2px] border border-cyan/30 bg-cyan/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 6:** Run overlay test — 2/2 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 7: Commit**

```bash
git add hooks/use-keyboard-shortcuts.ts hooks/use-keyboard-shortcuts.test.ts components/jarvis/KeyboardHelpOverlay.tsx components/jarvis/KeyboardHelpOverlay.test.tsx
git commit -m "feat(keyboard): add useKeyboardShortcuts hook + KeyboardHelpOverlay component"
```

---

## Task 8: `useSound` hook + Howler integration

**Files:**
- Create: `hooks/use-sound.ts`
- Create: `hooks/use-sound.test.ts`

- [ ] **Step 1: Write failing test** — `hooks/use-sound.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('howler', () => {
  return {
    Howl: vi.fn().mockImplementation(() => ({
      play: vi.fn(),
      stop: vi.fn(),
      unload: vi.fn()
    }))
  }
})

import { useSound } from './use-sound'
import { saveState, loadState } from '@/lib/progress'

beforeEach(() => {
  window.localStorage.clear()
})

describe('useSound', () => {
  it('returns a play() function that no-ops when sound is disabled', async () => {
    const { Howl } = await import('howler')
    const HowlMock = Howl as unknown as ReturnType<typeof vi.fn>
    HowlMock.mockClear()
    // Default: settings.soundEnabled === false
    const { result } = renderHook(() => useSound('tick'))
    act(() => { result.current.play() })
    // The mock Howl is never constructed since we never trigger play under disabled
    expect(HowlMock).not.toHaveBeenCalled()
  })

  it('constructs a Howl + calls play() when sound is enabled', async () => {
    const { Howl } = await import('howler')
    const HowlMock = Howl as unknown as ReturnType<typeof vi.fn>
    HowlMock.mockClear()
    const s = loadState()
    s.settings.soundEnabled = true
    saveState(s)
    const { result } = renderHook(() => useSound('chime'))
    act(() => { result.current.play() })
    expect(HowlMock).toHaveBeenCalledTimes(1)
    expect(HowlMock.mock.calls[0][0].src[0]).toContain('chime.wav')
  })
})
```

- [ ] **Step 2: Implement `hooks/use-sound.ts`**:

```ts
'use client'

import { useCallback, useRef } from 'react'
import { Howl } from 'howler'
import { loadState } from '@/lib/progress'

export type SoundKey = 'tick' | 'chime' | 'tone-down' | 'boot'

const SOUND_VOLUME: Record<SoundKey, number> = {
  tick: 0.3,
  chime: 0.35,
  'tone-down': 0.35,
  boot: 0.4
}

export function useSound(key: SoundKey) {
  const howlRef = useRef<Howl | null>(null)

  const play = useCallback(() => {
    const s = loadState()
    if (!s.settings.soundEnabled) return
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: [`/sounds/${key}.wav`],
        volume: SOUND_VOLUME[key],
        preload: true
      })
    }
    howlRef.current.play()
  }, [key])

  return { play }
}
```

- [ ] **Step 3:** Run tests — 2/2 PASS.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-sound.ts hooks/use-sound.test.ts
git commit -m "feat(sound): add useSound hook with opt-in Howler integration"
```

---

## Task 9: `<PageTransition>` Framer Motion wrapper

**Files:**
- Create: `components/jarvis/PageTransition.tsx`

(No `.test.tsx` for this one — Framer Motion's AnimatePresence behavior is integration-tested via Playwright in T22; unit-testing animation timing here adds noise.)

- [ ] **Step 1: Implement `components/jarvis/PageTransition.tsx`**:

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 2:** `pnpm typecheck` — PASS.

- [ ] **Step 3: Commit**

```bash
git add components/jarvis/PageTransition.tsx
git commit -m "feat(motion): add PageTransition wrapper using Framer Motion"
```

---

## Task 10: `mdx-components.tsx` auto-registration

**Files:**
- Create: `mdx-components.tsx`

- [ ] **Step 1: Implement `mdx-components.tsx`** at repo root (Next.js convention):

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
    CommandReference
  }
}
```

> Note: T11–T15 build the actual component files. This file will not typecheck cleanly until those exist — that's fine; commit this LAST after T15. Reorder: skip this commit, proceed to T11.

(Defer the commit of `mdx-components.tsx` until after T15. Just create the file but DO NOT commit yet.)

---

## Task 11: `<Quiz>` MDX component

**Files:**
- Create: `components/content/Quiz.tsx`
- Create: `components/content/Quiz.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'

const QUESTION = {
  id: 'q1',
  prompt: 'Which protocol uses tickets?',
  options: ['Kerberos', 'SAML', 'OAuth', 'LDAP'],
  correctIndex: 0,
  explanation: 'Kerberos issues TGTs from a KDC.'
}

describe('Quiz', () => {
  it('renders the prompt and option buttons', () => {
    render(<Quiz question={QUESTION} />)
    expect(screen.getByText(/which protocol/i)).toBeInTheDocument()
    expect(screen.getByText('Kerberos')).toBeInTheDocument()
    expect(screen.getByText('SAML')).toBeInTheDocument()
  })

  it('reveals the explanation after answering', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.click(screen.getByText('SAML'))
    expect(screen.getByText(/Kerberos issues TGTs/)).toBeInTheDocument()
  })

  it('marks selected correct answer with positive intent class', () => {
    const { container } = render(<Quiz question={QUESTION} />)
    fireEvent.click(screen.getByText('Kerberos'))
    const correctButton = screen.getByText('Kerberos').closest('button')!
    expect(correctButton.className).toMatch(/cyan|nominal/)
  })
})
```

- [ ] **Step 2: Implement `components/content/Quiz.tsx`**:

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { useSound } from '@/hooks/use-sound'
import { recordQuizAttempt } from '@/lib/progress'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
}

interface QuizProps {
  question: QuizQuestion
}

export function Quiz({ question }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const tick = useSound('tick')
  const chime = useSound('chime')
  const toneDown = useSound('tone-down')

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    const correct = i === question.correctIndex
    if (correct) chime.play()
    else toneDown.play()
    tick.play()
    recordQuizAttempt(question.id, {
      at: new Date().toISOString(),
      score: correct ? 1 : 0,
      answers: [i]
    })
  }

  return (
    <HoloPanel label="QUIZ" className="my-6">
      <p className="mb-4 text-foreground">{question.prompt}</p>
      <div className="grid gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === question.correctIndex
          const showAsRight = selected !== null && isCorrect
          const showAsWrong = isSelected && !isCorrect
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                'w-full rounded-[2px] border px-4 py-2 text-left font-mono text-sm uppercase tracking-[0.05em] transition-all',
                selected === null && 'border-panel-border bg-panel-bg hover:bg-cyan/10 hover:border-cyan/50',
                showAsRight && 'border-nominal/70 bg-nominal/12 text-nominal shadow-[0_0_12px_rgb(0_255_136/0.3)]',
                showAsWrong && 'border-threat/70 bg-threat/12 text-threat shadow-[0_0_12px_rgb(255_32_64/0.3)] animate-[jarvis-glitch_400ms_steps(4,end)_1]',
                selected !== null && !isSelected && !isCorrect && 'opacity-50'
              )}
            >
              <span className="mr-3 text-cyan/60">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && question.explanation && (
        <div className="mt-4 border-l-2 border-cyan/50 bg-cyan/5 px-4 py-3 font-mono text-xs text-text-muted">
          ▸ {question.explanation}
        </div>
      )}
    </HoloPanel>
  )
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/content/Quiz.tsx components/content/Quiz.test.tsx
git commit -m "feat(content): add Quiz MDX component with correct/wrong feedback + sound"
```

---

## Task 12: `<Flashcard>` MDX component (3D flip)

**Files:**
- Create: `components/content/Flashcard.tsx`
- Create: `components/content/Flashcard.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Flashcard } from './Flashcard'

describe('Flashcard', () => {
  it('shows front by default and back after click', () => {
    render(<Flashcard front="What is a TGT?" back="Ticket-Granting Ticket" />)
    expect(screen.getByText('What is a TGT?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Ticket-Granting Ticket')).toBeInTheDocument()
  })

  it('toggles back to front on second click', () => {
    render(<Flashcard front="A" back="B" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/content/Flashcard.tsx`**:

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSound } from '@/hooks/use-sound'

interface FlashcardProps {
  front: string
  back: string
}

export function Flashcard({ front, back }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)
  const tick = useSound('tick')

  function toggle() {
    setFlipped((f) => !f)
    tick.play()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
      aria-pressed={flipped}
      className={cn(
        'group my-4 w-full rounded-[3px] border border-cyan/40 bg-cyan/4 px-6 py-5 text-left transition-all backdrop-blur-md',
        'hover:border-cyan/70 hover:shadow-[0_0_18px_rgb(0_240_255/0.4)]',
        flipped ? 'border-nominal/50' : ''
      )}
    >
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/60">
        ▸ FLASHCARD {flipped ? '// ANSWER' : '// QUESTION'}
      </div>
      <div className="font-display text-lg text-foreground">{flipped ? back : front}</div>
      <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-text-dim group-hover:text-cyan/70">
        ▸ {flipped ? 'CLICK TO RETURN' : 'CLICK OR SPACE TO REVEAL'}
      </div>
    </button>
  )
}
```

- [ ] **Step 3:** Run tests — 2/2 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/content/Flashcard.tsx components/content/Flashcard.test.tsx
git commit -m "feat(content): add Flashcard with click/space flip + sound"
```

---

## Task 13: WarStory + ProTip + SC300Badge + Definition (4 callouts)

**Files:**
- Create: `components/content/WarStory.tsx`
- Create: `components/content/ProTip.tsx`
- Create: `components/content/SC300Badge.tsx`
- Create: `components/content/Definition.tsx`
- Create: `components/content/callouts.test.tsx`

- [ ] **Step 1: Implement `components/content/WarStory.tsx`** (glass panel callout):

```tsx
import { HoloPanel } from '@/components/jarvis/HoloPanel'

interface WarStoryProps {
  title?: string
  children: React.ReactNode
}

export function WarStory({ title, children }: WarStoryProps) {
  return (
    <HoloPanel intent="threat" className="my-6" label={`⚠ WAR STORY${title ? ` // ${title}` : ''}`}>
      <div className="text-foreground">{children}</div>
    </HoloPanel>
  )
}
```

- [ ] **Step 2: Implement `components/content/ProTip.tsx`** (inline amber-bar callout):

```tsx
interface ProTipProps {
  children: React.ReactNode
}

export function ProTip({ children }: ProTipProps) {
  return (
    <div className="my-4 border-l-2 border-warn bg-warn/5 px-4 py-3 text-foreground">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-warn">⚡ PRO TIP</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Implement `components/content/SC300Badge.tsx`** (inline pill):

```tsx
export function SC300Badge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-cyan/50 bg-cyan/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan shadow-[0_0_6px_rgb(0_240_255/0.25)]">
      SC-300
    </span>
  )
}
```

- [ ] **Step 4: Implement `components/content/Definition.tsx`** (inline hover term):

```tsx
'use client'

import { useState } from 'react'

interface DefinitionProps {
  term: string
  children: React.ReactNode
}

export function Definition({ term, children }: DefinitionProps) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="cursor-help border-b border-dashed border-cyan/60 font-medium text-cyan hover:text-cyan/90"
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 rounded-[2px] border border-cyan/40 bg-void-elevated/95 p-3 text-left text-xs font-normal text-foreground shadow-[0_0_18px_rgb(0_240_255/0.3)] backdrop-blur-md"
        >
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70">
            ▸ DEFINITION
          </span>
          {children}
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 5: Write tests** — `components/content/callouts.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WarStory } from './WarStory'
import { ProTip } from './ProTip'
import { SC300Badge } from './SC300Badge'
import { Definition } from './Definition'

describe('callouts', () => {
  it('<WarStory> renders title + body inside a glass panel', () => {
    render(<WarStory title="Okta breach">Bad day.</WarStory>)
    expect(screen.getByText(/WAR STORY/)).toBeInTheDocument()
    expect(screen.getByText('Bad day.')).toBeInTheDocument()
  })

  it('<ProTip> renders amber tip label + content', () => {
    render(<ProTip>Read the docs first.</ProTip>)
    expect(screen.getByText(/PRO TIP/)).toBeInTheDocument()
    expect(screen.getByText('Read the docs first.')).toBeInTheDocument()
  })

  it('<SC300Badge> renders the SC-300 label', () => {
    render(<SC300Badge />)
    expect(screen.getByText('SC-300')).toBeInTheDocument()
  })

  it('<Definition> reveals tooltip on click', () => {
    render(<Definition term="KDC">Key Distribution Center.</Definition>)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('KDC'))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Key Distribution Center.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6:** Run tests — 4/4 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 7: Commit**

```bash
git add components/content/WarStory.tsx components/content/ProTip.tsx components/content/SC300Badge.tsx components/content/Definition.tsx components/content/callouts.test.tsx
git commit -m "feat(content): add WarStory + ProTip + SC300Badge + Definition callouts"
```

---

## Task 14: `<PowerShellBlock>` MDX component

**Files:**
- Create: `components/content/PowerShellBlock.tsx`
- Create: `components/content/PowerShellBlock.test.tsx`

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PowerShellBlock } from './PowerShellBlock'

describe('PowerShellBlock', () => {
  it('renders the code content', () => {
    render(<PowerShellBlock>{`Get-ADUser -Filter *`}</PowerShellBlock>)
    expect(screen.getByText(/Get-ADUser/)).toBeInTheDocument()
  })

  it('renders the optional title', () => {
    render(<PowerShellBlock title="User Audit">Get-ADUser</PowerShellBlock>)
    expect(screen.getByText(/USER AUDIT/i)).toBeInTheDocument()
  })

  it('triggers clipboard copy on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<PowerShellBlock>{`echo hi`}</PowerShellBlock>)
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith('echo hi')
  })
})
```

- [ ] **Step 2: Implement `components/content/PowerShellBlock.tsx`**:

```tsx
'use client'

import { useState, Children } from 'react'

interface PowerShellBlockProps {
  title?: string
  children: React.ReactNode
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node !== null && 'props' in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

export function PowerShellBlock({ title, children }: PowerShellBlockProps) {
  const [copied, setCopied] = useState(false)
  const text = Children.toArray(children).map(extractText).join('')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // swallow
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-[3px] border border-cyan/30 bg-void-elevated/70 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-cyan/20 bg-cyan/4 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/70">
          ▸ PS{title ? ` // ${title.toUpperCase()}` : ''}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70 hover:bg-cyan/10 hover:text-cyan"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-cyan">
        <code>{children}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add components/content/PowerShellBlock.tsx components/content/PowerShellBlock.test.tsx
git commit -m "feat(content): add PowerShellBlock with title + copy-to-clipboard button"
```

---

## Task 15: `<CommandReference>` MDX component + commit mdx-components.tsx

**Files:**
- Create: `components/content/CommandReference.tsx`
- Create: `components/content/CommandReference.test.tsx`
- Commit `mdx-components.tsx` (from T10)

- [ ] **Step 1: Write failing test**:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandReference } from './CommandReference'

const RECIPES = [
  { id: 'r1', category: 'audit', title: 'List stale users', command: 'Get-ADUser -Filter *' },
  { id: 'r2', category: 'audit', title: 'List service accounts', command: 'Get-ADServiceAccount' },
  { id: 'r3', category: 'lifecycle', title: 'Disable user', command: 'Disable-ADAccount' }
]

describe('CommandReference', () => {
  it('renders all recipes', () => {
    render(<CommandReference recipes={RECIPES} />)
    expect(screen.getByText('List stale users')).toBeInTheDocument()
    expect(screen.getByText('Disable user')).toBeInTheDocument()
  })

  it('filters by text search', () => {
    render(<CommandReference recipes={RECIPES} />)
    fireEvent.change(screen.getByPlaceholderText(/filter/i), { target: { value: 'service' } })
    expect(screen.getByText('List service accounts')).toBeInTheDocument()
    expect(screen.queryByText('Disable user')).not.toBeInTheDocument()
  })

  it('filters by category chip', () => {
    render(<CommandReference recipes={RECIPES} />)
    fireEvent.click(screen.getByRole('button', { name: /lifecycle/i }))
    expect(screen.getByText('Disable user')).toBeInTheDocument()
    expect(screen.queryByText('List stale users')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement `components/content/CommandReference.tsx`**:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export interface CommandRecipe {
  id: string
  category: string
  title: string
  command: string
  description?: string
}

interface CommandReferenceProps {
  recipes: CommandRecipe[]
}

export function CommandReference({ recipes }: CommandReferenceProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => Array.from(new Set(recipes.map((r) => r.category))), [recipes])

  const filtered = useMemo(() => {
    let r = recipes
    if (category) r = r.filter((x) => x.category === category)
    if (query) {
      const q = query.toLowerCase()
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.command.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q)
      )
    }
    return r
  }, [recipes, category, query])

  return (
    <div className="my-6 rounded-[3px] border border-panel-border bg-panel-bg p-4 backdrop-blur-md">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Filter commands…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-xs rounded-[2px] border border-panel-border bg-input px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-text-dim placeholder:font-sans focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full border px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
              category === null
                ? 'border-cyan/60 bg-cyan/12 text-cyan'
                : 'border-panel-border text-text-muted hover:border-cyan/30'
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                category === c
                  ? 'border-cyan/60 bg-cyan/12 text-cyan'
                  : 'border-panel-border text-text-muted hover:border-cyan/30'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-panel-border">
        {filtered.map((r) => (
          <li key={r.id} className="py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-foreground">{r.title}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/60">{r.category}</span>
            </div>
            <code className="mt-1 block font-mono text-xs text-cyan/90">{r.command}</code>
            {r.description && (
              <p className="mt-1 text-xs text-text-muted">{r.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3:** Run tests — 3/3 PASS. `pnpm typecheck` — PASS (now mdx-components.tsx can typecheck since all 8 imports resolve).

- [ ] **Step 4: Commit CommandReference + the deferred mdx-components.tsx from T10**

```bash
git add components/content/CommandReference.tsx components/content/CommandReference.test.tsx mdx-components.tsx
git commit -m "feat(content): add CommandReference + auto-register all 8 MDX components"
```

---

## Task 16: `/progress` page — HudShell composition

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 1: Replace `app/progress/page.tsx` entirely**:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { RadialSegmentRing } from '@/components/jarvis/RadialSegmentRing'
import { TelemetryValue } from '@/components/jarvis/TelemetryValue'
import { getAllModules } from '@/lib/content'
import { loadState } from '@/lib/progress'

const TICKER = [
  'PROGRESS DASHBOARD',
  'TRACKING CURRICULUM MASTERY',
  'STREAK + QUIZ + FLASHCARD TELEMETRY',
  'STATUS NOMINAL'
]

const PHASE_COLOR = { 1: '#00f0ff', 2: '#ffb800', 3: '#808080' } as const

export default function ProgressPage() {
  const modules = getAllModules()
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    function onChange() {
      setState(loadState())
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  // Per-module mastery as fraction (placeholder: completed sections / total sections)
  const segments = modules.map((m) => {
    const completed = m.sections.filter((s) => state.progress.sections[`${m.id}/${s}`]?.completedAt).length
    const value = m.sections.length > 0 ? completed / m.sections.length : 0
    return {
      id: m.id,
      value,
      color: PHASE_COLOR[m.phase as 1 | 2 | 3]
    }
  })

  const totalCompleted = Object.values(state.progress.sections).filter((s) => s.completedAt).length
  const totalSections = modules.reduce((sum, m) => sum + m.sections.length, 0)
  const totalPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0

  return (
    <HudShell events={TICKER}>
      <div className="flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="relative">
          <RadialSegmentRing
            segments={segments}
            size={360}
            thickness={10}
            label={
              <div className="text-center">
                <div className="font-display text-5xl font-bold text-cyan glow-cyan-strong tabular-nums">
                  <TelemetryValue value={totalPercent} />
                  <span className="ml-1 text-2xl text-cyan/60">%</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
                  TOTAL MASTERY
                </div>
              </div>
            }
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const completed = m.sections.filter((s) => state.progress.sections[`${m.id}/${s}`]?.completedAt).length
            return (
              <HoloPanel key={m.id} label={`MOD ${String(m.order).padStart(2, '0')}`}>
                <div className="font-display text-base font-semibold uppercase tracking-[0.04em] text-foreground">
                  {m.title}
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                  <span>SECTIONS</span>
                  <span className="tabular-nums">{completed} / {m.sections.length}</span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                  <span>PHASE</span>
                  <span>{m.phase}</span>
                </div>
              </HoloPanel>
            )
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <HoloPanel label="STREAK">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={state.streak.currentDays} suffix="d" />
            </div>
          </HoloPanel>
          <HoloPanel label="LONGEST STREAK">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={state.streak.longestDays} suffix="d" />
            </div>
          </HoloPanel>
          <HoloPanel label="QUIZ ATTEMPTS">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={Object.values(state.quizzes).reduce((s, q) => s + q.attempts.length, 0)} />
            </div>
          </HoloPanel>
        </div>
      </div>
    </HudShell>
  )
}
```

- [ ] **Step 2:** Verify route renders: `pnpm dev`, open `http://localhost:3000/progress`, confirm: HudShell chrome, central segment ring with `0%`, 12 module panels each at `0/N sections`, streak panels. No console errors. Stop server.

- [ ] **Step 3:** `pnpm test` (existing tests should still pass — this page isn't unit-tested), `pnpm typecheck` PASS.

- [ ] **Step 4: Commit**

```bash
git add app/progress/page.tsx
git commit -m "feat(progress): compose /progress with HudShell + RadialSegmentRing + per-module panels"
```

---

## Task 17: Wire real mastery to home + mount CommandPalette + PageTransition globally

**Files:**
- Create: `lib/mastery.ts`
- Create: `lib/mastery.test.ts`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing test for mastery helper** — `lib/mastery.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { computeMastery } from './mastery'
import { saveState, loadState, markSectionCompleted } from './progress'

beforeEach(() => window.localStorage.clear())

describe('computeMastery', () => {
  it('returns 0% when no sections completed', () => {
    const m = computeMastery(loadState())
    expect(m.totalPercent).toBe(0)
  })

  it('reflects completed sections', () => {
    markSectionCompleted('01-foundations/01-identity-crisis')
    const m = computeMastery(loadState())
    expect(m.totalPercent).toBeGreaterThan(0)
    expect(m.completedSections).toBe(1)
  })

  it('returns phase counts', () => {
    const m = computeMastery(loadState())
    expect(m.phaseTotals[1]).toBeGreaterThan(0)
    expect(m.phaseTotals[2]).toBeGreaterThanOrEqual(0)
    expect(m.phaseTotals[3]).toBeGreaterThanOrEqual(0)
  })
})
```

- [ ] **Step 2: Implement `lib/mastery.ts`**:

```ts
import { getAllModules } from './content'
import type { StoredState } from './progress'

export interface MasterySummary {
  totalPercent: number
  completedSections: number
  totalSections: number
  phaseTotals: Record<1 | 2 | 3, number>
  phaseCompleted: Record<1 | 2 | 3, number>
}

export function computeMastery(state: StoredState): MasterySummary {
  const modules = getAllModules()
  let completedSections = 0
  let totalSections = 0
  const phaseTotals: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }
  const phaseCompleted: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }

  for (const m of modules) {
    const phase = m.phase as 1 | 2 | 3
    phaseTotals[phase] += m.sections.length
    for (const sectionId of m.sections) {
      totalSections += 1
      if (state.progress.sections[`${m.id}/${sectionId}`]?.completedAt) {
        completedSections += 1
        phaseCompleted[phase] += 1
      }
    }
  }

  const totalPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
  return { totalPercent, completedSections, totalSections, phaseTotals, phaseCompleted }
}
```

- [ ] **Step 3:** Run mastery tests — 3/3 PASS.

- [ ] **Step 4: Update `app/page.tsx`** to use real mastery + listen for state changes:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
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
      <ModuleConstellation totalMasteryPercent={mastery.totalPercent} />
    </HudShell>
  )
}
```

- [ ] **Step 5: Update `app/layout.tsx`** to mount `<CommandPalette>` globally + register `Cmd+K` and `?`. Replace the body of the file with:

```tsx
'use client'

import './globals.css'
import { useState } from 'react'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScanLineOverlay } from '@/components/jarvis/ScanLineOverlay'
import { BootSequence } from '@/components/jarvis/BootSequence'
import { CommandPalette } from '@/components/jarvis/CommandPalette'
import { KeyboardHelpOverlay } from '@/components/jarvis/KeyboardHelpOverlay'
import { PageTransition } from '@/components/jarvis/PageTransition'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { inter, rajdhani, jetbrainsMono } from '@/lib/fonts'

function ChromeWrapper({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useKeyboardShortcuts({
    'cmd+k': () => setPaletteOpen((o) => !o),
    '?': () => setHelpOpen((o) => !o),
    escape: () => {
      setPaletteOpen(false)
      setHelpOpen(false)
    }
  })

  return (
    <>
      <AmbientBackground />
      <ScanLineOverlay />
      <BootSequence>
        <PageTransition>{children}</PageTransition>
      </BootSequence>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <KeyboardHelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ChromeWrapper>{children}</ChromeWrapper>
      </body>
    </html>
  )
}
```

> Note: Adding `'use client'` to `app/layout.tsx` is acceptable here — Next.js allows this for top-level layouts. The `metadata` export is now removed (client components can't export it). To preserve metadata, leave the `RootLayout` server-side and move the chrome into a client child component instead.

**Revision:** keep `app/layout.tsx` as a server component, extract the client chrome into a new file `components/layout/AppChrome.tsx`:

Create `components/layout/AppChrome.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScanLineOverlay } from '@/components/jarvis/ScanLineOverlay'
import { BootSequence } from '@/components/jarvis/BootSequence'
import { CommandPalette } from '@/components/jarvis/CommandPalette'
import { KeyboardHelpOverlay } from '@/components/jarvis/KeyboardHelpOverlay'
import { PageTransition } from '@/components/jarvis/PageTransition'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function AppChrome({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useKeyboardShortcuts({
    'cmd+k': () => setPaletteOpen((o) => !o),
    '?': () => setHelpOpen((o) => !o),
    escape: () => {
      setPaletteOpen(false)
      setHelpOpen(false)
    }
  })

  return (
    <>
      <AmbientBackground />
      <ScanLineOverlay />
      <BootSequence>
        <PageTransition>{children}</PageTransition>
      </BootSequence>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <KeyboardHelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
```

Update `app/layout.tsx` (server component, keeps metadata):

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AppChrome } from '@/components/layout/AppChrome'
import { inter, rajdhani, jetbrainsMono } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
```

- [ ] **Step 6:** Run full suite — all tests should pass; `pnpm typecheck` clean; `pnpm build` clean.

- [ ] **Step 7: Commit**

```bash
git add lib/mastery.ts lib/mastery.test.ts app/page.tsx app/layout.tsx components/layout/AppChrome.tsx
git commit -m "feat(integration): wire real mastery + global CommandPalette + PageTransition + help overlay"
```

---

## Task 18: Add axe-core accessibility tests

**Files:**
- Create: `tests/a11y/shells.test.tsx`

- [ ] **Step 1: Implement `tests/a11y/shells.test.tsx`**:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ReadShell } from '@/components/layout/ReadShell'
import { HudShell } from '@/components/layout/HudShell'
import { Quiz } from '@/components/content/Quiz'
import { CommandPalette } from '@/components/jarvis/CommandPalette'

expect.extend(toHaveNoViolations)

describe('a11y — layout shells + interactive components', () => {
  it('ReadShell has no axe violations', async () => {
    const { container } = render(<ReadShell><p>content</p></ReadShell>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('HudShell has no axe violations', async () => {
    const { container } = render(<HudShell events={['EVENT']}><p>content</p></HudShell>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Quiz has no axe violations', async () => {
    const { container } = render(
      <Quiz question={{ id: 'q', prompt: 'P?', options: ['A', 'B'], correctIndex: 0 }} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('CommandPalette (open) has no axe violations', async () => {
    const { container } = render(<CommandPalette open onOpenChange={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Install jest-axe**:

```bash
pnpm add -D jest-axe @types/jest-axe
```

- [ ] **Step 3:** Run a11y tests:

```
pnpm test tests/a11y/shells.test.tsx
```

Expected: 4/4 PASS. If any fail, that's a real a11y bug — fix the underlying component (typical issues: missing aria-label, color contrast, focusable element without text).

- [ ] **Step 4: Commit**

```bash
git add tests/a11y package.json pnpm-lock.yaml
git commit -m "test(a11y): add axe-core checks for ReadShell + HudShell + Quiz + CommandPalette"
```

---

## Task 19: Add reduced-motion test coverage for new motion components

**Files:**
- Create: `tests/motion/reduced-motion.test.tsx`

- [ ] **Step 1: Implement `tests/motion/reduced-motion.test.tsx`**:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleField } from '@/components/jarvis/ParticleField'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

describe('reduced-motion fallbacks', () => {
  it('<ParticleField> renders nothing when reduced-motion is set', () => {
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('<ModuleConstellation> selects SVG fallback (no canvas) when reduced-motion is set', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    // SVG fallback identifying marker
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('<ModuleConstellationSVG> works under reduced-motion (sanity)', () => {
    const { container } = render(<ModuleConstellationSVG totalMasteryPercent={0} />)
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
  })
})
```

- [ ] **Step 2:** Run: `pnpm test tests/motion/reduced-motion.test.tsx` — expect 3/3 PASS. `pnpm typecheck` PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/motion
git commit -m "test(motion): cover reduced-motion fallbacks for ParticleField + Constellation"
```

---

## Task 20: Regenerate Playwright smoke screenshots

**Files:**
- Modify: `tests/visual/screens/*.png` (regenerated)

- [ ] **Step 1: Run Playwright** to regenerate all 8 screenshots:

```
pnpm test:visual
```

Expected: 8 tests pass, 8 PNGs updated. The home page screenshot should now capture the 3D constellation (or the SVG fallback if running in CI without WebGL — both are acceptable per the spec).

The Playwright config waits 2.8s past boot start. Since we extended boot to 3.5s in the Plan 2A polish, bump the wait in `tests/visual/screens.spec.ts`:

Find: `await page.waitForTimeout(2800)` → Replace with: `await page.waitForTimeout(4200)`

Then re-run:

```
pnpm test:visual
```

- [ ] **Step 2:** Confirm new PNGs:

```bash
ls -la tests/visual/screens/
```

Each PNG mtime should be from the current run.

- [ ] **Step 3:** Commit:

```bash
git add tests/visual/screens.spec.ts tests/visual/screens
git commit -m "test(visual): regenerate Playwright smoke screenshots + bump wait past extended boot"
```

---

## Task 21: Final full-suite verification + bundle budget check

**Files:** None (verification-only)

- [ ] **Step 1: Run all gates**:

```
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

All four MUST pass. Any failures are blockers — fix before T22.

- [ ] **Step 2: Verify bundle budget** — In the `pnpm build` output, check First Load JS per route. Acceptance:

- `/` route: ≤ ~550 KB gzipped (3D chunk allowed)
- Any other route (`/modules/*`, `/flashcards/*`, `/search`, `/progress`, `/settings`): ≤ ~200 KB gzipped (no three.js leakage)

If `/progress` is over 200 KB, audit imports — likely something pulled three.js into the wrong chunk.

If `/` is significantly over 550 KB, investigate which three.js/drei modules are heavyweight and consider tree-shaking drei imports more tightly.

Report findings as a verification note (no commit needed unless a fix is required).

- [ ] **Step 3 (only if bundle audit found a fix):** Make the fix in a new commit:

```bash
git add <file>
git commit -m "perf(bundle): <describe fix>"
```

---

## Task 22: Final cross-task code review

**Files:** None (review-only)

- [ ] **Step 1:** Dispatch a final code reviewer subagent over the entire branch diff (BASE = wave-0-1-foundation's HEAD before Plan 2B started, HEAD = current HEAD).

Reviewer checks:
- All 8 MDX components are consistent in style and use the JARVIS palette + type system
- 3D constellation actually loads only on `/` (chunk isolation verified in T21)
- CommandPalette + KeyboardHelpOverlay + PageTransition are mounted globally exactly once
- No regressions in Plan 2A primitives
- `prefers-reduced-motion` handled consistently across new motion code
- Sound is opt-in throughout (never plays without `settings.soundEnabled === true`)
- a11y tests pass
- No silent setTimeout/rAF/event-listener leaks (every useEffect has a cleanup)

- [ ] **Step 2:** Address any reviewer findings.

- [ ] **Step 3:** No final commit — the per-task commits are the deliverable record.

---

## Plan 2B acceptance criteria

Plan 2B is done when:

1. ✅ Three.js + R3F + drei installed and present in `package.json`
2. ✅ 4 sound files exist in `public/sounds/` (placeholder WAVs ok for now)
3. ✅ `<ParticleField>` canvas renders on HUD pages only (`/`, `/progress`) and is absent under reduced-motion
4. ✅ `<ModuleConstellation3D>` renders on `/` in WebGL-capable browsers without reduced-motion
5. ✅ `<ModuleConstellation>` wrapper selects SVG fallback under reduced-motion OR no-WebGL — verified by the wrapper test + `tests/motion/reduced-motion.test.tsx`
6. ✅ 3D chunk only loads on `/` (verified by `pnpm build` output)
7. ✅ `Cmd+K` opens `<CommandPalette>`; `?` opens `<KeyboardHelpOverlay>`; `Esc` closes both
8. ✅ Command palette fuzzy-searches modules + sections + nav actions; selecting one navigates
9. ✅ All 8 MDX components render correctly + auto-register via `mdx-components.tsx`
10. ✅ `<Quiz>` plays chime on correct / tone-down on wrong (when sound enabled); recorded via `recordQuizAttempt()`
11. ✅ `<Flashcard>` flips on click/Space and respects sound preference
12. ✅ `<PowerShellBlock>` copy button writes the code to clipboard
13. ✅ `<CommandReference>` filters by text + category chip
14. ✅ `/progress` renders HudShell + 12-segment radial ring + per-module breakdown panels + streak panels — all reading from `lib/progress.ts`
15. ✅ Home page `totalMasteryPercent` reflects real progress and updates on state-change events
16. ✅ `<PageTransition>` fades + translates content on route change (visible during navigation)
17. ✅ axe-core a11y tests pass for ReadShell, HudShell, Quiz, CommandPalette
18. ✅ `prefers-reduced-motion` test suite passes for new motion components
19. ✅ Playwright smoke screenshots regenerated and committed
20. ✅ All bundle budgets met
21. ✅ `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` all clean
22. ✅ 22 git commits, one per task

---

## Self-review notes

**Spec coverage check (against `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md`):**

| Spec section | Covered by | Notes |
|---|---|---|
| §3.3 — ParticleField on HUD pages | T2, T4 | Canvas-based, reduced-motion-aware |
| §3.3 — conic-gradient HoloPanel border | T5 | Opt-in via `ambientBorder` prop |
| §5.2 — ModuleConstellation 3D | T3 | Full RTF scene + SVG fallback wrapper |
| §6.6 — /progress HudShell composition | T16 | RadialSegmentRing + per-module + streak panels |
| §7.1 — Framer Motion page transitions | T9 | PageTransition wrapper |
| §7.1 — count-up telemetry | (Plan 2A) | TelemetryValue already implemented |
| §7.2 — cmdk command palette | T6 | Sections + nav actions; tutor actions deferred to Plan 2C |
| §7.3 — keyboard shortcuts + ? help | T7 | Hook + help overlay |
| §7.4 — opt-in sound | T8, T11, T12 | useSound hook + Quiz/Flashcard integration |
| §8 — MDX content components | T11–T15 | All 8 + auto-registration |
| §9.1 — ambitious 2D flow diagrams | Plan 2C | Out of scope here |
| §9.2 — 3D constellation | T3 | RTF + dynamic import + SSR fallback |
| §10 — AI Study Tutor | Plan 2C | Out of scope here |
| §12 — axe-core a11y tests | T18 | Layout shells + Quiz + CommandPalette |
| §12 — reduced-motion test coverage | T19 | New motion components |
| §12 — Playwright visual regression | T20 | Regenerated screenshots |
| §12 — bundle budget verification | T21 | Per-route audit |

**Placeholder scan:** No `TBD`, `TODO`, or vague instructions. Each step has runnable commands and complete code blocks.

**Type consistency check:**
- `QuizQuestion`, `CommandRecipe`, `CommandAction`, `MasterySummary`, `SoundKey`, `Segment` (from RadialSegmentRing) all referenced consistently across producer and consumer files.
- `ModuleId` from `lib/types.ts` used in both `ModuleConstellation3D.tsx` and `ModuleConstellationSVG.tsx`.
- `StoredState` from `lib/progress.ts` used by `lib/mastery.ts` and `/progress` page.

**Scope check:** 22 tasks, similar to Plan 2A. Each task is self-contained with one purpose. Subagents can dispatch independently.

---

## Next plan

After Plan 2B completes via `superpowers:subagent-driven-development`:

- **Plan 2C — Flow Diagrams + AI Tutor + Polish + Final QA** — adds all 5 ambitious 2D animated flow diagrams (Kerberos, SAML, OAuth, Hybrid Identity, EcosystemMap) built on a shared `<FlowDiagram>` primitive; AI Study Tutor right-pane with Anthropic streaming + section context injection + per-section history persistence; real sound files (replacing the placeholder stubs); final NICE-tier polish (random panel glitch flicker, cursor parallax tweaks); full Phase 2 acceptance criteria walkthrough; bundle budget final verification.
