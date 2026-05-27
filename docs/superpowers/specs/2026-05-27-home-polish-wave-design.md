# Home Polish Wave — Design

**Status:** Approved (2026-05-27)
**Owner:** Kolton Bernhardt
**Project:** `~/projects/iam-mastery`
**Builds on:** `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md` (Phase 2 design — §6.1 home page, §9.2 3D doctrine)
**Execution method:** `superpowers:writing-plans` → `superpowers:subagent-driven-development`

---

## 1. What this design does

Closes the two outstanding gaps on the home page that Plan 2C deliberately deferred:

1. **§6.1 home HUD mini-panels** — `STREAK`, `CARDS DUE`, `RESUME` mini panels currently missing entirely. The home page renders only `<ModuleConstellationSVG>` inside `<HudShell>`. The spec calls for three mini `<HoloPanel>`s anchored at the bottom of the centerpiece.
2. **3D `<ModuleConstellation>` revival** — the original 3D component (`components/jarvis/ModuleConstellation3D.tsx`) was disabled mid-Plan 2B due to stacking rendering issues (commit `4f005f0`) and the 2D SVG shipped instead. User intent at the close of that session: revisit the 3D as the final cinematic pass once the rest of the build was stable. This wave delivers that — and uses the opportunity to redesign rather than just resurrect.

Both pieces land in a single wave because they share the same home page surface, ship to the same route's bundle, and both verify against the same `<HudShell>` + `<AmbientBackground>` chrome.

---

## 2. Decisions locked

| # | Decision | Choice |
|---|---|---|
| 01 | Mini-panel layout | Horizontal row of three panels below the constellation, above the ticker. Inside `<HudShell>`. `grid-cols-3 gap-4 max-w-3xl mx-auto`. |
| 02 | Mini-panel clickability | All three panels navigate. `STREAK → /progress`, `CARDS DUE → /flashcards`, `RESUME → /modules/[moduleId]/[sectionId]` (last-visited section). |
| 03 | 3D revival scope | Full rethink — not a 1:1 resurrection. New "holographic command sphere" composition with wireframe energy core, spherical node distribution, arc connections, and ambient particle wash. |
| 04 | Center geometry | Outer wireframe dodecahedron (rotating) + inner pulsing sphere (no rotation). Replaces the original icosahedron. |
| 05 | Module node arrangement | True 3D spherical distribution at the 12 vertices of a scaled icosahedron — NOT a flat orbital ring. |
| 06 | Connection lines | Cubic-bezier arc from each module node curving back to origin. Static at low opacity; brighten + emit a traveling token on the hovered node's arc. |
| 07 | Camera | `PerspectiveCamera` (NOT orthographic) — perspective is needed for the cinematic depth the new design relies on. Overrides the original Phase 2 spec's orthographic camera. |
| 08 | Mastery % overlay | Hoisted OUT of R3F entirely. Rendered as an absolute-positioned `<div>` over the `<Canvas>` (the `9cb015f` fix pattern that worked). |
| 09 | Fallback | Existing `<ModuleConstellationSVG>` stays the fallback. Selector lives in the existing `<ModuleConstellation>` wrapper. Triggered by `prefers-reduced-motion: reduce`, missing `WebGLRenderingContext`, or R3F chunk load failure. |
| 10 | Bundle isolation | Three.js + R3F + drei stay code-split on `/` only via the existing dynamic-import pattern. No change to the budget already absorbed by the home route. |

---

## 3. Mini-panels — `<HudMiniPanels>`

### 3.1 Component shape

A new client component `components/jarvis/HudMiniPanels.tsx` that owns nothing but the layout and click handlers; reads its data from a new `lib/home-telemetry.ts` helper. The home page mounts it inside `<HudShell>` below the constellation.

```tsx
// app/page.tsx — relevant section
<HudShell events={SAMPLE_TICKER}>
  <ModuleConstellation totalMasteryPercent={mastery.totalPercent} />
  <HudMiniPanels />
</HudShell>
```

The component itself:

```tsx
// components/jarvis/HudMiniPanels.tsx — shape only
export function HudMiniPanels() {
  const router = useRouter()
  const [telemetry, setTelemetry] = useState(() => computeHomeTelemetry(loadState()))
  // subscribe to 'iam-mastery:state-change' so values stay live
  return (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4 mt-8">
      <HoloPanel ambientBorder label="STREAK" onClick={() => router.push('/progress')}>
        <TelemetryValue value={telemetry.streakDays} suffix="d" />
        <SubLabel>▸ CURRENT</SubLabel>
      </HoloPanel>
      <HoloPanel ambientBorder label="CARDS DUE" onClick={() => router.push('/flashcards')}
        intent={telemetry.cardsDue === 0 ? 'default' : 'warn'}>
        <TelemetryValue value={telemetry.cardsDue} />
        <SubLabel>▸ TODAY</SubLabel>
      </HoloPanel>
      <HoloPanel ambientBorder label="RESUME"
        onClick={() => router.push(telemetry.resume.href)}>
        <div className="font-display text-base truncate">{telemetry.resume.title}</div>
        <SubLabel>▸ {telemetry.resume.crumb}</SubLabel>
      </HoloPanel>
    </div>
  )
}
```

> Note: `<HoloPanel>` does NOT currently accept an `onClick` prop. The implementation wraps each `<HoloPanel>` in a `<button type="button">` (or `<Link>` for the navigation cases) so we don't have to change the primitive. The button gets `aria-label` describing the destination.

### 3.2 `lib/home-telemetry.ts`

A single pure function reading from `StoredState`:

```ts
export interface HomeTelemetry {
  streakDays: number
  cardsDue: number
  resume: { href: string; title: string; crumb: string }
}

export function computeHomeTelemetry(state: StoredState, modules: Module[]): HomeTelemetry {
  // streakDays — direct read
  const streakDays = state.streak.currentDays

  // cardsDue — count flashcards where nextDue is past or today
  const now = new Date()
  const cardsDue = Object.values(state.flashcards)
    .filter((f) => new Date(f.nextDue) <= now).length

  // resume — most recent section by visitedAt; empty case = first section of module 01
  const recent = Object.entries(state.progress.sections)
    .map(([key, s]) => ({ key, visitedAt: s.visitedAt }))
    .sort((a, b) => (a.visitedAt < b.visitedAt ? 1 : -1))[0]

  const resume = recent
    ? resolveResumeTarget(recent.key, modules)
    : firstSectionFallback(modules)

  return { streakDays, cardsDue, resume }
}
```

`resolveResumeTarget(sectionKey, modules)` parses the `${moduleId}/${sectionId}` key, looks up the section title from the modules content, and returns `{ href, title, crumb }`. `firstSectionFallback` returns `'01-foundations'`'s first section, or `{ href: '/modules/01-foundations', title: 'START MODULE 01', crumb: '01-foundations' }` if there are no modules yet.

`modules` is passed in from `getAllModules()` in `lib/content.ts` (the same call `app/progress/page.tsx` uses).

### 3.3 Test coverage

`lib/home-telemetry.test.ts` — pure-function tests:
- Empty state returns `{ streakDays: 0, cardsDue: 0, resume: START MODULE 01 }`
- One visited section returns that section as resume
- Multiple visited sections returns the most recent by `visitedAt`
- Cards-due count excludes cards where `nextDue` is in the future

`components/jarvis/HudMiniPanels.test.tsx` — render tests:
- Renders three panels with the expected labels
- Each panel's wrapping button has the right `aria-label` + href
- Reacts to `iam-mastery:state-change` events

---

## 4. 3D `<ModuleConstellation>` — Holographic Command Sphere

### 4.1 Scene composition

Rendered inside `components/jarvis/ModuleConstellation3D.tsx` as a single `<Canvas>` from React Three Fiber. Layers:

| Layer | Geometry | Material | Motion |
|---|---|---|---|
| Core outer shell | Wireframe `DodecahedronGeometry` r=1.8 | `LineBasicMaterial` cyan `#00f0ff`, opacity 0.85 | `useFrame` rotates Y at 8s/rev |
| Core inner pulse | `SphereGeometry` r=0.7 | `MeshBasicMaterial` cyan emissive, opacity 0.15↔0.35 over 3s | Sine pulse via `useFrame` |
| Module nodes (×12) | `SphereGeometry` r=0.18 at icosahedron vertices scaled to r=4.5 | `MeshBasicMaterial` cyan (Phase 1) / amber (Phase 2) / dim gray (Phase 3) emissive | Group counter-rotates Y at 14s/rev |
| Module labels (×12) | drei `<Text>` outward-offset 0.5 from each node | Color matches node | Always billboard to camera |
| Arc connections (×12) | Cubic-bezier `<Line>` from each node curving to origin | `LineBasicMaterial` cyan opacity 0.25 base / 0.85 on hover | Static; hovered node's arc emits a traveling token |
| Ambient particle field | drei `<Points>` 300 vertices in spherical shell r=6–9 | `PointsMaterial` size 0.04 opacity 0.4 | Slow random drift via `useFrame` |
| Lighting | `<pointLight>` at origin cyan intensity 1.2 + `<ambientLight>` intensity 0.05 | — | — |

### 4.2 Camera + parallax

`PerspectiveCamera` (default), FOV 38°, initial position `[0, 0, 12]`, lookAt origin. A `useEffect` adds a `mousemove` listener; the handler computes normalized cursor offset relative to the canvas center, clamped to ±0.6 units in X and Y. A `useFrame` lerps the camera position toward that target at 8%/frame for buttery motion. Under `prefers-reduced-motion: reduce` the lerp is disabled and the camera stays at the initial position.

### 4.3 Center mastery % overlay

Rendered OUTSIDE the `<Canvas>` as an absolute-positioned `<div>`:

```tsx
<div className="relative">
  <Canvas onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
    {/* scene */}
  </Canvas>
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <div className="font-display text-5xl text-cyan glow-cyan-strong tabular-nums">
        <TelemetryValue value={totalMasteryPercent} />%
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
        CURRICULUM MASTERY
      </div>
    </div>
  </div>
</div>
```

`gl.setClearColor(0x000000, 0)` in the canvas's `onCreated` ensures the AmbientBackground shows through the canvas behind the 3D scene.

### 4.4 Interaction

- **Hover a node** — node scales to 1.3 + glow filter intensifies + its arc connection brightens to 0.85 + a traveling token emits along the arc on a 1.8s loop while hovered
- **Click a node** — `router.push(\`/modules/${node.id}\`)`
- **Hidden accessible nav** — outside the canvas: `<nav className="sr-only">` containing a `<Link>` per module so keyboard tab navigation and screen readers work regardless of whether the 3D layer or SVG fallback is active

### 4.5 Fallback

The existing `components/jarvis/ModuleConstellation.tsx` wrapper selects between 3D and SVG. Currently the wrapper is bypassed (`app/page.tsx` imports `ModuleConstellationSVG` directly per commit `4f005f0`). This wave restores the wrapper:

```tsx
// components/jarvis/ModuleConstellation.tsx — shape
export function ModuleConstellation({ totalMasteryPercent }: Props) {
  const [use3D, setUse3D] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!hasWebGL()) return
    setUse3D(true)
  }, [])
  if (!use3D) return <ModuleConstellationSVG totalMasteryPercent={totalMasteryPercent} />
  // Lazy import keeps R3F off the bundle until WebGL+motion confirmed
  return <ModuleConstellation3DLazy totalMasteryPercent={totalMasteryPercent} />
}
```

`hasWebGL()` creates a temporary `<canvas>` and probes for `getContext('webgl2')` / `'webgl'`. `ModuleConstellation3DLazy` is `dynamic(() => import('./ModuleConstellation3D'), { ssr: false, loading: () => <ModuleConstellationSVG ... /> })` so the SVG renders during the chunk load too.

### 4.6 Test coverage

`components/jarvis/ModuleConstellation.test.tsx` — wrapper tests (some exist; expand):
- Renders SVG when `prefers-reduced-motion: reduce`
- Renders SVG when `WebGLRenderingContext` is unavailable
- Hidden a11y `<nav>` is present in BOTH 3D and SVG paths with 12 `<Link>`s

`components/jarvis/ModuleConstellation3D.test.tsx` — new:
- Imports without error (jsdom can mount R3F when given the right webgl-mock)
- Exposes 12 nodes (`canvas` mock + count check), or — more pragmatically — verifies the hidden accessibility nav contains 12 entries since the canvas innards aren't readable in jsdom
- Verifies the mastery overlay div is OUTSIDE the canvas (no drei `<Html>`)

`components/jarvis/ModuleConstellationSVG.test.tsx` — left untouched (already covers the fallback).

---

## 5. Files produced / modified

```
~/projects/iam-mastery/
├── app/
│   └── page.tsx                                  # Section 1 + Section 2 — mount HudMiniPanels, switch back to ModuleConstellation wrapper
├── components/jarvis/
│   ├── HudMiniPanels.tsx                         # Section 1 — NEW
│   ├── HudMiniPanels.test.tsx                    # Section 1 — NEW
│   ├── ModuleConstellation.tsx                   # Section 2 — re-enable 3D selector path
│   ├── ModuleConstellation.test.tsx              # Section 2 — expand wrapper tests
│   ├── ModuleConstellation3D.tsx                 # Section 2 — FULL REWRITE to holographic command sphere composition
│   ├── ModuleConstellation3D.test.tsx            # Section 2 — NEW (light coverage; jsdom can't paint webgl)
│   └── ModuleConstellationSVG.tsx                # untouched (fallback)
└── lib/
    ├── home-telemetry.ts                         # Section 1 — NEW
    └── home-telemetry.test.ts                    # Section 1 — NEW
```

---

## 6. Scope priority

### 6.1 MUST (ship in this wave)

- `HudMiniPanels` rendered on `/` with three working buttons (STREAK / CARDS DUE / RESUME) navigating to real targets
- `home-telemetry.ts` with `computeHomeTelemetry(state, modules)` + pure-function tests
- 3D `<ModuleConstellation>` re-enabled on `/` with the new holographic-command-sphere composition (core + 12 spherical nodes + arc connections + particle wash)
- Center mastery % overlay hoisted out of R3F into an absolute div over the canvas
- Cursor-driven camera parallax with lerp
- Hover state on nodes (scale + glow + arc brighten + traveling token on hovered arc)
- Click on a node navigates to `/modules/[id]`
- SVG fallback under `prefers-reduced-motion: reduce` OR no-WebGL OR chunk-load failure
- Hidden a11y `<nav>` with 12 `<Link>`s in both 3D and SVG paths
- Regenerated Playwright `home.png` screenshot

### 6.2 NICE (defer if scope pressure)

- Particle field count downshift on `navigator.hardwareConcurrency < 4` (drop from 300 → 120)
- Subtle conic-gradient halo BEHIND the canvas (CSS only) when 3D is mounted, intensifying the "core glow" feel further

### 6.3 CUT

- Independent rotation of EACH module node (over-engineered; group rotation is enough)
- Animated phase transitions when nodes change color (no live data ever flips them within a session)
- Particle field interactivity (particles reacting to cursor — distracting and adds frame cost)

---

## 7. Testing strategy

| Layer | Tooling | What it covers |
|---|---|---|
| Unit | Vitest | `computeHomeTelemetry` pure-function behavior; `HudMiniPanels` render + click navigation; `ModuleConstellation` wrapper SVG/3D selector branches |
| A11y | jest-axe (existing suite) | Add `HudMiniPanels` to `tests/a11y/diagrams-tutor-settings.test.tsx`. Hidden `<nav>` with 12 `<Link>`s must remain reachable. |
| Reduced motion | Vitest | `ModuleConstellation` renders SVG when `prefers-reduced-motion: reduce` is set; cursor parallax `useFrame` no-ops in that mode |
| Visual regression | Playwright | Regenerate `tests/visual/screens/home.png` — the home shot now includes mini panels + 3D canvas. Confirm under reduced-motion env the SVG fallback is captured deterministically (Playwright runs without the OS reduced-motion flag by default, so 3D will paint). |
| Bundle | `next build` output | Verify `/` chunk still under ~550 KB gzipped including the R3F revival. Non-home routes still ≤ 200 KB gzipped (no regression). |

---

## 8. Acceptance criteria

This wave is done when all of these are true:

1. `pnpm dev` starts cleanly. `/` renders with the 3D constellation animating, mastery % overlay sitting cleanly over the center, and the three mini panels below.
2. Hovering a module node scales it, brightens its arc, and emits a traveling token along the arc. Clicking navigates to `/modules/[id]`.
3. Cursor moving across the canvas tilts the camera with a buttery lerp.
4. With OS `prefers-reduced-motion: reduce` set OR with WebGL disabled in the browser, `/` falls back to the SVG `<ModuleConstellation>`. The mini panels still render and work.
5. The mini panels display real data: zero-state shows START MODULE 01 in RESUME; after visiting a section, RESUME updates and clicking returns to that section.
6. Hidden a11y nav remains keyboard-reachable in both 3D and SVG modes; screen reader announces each module link.
7. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass.
8. `pnpm test:visual` regenerates `home.png` with the new composition.
9. Bundle: `/` chunk under ~550 KB gzipped; non-home routes unchanged.

---

## 9. Open questions

None blocking. Documented for visibility:

- **Hover-token easing for the arc traversal** — `linear` reads as mechanical; `easeInOut` reads more biological. Settle during implementation by eyeballing.
- **Phase color when a module is "current"** — the spec colors by phase. If a module is in the current phase but actively in-progress, should it pulse? Out of scope for this wave; revisit when curriculum content lands in Plan 3 and modules have real activity signal.
- **Mobile 3D fallback** — the original Phase 2 spec flagged this as TBD. For this wave we keep the same selector (WebGL + reduced-motion check). If mid-tier mobile drops below 60fps in real testing, add a `window.innerWidth < 768` shortcut to SVG fallback as a follow-up.

---

**End of design.**
