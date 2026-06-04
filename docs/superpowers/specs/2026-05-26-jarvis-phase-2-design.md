# JARVIS Phase 2 — Visual Identity + Interaction Layer Design

**Status:** Approved (2026-05-26)
**Owner:** Kolton Bernhardt
**Project:** `~/projects/iam-mastery`
**Builds on:** `docs/superpowers/specs/2026-05-25-iam-mastery-platform-design.md` (Phase 1 platform design)
**Replaces:** the visual identity sections of the Phase 1 spec (palette, typography, layout chrome, home dashboard composition). All non-visual decisions from Phase 1 (curriculum scope, content model, persistence, tech stack) carry forward unchanged.
**Execution method:** `superpowers:subagent-driven-development` after `superpowers:writing-plans` produces the implementation plan.

---

## 1. What this design does

Phase 2 fuses two efforts into one coherent plan:

1. **JARVIS-grade visual identity** — a cinematic, tactical-holograph aesthetic replacing the restrained dark-slate shell built in Plan 1 (Foundation). Anchored by a real 3D `<ModuleConstellation>` on the home page (React Three Fiber) for maximum "first-load wow" — every other page is ambitious 2D for speed and focus.
2. **The full interaction layer** previously scoped for Plan 2 — Framer Motion transitions, `cmdk` command palette, MDX content components, five animated flow diagrams, AI Study Tutor, opt-in Howler sound.

The trigger was empirical: after Plan 1 shipped, the foundation shell "felt plain" — too restrained to carry hours of daily study. This spec resets the visual bar to "first reaction: holy shit" and bundles every interaction feature into a single launch so the aesthetic and behavior arrive together.

Plan 1 (foundation, 33 passing tests, all 8 routes scaffolded) stays. This plan repaints and extends.

---

## 2. Decisions locked

Each of these came out of a focused brainstorming round with visual mockups.

| # | Decision | Choice |
|---|---|---|
| 01 | Scope wrapper | Absorb JARVIS aesthetic into Plan 2 — one coherent visual + interaction plan |
| 02 | Layout doctrine | Radial HUD shell for dashboard pages (`/`, `/progress`); sidebar + topbar + reading shell for content pages |
| 03 | Palette | Pure JARVIS — void black `#0a0a0f` + electric cyan `#00f0ff` + nominal green `#00ff88` + warning amber `#ffb800` + threat red `#ff2040` |
| 04 | Typography | Inter (body) + Rajdhani (headers, uppercase) + JetBrains Mono (UI / code / labels / numbers) |
| 05 | Component strategy | Hybrid — re-theme shadcn primitives, build new JARVIS-native primitives for HUD chrome |
| 06 | Home page HUD | Module Constellation — 12 module nodes in a clockwise ring around a compact mastery core |
| 07 | Section reading chrome | Light — JARVIS-skinned sidebar/topbar/background, but prose stays clean for long-form reading |
| 08 | 3D doctrine | 3D (React Three Fiber) reserved for the home `<ModuleConstellation>` ONLY. All 5 flow diagrams stay 2D SVG with ambitious cinematic treatment. `/progress` stays 2D. Bundle-isolated via route-based code splitting. |

---

## 3. Visual identity

### 3.1 Color tokens (Tailwind 4 `@theme`)

```css
@theme {
  --color-void: #0a0a0f;          /* primary background */
  --color-void-elevated: #0e0e16; /* slightly raised surfaces */
  --color-cyan: #00f0ff;          /* signature accent */
  --color-cyan-glow: #00f0ff;     /* + box-shadow utility */
  --color-nominal: #00ff88;       /* success / mastered */
  --color-warn: #ffb800;          /* phase 2 / warning */
  --color-threat: #ff2040;        /* destructive / wrong */
  --color-text: rgba(255,255,255,0.92);
  --color-text-muted: rgba(255,255,255,0.7);
  --color-text-dim: rgba(255,255,255,0.5);

  /* Panel alpha-graded tokens */
  --panel-bg: rgba(0,240,255,0.04);
  --panel-border: rgba(0,240,255,0.25);
  --panel-border-bright: rgba(0,240,255,0.5);

  /* Grid + scan overlay tokens */
  --grid-dot: rgba(0,240,255,0.08);
  --scan-line: rgba(0,240,255,0.025);

  --radius: 2px;  /* sharp corners; max 4px anywhere */
}
```

The existing dark-slate tokens from Plan 1 are removed.

### 3.2 Typography

Self-hosted via `next/font/google` (no FOUT). Three fonts only.

| Font | Use | Weight | Treatment |
|---|---|---|---|
| **Inter** | Body prose (MDX), paragraph text, regular UI labels | 300–700 | Default rendering |
| **Rajdhani** | All headers (h1–h4), JARVIS panel values, brand wordmark | 500–700 | UPPERCASE, letter-spacing 0.04–0.08em, h1 gets cyan text-shadow glow |
| **JetBrains Mono** | UI labels, code blocks, telemetry values, breadcrumbs, command palette, status strips | 300–600 | UPPERCASE for labels (letter-spacing 0.1–0.15em); `font-variant-numeric: tabular-nums` for numbers |

### 3.3 Ambient effects doctrine

| Effect | App-wide | HUD pages | Reading pages | Reduced motion |
|---|---|---|---|---|
| Scan lines (3% opacity, 2px period, 30s drift) | ✓ | ✓ | ✓ | drift disabled, lines stay |
| Dot grid (cyan 5–8% opacity, 14px spacing) | ✓ | ✓ | ✓ | ✓ |
| Cursor-tracked ambient radial glow (intensified 3× from Plan 1) | ✓ | ✓ | ✓ | disabled |
| Boot sequence (2–2.5s, plays once per cold load) | ✓ | ✓ | ✓ | skipped — final state shown |
| `<ParticleField>` canvas (60–100 dots + constellation lines) | — | ✓ | — | disabled |
| Conic-gradient ambient border rotation on `<HoloPanel>` | — | ✓ | — | disabled |
| Count-up + flash on `<TelemetryValue>` | ✓ | ✓ | ✓ | cut to final |

### 3.4 Boot sequence

Plays on initial page load (sessionStorage flag prevents replay during in-app nav).

1. Black hold (200ms)
2. Scan line sweeps top → bottom (400ms)
3. Dot grid fades in (300ms)
4. Central element of the page (constellation core on `/`, h1 on reading pages) draws via SVG path / fade-in (500ms)
5. Surrounding panels fly in from edges with 80ms stagger (600ms total)
6. Status text types out `SYSTEM ONLINE` in top-right of status strip (400ms)
7. Full interactive state reached at ~2.2s

Skipped entirely under `prefers-reduced-motion: reduce`. Bypassable via `?skip-boot=1` query param for development.

---

## 4. Layout architecture

Two shells. One source of truth for chrome.

### 4.1 `HudShell` (radial command center)

Used by `/`, `/progress`.

```
┌───────────────────────────────────────────────────────────┐
│ ● BRAND // ONLINE   2026.05.26 // 14:32   SESSION 0:42  │  <- <StatusStrip>
├───────────────────────────────────────────────────────────┤
│                                                           │
│                     [ central composition ]              │
│        (constellation on / , segment ring on /progress)  │
│                                                           │
│         [ orbital panels and telemetry strips ]          │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ ▸ event ticker scrolls →                                  │  <- <TickerStrip>
└───────────────────────────────────────────────────────────┘
```

No sidebar — module navigation IS the constellation on `/`. Settings + tutor reachable via command palette or top-right utility icons in the status strip.

### 4.2 `ReadShell` (sidebar + topbar + content)

Used by `/modules/*`, `/flashcards/*`, `/search`, `/settings`.

```
┌─────────────────┬──────────────────────────────────────────┐
│ IAM MASTERY     │ MOD 02 // PROTOCOLS // 01 KERBEROS     ⚙ │  <- topbar
│                 ├──────────────────────────────────────────┤
│ 01 FOUNDATIONS  │                                          │
│ 02 PROTOCOLS    │   centered Inter prose (max-w-3xl)       │
│  › Kerberos     │                                          │
│  › SAML         │   interactive blocks (Quiz / Flashcard / │
│ 03 MICROSOFT    │   PowerShellBlock / Callouts) inline     │
│ 04 PAM    [P2]  │                                          │
│ ...             │                                          │
│ ─────────────── │   prev ◂ ───────────────────── ▸ next    │
│ ▸ Flashcards    │                                          │
│ ▸ Search        │                                          │
│ ▸ Progress      │                                          │
└─────────────────┴──────────────────────────────────────────┘
```

Both shells share `<AmbientBackground>`, `<ScanLineOverlay>`, and `<BootSequence>` wrappers. They live in `components/layout/`.

---

## 5. Component inventory

### 5.1 Re-themed from shadcn

Kept; restyled to JARVIS palette via CSS variables and Tailwind class overrides. No structural rewrites.

| Component | Treatment |
|---|---|
| `Button` | Default variant: cyan bg-tint + cyan border + glow shadow + uppercase JetBrains Mono + `▸` prefix on primary actions. Variants: `primary` (cyan), `outline` (border-only), `ghost` (text-only), `destructive` (threat red), `warning` (amber). |
| `Input` | Void background, cyan border on focus with glow ring. JetBrains Mono. |
| `ScrollArea` | Cyan scrollbar thumb at 40% opacity, brighter on hover. |
| `Card` | Replaced by `<HoloPanel>` in nearly all use sites; kept as a fallback for non-HUD contexts. |
| `Badge` | Restyled as JARVIS pill — uppercase, cyan border, optional pulsing dot. |

### 5.2 New JARVIS-native primitives

Live under `components/jarvis/`. Each exports a single component, ships with a `.test.tsx`, and renders correctly against the void background.

| Component | Purpose |
|---|---|
| `<HoloPanel>` | Glass-effect container: `backdrop-filter: blur(8px) saturate(180%)`, 4% cyan bg, 25% cyan border, corner brackets via `<CornerBrackets>`. Props: `intent` (`default` / `warn` / `threat`), `glow` (boolean), `label` (top-left tag). |
| `<CornerBrackets>` | L-shaped 1.5px cyan accents in 2 opposite corners (configurable to all 4). Pure CSS pseudo-elements. |
| `<RadialRing>` | Single SVG circular progress ring with animated `stroke-dashoffset`. Props: `value` (0–1), `size`, `label`, `glow`. |
| `<RadialSegmentRing>` | 12-segment ring; each segment fills independently (per-module mastery). Used on `/` (mastery core) and `/progress` (centerpiece). |
| `<ModuleConstellation>` | The home page centerpiece. **Built in real 3D** using React Three Fiber + drei (see §9.2). 12 `<ModuleNode>` meshes orbit a central mastery core in 3D space; rotating ambient rings are real geometry. Cursor parallax = true camera perspective shift. Renders an SVG fallback under `prefers-reduced-motion: reduce` or when WebGL is unavailable. Module nodes remain real clickable elements with ARIA labels so the 3D layer is presentation, not function. |
| `<StatusStrip>` | Top strip for `HudShell`: brand mark, live datetime tick, session timer, `● ONLINE` pulse, right-aligned utility icons. |
| `<TickerStrip>` | Bottom strip for `HudShell`: infinite-loop horizontal scroll of system-event strings. Reads from real session/progress data — never lorem. |
| `<TelemetryValue>` | A number that animates 0 → target on mount via rAF + ease-out-expo. Flashes a cyan text-shadow pulse on value change. `font-variant-numeric: tabular-nums`. |
| `<ScanLineOverlay>` | Fixed-viewport `pointer-events: none` overlay of the always-on scan-line pattern. Stacks above content (z-index 50). |
| `<ParticleField>` | Canvas-based 60–100-particle constellation field with rAF animation. Connects particles within 120px with faint cyan lines. Disabled under reduced motion. HUD pages only. |
| `<BootSequence>` | Wraps children; runs the 6-step boot animation on cold load. Reads sessionStorage flag to avoid replay. Reduced-motion: passthrough. |
| `<GlitchText>` | Brief chromatic-aberration + horizontal-offset reveal animation on text. Used sparingly — boot sequence, system event ticker accents. |

---

## 6. Page templates

### 6.1 `/` — Home (HudShell, Module Constellation)

- `<StatusStrip>` top: brand mark `IAM MASTERY`, live datetime `2026.05.26 // 14:32:07`, session timer, `● ONLINE` pulsing dot.
- Centerpiece: `<ModuleConstellation>` — **rendered in real 3D** via React Three Fiber. A central mastery-core sphere (with HTML overlay showing total mastery %) sits at world origin. 12 `<ModuleNode>` meshes orbit around it in 3D space at fixed angular positions. Phase 1 nodes cyan-emissive, Phase 2 amber-emissive, Phase 3 dim. Two concentric dashed-ring meshes rotate at 10s and 14s in opposite directions. Cursor parallax translates to a real camera perspective shift (mouse position drives camera lookAt offset). Click on a node fires the route handler `/modules/[id]`. Falls back to SVG `<ModuleConstellation>` when `prefers-reduced-motion: reduce` is set or WebGL is unavailable.
- Bottom-row mini `<HoloPanel>`s: `STREAK`, `CARDS DUE`, `RESUME`.
- `<TickerStrip>` bottom: derived from real session/progress events.

### 6.2 `/modules/[moduleId]` — Module overview (ReadShell)

- Breadcrumb chip + Rajdhani XL module title with cyan glow.
- Module summary paragraph + section list. Each row: section number badge, title, est-minutes telemetry, completion status (`○` unvisited, `◐` in-progress, `●` completed cyan, `✓` mastered green).
- Module CTAs as a `<HoloPanel>` row: `▸ START MODULE QUIZ`, `▸ REVIEW FLASHCARDS`, `▸ ASK PROFESSOR`.
- **Phase 2/3 stub modules**: same shell, body replaced with a `TRANSMISSION INCOMING — PHASE 2` glass card.

### 6.3 `/modules/[moduleId]/[sectionId]` — Section reading (ReadShell, Light chrome)

- Topbar shows full breadcrumb chip + section meta strip: `EST 25 MIN · SC-300 ✓ · STATUS: SEEDED`.
- MDX-rendered Inter prose. Rajdhani uppercase headers; h1 has cyan text-shadow glow.
- Interactive blocks (Quiz, Flashcard, code, `<ProTip>`, `<Definition>`) get tactical accent borders inline. They do not get full glass-panel wrapping (per Light chrome decision). The single exception is `<WarStory>` — see §8 — which is intentionally elevated to a glass `<HoloPanel>` because it represents real-world incident emphasis.
- Section footer: prev/next as two `<HoloPanel>` cards + `▸ MARK MASTERED` button (updates `progress.sections[].status`).
- Persistent right-edge `Ask Professor` rail (cyan glow button) opens the tutor in a slide-in panel.

### 6.4 `/flashcards` and `/flashcards/[moduleId]` — Review (ReadShell)

- Centered single-card focus mode (sidebar still visible).
- Card is a `<HoloPanel>` with 3D flip on click or `Space`. Cyan front-glow brightens during flip.
- Below: three buttons — `◀ DEMOTE` (threat), `↻ REPEAT` (warn), `▶ PROMOTE` (cyan). Keyboard: `1`/`2`/`3` or arrow keys.
- Top stats strip: `CARDS DUE TODAY · LEITNER BOX BREAKDOWN · STREAK`.

### 6.5 `/search` — Results (ReadShell)

- Topbar search input is primary; results paginate.
- Results: `<HoloPanel>` cards grouped by `type` (sections / glossary / recipes / quizzes). Filter chips for module + type.
- Hover lights up corner brackets + brightens border glow.

### 6.6 `/progress` — Progress dashboard (HudShell)

- Shared `<StatusStrip>` + `<TickerStrip>` chrome.
- Centerpiece: `<RadialSegmentRing>` (12 wedges, fill % per module) + adjacent `<HoloPanel>` strip with weekly study minutes sparkline.
- Below the centerpiece: stacked panel grid — per-module breakdown (completion %, sections done, quiz best score, flashcards mastered), 90-day activity heatmap, streak history.

### 6.7 `/settings` — Settings (ReadShell)

- Single-column form. `<HoloPanel>` sections: **Display** (sound toggle, motion intensity), **Tutor** (API key, model selector), **Data** (export, import, reset).
- API key entry: monospace input with `● STORED IN BROWSER` warning label in amber.

---

## 7. Interaction & motion layer

### 7.1 Framer Motion + CSS keyframes

| Surface | Library | Detail |
|---|---|---|
| Page route transitions | Framer | 200ms fade + 4px y-translate |
| Sidebar active swap | Framer | cyan glow burst on new item |
| List stagger reveals | Framer | 30ms stagger per child |
| Count-up telemetry | rAF + ease-out-expo | 1.5s duration; 400ms cyan text-shadow flash on value change |
| Scan-line drift | CSS keyframes | 30s loop |
| Conic-gradient border rotation (HoloPanel, NICE-tier) | CSS keyframes | 10s loop |
| `● ONLINE` dot pulse | CSS keyframes | 2s sine |

`prefers-reduced-motion: reduce` kills `<ParticleField>`, scan-line drift, conic rotations, and boot sequence; cuts functional transitions to 100ms.

### 7.2 Command palette (`cmdk`)

- `Cmd+K` / `Ctrl+K` opens a centered glass-panel modal with corner brackets + scan lines.
- Fuzzy search across sections, glossary terms, PowerShell recipes, quizzes, flashcards.
- Action items: `▸ Review flashcards due today`, `▸ Ask the Professor about [current section]`, `▸ Resume last section`, `▸ Toggle sound`, `▸ Export progress`, `▸ Reset session timer`.
- Live top-8 results; JetBrains Mono throughout. Recently-visited items pinned when query is empty.

### 7.3 Keyboard shortcuts

Registered via a `useKeyboardShortcuts` hook in `hooks/`.

| Key | Action |
|---|---|
| `Cmd+K` / `Ctrl+K` | Open command palette |
| `J` / `K` | Next / previous section |
| `Space` | Flip flashcard |
| `1` / `2` / `3` | Flashcard demote / repeat / promote |
| `1`–`4` | Quiz answer (when quiz visible) |
| `Esc` | Close any overlay |
| `?` | Open shortcut help overlay (JARVIS-themed grid) |

### 7.4 Sound (Howler, opt-in, default OFF)

- Sound files <10KB each, lazy-loaded only when `settings.soundEnabled === true`.
- `tick.wav` flashcard flip · `chime.wav` quiz correct · `tone-down.wav` quiz wrong · `boot.wav` startup sequence (only if sound enabled and boot is playing).
- Single `useSound()` hook reads `settings.soundEnabled` from progress lib; no-op if disabled.

---

## 8. MDX content components

Live in `components/content/`. All auto-registered via `mdx-components.tsx` so they're usable inside any `.mdx` file without imports.

| Component | Behavior |
|---|---|
| `<Quiz id="...">` | Multi-choice / true-false / scenario; cyan glow + checkmark on correct, red shake + slide-in explanation on wrong. Tracks attempts via `recordQuizAttempt()`. |
| `<Flashcard front back>` | Inline 3D-flip preview on click or `Space`. |
| `<WarStory title>` | Red left-bar + ⚠ icon; one of the few content components that DOES wrap in a glass panel (visual emphasis). |
| `<ProTip>` | Amber left-bar + ⚡ icon. Inline. |
| `<SC300Badge>` | Cyan-blue pill marking SC-300-aligned content. Inline. |
| `<Definition term>` | Inline cyan-underlined term with a hover card showing definition + example. |
| `<PowerShellBlock>` | JetBrains Mono code block, `▸ PS` label header, copy button with toast confirmation, syntax-tinted (cmdlets cyan, params amber, strings green). |
| `<CommandReference category>` | Filterable table reading from `recipes.json`. Search + category chip filters. |

---

## 9. Diagram & 3D doctrine

### 9.1 Flow diagrams — ambitious 2D SVG

Live in `components/diagrams/`. All built on a shared `<FlowDiagram>` SVG primitive that handles node positioning, arrow paths, and Framer-animated token traversal.

| Diagram | Animates |
|---|---|
| `<KerberosFlowDiagram>` | AS-REQ → AS-REP → TGS-REQ → TGS-REP → AP-REQ. Click any step to expand ticket-contents detail panel. |
| `<SAMLFlowDiagram>` | SP-initiated and IdP-initiated flows with a toggle. Click steps for AuthnRequest / Response / Assertion XML detail. |
| `<OAuthFlowDiagram>` | Authorization Code + PKCE animation with token endpoint exchange and refresh rotation. Implicit Grant rendered with strikethrough animation. |
| `<HybridIdentityDiagram>` | PHS / PTA / Federation mode toggle. Arrows reroute when switching mode. |
| `<EcosystemMap>` | Pan/zoom IAM ecosystem map. Click any node to highlight its connections. |

All diagrams use the JARVIS palette (cyan arrows + glow on active step, amber for warnings, threat red for attacker paths). SVG-based; Framer Motion animates token paths along edges.

**Ambitious 2D treatment** — these are NOT flat charts. Each diagram ships with:
- Cyan-glowing tokens traveling along arc paths (Framer Motion path animation)
- Layered blur backgrounds for pseudo-depth (3 SVG `<filter>` stack with offsets)
- Hover-zoom on actor nodes (Framer scale + glow intensify)
- Click-to-expand step detail (slide-in glass panel with the protocol-specific payload)
- Subtle parallax on actor nodes via cursor position (max 6px offset)

Goal: cinematic 2D that competes visually with the 3D constellation, without bringing WebGL onto reading pages.

### 9.2 3D home dashboard — React Three Fiber

> **SUPERSEDED (2026-06-03).** This 3D-home-dashboard doctrine was abandoned. The React Three Fiber `<ModuleConstellation>` was attempted twice and reverted twice (rendering/stacking issues, and the cinematic payoff never justified the WebGL bundle); the later "holographic command sphere" revival (`docs/superpowers/specs/2026-05-27-home-polish-wave-design.md` §4) was likewise abandoned. The home centerpiece is the 2D SVG `ModuleDeck` (`<ModuleConstellationSVG>`) — same 12 clickable nodes, mastery %, and hidden a11y nav, no WebGL. This is a settled product decision; do NOT propose reviving the 3D path. The §2 decision 08 "3D doctrine" row, the §6.1 home-page 3D bullet, the §11.1 MUST "3D `<ModuleConstellation>`" item, and the §13 acceptance criteria below that reference 3D are void as written; their 2D-SVG equivalents (nodes, parallax-free static layout, fallback parity) are what shipped. Spec text below is retained for history.

The home page constellation is the **one** 3D experience in the app. Implementation:

| Decision | Choice |
|---|---|
| Renderer | React Three Fiber (`@react-three/fiber`) |
| Helpers | `@react-three/drei` — `OrbitControls` (disabled, used only for camera math), `Html` for the mastery % overlay, `Text` for module IDs, `useFrame` for ambient rotation |
| Scene composition | Central mastery sphere (icosahedron with cyan emissive material) + 12 orbiting `<ModuleNode>` meshes (small spheres with module-ID `Text`) + 2 concentric `<RingGeometry>` rotating bands + ambient particle field (`Points` with 200 cyan-tinted vertices) |
| Camera | Orthographic camera offset for that "engineering blueprint" perspective; cursor-driven lookAt for parallax (max 4° offset) |
| Lighting | Single cyan `PointLight` at origin + ambient at 5% intensity (looks like emissive geometry is glowing on its own) |
| Click handling | Each `<ModuleNode>` is a `<mesh>` with `onClick` firing `router.push('/modules/[id]')` |
| Accessibility | Behind-the-scenes hidden `<nav>` element with `<Link>` to each module, so screen readers and `Tab` navigation work normally. The 3D layer is presentation, not function. |
| Fallback | Detects `prefers-reduced-motion: reduce` OR `WebGLRenderingContext` unavailable → renders the SVG `<ModuleConstellation>` primitive instead (same nodes, no 3D) |
| Bundle | Three.js + R3F + drei load **only on `/`** via Next.js route-based code splitting. ~1.0 MB compressed for this chunk; reading pages remain unaffected. |

`/progress` stays 2D — it's a data page, not a wow page. Same JARVIS chrome (`<StatusStrip>` + `<TickerStrip>` + `<RadialSegmentRing>`) but pure SVG/HTML.

---

## 10. AI Study Tutor — "Ask the Professor"

- Right-edge slide-in panel — 40% viewport width on desktop, full-width on mobile. Glass `<HoloPanel>` frame.
- Default model: `claude-sonnet-4-6` (configurable in settings).
- System prompt: Ivy-League IAM professor persona — passionate, precise, what / why / how / war-story structure.
- Context injection: the current section's MDX content is auto-loaded into the request so answers stay grounded.
- Conversation persistence: per-section history under `tutorHistory[sectionId]` in localStorage.
- API key: stored in localStorage with `● STORED IN BROWSER` amber warning in settings.
- **Streaming responses** via the Anthropic SDK streaming API, rendered with a cyan typewriter effect.

---

## 11. Scope priority

### 11.1 MUST (ship in Plan 2 launch)

- Full JARVIS visual identity (palette tokens, type stack, scan lines, dot grid, intensified cursor glow)
- Both layout shells (`HudShell`, `ReadShell`) sharing `<ScanLineOverlay>` + `<BootSequence>`
- All JARVIS-native primitives: `HoloPanel`, `CornerBrackets`, `RadialRing`, `RadialSegmentRing`, `ModuleConstellation`, `TickerStrip`, `StatusStrip`, `TelemetryValue`
- Boot sequence (cold-load only, reduced-motion aware)
- All 8 page templates from §6
- Framer Motion: page transitions + stagger reveals + count-up + value-flash
- `cmdk` command palette with full action list
- Keyboard shortcuts + `?` help overlay
- Opt-in Howler sound (default OFF, lazy-loaded files)
- All MDX content components from §8
- All 5 ambitious 2D animated flow diagrams from §9.1
- **3D `<ModuleConstellation>` on `/` (React Three Fiber)** with SVG fallback — see §9.2
- AI Study Tutor right-pane with streaming responses

### 11.2 NICE (target Plan 2; defer if scope pressure surfaces)

- `<ParticleField>` canvas constellation on HUD pages only
- Conic-gradient ambient border rotation on `<HoloPanel>`
- `<GlitchText>` component for accent reveals (boot sequence, ticker events)
- Cursor parallax on constellation nodes
- Random panel glitch flicker (every 15–30s, single element)

### 11.3 CUT

- Audio-reactive sine-wave pulse — no audio source, gratuitous in a learning context
- Cursor trail glow (a *short-lived lerping highlight that follows the cursor*, per JARVIS spec section V — distinct from the always-on cursor-tracked ambient spotlight in §3.3, which stays). Distracting during long reading sessions.
- 3D versions of the 5 flow diagrams (Kerberos/SAML/OAuth/Hybrid/EcosystemMap) — they stay 2D per §9.1. 3D is reserved for the home `<ModuleConstellation>` only.
- Voice commands — already cut from Phase 1, stays cut

---

## 12. Testing strategy

| Layer | Tooling | What it covers |
|---|---|---|
| Unit | Vitest + @testing-library/react | Every JARVIS primitive ships with a `.test.tsx` verifying render + required props. Existing lib tests (`content`, `progress`, `flashcards`, `Sidebar`, `Topbar`, `useSessionTimer`) stay green. |
| Visual smoke | Vitest snapshots under `tests/visual/` | One render-snapshot per JARVIS primitive against void-black background — catches palette / type regressions. |
| Accessibility | `@axe-core/react` checks in tests | Layout shells + `<Quiz>` + command palette + tutor panel. Focus glow verified visible. |
| Motion preference | Vitest | Explicit test that `<BootSequence>`, `<ParticleField>`, scan-line drift, conic rotations become no-ops when `prefers-reduced-motion: reduce`. |
| Visual regression | Playwright screenshots | One screenshot per route at 1440×900 saved to `tests/visual/screens/`, committed to git so visual drift is reviewable on PR. |
| Manual QA checklist | (in the implementation plan) | Boot sequence plays smoothly · ticker scrolls · palette opens with `Cmd+K` · sound respects toggle · tutor streams · prev/next nav works · all keyboard shortcuts fire. |
| Bundle budget | `next build` output | **Shared / per-page chunk**: Framer Motion + Howler + `cmdk` + Fuse.js combined ≤ 200 KB gzipped on any route that isn't `/`. Warn at 180 KB. **`/` (home) chunk** allowed an additional ~350 KB gzipped for Three.js + R3F + drei (~1 MB compressed total for the home 3D experience), since this loads only on `/` via route-based code splitting and is verified absent from `/modules/*`, `/flashcards/*`, `/search`, `/progress`, `/settings` chunks. |

---

## 13. Acceptance criteria

> **SUPERSEDED in part (2026-06-03):** Criterion 3's "renders the 3D Module Constellation (React Three Fiber) with all 12 nodes orbiting in real 3D space ... cursor parallax shifts the camera" is void — the 3D path was abandoned (see §9.2 SUPERSEDED note); `/` ships the 2D SVG `ModuleDeck` (`<ModuleConstellationSVG>`) with all 12 nodes positioned and clickable. Criterion 13's home-route 3D-chunk bundle clause and Three.js/R3F/drei verification are moot (those deps are not shipped). Criterion 14's hidden-DOM-nav requirement still holds and is satisfied by the SVG path. Everything else in this list stands.

Plan 2 is done when all of these are true:

1. `pnpm dev` starts cleanly with no console errors on every route.
2. Boot sequence plays on cold load and is skipped under `prefers-reduced-motion`.
3. `/` renders the 3D Module Constellation (React Three Fiber) with all 12 nodes orbiting in real 3D space, status strip live, ticker scrolling, mastery core glowing. Cursor parallax shifts the camera. Under `prefers-reduced-motion: reduce` or WebGL-unavailable, the SVG fallback renders instead — also with all 12 nodes positioned and clickable.
4. `/progress` renders the 12-segment radial mastery ring + per-module breakdown panels.
5. Section reading pages render with light JARVIS chrome — scan lines + dot grid + cyan-glow h1 + sidebar/topbar themed; prose stays clean.
6. Command palette opens with `Cmd+K`, fuzzy-searches all content, runs every action.
7. All 8 MDX content components render correctly inside a sample MDX file.
8. All 5 ambitious 2D animated flow diagrams play with cyan-palette token animation along paths, layered-blur depth, hover-zoom, click-to-expand detail panels.
9. AI Study Tutor streams a coherent reply when an API key is configured; conversation persists per section.
10. Opt-in sound triggers on flashcard flip + quiz events when enabled; silent when disabled.
11. `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass.
12. Playwright visual regression screenshots committed for all 8 routes.
13. Bundle size constraints met: non-home routes under 200 KB gzipped for new interaction dependencies; `/` home route under ~550 KB gzipped including the 3D constellation chunk; Three.js/R3F/drei verified absent from non-home route chunks via `next build` output.
14. **3D constellation accessibility**: hidden DOM nav with `<Link>` per module is present and works under keyboard `Tab` navigation and screen readers, regardless of whether the 3D layer is active or the SVG fallback is shown.

---

## 14. Open questions

None blocking. Documented for visibility:

- **Self-hosted Rajdhani / Inter / JetBrains Mono files** — fetch via `next/font/google` (preferred) or download to `public/fonts/`? Settle during Wave 0 of the implementation plan.
- **Boot sequence `sessionStorage` flag** — should it reset on Vercel deploy hash change? Likely yes, key it `iam-mastery:boot-played:<git-sha>`.
- **`<ParticleField>` performance budget** — particle count downshifts to 30 on `navigator.hardwareConcurrency < 4`. Verify during implementation.
- **3D constellation mobile performance** — confirm the React Three Fiber scene maintains 60fps on a mid-tier mobile (Pixel 6a / iPhone 12 class). If not, downshift particle count and lower the mastery-core polygon density, or fall back to SVG on mobile entirely.
- **First-load wait on `/`** — Three.js + R3F + drei chunk is ~1 MB; even on broadband that's a perceptible delay. Plan: show the SVG fallback immediately during the JS chunk load, then upgrade to 3D when ready. Alternative: a brief "INITIALIZING CONSTELLATION" boot-sequence step that masks the load. Choose during implementation.

---

**End of design.**
