# JARVIS Visual Foundations (Plan 2A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the restrained dark-slate visual shell from Plan 1 with the pure-JARVIS palette + Inter/Rajdhani/JetBrains Mono typography + all ten JARVIS-native primitives + dual layout shells (`HudShell`, `ReadShell`) + boot sequence, so every existing route is JARVIS-skinned end-to-end and ready for Plan 2B's command palette, 3D constellation, and MDX layer.

**Architecture:** Tailwind 4 `@theme` block holds the JARVIS palette tokens. Fonts self-hosted via `next/font/google` (zero FOUT). JARVIS-native primitives live in `components/jarvis/` — each is a focused, individually-testable React component using only existing dependencies (Framer Motion is already installed). `ReadShell` wraps the existing Sidebar/Topbar with intensified ambient effects; `HudShell` is a new chromeless radial-page wrapper. `BootSequence` runs once per cold load via `sessionStorage` flag and bypasses cleanly under `prefers-reduced-motion: reduce`.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui (re-themed), Framer Motion 12 (already installed), Vitest, @testing-library/react. New dev dep added: `@axe-core/react` for accessibility tests. No 3D, no cmdk, no MDX components — those land in Plan 2B.

**Spec reference:** `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md` (§3 Visual identity, §4 Layout architecture, §5 Component inventory, §6 Page templates, §11.1 MUST scope — minus interaction layer + 3D + MDX + diagrams + tutor).

**This plan delivers:**
- Pure-JARVIS palette tokens replacing all dark-slate tokens (no slate hex/oklch left in the codebase)
- Inter, Rajdhani, JetBrains Mono self-hosted via `next/font/google`
- All 5 existing shadcn primitives re-themed to JARVIS
- 10 new JARVIS-native primitives: `<CornerBrackets>`, `<HoloPanel>`, `<ScanLineOverlay>`, `<TelemetryValue>`, `<RadialRing>`, `<RadialSegmentRing>`, `<StatusStrip>`, `<TickerStrip>`, `<GlitchText>`, `<BootSequence>` — each with `.test.tsx`
- `ReadShell` and `HudShell` layout components
- `app/layout.tsx` updated to wrap children with `<BootSequence>` + `<ScanLineOverlay>` + intensified `<AmbientBackground>`
- Existing `Sidebar` and `Topbar` re-skinned with JARVIS treatment + cyan-glow active indicators + breadcrumb meta strip
- `/` home shows a static 2D SVG `<ModuleConstellation>` (12 nodes click-to-navigate; 3D upgrade lands in Plan 2B)
- Playwright smoke screenshots committed for all 8 routes under `tests/visual/screens/`
- 19 git commits, one per task

**Out of scope for Plan 2A** (deferred):
- 3D React Three Fiber constellation (Plan 2B)
- cmdk command palette (Plan 2B)
- Keyboard shortcuts + `?` help overlay (Plan 2B)
- Sound (Plan 2B)
- ParticleField canvas (Plan 2B)
- All MDX content components — Quiz, Flashcard, callouts, PowerShellBlock, CommandReference, Definition (Plan 2B)
- All 5 animated flow diagrams (Plan 2C)
- AI Study Tutor (Plan 2C)
- HUD-page-specific composition for `/progress` (Plan 2B)
- Glitch flicker effect / cursor parallax (Plan 2B NICE tier)
- Conic-gradient HoloPanel border rotation (Plan 2B NICE tier)

---

## File structure produced by this plan

```
~/projects/iam-mastery/
├── app/
│   ├── globals.css                       # T2 (replaced JARVIS palette)
│   ├── layout.tsx                        # T17 (wrapped with shells + boot)
│   └── page.tsx                          # T18 (uses HudShell + SVG constellation)
├── components/
│   ├── layout/
│   │   ├── AmbientBackground.tsx         # T15 (intensified 3x)
│   │   ├── Sidebar.tsx                   # T15 (re-skinned)
│   │   ├── Topbar.tsx                    # T16 (re-skinned + meta strip)
│   │   ├── ReadShell.tsx                 # T17 (new)
│   │   └── HudShell.tsx                  # T17 (new)
│   ├── jarvis/
│   │   ├── CornerBrackets.tsx            # T5
│   │   ├── CornerBrackets.test.tsx       # T5
│   │   ├── HoloPanel.tsx                 # T6
│   │   ├── HoloPanel.test.tsx            # T6
│   │   ├── ScanLineOverlay.tsx           # T7
│   │   ├── ScanLineOverlay.test.tsx      # T7
│   │   ├── TelemetryValue.tsx            # T8
│   │   ├── TelemetryValue.test.tsx       # T8
│   │   ├── RadialRing.tsx                # T9
│   │   ├── RadialRing.test.tsx           # T9
│   │   ├── RadialSegmentRing.tsx         # T10
│   │   ├── RadialSegmentRing.test.tsx    # T10
│   │   ├── StatusStrip.tsx               # T11
│   │   ├── StatusStrip.test.tsx          # T11
│   │   ├── TickerStrip.tsx               # T12
│   │   ├── TickerStrip.test.tsx          # T12
│   │   ├── GlitchText.tsx                # T13
│   │   ├── GlitchText.test.tsx           # T13
│   │   ├── BootSequence.tsx              # T14
│   │   ├── BootSequence.test.tsx         # T14
│   │   ├── ModuleConstellation.tsx       # T18 (SVG fallback version)
│   │   └── ModuleConstellation.test.tsx  # T18
│   └── ui/
│       ├── button.tsx                    # T4 (re-themed)
│       ├── input.tsx                     # T4 (re-themed)
│       ├── badge.tsx                     # T4 (re-themed)
│       ├── card.tsx                      # T4 (re-themed)
│       └── scroll-area.tsx               # T4 (re-themed)
├── lib/
│   └── fonts.ts                          # T3 (font config)
├── tests/
│   └── visual/
│       └── screens/                      # T19 (8 PNG screenshots committed)
├── playwright.config.ts                  # T19 (new)
├── package.json                          # T1 (+ @axe-core/react + @playwright/test)
└── pnpm-lock.yaml                        # T1 (regenerated)
```

Task numbers (T1–T19) indicate which task creates each file.

---

## Task 1: Add Plan 2A dev dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (regenerated)

- [ ] **Step 1: Add Playwright + axe-core**

Run: `pnpm add -D @axe-core/react @playwright/test`
Expected: pnpm resolves both packages and writes the new lockfile. Some peer-dep warnings are acceptable. Exit code 0.

- [ ] **Step 2: Install Playwright browsers**

Run: `pnpm exec playwright install chromium`
Expected: Chromium binary downloaded into Playwright's cache (typically `%LOCALAPPDATA%\ms-playwright\` on Windows). Single-line summary like `chromium downloaded`.

- [ ] **Step 3: Verify install**

Run: `pnpm list @axe-core/react @playwright/test --depth=0`
Expected: Both packages listed with their installed versions.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @axe-core/react and @playwright/test for visual + a11y tests"
```

---

## Task 2: Replace Tailwind theme with JARVIS palette

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Overwrite `app/globals.css` with the JARVIS theme**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* Core palette */
  --color-void: #0a0a0f;
  --color-void-elevated: #0e0e16;
  --color-cyan: #00f0ff;
  --color-nominal: #00ff88;
  --color-warn: #ffb800;
  --color-threat: #ff2040;

  /* Foreground tiers */
  --color-text: rgb(255 255 255 / 0.92);
  --color-text-muted: rgb(255 255 255 / 0.7);
  --color-text-dim: rgb(255 255 255 / 0.5);

  /* Shadcn-shaped tokens (kept for re-themed shadcn primitives) */
  --color-background: #0a0a0f;
  --color-foreground: rgb(255 255 255 / 0.92);
  --color-card: rgb(0 240 255 / 0.04);
  --color-card-foreground: rgb(255 255 255 / 0.92);
  --color-muted: rgb(0 240 255 / 0.06);
  --color-muted-foreground: rgb(255 255 255 / 0.7);
  --color-border: rgb(0 240 255 / 0.25);
  --color-input: rgb(0 240 255 / 0.06);
  --color-ring: #00f0ff;
  --color-primary: #00f0ff;
  --color-primary-foreground: #0a0a0f;
  --color-accent: rgb(0 240 255 / 0.12);
  --color-accent-foreground: #00f0ff;
  --color-warning: #ffb800;
  --color-warning-foreground: #0a0a0f;
  --color-destructive: #ff2040;
  --color-destructive-foreground: #ffffff;

  /* Glass + chrome alpha-graded tokens */
  --color-panel-bg: rgb(0 240 255 / 0.04);
  --color-panel-border: rgb(0 240 255 / 0.25);
  --color-panel-border-bright: rgb(0 240 255 / 0.5);
  --color-grid-dot: rgb(0 240 255 / 0.08);
  --color-scan-line: rgb(0 240 255 / 0.025);

  /* Sharp corners by default */
  --radius: 2px;
  --radius-sm: 2px;
  --radius-md: 3px;
  --radius-lg: 4px;
}

@layer base {
  * { @apply border-border; }
  html { color-scheme: dark; }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
  .tabular-nums { font-variant-numeric: tabular-nums; }

  /* JARVIS-specific utilities */
  .glow-cyan { text-shadow: 0 0 8px rgb(0 240 255 / 0.5); }
  .glow-cyan-strong { text-shadow: 0 0 14px rgb(0 240 255 / 0.7); }
  .ring-glow-cyan { box-shadow: 0 0 12px rgb(0 240 255 / 0.35); }
  .ring-glow-cyan-strong { box-shadow: 0 0 20px rgb(0 240 255 / 0.5); }
}
```

- [ ] **Step 2: Verify Tailwind compiles**

Run: `pnpm dev` (in background)
Open: `http://localhost:3000`
Expected: Page renders with the JARVIS void-black background. All existing chrome (Sidebar, Topbar) is now rendered in mostly the new palette but looks raw — that's expected; we re-skin in T15/T16. No PostCSS / Tailwind errors in the terminal. Stop server (`Ctrl+C`).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): replace dark-slate palette with JARVIS void+cyan tokens"
```

---

## Task 3: Self-host Inter, Rajdhani, JetBrains Mono via next/font

**Files:**
- Create: `lib/fonts.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create `lib/fonts.ts`**

```ts
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

export const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600'],
  display: 'swap'
})
```

- [ ] **Step 2: Wire the font variables into `app/layout.tsx`**

Find the `<html lang="en" className="dark">` line. Replace the whole `RootLayout` return with:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
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
        <AmbientBackground />
        <div className="relative flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Wire fonts into Tailwind theme via `app/globals.css`**

Add inside the `@theme` block (after the existing tokens, before the closing `}`):

```css
  /* Fonts */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-rajdhani), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
```

- [ ] **Step 4: Verify fonts load**

Run: `pnpm dev`
Open: `http://localhost:3000` in a browser with DevTools open.
Expected: Network tab shows 3 woff2 requests for Inter, Rajdhani, JetBrains Mono. No console errors. Body text renders in Inter. Stop server.

- [ ] **Step 5: Commit**

```bash
git add lib/fonts.ts app/layout.tsx app/globals.css
git commit -m "feat(theme): self-host Inter + Rajdhani + JetBrains Mono via next/font"
```

---

## Task 4: Re-theme shadcn primitives to JARVIS look

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/scroll-area.tsx`

- [ ] **Step 1: Re-theme `components/ui/button.tsx`**

Replace the `buttonVariants` const (keep all imports + the `Button` component + the `forwardRef` + the `Slot` logic unchanged; only the variant cva strings change):

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-medium uppercase tracking-[0.1em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-cyan/60 bg-cyan/10 text-cyan shadow-[0_0_12px_rgb(0_240_255/0.25)] hover:bg-cyan/20 hover:shadow-[0_0_18px_rgb(0_240_255/0.45)]",
        outline:
          "border border-cyan/30 bg-transparent text-foreground hover:border-cyan/60 hover:text-cyan",
        ghost:
          "border border-transparent bg-transparent text-text-muted hover:bg-cyan/10 hover:text-cyan",
        destructive:
          "border border-threat/60 bg-threat/15 text-threat shadow-[0_0_12px_rgb(255_32_64/0.3)] hover:bg-threat/25",
        warning:
          "border border-warn/60 bg-warn/15 text-warn shadow-[0_0_12px_rgb(255_184_0/0.3)] hover:bg-warn/25",
        link: "text-cyan underline-offset-4 hover:underline border-none"
      },
      size: {
        default: "h-9 px-4 py-1.5 rounded-[2px]",
        sm: "h-7 px-3 text-[10px] rounded-[2px]",
        lg: "h-11 px-6 text-sm rounded-[3px]",
        icon: "h-9 w-9 rounded-[2px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

- [ ] **Step 2: Re-theme `components/ui/input.tsx`**

Replace the `className` cn() call inside the `Input` component:

```tsx
className={cn(
  "flex h-9 w-full border border-panel-border bg-input px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-foreground placeholder:text-text-dim placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus-visible:outline-none focus-visible:border-cyan focus-visible:ring-1 focus-visible:ring-cyan focus-visible:shadow-[0_0_10px_rgb(0_240_255/0.3)] disabled:cursor-not-allowed disabled:opacity-50 rounded-[2px]",
  className
)}
```

- [ ] **Step 3: Re-theme `components/ui/badge.tsx`**

Replace `badgeVariants`:

```ts
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-1 focus:ring-cyan rounded-full",
  {
    variants: {
      variant: {
        default: "border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_8px_rgb(0_240_255/0.2)]",
        secondary: "border-panel-border bg-card text-text-muted",
        destructive: "border-threat/60 bg-threat/15 text-threat",
        warning: "border-warn/60 bg-warn/15 text-warn",
        outline: "border-panel-border text-foreground"
      }
    },
    defaultVariants: { variant: "default" }
  }
)
```

- [ ] **Step 4: Re-theme `components/ui/card.tsx`**

Replace the `Card` component's className:

```tsx
className={cn(
  "border border-panel-border bg-card text-card-foreground backdrop-blur-sm rounded-[3px]",
  className
)}
```

Leave `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` untouched (their defaults inherit fine).

- [ ] **Step 5: Re-theme `components/ui/scroll-area.tsx`**

Inside the `ScrollBar` component, replace the thumb styling. The `ScrollAreaPrimitive.ScrollAreaThumb` className becomes:

```tsx
className="relative flex-1 bg-cyan/40 hover:bg-cyan/70 transition-colors rounded-full"
```

And the `ScrollBar` container className becomes:

```tsx
className={cn(
  "flex touch-none select-none transition-colors",
  orientation === "vertical" && "h-full w-1.5 border-l border-l-transparent p-[1px]",
  orientation === "horizontal" && "h-1.5 flex-col border-t border-t-transparent p-[1px]",
  className
)}
```

- [ ] **Step 6: Verify re-themed primitives in the dev server**

Run: `pnpm dev`
Open: `http://localhost:3000`
Expected: Existing home page (which uses `Button` and `Badge` from Task T6 of Plan 1) now renders with JARVIS treatment — buttons are cyan-glow uppercase mono, badges are cyan-pill uppercase mono. Page background is void-black. Stop server.

- [ ] **Step 7: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/ui
git commit -m "feat(ui): re-theme shadcn Button/Input/Badge/Card/ScrollArea to JARVIS"
```

---

## Task 5: `<CornerBrackets>` primitive

**Files:**
- Create: `components/jarvis/CornerBrackets.tsx`
- Create: `components/jarvis/CornerBrackets.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/CornerBrackets.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CornerBrackets } from './CornerBrackets'

describe('CornerBrackets', () => {
  it('renders 2 corner span elements by default (top-left, bottom-right)', () => {
    const { container } = render(<CornerBrackets />)
    const corners = container.querySelectorAll('[data-jarvis-corner]')
    expect(corners).toHaveLength(2)
  })

  it('renders 4 corners when corners="all"', () => {
    const { container } = render(<CornerBrackets corners="all" />)
    const corners = container.querySelectorAll('[data-jarvis-corner]')
    expect(corners).toHaveLength(4)
  })

  it('accepts a custom color class', () => {
    const { container } = render(<CornerBrackets className="border-warn" />)
    const corner = container.querySelector('[data-jarvis-corner]')
    expect(corner?.className).toContain('border-warn')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/CornerBrackets.test.tsx`
Expected: FAIL — module `./CornerBrackets` not found.

- [ ] **Step 3: Implement `components/jarvis/CornerBrackets.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface CornerBracketsProps {
  /** Which corners to render. "diag" = top-left + bottom-right (default). "all" = all four. */
  corners?: 'diag' | 'all'
  /** Bracket arm length in px (default 6). */
  size?: number
  /** Border thickness in px (default 1.5). */
  thickness?: number
  /** Extra classes — typically a border-color utility like "border-cyan" or "border-warn". */
  className?: string
}

export function CornerBrackets({
  corners = 'diag',
  size = 6,
  thickness = 1.5,
  className
}: CornerBracketsProps) {
  const base = cn(
    'pointer-events-none absolute block border-cyan',
    className
  )
  const style = { width: size, height: size, borderWidth: 0 } as React.CSSProperties

  return (
    <>
      <span
        data-jarvis-corner="tl"
        className={base}
        style={{ ...style, top: -1, left: -1, borderTopWidth: thickness, borderLeftWidth: thickness }}
      />
      <span
        data-jarvis-corner="br"
        className={base}
        style={{ ...style, bottom: -1, right: -1, borderBottomWidth: thickness, borderRightWidth: thickness }}
      />
      {corners === 'all' && (
        <>
          <span
            data-jarvis-corner="tr"
            className={base}
            style={{ ...style, top: -1, right: -1, borderTopWidth: thickness, borderRightWidth: thickness }}
          />
          <span
            data-jarvis-corner="bl"
            className={base}
            style={{ ...style, bottom: -1, left: -1, borderBottomWidth: thickness, borderLeftWidth: thickness }}
          />
        </>
      )}
    </>
  )
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `pnpm test components/jarvis/CornerBrackets.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/CornerBrackets.tsx components/jarvis/CornerBrackets.test.tsx
git commit -m "feat(jarvis): add CornerBrackets primitive with tests"
```

---

## Task 6: `<HoloPanel>` primitive

**Files:**
- Create: `components/jarvis/HoloPanel.tsx`
- Create: `components/jarvis/HoloPanel.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/HoloPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloPanel } from './HoloPanel'

describe('HoloPanel', () => {
  it('renders children inside a positioned container', () => {
    render(<HoloPanel>Inside</HoloPanel>)
    expect(screen.getByText('Inside')).toBeInTheDocument()
  })

  it('renders 2 corner brackets by default (diag)', () => {
    const { container } = render(<HoloPanel>x</HoloPanel>)
    expect(container.querySelectorAll('[data-jarvis-corner]')).toHaveLength(2)
  })

  it('renders 4 corners when cornersAll is set', () => {
    const { container } = render(<HoloPanel cornersAll>x</HoloPanel>)
    expect(container.querySelectorAll('[data-jarvis-corner]')).toHaveLength(4)
  })

  it('renders a top-left label tag when label prop is provided', () => {
    render(<HoloPanel label="STATUS">x</HoloPanel>)
    expect(screen.getByText('STATUS')).toBeInTheDocument()
  })

  it('applies warning intent class', () => {
    const { container } = render(<HoloPanel intent="warn">x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('border-warn')
  })

  it('applies threat intent class', () => {
    const { container } = render(<HoloPanel intent="threat">x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('border-threat')
  })

  it('applies glow shadow when glow=true', () => {
    const { container } = render(<HoloPanel glow>x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('ring-glow-cyan')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/HoloPanel.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/HoloPanel.tsx`**

```tsx
import { cn } from '@/lib/utils'
import { CornerBrackets } from './CornerBrackets'

interface HoloPanelProps {
  children: React.ReactNode
  intent?: 'default' | 'warn' | 'threat'
  glow?: boolean
  /** Render all four corner brackets instead of just diag. */
  cornersAll?: boolean
  /** Small uppercase mono label rendered in the top-left "tag" position. */
  label?: string
  className?: string
}

const intentBorder = {
  default: 'border-panel-border',
  warn: 'border-warn/50',
  threat: 'border-threat/60'
} as const

const intentCorner = {
  default: 'border-cyan',
  warn: 'border-warn',
  threat: 'border-threat'
} as const

export function HoloPanel({
  children,
  intent = 'default',
  glow = false,
  cornersAll = false,
  label,
  className
}: HoloPanelProps) {
  return (
    <div
      className={cn(
        'relative border bg-panel-bg backdrop-blur-md p-4 rounded-[2px]',
        intentBorder[intent],
        glow && 'ring-glow-cyan',
        className
      )}
    >
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
  )
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `pnpm test components/jarvis/HoloPanel.test.tsx`
Expected: PASS — 7 tests passing.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/HoloPanel.tsx components/jarvis/HoloPanel.test.tsx
git commit -m "feat(jarvis): add HoloPanel primitive with intent + glow + label + tests"
```

---

## Task 7: `<ScanLineOverlay>` primitive

**Files:**
- Create: `components/jarvis/ScanLineOverlay.tsx`
- Create: `components/jarvis/ScanLineOverlay.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/ScanLineOverlay.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ScanLineOverlay } from './ScanLineOverlay'

describe('ScanLineOverlay', () => {
  it('renders a fixed pointer-events:none overlay', () => {
    const { container } = render(<ScanLineOverlay />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('pointer-events-none')
    expect(el.className).toContain('fixed')
  })

  it('sets aria-hidden so screen readers skip it', () => {
    const { container } = render(<ScanLineOverlay />)
    expect((container.firstChild as HTMLElement).getAttribute('aria-hidden')).toBe('true')
  })

  it('honors a custom z-index via className', () => {
    const { container } = render(<ScanLineOverlay className="z-10" />)
    expect((container.firstChild as HTMLElement).className).toContain('z-10')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/ScanLineOverlay.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/ScanLineOverlay.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface ScanLineOverlayProps {
  className?: string
}

/**
 * Fixed-viewport overlay rendering the always-on scan-line pattern + dot grid.
 * Pointer-events: none so it never blocks interaction. aria-hidden because it's
 * pure decoration. Drift animation respects prefers-reduced-motion via the CSS.
 */
export function ScanLineOverlay({ className }: ScanLineOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-50',
        '[background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgb(0_240_255/0.025)_2px,rgb(0_240_255/0.025)_3px)]',
        '[animation:jarvis-scan-drift_30s_linear_infinite] motion-reduce:animate-none',
        className
      )}
      style={{
        backgroundSize: '100% 200%'
      }}
    />
  )
}
```

- [ ] **Step 4: Add the `@keyframes` for the scan drift to `app/globals.css`**

Append inside `@layer utilities` (before the closing `}` of the layer):

```css
  @keyframes jarvis-scan-drift {
    from { background-position: 0 0; }
    to   { background-position: 0 100%; }
  }
```

- [ ] **Step 5: Run tests to verify pass**

Run: `pnpm test components/jarvis/ScanLineOverlay.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/ScanLineOverlay.tsx components/jarvis/ScanLineOverlay.test.tsx app/globals.css
git commit -m "feat(jarvis): add ScanLineOverlay with reduced-motion-aware drift"
```

---

## Task 8: `<TelemetryValue>` primitive

**Files:**
- Create: `components/jarvis/TelemetryValue.tsx`
- Create: `components/jarvis/TelemetryValue.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/TelemetryValue.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TelemetryValue } from './TelemetryValue'

afterEach(() => vi.useRealTimers())

describe('TelemetryValue', () => {
  it('renders the final integer value after the count-up duration', () => {
    vi.useFakeTimers()
    render(<TelemetryValue value={42} durationMs={1000} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders 0 initially before any timer advance', () => {
    vi.useFakeTimers()
    render(<TelemetryValue value={42} durationMs={1000} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders the suffix when provided', () => {
    vi.useFakeTimers()
    render(<TelemetryValue value={75} suffix="%" durationMs={500} />)
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('skips animation under prefers-reduced-motion (renders final immediately)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    render(<TelemetryValue value={99} durationMs={1000} />)
    expect(screen.getByText('99')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/TelemetryValue.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/TelemetryValue.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TelemetryValueProps {
  value: number
  suffix?: string
  durationMs?: number
  className?: string
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function TelemetryValue({
  value,
  suffix,
  durationMs = 1500,
  className
}: TelemetryValueProps) {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }
    startRef.current = null
    const from = display
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / durationMs)
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const current = Math.round(from + (value - from) * eased)
      setDisplay(current)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs])

  return (
    <span className={cn('tabular-nums font-display font-semibold text-cyan glow-cyan', className)}>
      {display}
      {suffix && <span className="ml-1 font-mono text-[0.5em] text-cyan/60">{suffix}</span>}
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test components/jarvis/TelemetryValue.test.tsx`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/TelemetryValue.tsx components/jarvis/TelemetryValue.test.tsx
git commit -m "feat(jarvis): add TelemetryValue with rAF count-up + reduced-motion bypass"
```

---

## Task 9: `<RadialRing>` primitive

**Files:**
- Create: `components/jarvis/RadialRing.tsx`
- Create: `components/jarvis/RadialRing.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/RadialRing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RadialRing } from './RadialRing'

describe('RadialRing', () => {
  it('renders an SVG circle with the supplied size', () => {
    const { container } = render(<RadialRing value={0.5} size={200} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
    expect(svg?.getAttribute('height')).toBe('200')
  })

  it('renders two circles — track + progress', () => {
    const { container } = render(<RadialRing value={0.5} />)
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('progress circle stroke-dashoffset reflects the value', () => {
    const { container } = render(<RadialRing value={0.25} size={100} />)
    const progress = container.querySelectorAll('circle')[1]
    const r = Number(progress.getAttribute('r'))
    const circumference = 2 * Math.PI * r
    const expectedOffset = circumference * (1 - 0.25)
    expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(expectedOffset, 1)
  })

  it('clamps value to [0,1]', () => {
    const { container } = render(<RadialRing value={1.5} />)
    const progress = container.querySelectorAll('circle')[1]
    expect(progress.getAttribute('stroke-dashoffset')).toBe('0')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/RadialRing.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/RadialRing.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test components/jarvis/RadialRing.test.tsx`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/RadialRing.tsx components/jarvis/RadialRing.test.tsx
git commit -m "feat(jarvis): add RadialRing SVG progress primitive with center label slot"
```

---

## Task 10: `<RadialSegmentRing>` primitive

**Files:**
- Create: `components/jarvis/RadialSegmentRing.tsx`
- Create: `components/jarvis/RadialSegmentRing.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/RadialSegmentRing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RadialSegmentRing } from './RadialSegmentRing'

describe('RadialSegmentRing', () => {
  it('renders one path per segment for the supplied segments array', () => {
    const { container } = render(
      <RadialSegmentRing
        segments={[
          { id: 'a', value: 1, color: '#00f0ff' },
          { id: 'b', value: 0.5, color: '#ffb800' },
          { id: 'c', value: 0, color: '#ff2040' }
        ]}
      />
    )
    // 3 segments × (track arc + fill arc) = 6 path elements
    expect(container.querySelectorAll('path')).toHaveLength(6)
  })

  it('renders 12 segments when given a 12-element array', () => {
    const segments = Array.from({ length: 12 }, (_, i) => ({
      id: `m${i}`,
      value: i / 11,
      color: '#00f0ff'
    }))
    const { container } = render(<RadialSegmentRing segments={segments} />)
    expect(container.querySelectorAll('path')).toHaveLength(24)
  })

  it('honors size prop on the svg', () => {
    const { container } = render(
      <RadialSegmentRing
        size={240}
        segments={[{ id: 'a', value: 0.3, color: '#00f0ff' }]}
      />
    )
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('240')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/RadialSegmentRing.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/RadialSegmentRing.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test components/jarvis/RadialSegmentRing.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/RadialSegmentRing.tsx components/jarvis/RadialSegmentRing.test.tsx
git commit -m "feat(jarvis): add RadialSegmentRing (per-segment fill) for module mastery viz"
```

---

## Task 11: `<StatusStrip>` primitive

**Files:**
- Create: `components/jarvis/StatusStrip.tsx`
- Create: `components/jarvis/StatusStrip.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/StatusStrip.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StatusStrip } from './StatusStrip'

describe('StatusStrip', () => {
  it('renders the brand mark', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/IAM MASTERY/i)).toBeInTheDocument()
  })

  it('renders an ONLINE status pill', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument()
  })

  it('renders a session timer in HH:MM:SS format', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/^0:0[0-9]:0[0-9]$/)).toBeInTheDocument()
  })

  it('renders the live datetime and updates each second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T14:32:07Z'))
    render(<StatusStrip />)
    // Format includes year and the colon-separated time
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1000) })
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/StatusStrip.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/StatusStrip.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

function formatNow(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} // ${hh}:${mi}:${ss}`
}

interface StatusStripProps {
  className?: string
}

export function StatusStrip({ className }: StatusStripProps) {
  const seconds = useSessionTimer()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-10 items-center justify-between border-b border-panel-border bg-void/85 px-5 backdrop-blur-md',
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
      >
        <span className="size-1.5 rounded-full bg-nominal shadow-[0_0_8px_#00ff88] animate-pulse" />
        IAM MASTERY // ONLINE
      </Link>

      <div className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70 md:block">
        {now ? formatNow(now) : '----'}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-cyan/70">
          SESSION {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-[2px] p-1.5 text-text-muted transition-colors hover:bg-cyan/10 hover:text-cyan"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test components/jarvis/StatusStrip.test.tsx`
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/jarvis/StatusStrip.tsx components/jarvis/StatusStrip.test.tsx
git commit -m "feat(jarvis): add StatusStrip with brand + datetime + session timer + settings link"
```

---

## Task 12: `<TickerStrip>` primitive

**Files:**
- Create: `components/jarvis/TickerStrip.tsx`
- Create: `components/jarvis/TickerStrip.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/TickerStrip.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TickerStrip } from './TickerStrip'

describe('TickerStrip', () => {
  it('renders each event prefixed with the marker', () => {
    render(<TickerStrip events={['PHS SYNC NOMINAL', 'TUTOR READY']} />)
    expect(screen.getAllByText(/PHS SYNC NOMINAL/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/TUTOR READY/).length).toBeGreaterThan(0)
  })

  it('renders a fallback message when events array is empty', () => {
    render(<TickerStrip events={[]} />)
    expect(screen.getByText(/AWAITING TELEMETRY/)).toBeInTheDocument()
  })

  it('duplicates content for the infinite-loop marquee', () => {
    const { container } = render(<TickerStrip events={['EVENT_A']} />)
    expect(container.querySelectorAll('[data-jarvis-ticker-track]').length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/TickerStrip.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/TickerStrip.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface TickerStripProps {
  events: string[]
  /** Pixels per second (default 40) */
  speedPxPerSec?: number
  className?: string
}

export function TickerStrip({ events, speedPxPerSec = 40, className }: TickerStripProps) {
  const items = events.length > 0 ? events : ['AWAITING TELEMETRY...']
  const content = items.map((e) => `▸ ${e}`).join('     ')
  // Duration scales with content length so animation speed stays roughly constant.
  const durationSec = Math.max(20, content.length * 0.25 * (40 / speedPxPerSec))

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
          {content}
        </span>
        <span
          data-jarvis-ticker-track
          aria-hidden="true"
          className="whitespace-nowrap px-6 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/60"
        >
          {content}
        </span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Add the ticker keyframes to `app/globals.css`**

Append inside `@layer utilities`:

```css
  @keyframes jarvis-ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
```

- [ ] **Step 5: Run tests to verify pass**

Run: `pnpm test components/jarvis/TickerStrip.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/TickerStrip.tsx components/jarvis/TickerStrip.test.tsx app/globals.css
git commit -m "feat(jarvis): add TickerStrip with infinite-loop marquee + reduced-motion bypass"
```

---

## Task 13: `<GlitchText>` primitive

**Files:**
- Create: `components/jarvis/GlitchText.tsx`
- Create: `components/jarvis/GlitchText.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/GlitchText.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  it('renders the supplied children', () => {
    render(<GlitchText>SYSTEM ONLINE</GlitchText>)
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
  })

  it('applies the glitch animation class when glitch=true', () => {
    const { container } = render(<GlitchText glitch>x</GlitchText>)
    expect((container.firstChild as HTMLElement).className).toContain('animate-[jarvis-glitch')
  })

  it('omits the animation class by default', () => {
    const { container } = render(<GlitchText>x</GlitchText>)
    expect((container.firstChild as HTMLElement).className).not.toContain('animate-[jarvis-glitch')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/GlitchText.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/GlitchText.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface GlitchTextProps {
  children: React.ReactNode
  /** Run the brief glitch animation once on mount when true. */
  glitch?: boolean
  className?: string
}

export function GlitchText({ children, glitch = false, className }: GlitchTextProps) {
  return (
    <span
      className={cn(
        'inline-block',
        glitch && 'animate-[jarvis-glitch_700ms_steps(4,end)_1] motion-reduce:animate-none',
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Add the glitch keyframes to `app/globals.css`**

Append inside `@layer utilities`:

```css
  @keyframes jarvis-glitch {
    0%   { transform: translate(0); text-shadow: 0 0 0 transparent; }
    20%  { transform: translate(-2px, 1px); text-shadow: 2px 0 #ff2040, -2px 0 #00f0ff; }
    40%  { transform: translate(2px, -1px); text-shadow: -2px 0 #ff2040, 2px 0 #00f0ff; }
    60%  { transform: translate(-1px, 0); text-shadow: 1px 0 #ff2040, -1px 0 #00f0ff; opacity: 0.85; }
    80%  { transform: translate(1px, 0); text-shadow: -1px 0 #ff2040, 1px 0 #00f0ff; opacity: 1; }
    100% { transform: translate(0); text-shadow: 0 0 8px rgb(0 240 255 / 0.5); }
  }
```

- [ ] **Step 5: Run tests to verify pass**

Run: `pnpm test components/jarvis/GlitchText.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/GlitchText.tsx components/jarvis/GlitchText.test.tsx app/globals.css
git commit -m "feat(jarvis): add GlitchText primitive with chromatic-aberration animation"
```

---

## Task 14: `<BootSequence>` primitive

**Files:**
- Create: `components/jarvis/BootSequence.tsx`
- Create: `components/jarvis/BootSequence.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/BootSequence.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { BootSequence } from './BootSequence'

beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

describe('BootSequence', () => {
  it('renders children behind the boot overlay on cold load', () => {
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.getByText('app-content')).toBeInTheDocument()
    expect(screen.getByText(/INITIALIZING/i)).toBeInTheDocument()
  })

  it('skips the boot overlay when sessionStorage flag is already set', () => {
    sessionStorage.setItem('iam-mastery:boot-played', '1')
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.queryByText(/INITIALIZING/i)).not.toBeInTheDocument()
  })

  it('skips boot under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.queryByText(/INITIALIZING/i)).not.toBeInTheDocument()
  })

  it('sets sessionStorage flag after boot completes', async () => {
    vi.useFakeTimers()
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    act(() => { vi.advanceTimersByTime(3000) })
    await waitFor(() => {
      expect(sessionStorage.getItem('iam-mastery:boot-played')).toBe('1')
    })
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/BootSequence.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/BootSequence.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GlitchText } from './GlitchText'

const BOOT_KEY = 'iam-mastery:boot-played'
const BOOT_DURATION_MS = 2200

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface BootSequenceProps {
  children: React.ReactNode
}

export function BootSequence({ children }: BootSequenceProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(BOOT_KEY) === '1') return
    setPlaying(true)
    const id = window.setTimeout(() => {
      sessionStorage.setItem(BOOT_KEY, '1')
      setPlaying(false)
    }, BOOT_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      {children}
      {playing && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-void',
            'animate-[jarvis-boot-fade_2200ms_ease-in-out_forwards]'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-cyan/80 shadow-[0_0_12px_#00f0ff] animate-[jarvis-boot-sweep_400ms_ease-in_forwards]" />
          <div className="text-center">
            <div className="mb-3 font-display text-2xl font-bold uppercase tracking-[0.15em] text-cyan glow-cyan-strong">
              <GlitchText glitch>IAM MASTERY</GlitchText>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan/60 animate-[jarvis-boot-type_1800ms_steps(20,end)_500ms_forwards] overflow-hidden whitespace-nowrap">
              INITIALIZING SYSTEM...
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Add boot keyframes to `app/globals.css`**

Append inside `@layer utilities`:

```css
  @keyframes jarvis-boot-fade {
    0%   { opacity: 1; }
    80%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes jarvis-boot-sweep {
    from { transform: translateY(0); }
    to   { transform: translateY(100vh); }
  }
  @keyframes jarvis-boot-type {
    from { max-width: 0; }
    to   { max-width: 100%; }
  }
```

- [ ] **Step 5: Run tests to verify pass**

Run: `pnpm test components/jarvis/BootSequence.test.tsx`
Expected: PASS — 4 tests passing.

- [ ] **Step 6: Commit**

```bash
git add components/jarvis/BootSequence.tsx components/jarvis/BootSequence.test.tsx app/globals.css
git commit -m "feat(jarvis): add BootSequence with sessionStorage gate + reduced-motion bypass"
```

---

## Task 15: Re-skin Sidebar + intensify AmbientBackground

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Modify: `components/layout/AmbientBackground.tsx`

- [ ] **Step 1: Bump `AmbientBackground` intensity 3×**

Replace the entire content of `components/layout/AmbientBackground.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onMove(e: MouseEvent) {
      el!.style.setProperty('--mx', `${e.clientX}px`)
      el!.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage:
          // Mouse-tracking radial — 3x stronger than Plan 1 (0.25 → 0.75)
          'radial-gradient(circle 900px at var(--mx, 50%) var(--my, 50%), rgb(0 240 255 / 0.18), transparent 55%), ' +
          // Dot grid — switched from slate to cyan, denser (24px → 18px)
          'radial-gradient(circle at 1px 1px, rgb(0 240 255 / 0.08) 1px, transparent 0)',
        backgroundSize: 'auto, 18px 18px'
      }}
    />
  )
}
```

- [ ] **Step 2: Re-skin `components/layout/Sidebar.tsx`**

Replace the file entirely:

```tsx
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const modules = getAllModules()

  return (
    <nav
      aria-label="Modules"
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-panel-border bg-void-elevated/60 backdrop-blur-sm md:flex"
    >
      <div className="border-b border-panel-border px-5 py-4">
        <Link
          href="/"
          className="block font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
        >
          IAM MASTERY
        </Link>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/50">
          ▸ CURRICULUM // 12 MODULES
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-[2px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors',
                  'hover:bg-cyan/10 hover:text-cyan',
                  m.phase === 1
                    ? 'text-text'
                    : m.phase === 2
                    ? 'text-warn/70'
                    : 'text-text-dim'
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {String(m.order).padStart(2, '0')} {m.title}
                  </span>
                </div>
                {m.phase !== 1 && (
                  <Badge variant={m.phase === 2 ? 'warning' : 'outline'} className="shrink-0">
                    P{m.phase}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-panel-border px-2 py-3">
        <ul className="space-y-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">
          <li>
            <Link
              href="/flashcards"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ FLASHCARDS
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ SEARCH
            </Link>
          </li>
          <li>
            <Link
              href="/progress"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ PROGRESS
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Run existing Sidebar tests**

Run: `pnpm test components/layout/Sidebar.test.tsx`
Expected: PASS — Plan 1 tests still verify the 12 module titles render, footer links present, and Phase badges appear on non-Phase-1 modules. The badge text changed from "Phase 2" to "P2" — update the test expectations.

- [ ] **Step 4: Update Sidebar tests to match new badge format**

Open `components/layout/Sidebar.test.tsx`. Replace the two Phase-badge assertions with:

```tsx
  it('renders a Phase 2 badge on Module 4', () => {
    render(<Sidebar />)
    const module4 = screen.getByText('04 Privileged Access Management').closest('a, button, div')!
    expect(module4.textContent).toMatch(/P2/)
  })

  it('renders a Phase 3 badge on Module 7', () => {
    render(<Sidebar />)
    const m7 = screen.getByText('07 Cloud IAM').closest('a, button, div')!
    expect(m7.textContent).toMatch(/P3/)
  })

  it('does not render a Phase badge on Phase 1 modules', () => {
    render(<Sidebar />)
    const m1 = screen.getByText('01 IAM Foundations').closest('a, button, div')!
    expect(m1.textContent).not.toMatch(/P2|P3/)
  })
```

And update the "renders all 12 module titles" expectations to match the new `"01 IAM Foundations"` (with padded order prefix) format:

```tsx
  it('renders all 12 module titles', () => {
    render(<Sidebar />)
    expect(screen.getByText('01 IAM Foundations')).toBeInTheDocument()
    expect(screen.getByText('02 Protocols Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('03 Microsoft Identity Platform')).toBeInTheDocument()
    expect(screen.getByText('04 Privileged Access Management')).toBeInTheDocument()
    expect(screen.getByText('12 Hands-On Labs')).toBeInTheDocument()
  })
```

And update the footer link assertions to match the new `▸` prefix:

```tsx
  it('renders footer links (Flashcards, Search, Progress)', () => {
    render(<Sidebar />)
    expect(screen.getByText('▸ FLASHCARDS')).toBeInTheDocument()
    expect(screen.getByText('▸ SEARCH')).toBeInTheDocument()
    expect(screen.getByText('▸ PROGRESS')).toBeInTheDocument()
  })
```

- [ ] **Step 5: Run Sidebar tests to verify pass**

Run: `pnpm test components/layout/Sidebar.test.tsx`
Expected: PASS — all 6 tests passing with the JARVIS-skinned Sidebar.

- [ ] **Step 6: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/Sidebar.test.tsx components/layout/AmbientBackground.tsx
git commit -m "feat(layout): re-skin Sidebar to JARVIS + intensify AmbientBackground 3x"
```

---

## Task 16: Re-skin Topbar + breadcrumb meta strip

**Files:**
- Modify: `components/layout/Topbar.tsx`
- Modify: `components/layout/Topbar.test.tsx`

- [ ] **Step 1: Replace `components/layout/Topbar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

export function Topbar() {
  const seconds = useSessionTimer()
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-panel-border bg-void/85 px-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div
          aria-label="Overall mastery"
          className="flex h-7 items-center gap-2 rounded-full border border-cyan/40 bg-cyan/8 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 shadow-[0_0_8px_rgb(0_240_255/0.2)]"
        >
          <span className="size-1.5 rounded-full bg-nominal shadow-[0_0_6px_#00ff88] animate-pulse" />
          0% MASTERED
        </div>
      </div>

      <form action="/search" className="hidden max-w-md flex-1 md:block">
        <Input
          type="search"
          name="q"
          placeholder="Search modules, terms, recipes…"
          className="h-8"
        />
      </form>

      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-cyan/70">
          SESSION {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-[2px] p-1.5 text-text-muted transition-colors hover:bg-cyan/10 hover:text-cyan"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update `components/layout/Topbar.test.tsx`**

The existing test for "renders the session timer in HH:MM:SS format" still works. The "mastery progress indicator" test still works. The settings link test still works. The search-input test still works.

But the timer text is now prefixed with `SESSION `. Update the timer assertion:

```tsx
  it('renders the session timer in HH:MM:SS format', () => {
    render(<Topbar />)
    expect(screen.getByText(/SESSION 0:0[0-9]:0[0-9]/)).toBeInTheDocument()
  })
```

- [ ] **Step 3: Run Topbar tests**

Run: `pnpm test components/layout/Topbar.test.tsx`
Expected: PASS — all 4 tests passing.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Topbar.tsx components/layout/Topbar.test.tsx
git commit -m "feat(layout): re-skin Topbar to JARVIS + cyan mastery pill + session label"
```

---

## Task 17: Build `ReadShell` + `HudShell` + wire into `app/layout.tsx`

**Files:**
- Create: `components/layout/ReadShell.tsx`
- Create: `components/layout/HudShell.tsx`
- Create: `components/layout/ReadShell.test.tsx`
- Create: `components/layout/HudShell.test.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing test for `ReadShell`**

Create `components/layout/ReadShell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReadShell } from './ReadShell'

describe('ReadShell', () => {
  it('renders the Sidebar + Topbar + children', () => {
    render(
      <ReadShell>
        <div>section-body</div>
      </ReadShell>
    )
    expect(screen.getByText('IAM MASTERY')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    expect(screen.getByText('section-body')).toBeInTheDocument()
  })

  it('wraps the main content in a max-width container', () => {
    const { container } = render(<ReadShell>x</ReadShell>)
    const main = container.querySelector('main')
    expect(main?.className).toMatch(/max-w-/)
  })
})
```

- [ ] **Step 2: Write failing test for `HudShell`**

Create `components/layout/HudShell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HudShell } from './HudShell'

describe('HudShell', () => {
  it('renders the StatusStrip + TickerStrip + children', () => {
    render(
      <HudShell events={['EVENT_A']}>
        <div>centerpiece</div>
      </HudShell>
    )
    expect(screen.getByText(/IAM MASTERY/)).toBeInTheDocument()
    expect(screen.getByText('centerpiece')).toBeInTheDocument()
    expect(screen.getAllByText(/EVENT_A/).length).toBeGreaterThan(0)
  })

  it('does NOT render a sidebar', () => {
    const { container } = render(
      <HudShell events={[]}>
        <div>x</div>
      </HudShell>
    )
    expect(container.querySelector('nav[aria-label="Modules"]')).toBeNull()
  })
})
```

- [ ] **Step 3: Run tests to verify failure**

Run: `pnpm test components/layout/ReadShell.test.tsx components/layout/HudShell.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement `components/layout/ReadShell.tsx`**

```tsx
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface ReadShellProps {
  children: React.ReactNode
}

export function ReadShell({ children }: ReadShellProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `components/layout/HudShell.tsx`**

```tsx
import { StatusStrip } from '@/components/jarvis/StatusStrip'
import { TickerStrip } from '@/components/jarvis/TickerStrip'

interface HudShellProps {
  children: React.ReactNode
  events: string[]
}

export function HudShell({ children, events }: HudShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <StatusStrip />
      <main className="flex flex-1 items-center justify-center px-6 py-8">{children}</main>
      <TickerStrip events={events} />
    </div>
  )
}
```

- [ ] **Step 6: Update `app/layout.tsx` to wrap with `<BootSequence>` + `<ScanLineOverlay>` and DROP the inline shell**

Replace `app/layout.tsx` entirely (note: pages will now choose their own shell — `/` uses `HudShell`, all others use `ReadShell`):

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScanLineOverlay } from '@/components/jarvis/ScanLineOverlay'
import { BootSequence } from '@/components/jarvis/BootSequence'
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
        <AmbientBackground />
        <ScanLineOverlay />
        <BootSequence>{children}</BootSequence>
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Wrap all non-`/` routes with `<ReadShell>` via per-page changes**

For each of the following files, wrap the existing returned JSX with `<ReadShell>...</ReadShell>` (don't change anything else). Files to update:

- `app/modules/[moduleId]/page.tsx`
- `app/modules/[moduleId]/[sectionId]/page.tsx`
- `app/flashcards/page.tsx`
- `app/flashcards/[moduleId]/page.tsx`
- `app/search/page.tsx`
- `app/progress/page.tsx`
- `app/settings/page.tsx`

Example for `app/flashcards/page.tsx`:

```tsx
import { ReadShell } from '@/components/layout/ReadShell'

export default function FlashcardsPage() {
  return (
    <ReadShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-text-muted">Cross-module spaced-repetition review placeholder.</p>
      </div>
    </ReadShell>
  )
}
```

Repeat the same `<ReadShell>` wrap for the other six pages above (keep their async / params handling intact; only wrap the returned JSX).

Note: `app/page.tsx` is NOT wrapped here — Task 18 gives it the `HudShell` and the SVG `ModuleConstellation`.

- [ ] **Step 8: Run shell tests + full suite**

Run: `pnpm test components/layout/ReadShell.test.tsx components/layout/HudShell.test.tsx`
Expected: PASS.

Run: `pnpm test`
Expected: PASS — all suites green (including existing Sidebar / Topbar / library tests).

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 9: Verify in dev server**

Run: `pnpm dev`
Open `http://localhost:3000/modules/01-foundations` — Sidebar + Topbar JARVIS-skinned, void-black background, ambient cyan glow following the cursor, scan-line overlay subtly visible. Boot sequence plays on cold reload. Open DevTools: no console errors. Stop server.

- [ ] **Step 10: Commit**

```bash
git add components/layout/ReadShell.tsx components/layout/ReadShell.test.tsx components/layout/HudShell.tsx components/layout/HudShell.test.tsx app/layout.tsx app/modules app/flashcards app/search app/progress app/settings
git commit -m "feat(layout): add ReadShell + HudShell, wrap layout with BootSequence + ScanLineOverlay"
```

---

## Task 18: Build SVG `<ModuleConstellation>` + wire into `/` via `HudShell`

**Files:**
- Create: `components/jarvis/ModuleConstellation.tsx`
- Create: `components/jarvis/ModuleConstellation.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write failing test**

Create `components/jarvis/ModuleConstellation.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

// Stub matchMedia → prefers-reduced-motion = true so TelemetryValue renders
// its final value immediately and these assertions don't race the rAF loop.
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

describe('ModuleConstellation (SVG fallback)', () => {
  it('renders 12 module nodes', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={14} />)
    const nodes = container.querySelectorAll('[data-jarvis-module-node]')
    expect(nodes).toHaveLength(12)
  })

  it('renders a central mastery percent', () => {
    render(<ModuleConstellation totalMasteryPercent={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders a hidden screen-reader-friendly nav with one link per module', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    const a11yNav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(a11yNav).not.toBeNull()
    expect(a11yNav!.querySelectorAll('a').length).toBe(12)
  })

  it('node 04 (PAM) gets the phase-2 color class', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    const pamNode = container.querySelector('[data-jarvis-module-node="04-pam"]')
    expect(pamNode?.getAttribute('data-phase')).toBe('2')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test components/jarvis/ModuleConstellation.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `components/jarvis/ModuleConstellation.tsx`**

```tsx
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { cn } from '@/lib/utils'
import { RadialRing } from './RadialRing'
import { TelemetryValue } from './TelemetryValue'

interface ModuleConstellationProps {
  /** 0–100 — overall curriculum mastery */
  totalMasteryPercent: number
  /** SVG size in px (default 520) */
  size?: number
}

const PHASE_COLOR = {
  1: { ring: 'border-cyan', text: 'text-cyan', glow: 'shadow-[0_0_14px_rgb(0_240_255/0.5)]' },
  2: { ring: 'border-warn/60', text: 'text-warn', glow: 'shadow-[0_0_10px_rgb(255_184_0/0.4)]' },
  3: { ring: 'border-text-dim/40', text: 'text-text-dim', glow: '' }
} as const

export function ModuleConstellation({
  totalMasteryPercent,
  size = 520
}: ModuleConstellationProps) {
  const modules = getAllModules()
  const radius = size * 0.42

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer decorative dashed rings */}
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 motion-reduce:hidden"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 1.05}
          fill="none"
          stroke="rgb(0 240 255 / 0.18)"
          strokeWidth="1"
          strokeDasharray="3 4"
          className="origin-center animate-[jarvis-spin_24s_linear_infinite]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius * 1.22}
          fill="none"
          stroke="rgb(0 240 255 / 0.1)"
          strokeWidth="1"
          strokeDasharray="1 6"
          className="origin-center animate-[jarvis-spin-rev_38s_linear_infinite]"
        />
      </svg>

      {/* Central mastery core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <RadialRing
          value={totalMasteryPercent / 100}
          size={size * 0.36}
          thickness={5}
          label={
            <div className="text-center">
              <div className="font-display text-5xl font-bold leading-none text-cyan glow-cyan-strong">
                <TelemetryValue value={totalMasteryPercent} />
                <span className="ml-1 text-2xl text-cyan/60">%</span>
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
                CURRICULUM MASTERY
              </div>
            </div>
          }
        />
      </div>

      {/* 12 module nodes arrayed at fixed angles */}
      {modules.map((m, i) => {
        const angleDeg = i * 30 - 90 // start at top, clockwise
        const rad = (angleDeg * Math.PI) / 180
        const x = size / 2 + radius * Math.cos(rad)
        const y = size / 2 + radius * Math.sin(rad)
        const phase = m.phase as 1 | 2 | 3
        const c = PHASE_COLOR[phase]
        return (
          <Link
            key={m.id}
            href={`/modules/${m.id}`}
            data-jarvis-module-node={m.id}
            data-phase={String(phase)}
            aria-label={`${m.order}. ${m.title}`}
            className={cn(
              'absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-void/80 backdrop-blur-sm transition-all',
              'hover:scale-110',
              c.ring,
              c.text,
              c.glow
            )}
            style={{ left: x, top: y }}
            title={m.title}
          >
            <span className="font-display text-base font-bold tabular-nums">
              {String(m.order).padStart(2, '0')}
            </span>
          </Link>
        )
      })}

      {/* Hidden accessible nav for screen readers + keyboard tab order */}
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

- [ ] **Step 4: Add the spin keyframes to `app/globals.css`**

Append inside `@layer utilities`:

```css
  @keyframes jarvis-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes jarvis-spin-rev {
    from { transform: rotate(360deg); }
    to   { transform: rotate(0deg); }
  }
```

- [ ] **Step 5: Replace `app/page.tsx` with HudShell + Constellation**

```tsx
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  // Placeholder mastery value — Plan 2B wires this to real progress.ts
  const totalMastery = 0
  return (
    <HudShell events={SAMPLE_TICKER}>
      <ModuleConstellation totalMasteryPercent={totalMastery} />
    </HudShell>
  )
}
```

- [ ] **Step 6: Run tests**

Run: `pnpm test components/jarvis/ModuleConstellation.test.tsx`
Expected: PASS — 4 tests passing.

Run: `pnpm test`
Expected: PASS — all suites green.

- [ ] **Step 7: Verify in dev server**

Run: `pnpm dev`
Open: `http://localhost:3000/`
Expected: HudShell renders — StatusStrip at top with live datetime, ticker scrolling at bottom, Module Constellation in center showing 12 nodes around a `0%` mastery core. Phase 1 nodes (01, 02, 03, 06, 11) glow cyan; Phase 2 (04, 05, 08, 12) glow amber; Phase 3 (07, 09, 10) dim. Boot sequence plays on cold reload. Click any node → navigates to `/modules/[id]`. Stop server.

- [ ] **Step 8: Commit**

```bash
git add components/jarvis/ModuleConstellation.tsx components/jarvis/ModuleConstellation.test.tsx app/page.tsx app/globals.css
git commit -m "feat(home): replace home page with HudShell + 2D SVG ModuleConstellation"
```

---

## Task 19: Playwright smoke screenshots + final verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/visual/screens.spec.ts`
- Create: `tests/visual/screens/.gitkeep`
- Modify: `package.json` (add scripts)
- Modify: `.gitignore` (allow `tests/visual/screens/*.png`)

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark'
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
})
```

- [ ] **Step 2: Create `tests/visual/screens.spec.ts`**

```ts
import { test } from '@playwright/test'

const ROUTES: Array<{ name: string; url: string }> = [
  { name: 'home', url: '/' },
  { name: 'module-overview', url: '/modules/01-foundations' },
  { name: 'section', url: '/modules/02-protocols/01-kerberos' },
  { name: 'flashcards', url: '/flashcards' },
  { name: 'flashcards-module', url: '/flashcards/01-foundations' },
  { name: 'search', url: '/search?q=kerberos' },
  { name: 'progress', url: '/progress' },
  { name: 'settings', url: '/settings' }
]

for (const r of ROUTES) {
  test(`smoke screenshot — ${r.name}`, async ({ page }) => {
    await page.goto(r.url)
    // Wait past boot sequence + initial paint
    await page.waitForTimeout(2800)
    await page.screenshot({
      path: `tests/visual/screens/${r.name}.png`,
      fullPage: false
    })
  })
}
```

- [ ] **Step 3: Add scripts to `package.json`**

In the `"scripts"` object, add:

```json
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots"
```

- [ ] **Step 4: Create `tests/visual/screens/.gitkeep`**

```
```

(Empty file so the directory commits cleanly.)

- [ ] **Step 5: Ensure screenshots are committed**

The `.gitignore` already doesn't ignore PNGs. Verify nothing in `.gitignore` matches `tests/visual/screens/`. If it does, add an explicit allowance:

```
!tests/visual/screens/*.png
```

- [ ] **Step 6: Run Playwright**

Run: `pnpm test:visual`
Expected: 8 tests pass; one PNG screenshot per route under `tests/visual/screens/`. The dev server is auto-started + auto-stopped by Playwright's `webServer` config.

- [ ] **Step 7: Run the full unit suite + typecheck + lint**

Run all three:

Run: `pnpm test`
Expected: PASS — all unit tests green (existing Plan 1 tests + all 10 new JARVIS-primitive tests + ReadShell + HudShell + ModuleConstellation).

Run: `pnpm typecheck`
Expected: PASS — no errors.

Run: `pnpm lint`
Expected: PASS or warnings only — no errors.

- [ ] **Step 8: Visual eyeball check against acceptance criteria**

In the browser, walk through:
- `/` — boot sequence plays on cold load → constellation visible with 12 nodes around mastery core → ticker scrolling at bottom → cursor glow visible
- `/modules/01-foundations` — ReadShell renders with JARVIS sidebar + topbar → cyan accents → ambient effects present
- `/modules/02-protocols/01-kerberos` — same as above with section content placeholder
- `/flashcards`, `/flashcards/01-foundations`, `/search?q=kerberos`, `/progress`, `/settings` — all render under ReadShell with no console errors

- [ ] **Step 9: Commit final**

```bash
git add playwright.config.ts tests/visual package.json .gitignore
git commit -m "test(visual): add Playwright smoke screenshots for all 8 routes"
```

---

## Plan 2A acceptance criteria

Plan 2A is done when all of these are true:

1. ✅ `pnpm dev` starts cleanly with no console errors on every route listed in T19's `ROUTES`.
2. ✅ All 5 shadcn primitives re-themed to JARVIS (cyan-glow buttons, cyan-pill badges, etc.).
3. ✅ All 10 new JARVIS-native primitives implemented under `components/jarvis/`, each with a passing `.test.tsx`.
4. ✅ Inter / Rajdhani / JetBrains Mono self-hosted via `next/font/google` — verified in DevTools Network tab as 3 woff2 requests, no FOUT.
5. ✅ JARVIS palette tokens defined in `app/globals.css @theme`; no `oklch(... 250)` slate tokens remain.
6. ✅ Boot sequence plays on cold load and is skipped under `prefers-reduced-motion` AND when `sessionStorage["iam-mastery:boot-played"] === '1'`.
7. ✅ `app/layout.tsx` wraps children with `<BootSequence>` + `<ScanLineOverlay>` + intensified `<AmbientBackground>`.
8. ✅ `/` renders `<HudShell>` + `<ModuleConstellation>` (2D SVG fallback) — 12 nodes arranged in a clockwise ring around a `0%` mastery core; Phase 2/3 nodes color-coded; click navigates to module overview.
9. ✅ A hidden `nav[aria-label="Module navigation"]` exists on `/` providing screen-reader + keyboard `Tab` access to all 12 module links regardless of the visual constellation.
10. ✅ All 7 non-`/` routes render under `<ReadShell>` (JARVIS-skinned sidebar + topbar) with no broken layout.
11. ✅ `pnpm test` passes all 17+ test files (existing Plan 1 + 10 new JARVIS primitives + ReadShell + HudShell + ModuleConstellation).
12. ✅ `pnpm typecheck` passes with no errors.
13. ✅ `pnpm lint` passes (warnings ok, no errors).
14. ✅ `pnpm test:visual` produces 8 committed PNG screenshots under `tests/visual/screens/`.
15. ✅ 19 git commits on the working branch, one per task.

---

## Self-review notes

**Spec coverage check (against `docs/superpowers/specs/2026-05-26-jarvis-phase-2-design.md`):**

| Spec section | Covered by | Notes |
|---|---|---|
| §3.1 color tokens | T2 | All JARVIS tokens + shadcn-shaped fallbacks defined |
| §3.2 typography | T3 | All 3 fonts self-hosted via next/font; Tailwind `--font-*` vars wired |
| §3.3 ambient effects doctrine — scan lines, dot grid, ambient glow | T7, T15 | ScanLineOverlay + intensified AmbientBackground |
| §3.3 — particle field, conic-gradient border, glitch flicker | DEFERRED to Plan 2B | NICE-tier, not in 2A scope |
| §3.4 boot sequence | T14, T17 | BootSequence primitive + wired into RootLayout |
| §4.1 HudShell | T17 | StatusStrip + TickerStrip + centered slot |
| §4.2 ReadShell | T17 | Composes existing JARVIS-skinned Sidebar + Topbar |
| §5.1 re-themed shadcn primitives | T4 | All 5 (Button, Input, Badge, Card, ScrollArea) |
| §5.2 JARVIS-native primitives | T5–T14 | All 10 implemented, except ModuleConstellation as SVG only (3D in 2B) |
| §6.1 home page Constellation | T18 | SVG fallback version; 3D RTF upgrade lands in Plan 2B |
| §6.2–§6.7 page templates | T17 step 7 | All 7 non-home routes use ReadShell shell; content is still placeholder (real content/components in 2B+2C) |
| §7 motion language | PARTIAL — basic CSS keyframes via T7/T12/T13/T14/T18; Framer Motion page transitions in Plan 2B |
| §8 MDX content components | DEFERRED to Plan 2B |
| §9.1 ambitious 2D flow diagrams | DEFERRED to Plan 2C |
| §9.2 3D constellation | DEFERRED to Plan 2B |
| §10 AI Study Tutor | DEFERRED to Plan 2C |
| §12 testing — Vitest unit, visual smoke, axe a11y | T19 (visual + lint/typecheck); axe-core tests added in Plan 2B |
| §13 acceptance criteria | 2A acceptance is a narrower subset; criteria 1, 2 partial (boot only), 3 partial (constellation is SVG not 3D), 11 (typecheck), 12 (lint), 13 (bundle — measurable in 2A but verified in 2C) |

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, or vague "handle errors appropriately" instructions. Every code block is complete.

**Type consistency check:**
- `HoloPanel` uses `intent: 'default' | 'warn' | 'threat'` — referenced consistently in T6.
- `RadialRing` `value` is 0–1 fraction; `ModuleConstellation` passes `totalMasteryPercent / 100`. Consistent.
- `RadialSegmentRing.Segment.value` is 0–1; T10 test uses fractional values. Consistent.
- `TelemetryValue` accepts `value: number, suffix?: string, durationMs?: number`. `ModuleConstellation` uses `value={totalMasteryPercent}` (no suffix in this render, percent sign added externally for typography reasons). Consistent.
- `StatusStrip`, `TickerStrip` are server-component-safe except StatusStrip which is `'use client'` because of `useSessionTimer` and live datetime — explicitly marked.
- `BootSequence` is `'use client'` (needs `sessionStorage` + `useEffect`) — explicitly marked.

**Decomposition check:** Each task creates self-contained components with clear interfaces. Files stay focused (one primitive per file). Subagents can execute each task independently with no shared state beyond what's in `lib/` and `components/`.

**Scope check:** 19 tasks, each ~5–8 steps. Estimated 8–12 hours of focused implementation. Suitable for either subagent-driven or inline execution.

---

## Next plan

After Plan 2A completes via `superpowers:subagent-driven-development`:

- **Plan 2B — Interaction Layer + 3D + MDX components** — adds React Three Fiber 3D ModuleConstellation upgrade, cmdk command palette + keyboard shortcuts, opt-in Howler sound, ParticleField canvas on HUD pages, Framer Motion page transitions, all 8 MDX content components (Quiz, Flashcard, callouts, PowerShellBlock, CommandReference, Definition), `/progress` HudShell composition, axe-core a11y tests, `prefers-reduced-motion` test coverage.
- **Plan 2C — Flow Diagrams + AI Tutor + Polish** — adds all 5 animated 2D flow diagrams (Kerberos, SAML, OAuth, Hybrid Identity, EcosystemMap), AI Study Tutor right-pane with streaming, bundle-budget verification, final integration QA, NICE-tier polish (conic-gradient borders, glitch flicker, cursor parallax on constellation), Phase 2 acceptance criteria walkthrough.
