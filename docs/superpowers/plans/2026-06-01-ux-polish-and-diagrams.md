# IAM Mastery — Workstream 1 + New Diagrams: UX/Mobile Polish and 3 Net-New Diagram Components

> **Goal:** Close the Phase-1 UX gaps (mobile navigation, full keyboard control, strict mode, deep-linkable TOC, optional palette/resume fidelity) and build the 3 spec'd diagram components (`<CyberArkArchDiagram />`, `<SailPointAggregationDiagram />`, `<AWSIAMEvalDiagram />`) so Workstreams 2/3 can author Modules 4, 5, and 7 at full fidelity.

**Architecture note:** Every task here is a *localized* change to existing components/config plus three new self-contained diagrams that compose the generic `components/diagrams/FlowDiagram.tsx`. No data-model or routing change. The section page (`app/modules/[moduleId]/[sectionId]/page.tsx`) is an RSC; anything reading `window`/`localStorage` or holding keyboard state must be a `'use client'` component mounted into it (mirror `SectionMountTracker`). Tests run on Vitest + Testing Library + jsdom (`vitest.config.ts`, setup `./tests/setup.ts`, `@` alias → repo root). Diagram tests co-locate as `*.test.tsx` mirroring `components/diagrams/KerberosFlowDiagram.test.tsx`.

**Prereqs / conventions (read first):**
- This plan touches **code only** — it does NOT add MDX sections, so the **two-file section-sync** rule (`content/modules.json` ↔ `lib/sections.ts`) and the **content-loader registration** rule do *not* apply to any task here. (Those rules govern content workstreams 0/2/3. The new diagrams are *wired by registration in `mdx-components.tsx` only* — the same way the 5 existing diagrams are — so MDX authors in Workstreams 2/3 can use them tag-only with no import.)
- **TDD is mandatory** for every task: write the failing test, run it, watch it fail for the right reason, implement, run until green, then commit. Verify after each task with `pnpm test`, `pnpm typecheck`, `pnpm lint`, and (for config/render changes) `pnpm build`. The baseline at plan time is **233 passing tests / 54 files, build/lint/typecheck all green** — never regress it.
- House primitives to reuse, not reinvent: `HoloPanel` (panel chrome), `cn()` (`lib/utils`), `useSound` (`hooks/use-sound`), `useFocusTrap` (`hooks/use-focus-trap`), `useKeyboardShortcuts` (`hooks/use-keyboard-shortcuts`), the JARVIS color tokens (`cyan`, `nominal`, `warn`/`warn`, `threat`, `text-muted`, `panel-border`, `void-elevated`).
- `pnpm` is the package manager (`packageManager: pnpm@9.14.0`). `next dev`/`next build` run with `--webpack` (not Turbopack) — relevant for the MDX rehype-plugin task (1D), which must work under the webpack `@next/mdx` loader.

---

## Task map

| Task | Title | Steps | New deps |
|---|---|---|---|
| 1A | Mobile nav drawer | 6 | none |
| 1B | Keyboard nav (J/K, 1–4 quiz keys, help-overlay reconcile) | 7 | none |
| 1C | reactStrictMode: true + double-mount audit | 5 | none |
| 1D | Section TOC + heading anchors | 7 | `rehype-slug`, `rehype-autolink-headings` |
| 1E *(optional)* | Command palette searches full Fuse index | 5 | none |
| 1F *(optional)* | Resume fidelity: true most-recent, tile timestamps, streak flame | 5 | none |
| D1 | `<CyberArkArchDiagram />` | 4 | none |
| D2 | `<SailPointAggregationDiagram />` | 4 | none |
| D3 | `<AWSIAMEvalDiagram />` | 4 | none |

Recommended order: **1A → 1B → 1C → 1D → (1E, 1F optional) → D1 → D2 → D3**. The diagrams are independent of the polish tasks and may be dispatched in parallel.

---

## Task 1A — Mobile nav drawer

**Problem (verified):** `components/layout/Sidebar.tsx:12` is `hidden ... md:flex`. On `<768px` the `<Sidebar>` rendered by `ReadShell` (`components/layout/ReadShell.tsx:20`) is completely absent — read pages and `/search`/`/flashcards`/`/progress` (all `ReadShell`-wrapped) have **zero navigation** on a phone. Kolton reviews flashcards on mobile, so this is real.

**Design decision:** Extract the Sidebar nav body into a shared, presentation-only list so the desktop `<Sidebar>` and a new mobile `<MobileNavDrawer>` render identical link sets from one source. A hamburger button lives in `Topbar` (already mounted in `ReadShell`, sticky, always visible) and toggles the drawer. The drawer is a client component using `useFocusTrap` + `Escape` to close, and auto-closes on route change (`usePathname`).

**Files:** new `components/layout/NavList.tsx`, new `components/layout/MobileNavDrawer.tsx`, new `components/layout/MobileNavDrawer.test.tsx`; edit `components/layout/Sidebar.tsx`, `components/layout/Topbar.tsx`.

### Step 1A.1 — Failing test for `NavList`
Create `components/layout/NavList.test.tsx`. `NavList` is a pure server-safe component that renders the module list + the Flashcards/Search/Progress footer links. Assert it renders all 12 module titles (use `getAllModules()` length) and the three footer links.

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavList } from './NavList'
import { getAllModules } from '@/lib/content'

describe('NavList', () => {
  it('renders every module link', () => {
    render(<NavList />)
    for (const m of getAllModules()) {
      expect(screen.getByText(new RegExp(m.title, 'i'))).toBeInTheDocument()
    }
  })
  it('renders the utility footer links', () => {
    render(<NavList />)
    expect(screen.getByRole('link', { name: /flashcards/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /progress/i })).toBeInTheDocument()
  })
})
```

Run `pnpm test NavList` → fails (module not found).

### Step 1A.2 — Implement `NavList`
Extract the inner markup of `Sidebar.tsx` (the module `<ul>` and the footer `<ul>`, lines 26–85) into `components/layout/NavList.tsx`. Accept an optional `onNavigate?: () => void` prop so the mobile drawer can close itself when a link is tapped (desktop passes nothing). Keep it server-safe (no hooks) — `onNavigate` is just attached to each `<Link onClick>`. Header (the "IAM MASTERY" brand block, lines 14–24) stays in `Sidebar` for desktop and is duplicated into the drawer header, so `NavList` is body-only.

```tsx
import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const modules = getAllModules()
  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                onClick={onNavigate}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-[2px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors',
                  'hover:bg-cyan/10 hover:text-cyan',
                  m.phase === 1 ? 'text-text' : m.phase === 2 ? 'text-warn/90' : 'text-text-muted'
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
          {[
            { href: '/flashcards', label: 'FLASHCARDS' },
            { href: '/search', label: 'SEARCH' },
            { href: '/progress', label: 'PROGRESS' },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
              >
                ▸ {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
```

Run `pnpm test NavList` → green.

### Step 1A.3 — Refactor `Sidebar` to consume `NavList`
Edit `Sidebar.tsx`: replace lines 26–85 (the two `<ul>` blocks) with `<NavList />`, keep the brand header (lines 14–24) and the `hidden md:flex` wrapper. This is a pure refactor — desktop output is byte-identical. No new test; existing Sidebar coverage (if any) and the visual snapshot still pass. Run `pnpm test` for the layout folder.

### Step 1A.4 — Failing test for `MobileNavDrawer`
Create `components/layout/MobileNavDrawer.test.tsx`.

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNavDrawer } from './MobileNavDrawer'

vi.mock('next/navigation', () => ({ usePathname: () => '/modules/02-protocols/01-kerberos' }))

describe('MobileNavDrawer', () => {
  it('is not in the document when closed', () => {
    render(<MobileNavDrawer open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('renders nav links when open', () => {
    render(<MobileNavDrawer open onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /flashcards/i })).toBeInTheDocument()
  })
  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<MobileNavDrawer open onClose={onClose} />)
    fireEvent.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

Run `pnpm test MobileNavDrawer` → fails (module not found).

### Step 1A.5 — Implement `MobileNavDrawer`
Create `components/layout/MobileNavDrawer.tsx` — `'use client'`. Pattern matches `KeyboardHelpOverlay`/`CommandPalette`: fixed overlay, backdrop click closes, `useFocusTrap(open, ref)`, `Escape` closes via the existing window listener pattern, auto-close on `pathname` change. `md:hidden` so it never shows on desktop. Slide-in from the left.

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavList } from './NavList'
import { useFocusTrap } from '@/hooks/use-focus-trap'

export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useFocusTrap(open, ref)

  // Auto-close on navigation.
  useEffect(() => { if (open) onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[88] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div data-testid="drawer-backdrop" className="absolute inset-0 bg-void/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col border-r border-panel-border bg-void-elevated/95 shadow-[0_0_30px_rgb(0_240_255/0.25)] animate-[slide-in-left_180ms_ease-out]"
      >
        <div className="flex items-center justify-between border-b border-panel-border px-5 py-4">
          <Link href="/" onClick={onClose} className="font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan">
            IAM MASTERY
          </Link>
          <button type="button" onClick={onClose} aria-label="Close navigation"
            className="rounded-[2px] p-1.5 text-text-muted hover:bg-cyan/10 hover:text-cyan">✕</button>
        </div>
        <NavList onNavigate={onClose} />
      </div>
    </div>
  )
}
```

If `slide-in-left` is not an existing keyframe in `app/globals.css`, drop the `animate-[...]` class (the drawer still works) or add the keyframe in a follow-up; do NOT block on it. [VERIFY] whether `slide-in-left` keyframe exists in `app/globals.css` — if not, omit the animate utility.

Run `pnpm test MobileNavDrawer` → green.

### Step 1A.6 — Wire the hamburger into `Topbar`
Edit `Topbar.tsx`: add `open` state and render a hamburger button (`Menu` icon from `lucide-react`) with `md:hidden` on the far left of the header, before the mastery pill. Mount `<MobileNavDrawer open={open} onClose={() => setOpen(false)} />`. The hamburger is only in `ReadShell`-wrapped pages because `Topbar` is only in `ReadShell` — exactly the pages that lost nav. Add a small render test asserting a `button[aria-label="Open navigation"]` exists.

```tsx
// add to Topbar.tsx imports
import { Menu, Settings } from 'lucide-react'
import { MobileNavDrawer } from './MobileNavDrawer'
// inside component
const [navOpen, setNavOpen] = useState(false)
// first child of the left flex group:
<button type="button" aria-label="Open navigation" onClick={() => setNavOpen(true)}
  className="md:hidden rounded-[2px] p-1.5 text-text-muted hover:bg-cyan/10 hover:text-cyan">
  <Menu className="size-4" />
</button>
// ...end of header JSX:
<MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
```

Verify: `pnpm test && pnpm typecheck && pnpm lint`. Manually (or via Playwright resize to 375px) confirm the drawer opens and a link navigates + closes.

**Commit:** `feat(nav): mobile nav drawer reusing the sidebar nav list` (branch `feat/mobile-nav-drawer`).

---

## Task 1B — Keyboard navigation (J/K, quiz 1–4, help-overlay reconcile)

**Spec basis (verified, design spec line 298):** registry = `Cmd+K` palette, `J`/`K` next/prev section, `Space` flip flashcard, `1-4` quiz answers, `?` help overlay. Today `Cmd+K`/`?`/`Esc` work (`AppChrome` + `useKeyboardShortcuts`), `Space`/`1`/`2` work in `FlashcardReview`, but **J/K do nothing** and **quiz answers are mouse-only**.

**Three sub-pieces:**
1. J/K prev/next on the section page (uses `getPrevNext` from `lib/sections.ts`).
2. 1–4 answer keys in `Quiz.tsx`.
3. Reconcile `KeyboardHelpOverlay` (it advertises `1 / 2 / 3` = "demote / repeat / promote", but `FlashcardReview` implements a **two-button Leitner** grade: `1`=Missed, `2`=Got it — `grade(false)`/`grade(true)`).

**Reconciliation decision — make the overlay match the code (do NOT extend the code).** Rationale: `FlashcardReview` (`components/flashcards/FlashcardReview.tsx:58–88`) is built on a binary Leitner promote/demote engine (`lib/flashcards.ts` `promoteCard`/`demoteCard`); adding a third "repeat/hard" grade is a real SRS-algorithm change (new state transition, new tests, new persistence semantics) that is out of scope for a polish task and risks the 233-test baseline. The overlay is just a static label list. So: change the overlay text to the truth and add the missing rows (J/K, quiz 1–4). If Kolton later wants 3-grade SRS, that's its own workstream.

**Files:** new `components/jarvis/SectionKeyboardNav.tsx` + `.test.tsx`; edit `app/modules/[moduleId]/[sectionId]/page.tsx`, `components/content/Quiz.tsx` (+ `Quiz.test.tsx` if present, else new), `components/jarvis/KeyboardHelpOverlay.tsx` (+ a test).

### Step 1B.1 — Failing test: quiz answer keys
Add to `components/content/Quiz.test.tsx` (create if absent). Render a quiz, press `1`, assert option A is selected (correct/incorrect styling appears + the `role="status"` live region reads "Correct"/"Incorrect"). Pressing `2`–`4` selects B–D. Keys are ignored once answered (single-shot, mirroring the mouse `if (selected !== null) return` guard).

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'

const Q = { id: 'q-test', prompt: 'Pick A', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'A is right.' }

describe('Quiz keyboard answers', () => {
  it('selects option A when "1" is pressed', () => {
    render(<Quiz question={Q} />)
    fireEvent.keyDown(window, { key: '1' })
    expect(screen.getByText('A is right.')).toBeInTheDocument() // explanation shows only after answer
  })
  it('selects option B when "2" is pressed', () => {
    const q2 = { ...Q, id: 'q2', correctIndex: 1 }
    render(<Quiz question={q2} />)
    fireEvent.keyDown(window, { key: '2' })
    expect(screen.getByText('A is right.').textContent).toBeTruthy()
  })
  it('ignores a second key press after answering', () => {
    render(<Quiz question={Q} />)
    fireEvent.keyDown(window, { key: '2' }) // wrong (B)
    fireEvent.keyDown(window, { key: '1' }) // should be ignored
    // still shows the explanation from the first (wrong) answer; selection locked
    expect(screen.getByText('A is right.')).toBeInTheDocument()
  })
})
```

Run `pnpm test Quiz` → fails.

### Step 1B.2 — Implement quiz answer keys
In `Quiz.tsx`, add a `useEffect` window `keydown` listener (guard `isTypingTarget`-style: bail if target is INPUT/TEXTAREA/SELECT/contentEditable; bail if already `selected !== null`). Map keys `'1'..'4'` → index `0..3`, but only fire if the index is `< question.options.length`. Call the existing `handleSelect(index)`. Clean up the listener on unmount. Keep deps `[selected, question]` so the closure sees current `selected`.

```tsx
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (selected !== null) return
    const t = e.target
    if (t instanceof HTMLElement && (/(INPUT|TEXTAREA|SELECT)/.test(t.tagName) || t.isContentEditable)) return
    const n = Number(e.key)
    if (Number.isInteger(n) && n >= 1 && n <= question.options.length) {
      e.preventDefault()
      handleSelect(n - 1)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [selected, question]) // handleSelect is stable enough; or wrap in useCallback
```

Add a visible affordance: render the key number in each option button (e.g. a faint `[1]` like FlashcardReview's `[1]`/`[2]`) so the shortcut is discoverable. Run `pnpm test Quiz` → green.

### Step 1B.3 — Failing test: section J/K nav
Create `components/jarvis/SectionKeyboardNav.test.tsx`. The component takes `prevHref?: string | null` and `nextHref?: string | null` and pushes to the router on `j`/`k`. Mock `next/navigation`'s `useRouter` and assert `push` is called with the right href; assert it does nothing when the href is null (edges of the curriculum) and when focus is in a text field.

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SectionKeyboardNav } from './SectionKeyboardNav'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('SectionKeyboardNav', () => {
  it('pushes nextHref on "j"', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref="/b" />)
    fireEvent.keyDown(window, { key: 'j' })
    expect(push).toHaveBeenCalledWith('/b')
  })
  it('pushes prevHref on "k"', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref="/b" />)
    fireEvent.keyDown(window, { key: 'k' })
    expect(push).toHaveBeenCalledWith('/a')
  })
  it('does nothing on "j" at the last section', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref={null} />)
    fireEvent.keyDown(window, { key: 'j' })
    expect(push).not.toHaveBeenCalled()
  })
})
```

Run `pnpm test SectionKeyboardNav` → fails.

### Step 1B.4 — Implement `SectionKeyboardNav`
Create `components/jarvis/SectionKeyboardNav.tsx` — `'use client'`, renders `null` (invisible, like `SectionMountTracker`). Reuse the typing-target guard. Convention: **J = next** (down the curriculum), **K = prev** (up) — matches vim down/up and the spec's "J/K next/prev". Guard against Cmd/Ctrl/Alt modifiers so it doesn't hijack browser shortcuts.

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SectionKeyboardNav({ prevHref, nextHref }: { prevHref?: string | null; nextHref?: string | null }) {
  const router = useRouter()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t instanceof HTMLElement && (/(INPUT|TEXTAREA|SELECT)/.test(t.tagName) || t.isContentEditable)) return
      const k = e.key.toLowerCase()
      if (k === 'j' && nextHref) { e.preventDefault(); router.push(nextHref) }
      else if (k === 'k' && prevHref) { e.preventDefault(); router.push(prevHref) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, prevHref, nextHref])
  return null
}
```

Run `pnpm test SectionKeyboardNav` → green.

### Step 1B.5 — Mount `SectionKeyboardNav` on the section page
Edit `app/modules/[moduleId]/[sectionId]/page.tsx`. `getPrevNext(moduleId, sectionId)` already runs at line 69 (`{ prev, next }`). Build hrefs identical to the footer links (lines 102/115): `prev ? \`/modules/${prev.moduleId}/${prev.slug}\` : null` and same for `next`. Mount `<SectionKeyboardNav prevHref={prevHref} nextHref={nextHref} />` right after `<SectionMountTracker ... />` (line 73). Note: `prev`/`next` are only computed in the authored-section branch; the not-yet-authored branch (lines 52–64) can skip J/K (there's nowhere meaningful to go) — that's fine.

Run `pnpm test`, `pnpm typecheck`. Manual: open a Module 2 section, press J/K, confirm navigation; press inside the tutor input and confirm J/K type normally.

### Step 1B.6 — Failing test + fix: reconcile `KeyboardHelpOverlay`
Add `components/jarvis/KeyboardHelpOverlay.test.tsx` that pins the overlay to the *actual* shortcut set, so future drift fails CI:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyboardHelpOverlay } from './KeyboardHelpOverlay'

describe('KeyboardHelpOverlay', () => {
  it('documents the real flashcard grades (Missed / Got it, not 3 grades)', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/flashcard.*missed.*got it/i)).toBeInTheDocument()
  })
  it('documents J / K section navigation', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/previous \/ next section/i)).toBeInTheDocument()
  })
  it('documents 1-4 quiz answers', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/answer quiz/i)).toBeInTheDocument()
  })
})
```

Run → fails (current text says "Flashcard demote / repeat / promote" and has no J/K or quiz rows).

### Step 1B.7 — Update the `SHORTCUTS` array
Edit `KeyboardHelpOverlay.tsx` lines 11–17 to the reconciled, complete list:

```tsx
const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'Cmd+K', description: 'Open command palette' },
  { keys: 'J / K', description: 'Previous / next section' },
  { keys: 'Space', description: 'Flip flashcard' },
  { keys: '1 / 2', description: 'Flashcard: Missed / Got it' },
  { keys: '1 – 4', description: 'Answer quiz (A–D)' },
  { keys: 'Esc', description: 'Close any overlay' },
  { keys: '?', description: 'Open this shortcut help' },
]
```

Run `pnpm test KeyboardHelpOverlay` → green. Full `pnpm test && pnpm typecheck && pnpm lint`.

**Commit:** `feat(keyboard): J/K section nav, 1-4 quiz answer keys, reconcile help overlay` (branch `feat/keyboard-nav`).

---

## Task 1C — `reactStrictMode: true` + double-mount audit

**Why:** `next.config.mjs:9` is `reactStrictMode: false`. The comment says the only reason (R3F WebGL context loss) is gone. Strict Mode double-invokes effects in dev to surface missing cleanup — flipping it on is the last item from the dead-3D cleanup. The risk surface is any `useEffect` that adds a listener / starts a loop / mutates external state without idempotent cleanup.

**Audited effects (verified safe-by-design, confirm under StrictMode):**
- `ParticleField.tsx:33–99` — starts a `requestAnimationFrame` loop and a `resize` listener; cleanup at lines 95–98 calls `cancelAnimationFrame(rafId)` + `removeEventListener`. **Double-mount safe** as written (each mount captures its own `rafId`). Verify: with StrictMode on, only one rAF loop survives (no doubled CPU). The `enabled` gate (`prefersReducedMotion`) means the loop effect re-runs when `enabled` flips — cleanup handles it.
- `SectionMountTracker.tsx:16–18` — `markSectionVisited(sectionKey)` runs in an effect with `[sectionKey]` deps. Under StrictMode it fires **twice** on mount. This writes to `localStorage` + dispatches `iam-mastery:state-change`. **Verify idempotency:** double-marking the same section must not corrupt streak/activity counts. Read `lib/progress.ts` `markSectionVisited` — confirm it's idempotent for same-key same-day (it should set `visitedAt` and bump per-day activity; if activity is an *increment*, a double-call would over-count by one on first view). If it increments unconditionally, gate it (e.g., only count first visit per `sectionKey` per day, or dedupe in the tracker with a `useRef` "already fired this key" guard). **[VERIFY] the exact `markSectionVisited` increment semantics in `lib/progress.ts` and add a dedupe guard if it is not same-key idempotent.**
- **State-change listeners** — `Topbar.tsx:15–20` and any component listening on `iam-mastery:state-change` add/remove the listener with matching cleanup; double-mount adds then removes, net zero. Safe.
- `FlowDiagram.tsx:87–103` (`mousemove`/`matchMedia`), `CommandPalette`/`KeyboardHelpOverlay`/`MobileNavDrawer`/`SectionKeyboardNav`/`Quiz` keydown listeners — all add+remove symmetrically. Safe.

### Step 1C.1 — Guard test for `SectionMountTracker` idempotency
Before flipping the flag, write `components/jarvis/SectionMountTracker.test.tsx` (if not present) that simulates a double-mount and asserts study-touch state is counted once. Use a fresh `localStorage` (the test setup likely resets it; confirm in `tests/setup.ts`).

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SectionMountTracker } from './SectionMountTracker'
import { loadState } from '@/lib/progress'

describe('SectionMountTracker idempotency', () => {
  beforeEach(() => localStorage.clear())
  it('counts a section visit once even if the effect fires twice', () => {
    const { rerender } = render(<SectionMountTracker sectionKey="02-protocols/01-kerberos" />)
    rerender(<SectionMountTracker sectionKey="02-protocols/01-kerberos" />)
    const today = new Date().toISOString().slice(0, 10)
    // assert per-day activity for this section was not double-counted
    expect((loadState().activity ?? {})[today] ?? 0).toBeLessThanOrEqual(1)
  })
})
```

Run → it either passes (already idempotent → no code change needed) or fails (→ add the `useRef` dedupe guard in `SectionMountTracker` keyed by `sectionKey`). **Adjust the assertion to the real semantics discovered in the [VERIFY] above** — the point is to lock idempotency before StrictMode doubles the call in dev.

### Step 1C.2 — Flip the flag
Edit `next.config.mjs:9` → `reactStrictMode: true`. Replace the stale comment with: `// StrictMode on: dev double-mount surfaces effect-cleanup bugs early. Audited 2026-06-01 (ParticleField rAF, SectionMountTracker, state-change listeners) — see plan 2026-06-01-ux-polish-and-diagrams.md Task 1C.`

### Step 1C.3 — Dev double-mount pass
Run `pnpm dev` (webpack). Open the home dashboard (HudShell → ParticleField), a section page (SectionMountTracker + SectionKeyboardNav + Topbar listener), and flashcard review. Watch the console for React StrictMode warnings and check the Performance tab that only **one** rAF loop runs on the home page (not two). Confirm streak/activity counters don't jump by 2 on a single section view.

### Step 1C.4 — Full verification
`pnpm test` (all 233+ green), `pnpm typecheck`, `pnpm lint`, `pnpm build` (build must stay clean — StrictMode is dev-only but the build validates config).

### Step 1C.5 — Visual regression
Run `pnpm test:visual` (Playwright) if snapshots exist for home/section — StrictMode shouldn't change pixels, but a doubled animation init could. Update snapshots only if intentional.

**Commit:** `chore(config): enable reactStrictMode after effect-cleanup audit` (branch `chore/react-strict-mode`).

---

## Task 1D — Section TOC + heading anchors

**Spec basis (verified, design spec line 227 / §4.2):** the section route should render "section MDX with sidebar TOC". Today there's no TOC and headings have no `id`, so deep links don't work.

**Approach:** Add `rehype-slug` (deterministic `id` on every heading) and `rehype-autolink-headings` (a focusable anchor link on hover) to the `@next/mdx` `rehypePlugins` in `next.config.mjs`. Build a `<SectionToc>` client component that reads the rendered article's `h2`/`h3` elements from the DOM after mount and renders an in-page nav with smooth scroll + scroll-spy active state. Mount it in `ReadShell` as an optional right-rail (desktop only; the AskProfessorRail already occupies a rail, so TOC sits in a `xl:`-only column or above-content `<details>` on smaller widths — keep it from colliding with the tutor rail).

**New deps:** `rehype-slug` and `rehype-autolink-headings` (both are standard, MIT, zero-runtime-cost build plugins). Install as **dependencies** (used by the build): `pnpm add rehype-slug rehype-autolink-headings`. [VERIFY] latest versions resolve cleanly with `@next/mdx@^16` under `--webpack`; pin to the versions pnpm selects.

**Files:** edit `next.config.mjs`, `package.json` (via pnpm add); new `components/layout/SectionToc.tsx` + `.test.tsx`; edit `components/layout/ReadShell.tsx` (optional `toc` slot) and `app/modules/[moduleId]/[sectionId]/page.tsx` (mount TOC).

### Step 1D.1 — Install deps
`pnpm add rehype-slug rehype-autolink-headings`. Confirm they land in `dependencies` in `package.json`.

### Step 1D.2 — Wire rehype plugins
Edit `next.config.mjs`:

```js
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
// ...
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
    ],
  },
})
```

Verify a build: `pnpm build`. Then spot-check rendered HTML of an existing section (e.g. `/modules/02-protocols/01-kerberos`) has `id` attributes on `<h2>`/`<h3>` and an anchor wrapping the heading text. Add `.heading-anchor` styling in `app/globals.css` (subtle, no underline; show a `#` glyph on `:hover`/`:focus-visible`) so it matches the JARVIS aesthetic and isn't intrusive. [VERIFY] the autolink `behavior` ('wrap' vs 'append') reads cleanly with the `prose` typography styles — adjust if the wrap injects an unwanted focus outline.

### Step 1D.3 — Failing test for `SectionToc`
Create `components/layout/SectionToc.test.tsx`. `SectionToc` reads headings from a container ref (so it's testable without a full MDX render). Render a fixture article with `<h2 id="a">A</h2><h3 id="b">B</h3>` and assert the TOC lists "A" and "B" as links to `#a`/`#b`.

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { SectionToc } from './SectionToc'

function Harness() {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div ref={ref}>
        <h2 id="a">Alpha</h2>
        <p>x</p>
        <h3 id="b">Bravo</h3>
      </div>
      <SectionToc contentRef={ref} />
    </div>
  )
}

describe('SectionToc', () => {
  it('lists headings as in-page links', async () => {
    render(<Harness />)
    expect(await screen.findByRole('link', { name: 'Alpha' })).toHaveAttribute('href', '#a')
    expect(await screen.findByRole('link', { name: 'Bravo' })).toHaveAttribute('href', '#b')
  })
})
```

Run → fails.

### Step 1D.4 — Implement `SectionToc`
Create `components/layout/SectionToc.tsx` — `'use client'`. Props: `{ contentRef: React.RefObject<HTMLElement | null> }`. On mount (and on `contentRef.current` available), `querySelectorAll('h2[id], h3[id]')`, build `{ id, text, level }[]`, store in state. Render a `<nav aria-label="On this page">` list; clicking a link sets `location.hash` (native smooth scroll via CSS `scroll-behavior: smooth` + `scroll-margin-top` on headings to clear the sticky Topbar). Add a scroll-spy: an `IntersectionObserver` over the headings sets an `activeId` for highlighting. Render nothing if `< 2` headings (no TOC for a flat section). Styling: vertical list, mono micro-caps, cyan active state — mirror the sidebar footer link style.

```tsx
'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading { id: string; text: string; level: number }

export function SectionToc({ contentRef }: { contentRef: React.RefObject<HTMLElement | null> }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'))
    setHeadings(els.map((el) => ({ id: el.id, text: el.textContent ?? '', level: el.tagName === 'H3' ? 3 : 2 })))
    const obs = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActiveId((e.target as HTMLElement).id) },
      { rootMargin: '0px 0px -70% 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [contentRef])

  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="font-mono text-[10px] uppercase tracking-[0.1em]">
      <div className="mb-2 text-cyan/60">▸ ON THIS PAGE</div>
      <ul className="space-y-1 border-l border-panel-border">
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && 'pl-3')}>
            <a href={`#${h.id}`}
              className={cn('block border-l-2 -ml-px py-0.5 pl-3 transition-colors hover:text-cyan',
                activeId === h.id ? 'border-cyan text-cyan' : 'border-transparent text-text-muted')}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

Run `pnpm test SectionToc` → green.

### Step 1D.5 — Mount in the section page
The `<article>` already wraps `<Component />` (page.tsx lines 93–95). Wrap a client boundary so the TOC can read it: simplest is a small `'use client'` wrapper `SectionArticle` that owns a `ref` on the `<article>` and renders `<SectionToc contentRef={ref} />` beside it — OR mount TOC via `ReadShell` with a `toc` slot and pass a ref. Choose the **`SectionArticle` client wrapper** to keep `ReadShell` simple: it accepts `children` (the rendered MDX) and renders the article + TOC. On `xl` screens place the TOC as a `sticky top-16` right column; on smaller screens render it as a collapsible `<details>` above the article so it never collides with the `AskProfessorRail`.

### Step 1D.6 — Add scroll-margin to headings
In `app/globals.css`, add `:where(h2,h3)[id] { scroll-margin-top: 4rem; }` (clears the 48px sticky Topbar). Add `html { scroll-behavior: smooth; }` guarded by `@media (prefers-reduced-motion: no-preference)`.

### Step 1D.7 — Verify
`pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Manual: load a long section (e.g. `02-protocols/01-kerberos`), confirm TOC lists its `##`/`###` headings, clicking scrolls with the heading clearing the Topbar, the URL hash updates, deep-linking to `#some-heading` lands correctly, and scroll-spy highlights the current section.

**Commit:** `feat(content): heading anchors + on-page TOC (rehype-slug/autolink)` (branch `feat/section-toc`). Note the two new deps in the commit body.

---

## Task 1E *(OPTIONAL)* — Command palette searches the full Fuse index

**Current state (verified):** `CommandPalette.tsx` builds actions from `buildSectionActions(getAllModules())` + `buildSystemActions()` (`lib/command-actions.ts`) — modules, sections, and 5 nav targets only. It does **not** surface glossary terms, war stories, quizzes, or PowerShell recipes, even though `getSearchIndex()` (`lib/content-index.ts`) already builds exactly those entries and `SearchResults.tsx:37` already runs Fuse over them with the spec weights.

**Approach:** The palette runs in `AppChrome` (a client layout) so it can't `await getSearchIndex()` (server-only `fs`). Pass the prebuilt index down: fetch it in the RSC `app/layout.tsx`, hand it to `AppChrome` as a prop, then into `CommandPalette`. Convert each `SearchEntry` to a `CommandAction` (`href: e.href`, `hint: TYPE_LABEL[e.type]`, `keywords: [...e.keywords, e.body].join(' ')`). De-dupe by `id`. Keep section/module/system actions on top. cmdk's built-in filter handles fuzzy matching over the `value` string already; for parity with the spec's weighted Fuse you may instead drive results with the same `Fuse` config as `SearchResults` — but the simpler `value`-string approach is acceptable for a palette and avoids a second Fuse instance. Recommend the simple path first.

**Files:** edit `app/layout.tsx`, `components/layout/AppChrome.tsx`, `components/jarvis/CommandPalette.tsx`, `lib/command-actions.ts` (add `buildContentActions(entries: SearchEntry[])`); test `lib/command-actions.test.ts`.

### Steps
1. **Failing test** — `lib/command-actions.test.ts`: `buildContentActions([{type:'glossary', title:'SAML', href:'/modules/02-protocols/02-saml', ...}])` returns an action with `label: 'SAML'`, `hint: 'TERM'`, `href` set. Run → fails.
2. **Implement** `buildContentActions(entries: SearchEntry[]): CommandAction[]` in `command-actions.ts` mapping the index; reuse a `TYPE_HINT` map (`glossary→TERM`, `warstory→WAR STORY`, `quiz→QUIZ`, `recipe→RECIPE`, `flashcard→CARD`, `section→SECTION`). Skip `section` type (already covered by `buildSectionActions`) to avoid dupes. Run → green.
3. **Thread the index:** `app/layout.tsx` `await getSearchIndex()`, pass `searchEntries` to `<AppChrome searchEntries={...}>`. Note: `app/layout.tsx` is currently a plain RSC; making it `async` is fine. [VERIFY] this doesn't force the whole layout dynamic in a way that hurts the home build — if it does, instead fetch the index in a small server component sibling and pass via context/prop only to the palette.
4. **Consume in palette:** `CommandPalette` accepts `searchEntries`; `actions` memo appends `buildContentActions(searchEntries)`. Keep the `ask-professor` + section + system actions ordering.
5. **Verify:** `pnpm test`, `pnpm typecheck`, `pnpm build`. Manual: `Cmd+K`, type "kerberoast" or a glossary term, confirm a TERM/WAR STORY result appears and navigates.

**Commit:** `feat(palette): search the full content index (glossary/recipes/quizzes)` (branch `feat/palette-full-index`).

---

## Task 1F *(OPTIONAL)* — Resume fidelity: true most-recent, tile timestamps, streak flame

**Current state (verified):** `lib/home-telemetry.ts:69–82` already sorts visited sections by `visitedAt` **descending** and walks to the first resolvable target — so "true most-recent `visitedAt`" is **already correct**; it only falls back to `firstSectionFallback` when nothing is visited. So this task is **mostly the two cosmetic adds**, not a resume bug fix. State that explicitly in the plan and don't "fix" a non-bug.

**Three sub-pieces:**
1. **Confirm** (with a test) that `computeHomeTelemetry` returns the most-recently-visited resolvable section, not the first — lock the existing behavior so it can't regress.
2. **Tile last-visited timestamps** — surface a relative "visited 2d ago" on module/section tiles on the home dashboard (whichever component renders the Command Deck tiles — locate it; the roadmap references a Command Deck home). Pull from `state.progress.sections[key].visitedAt`.
3. **Streak flame glyph** — when `streakDays > 0`, render a flame glyph (lucide `Flame`) next to the streak count, intensity/color scaling with the streak (e.g. `text-warn` ≥3 days, `text-threat` ≥7) — purely visual, reads from `state.streak.currentDays` already exposed via `computeHomeTelemetry`.

**Files:** test `lib/home-telemetry.test.ts` (add a most-recent case); edit the home/Command-Deck tile component(s) + the streak display. [VERIFY] exact home component filenames — search `components/` for the Command Deck / dashboard tiles and the streak readout before editing.

### Steps
1. **Failing/locking test** — `home-telemetry.test.ts`: build a `StoredState` with two visited sections, the later `visitedAt` belonging to section B; assert `computeHomeTelemetry(...).resume.href` points to B. (Likely passes immediately — that's fine; it locks behavior.)
2. **Relative-time helper** — add a tiny `formatRelative(iso: string): string` (e.g. in `lib/home-telemetry.ts` or a `lib/format.ts`) with its own unit test ("just now" / "2d ago" / "3w ago"). Pure function, deterministic with an injected `now`.
3. **Tile timestamps** — render `formatRelative(visitedAt)` on visited tiles; nothing on unvisited.
4. **Streak flame** — add the `Flame` glyph + color tiering to the streak readout. Add a render test asserting the flame appears when `streakDays > 0` and is absent at `0`.
5. **Verify:** `pnpm test`, `pnpm typecheck`, `pnpm lint`, visual snapshot update if the dashboard is snapshotted.

**Commit:** `feat(home): tile last-visited timestamps + streak flame; lock resume-most-recent` (branch `feat/resume-fidelity`).

---

# Diagram components (D1–D3)

All three follow the **identical TDD pattern** established by `KerberosFlowDiagram` + `KerberosFlowDiagram.test.tsx`:
1. Define `NODES: FlowNode[]` and `STEPS: FlowStep[]` (and any `toolbar` mode toggles like `HybridIdentityDiagram`).
2. Compose `<FlowDiagram title=... width=... height=... nodes steps caption />`.
3. Co-locate `*.test.tsx`: assert all node labels render, all step labels render, and that clicking an interactive step (one with a `detail`) reveals its detail panel (via `getByRole('button', { name: /LABEL/i })` → `screen.getByText(/detail substring/)`).
4. Register in `mdx-components.tsx` so MDX authors use the tag with no import.

`FlowDiagram` contract (from `components/diagrams/FlowDiagram.tsx`): nodes have `{id,x,y,label,sublabel?,intent?}`; steps have `{id,from,to,label,detail?,intent?,deprecated?}`; `intent ∈ 'default'|'warn'|'threat'` → cyan/amber/red; a step is **interactive (clickable, focusable, reveals a HoloPanel detail) iff it has a `detail`**. Coordinate space is the `viewBox`; nodes draw a 28px-radius circle, so keep node centers ≥ ~80px from edges and ≥ ~140px apart horizontally to avoid label overlap (mirror Kerberos `x: 80 / 460 / 840`, `y: 240`, width 920).

> **Diagram build-plan note:** these three specs are the authoritative node/step data models for the build. There is no separate "diagrams plan doc"; this file IS the TDD build plan for D1–D3. The content plans for Modules 4/5/7 (Workstreams 2A/2B/3A) reference these components by name and embed them.

---

## Task D1 — `<CyberArkArchDiagram />`

**Subject (verified, design spec line 617 + roadmap §2A):** CyberArk Self-Hosted PAS core components — the **Digital Vault** (the encrypted store / "Vault" server), **PVWA** (Password Vault Web Access — the web UI/API), **CPM** (Central Policy Manager — rotates/verifies/reconciles credentials), **PSM** (Privileged Session Manager — proxies and records privileged sessions). Show both the **secrets-management flow** (CPM ↔ Vault rotation; PVWA retrieval) and the **session-isolation flow** (user → PSM → target, never seeing the credential). Cite: CyberArk PAS component architecture docs (Vault, PVWA, CPM, PSM roles). [VERIFY] component responsibilities against current CyberArk PAS docs (the four core components and their roles are long-stable, but confirm exact wording before publishing).

**Node model:**

```ts
const NODES: FlowNode[] = [
  { id: 'user',   x: 90,  y: 120, label: 'USER',   sublabel: 'Admin' },
  { id: 'pvwa',   x: 360, y: 120, label: 'PVWA',   sublabel: 'Web Access' },
  { id: 'vault',  x: 360, y: 360, label: 'VAULT',  sublabel: 'Digital Vault' },
  { id: 'cpm',    x: 90,  y: 360, label: 'CPM',    sublabel: 'Policy Mgr' },
  { id: 'psm',    x: 640, y: 120, label: 'PSM',    sublabel: 'Session Mgr', intent: 'warn' },
  { id: 'target', x: 900, y: 240, label: 'TARGET', sublabel: 'Server/DB' },
]
```

**Step model (each `detail` is the teaching payload):**

```ts
const STEPS: FlowStep[] = [
  { id: 's1', from: 'user',  to: 'pvwa',  label: 'Authenticate',
    detail: 'Admin authenticates to PVWA (LDAP/SAML/RADIUS/PKI). PVWA is the web front-end + REST API; it holds no secrets itself — it brokers requests to the Vault.' },
  { id: 's2', from: 'pvwa',  to: 'vault', label: 'Retrieve Secret',
    detail: 'On an approved request, PVWA pulls the credential from the Digital Vault. The Vault is the FIPS-validated, firewall-isolated encrypted store; every object is sealed and access is policy-controlled and fully audited.' },
  { id: 's3', from: 'cpm',   to: 'vault', label: 'Rotate / Verify', intent: 'default',
    detail: 'The Central Policy Manager (CPM) enforces credential policy against the Vault: it changes (rotates), verifies, and reconciles managed account passwords on target systems on a schedule or on demand, then writes the new value back to the Vault.' },
  { id: 's4', from: 'cpm',   to: 'target', label: 'Change on Target',
    detail: 'CPM connects to the managed target (server, DB, network device, cloud) using a plug-in to actually change the password there, keeping the Vault and the live account in sync.' },
  { id: 's5', from: 'user',  to: 'psm',   label: 'Launch Session', intent: 'warn',
    detail: 'For privileged session access the user connects through the Privileged Session Manager (PSM) — a secure jump/proxy. The user never sees or handles the actual credential.' },
  { id: 's6', from: 'psm',   to: 'target', label: 'Proxied + Recorded', intent: 'warn',
    detail: 'PSM injects the credential and opens an isolated, fully recorded session to the target. Sessions can be monitored live and terminated; recordings are stored for audit/forensics.' },
]
```

**TDD steps:**
- **D1.1** Write `components/diagrams/CyberArkArchDiagram.test.tsx`: assert nodes `USER, PVWA, VAULT, CPM, PSM, TARGET` render; assert step labels `Retrieve Secret`, `Rotate / Verify`, `Proxied + Recorded` render; click the `Proxied + Recorded` step button → assert `/never sees|isolated, fully recorded/i` detail text appears. Run → fails.
- **D1.2** Implement `components/diagrams/CyberArkArchDiagram.tsx` with the models above; `title="CYBERARK PAS // VAULT ARCHITECTURE"`, `width={1000} height={460}`, `caption="Self-Hosted PAS: PVWA brokers, the Vault stores, CPM rotates, PSM isolates & records — click any step."`. Run → green.
- **D1.3** Register in `mdx-components.tsx` (import + add `CyberArkArchDiagram` to the returned map). Add a one-line assertion test (or extend an existing mdx-components registry test if one exists) that the component is exported — otherwise rely on D1.1.
- **D1.4** `pnpm test`, `pnpm typecheck`, `pnpm lint`.

**Commit:** `feat(diagrams): CyberArkArchDiagram (Vault/PVWA/CPM/PSM)` (branch `feat/diagram-cyberark`).

---

## Task D2 — `<SailPointAggregationDiagram />`

**Subject (verified, roadmap §2B + design spec line 618):** SailPoint IGA data flow — **sources/connectors aggregate** account + entitlement data → **correlation** maps accounts to identities → the **Identity Cube** (SailPoint's unified per-identity object) → drives **access request** and **certification (access review)** flows. Cite: SailPoint IdentityIQ/Identity Security Cloud concepts — aggregation, correlation, the Identity Cube, access requests, certifications. [VERIFY] the term "Identity Cube" is IdentityIQ terminology (Identity Security Cloud uses "identity"); note both in the caption and pick "Identity Cube" as the labeled node since it's the iconic SailPoint concept.

**Node model:**

```ts
const NODES: FlowNode[] = [
  { id: 'sources', x: 90,  y: 240, label: 'SOURCES', sublabel: 'AD/HR/Apps' },
  { id: 'agg',     x: 330, y: 240, label: 'AGGREGATE', sublabel: 'Connectors' },
  { id: 'corr',    x: 560, y: 240, label: 'CORRELATE', sublabel: 'Match' },
  { id: 'cube',    x: 790, y: 240, label: 'IDENTITY', sublabel: 'Identity Cube' },
  { id: 'request', x: 960, y: 120, label: 'REQUEST', sublabel: 'Access Req' },
  { id: 'cert',    x: 960, y: 360, label: 'CERTIFY', sublabel: 'Access Review', intent: 'warn' },
]
```

**Step model:**

```ts
const STEPS: FlowStep[] = [
  { id: 'a1', from: 'sources', to: 'agg', label: 'Read Accounts',
    detail: 'Connectors read accounts + entitlements from each source system (AD, the HR system of record, business apps). Aggregation pulls this raw account data into SailPoint on a schedule.' },
  { id: 'a2', from: 'agg', to: 'corr', label: 'Aggregate',
    detail: 'Aggregated account data is staged for processing. An authoritative source (usually HR) defines who the people are; application sources contribute the accounts and entitlements they hold.' },
  { id: 'a3', from: 'corr', to: 'cube', label: 'Correlate',
    detail: 'Correlation logic matches each discovered account to the right identity (e.g., by employee ID or email). Unmatched accounts are flagged as uncorrelated/orphan for review.' },
  { id: 'a4', from: 'cube', to: 'request', label: 'Access Request',
    detail: 'The Identity Cube is the unified view of one person — all their accounts, entitlements, roles and risk. Users (or managers) request access against this model; policy (SoD, approvals) gates fulfillment back to the source.' },
  { id: 'a5', from: 'cube', to: 'cert', label: 'Certification', intent: 'warn',
    detail: 'Certification (access review) campaigns ask reviewers to attest that each identity should keep its access. Revocations flow back out to the source systems, closing the loop. This is the core audit/recertification control.' },
]
```

**TDD steps:**
- **D2.1** Write `SailPointAggregationDiagram.test.tsx`: assert nodes `SOURCES, AGGREGATE, CORRELATE, IDENTITY, REQUEST, CERTIFY` render; step labels `Aggregate`, `Correlate`, `Certification` render; click `Correlate` → detail `/uncorrelated|orphan|matches each/i`. Run → fails.
- **D2.2** Implement `SailPointAggregationDiagram.tsx`; `title="SAILPOINT IGA // AGGREGATION → CERTIFICATION"`, `width={1060} height={460}`, `caption="Sources aggregate → correlate to the Identity Cube → access request + certification. (Identity Security Cloud calls the cube an 'identity'.)"`. Run → green.
- **D2.3** Register in `mdx-components.tsx`.
- **D2.4** `pnpm test`, `pnpm typecheck`, `pnpm lint`.

**Commit:** `feat(diagrams): SailPointAggregationDiagram (aggregate→cube→cert)` (branch `feat/diagram-sailpoint`).

---

## Task D3 — `<AWSIAMEvalDiagram />`

**Subject (verified, roadmap §3A + design spec line 624):** AWS IAM **policy evaluation logic** for a request within a single account/Organization. The canonical decision order (AWS IAM docs, "Policy evaluation logic"): start at **implicit deny (default)** → **evaluate all applicable policies** → if any **explicit Deny** anywhere, the result is **Deny** (highest precedence) → otherwise the request must be **Allowed by every policy type in scope**: **Organizations SCPs**, **Resource-control policies (RCPs)** *(note both; SCP is the classic exam answer)*, **Permissions boundary**, **Session policies** (if assumed-role), and an **identity-based or resource-based Allow** → if all pass, **Allow**; if any required type lacks an Allow, fall back to **implicit Deny**. This is best drawn as a **linear gate pipeline** where each gate can short-circuit to Deny. Cite: AWS IAM "Policy evaluation logic" and "Determining whether a request is allowed or denied within an account." [VERIFY] the exact ordering and the SCP-vs-RCP/permissions-boundary precedence wording against the current AWS IAM evaluation docs before publishing — AWS has added RCPs recently; keep the labeled gates to the durable ones (explicit deny → SCP → permissions boundary → identity/resource Allow → implicit deny) and mention RCP/session policy in details.

**Node model (left-to-right decision pipeline; Deny sink below, Allow at the end):**

```ts
const NODES: FlowNode[] = [
  { id: 'req',     x: 80,  y: 140, label: 'REQUEST', sublabel: 'Principal+Action' },
  { id: 'deny',    x: 80,  y: 380, label: 'DENY',    sublabel: 'Result', intent: 'threat' },
  { id: 'xdeny',   x: 300, y: 140, label: 'EXPLICIT', sublabel: 'Deny?', intent: 'threat' },
  { id: 'scp',     x: 500, y: 140, label: 'SCP',      sublabel: 'Org Guardrail', intent: 'warn' },
  { id: 'pb',      x: 700, y: 140, label: 'BOUNDARY', sublabel: 'Perm Boundary', intent: 'warn' },
  { id: 'allowpol',x: 900, y: 140, label: 'ALLOW?',   sublabel: 'Identity/Resource' },
  { id: 'allow',   x: 900, y: 380, label: 'ALLOW',    sublabel: 'Result' },
]
```

**Step model (the evaluation order is the teaching payload — each gate's `detail` explains the rule and the short-circuit):**

```ts
const STEPS: FlowStep[] = [
  { id: 'e0', from: 'req', to: 'xdeny', label: 'Default: Deny',
    detail: 'Every request starts as an implicit DENY. Authorization must be affirmatively granted by policy; nothing is allowed by default.' },
  { id: 'e1', from: 'xdeny', to: 'deny', label: 'Explicit Deny → DENY', intent: 'threat',
    detail: 'AWS evaluates ALL applicable policies. If ANY policy (SCP, boundary, identity, resource, session) contains an explicit Deny that matches, the final decision is DENY. An explicit Deny ALWAYS wins and cannot be overridden by any Allow.' },
  { id: 'e2', from: 'xdeny', to: 'scp', label: 'No explicit Deny',
    detail: 'With no explicit Deny, the request must be ALLOWED by every policy type that applies. Evaluation continues through the guardrails.' },
  { id: 'e3', from: 'scp', to: 'pb', label: 'SCP allows?', intent: 'warn',
    detail: 'Organizations Service Control Policies (SCPs) set the maximum available permissions for accounts in the org. An SCP grants no access by itself — if the SCP does not allow the action, it is denied regardless of identity policy. (Resource-control policies, RCPs, apply a similar org-wide cap to resources.)' },
  { id: 'e4', from: 'pb', to: 'allowpol', label: 'Boundary allows?', intent: 'warn',
    detail: 'A permissions boundary is an advanced feature that caps the maximum permissions an identity-based policy can grant to a principal. The effective permission is the INTERSECTION of the boundary and the identity policy. (For assumed roles, session policies further cap this.)' },
  { id: 'e5', from: 'allowpol', to: 'allow', label: 'Allow present → ALLOW',
    detail: 'Finally there must be an explicit Allow in an identity-based policy (or a matching resource-based policy / RCP allowance). If every gate passes and an Allow exists, the result is ALLOW.' },
  { id: 'e6', from: 'allowpol', to: 'deny', label: 'No Allow → implicit DENY', intent: 'threat',
    detail: 'If no policy provides a matching Allow, the request falls back to the starting implicit DENY. "Not explicitly allowed" = denied.' },
]
```

**TDD steps:**
- **D3.1** Write `AWSIAMEvalDiagram.test.tsx`: assert nodes `REQUEST, EXPLICIT, SCP, BOUNDARY, ALLOW?, DENY, ALLOW` render; step labels `Explicit Deny → DENY`, `SCP allows?`, `Boundary allows?`, `No Allow → implicit DENY` render; click `Explicit Deny → DENY` → detail `/explicit Deny ALWAYS wins|cannot be overridden/i`. Run → fails.
- **D3.2** Implement `AWSIAMEvalDiagram.tsx`; `title="AWS IAM // POLICY EVALUATION ORDER"`, `width={1020} height={460}`, `caption="Implicit deny → explicit Deny wins → SCP → permissions boundary → identity/resource Allow → else implicit deny. Click a gate."`. Run → green.
- **D3.3** Register in `mdx-components.tsx`.
- **D3.4** `pnpm test`, `pnpm typecheck`, `pnpm lint`.

**Commit:** `feat(diagrams): AWSIAMEvalDiagram (policy evaluation order)` (branch `feat/diagram-aws-eval`).

---

# Wiring tasks (exact edits)

**No `content/modules.json` or `lib/sections.ts` edits are required by this plan** — it adds no MDX sections. (Restating the cross-cutting rule so an executor doesn't go looking: that two-file sync governs the *content* workstreams, not these code/diagram tasks.)

**`mdx-components.tsx` — register the 3 new diagrams** (the ONLY code touch needed to light them up for MDX authors). Add imports beside the existing diagram imports (lines 11–15) and add the names to the returned object (after `EcosystemMap`, lines 29–34):

```tsx
import { CyberArkArchDiagram } from '@/components/diagrams/CyberArkArchDiagram'
import { SailPointAggregationDiagram } from '@/components/diagrams/SailPointAggregationDiagram'
import { AWSIAMEvalDiagram } from '@/components/diagrams/AWSIAMEvalDiagram'
// ...returned map:
CyberArkArchDiagram,
SailPointAggregationDiagram,
AWSIAMEvalDiagram,
```

**`next.config.mjs` (Task 1C + 1D)** — flip `reactStrictMode: true`; add `rehypeSlug` + `[rehypeAutolinkHeadings, {...}]` to `rehypePlugins` (see 1C.2 / 1D.2).

**`package.json` (Task 1D)** — `pnpm add rehype-slug rehype-autolink-headings` lands two new `dependencies`.

**Component mounts:** `Topbar` mounts `<MobileNavDrawer>` (1A); section page mounts `<SectionKeyboardNav>` (1B) and the TOC wrapper (1D); `AppChrome`/`app/layout.tsx` thread `searchEntries` to `CommandPalette` (1E, optional).

---

# Diagrams diagram-build spec summary

There is no separate diagrams plan doc — D1–D3 above ARE the full TDD build plans, each with a concrete `FlowNode[]`/`FlowStep[]` data model, what it animates (the generic `FlowDiagram` animates a glowing token along each step's bezier arc when motion is enabled, renders clickable step labels that open a `HoloPanel` detail, and parallaxes nodes on mouse-move), and its 4-step failing-test→implement→register→verify cycle. They compose `components/diagrams/FlowDiagram.tsx` exactly like the 5 existing diagrams.

---

# Commit plan (summary)

One commit per task on its own short-lived branch; merge to `main` when `pnpm test && pnpm typecheck && pnpm lint && pnpm build` are all green:

1. `feat/mobile-nav-drawer` → `feat(nav): mobile nav drawer reusing the sidebar nav list`
2. `feat/keyboard-nav` → `feat(keyboard): J/K section nav, 1-4 quiz answer keys, reconcile help overlay`
3. `chore/react-strict-mode` → `chore(config): enable reactStrictMode after effect-cleanup audit`
4. `feat/section-toc` → `feat(content): heading anchors + on-page TOC (rehype-slug/autolink)`
5. *(optional)* `feat/palette-full-index` → `feat(palette): search the full content index`
6. *(optional)* `feat/resume-fidelity` → `feat(home): tile timestamps + streak flame; lock resume-most-recent`
7. `feat/diagram-cyberark` → `feat(diagrams): CyberArkArchDiagram (Vault/PVWA/CPM/PSM)`
8. `feat/diagram-sailpoint` → `feat(diagrams): SailPointAggregationDiagram (aggregate→cube→cert)`
9. `feat/diagram-aws-eval` → `feat(diagrams): AWSIAMEvalDiagram (policy evaluation order)`

The three diagram branches are independent of branches 1–6 and of each other; dispatch them in parallel. Within the polish set, 1A→1B→1C→1D is the safe order (1C's StrictMode flip is easier to reason about after the new client components from 1A/1B exist and have cleanup).

---

# Open items left for the author to confirm ([VERIFY] markers)

1. `slide-in-left` keyframe existence in `app/globals.css` (1A.5) — omit the animate utility if absent.
2. `markSectionVisited` increment semantics in `lib/progress.ts` (1C.1) — add a dedupe guard if not same-key-same-day idempotent before enabling StrictMode.
3. `rehype-slug` / `rehype-autolink-headings` version resolution under `@next/mdx@^16` + `--webpack` (1D.1); autolink `behavior` interplay with `prose` styles (1D.2).
4. `app/layout.tsx` going `async` for the palette index (1E.3) must not unintentionally make the route dynamic / hurt the home build.
5. Home Command-Deck tile + streak component filenames (1F) — locate before editing.
6. CyberArk PAS component responsibilities (D1) against current CyberArk docs.
7. SailPoint "Identity Cube" (IdentityIQ) vs "identity" (Identity Security Cloud) terminology (D2).
8. AWS IAM policy-evaluation exact ordering + SCP/RCP/permissions-boundary/session-policy precedence wording (D3) against current AWS IAM docs.
