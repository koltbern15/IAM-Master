# Plan 1 — Foundation (Wave 0 + Wave 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a scaffolded Next.js 16 + Tailwind 4 + shadcn/ui project for the IAM Mastery Platform, with all routes, content registry, progress and flashcard libraries, and the persistent Sidebar/Topbar layout components — verified by tests and a clean dev server run.

**Architecture:** Next.js 16 App Router with TypeScript strict mode. Tailwind 4 with CSS-first config and a dark slate theme. shadcn/ui for component primitives. Content modeled as MDX files in `content/` with a JSON registry (`modules.json`). State persisted to localStorage via a typed helper. Tests via Vitest + @testing-library/react. pnpm for package management.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui, Vitest, @testing-library/react, pnpm, ESLint, Prettier, Framer Motion (light usage in Wave 1; full usage in Plan 2)

**Spec reference:** `docs/superpowers/specs/2026-05-25-iam-mastery-platform-design.md`

**This plan delivers:**
- Working `pnpm dev` server on `http://localhost:3000` with the full layout shell
- All 8 routes navigable (placeholder content acceptable)
- `lib/content.ts`, `lib/progress.ts`, `lib/flashcards.ts` with full test coverage
- `Sidebar` and `Topbar` rendering correctly with all 12 modules (5 Phase 1 + 7 Phase 2/3 placeholders)
- 12 git commits, one per task

**Out of scope for Plan 1:** MDX content components, animated diagrams, command palette, search, AI Tutor, dashboard HUD widgets (all Plan 2 / Plan 3), actual curriculum content (Plan 4), Vercel deploy (Plan 5).

---

## File structure produced by this plan

```
~/projects/iam-mastery/
├── app/
│   ├── layout.tsx                          # T5
│   ├── page.tsx                            # T5
│   ├── globals.css                         # T3
│   ├── modules/[moduleId]/page.tsx         # T7
│   ├── modules/[moduleId]/[sectionId]/page.tsx  # T7
│   ├── flashcards/page.tsx                 # T7
│   ├── flashcards/[moduleId]/page.tsx      # T7
│   ├── search/page.tsx                     # T7
│   ├── progress/page.tsx                   # T7
│   └── settings/page.tsx                   # T7
├── components/
│   ├── layout/
│   │   ├── AmbientBackground.tsx           # T5
│   │   ├── Sidebar.tsx                     # T11
│   │   └── Topbar.tsx                      # T12
│   └── ui/                                  # T6 (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       └── scroll-area.tsx
├── content/
│   └── modules.json                        # T8
├── lib/
│   ├── content.ts                          # T8
│   ├── content.test.ts                     # T8
│   ├── progress.ts                         # T9
│   ├── progress.test.ts                    # T9
│   ├── flashcards.ts                       # T10
│   ├── flashcards.test.ts                  # T10
│   └── types.ts                            # T8 (shared types)
├── tests/
│   └── setup.ts                            # T4
├── package.json                            # T1
├── pnpm-lock.yaml                          # T1 (generated)
├── tsconfig.json                           # T2
├── next.config.mjs                         # T2
├── eslint.config.mjs                       # T2
├── .prettierrc                             # T2
├── postcss.config.mjs                      # T3
├── vitest.config.ts                        # T4
├── components.json                         # T6 (shadcn)
└── README.md                               # T5 (initial)
```

Task numbers (T1–T12) indicate which task creates each file.

---

## Task 1: Initialize package.json with dependencies

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "iam-mastery",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@anthropic-ai/sdk": "^0.40.0",
    "@next/mdx": "^16.0.0",
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@types/mdx": "^2.0.13",
    "gray-matter": "^4.0.3",
    "fuse.js": "^7.0.0",
    "cmdk": "^1.0.0",
    "framer-motion": "^12.0.0",
    "howler": "^2.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/howler": "^2.2.12",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.15",
    "postcss": "^8.4.49",
    "eslint": "^9.16.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1"
  },
  "packageManager": "pnpm@9.14.0"
}
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: pnpm resolves all packages and creates `pnpm-lock.yaml`. Some peer-dep warnings are acceptable; install must exit code 0.

- [ ] **Step 3: Verify install**

Run: `pnpm list next react typescript tailwindcss vitest --depth=0`
Expected: All five packages listed with their installed versions.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: initialize package.json with Next.js 16 + Tailwind 4 + Vitest stack"
```

---

## Task 2: Configure TypeScript, Next.js, ESLint, Prettier

**Files:**
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.prettierrc`
- Create: `next-env.d.ts` (will be generated)

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Create `next.config.mjs`**

```js
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
})

export default withMDX(nextConfig)
```

- [ ] **Step 3: Create `eslint.config.mjs`**

```js
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
})

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'off'
    }
  }
]
```

- [ ] **Step 4: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 5: Run typecheck and lint to verify config**

Run: `pnpm typecheck`
Expected: PASS (no errors; no source files yet)

Run: `pnpm lint`
Expected: PASS or warnings only; no errors.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json next.config.mjs eslint.config.mjs .prettierrc
git commit -m "chore: configure TypeScript, Next.js, ESLint, Prettier"
```

---

## Task 3: Configure Tailwind 4 with dark slate theme

**Files:**
- Create: `postcss.config.mjs`
- Create: `app/globals.css`

- [ ] **Step 1: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

- [ ] **Step 2: Create `app/globals.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-background: oklch(0.18 0.02 250);
  --color-foreground: oklch(0.95 0.01 240);
  --color-card: oklch(0.22 0.025 250);
  --color-card-foreground: oklch(0.95 0.01 240);
  --color-muted: oklch(0.28 0.02 250);
  --color-muted-foreground: oklch(0.68 0.02 240);
  --color-border: oklch(0.32 0.025 250);
  --color-input: oklch(0.32 0.025 250);
  --color-ring: oklch(0.6 0.18 260);

  --color-primary: oklch(0.65 0.18 260);
  --color-primary-foreground: oklch(0.99 0 0);

  --color-accent: oklch(0.7 0.16 160);
  --color-accent-foreground: oklch(0.18 0.02 250);

  --color-warning: oklch(0.78 0.16 75);
  --color-warning-foreground: oklch(0.18 0.02 250);

  --color-destructive: oklch(0.6 0.22 25);
  --color-destructive-foreground: oklch(0.99 0 0);

  --radius: 0.75rem;
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
}
```

- [ ] **Step 3: Verify Tailwind compiles**

Run: `pnpm dev` (in background)
Open: `http://localhost:3000`
Expected: Page returns 404 (no `app/page.tsx` yet) but no Tailwind/PostCSS errors in the terminal. Stop the dev server (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add postcss.config.mjs app/globals.css
git commit -m "chore: configure Tailwind 4 with dark slate theme tokens"
```

---

## Task 4: Set up Vitest + testing utilities

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `lib/sanity.test.ts` (temporary smoke test, removed at end)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

- [ ] **Step 2: Install `@vitejs/plugin-react`**

Run: `pnpm add -D @vitejs/plugin-react`
Expected: package added; install exits clean.

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

class LocalStorageMock {
  private store: Record<string, string> = {}
  clear() { this.store = {} }
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, value: string) { this.store[key] = String(value) }
  removeItem(key: string) { delete this.store[key] }
  get length() { return Object.keys(this.store).length }
  key(i: number) { return Object.keys(this.store)[i] ?? null }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true
})

afterEach(() => {
  window.localStorage.clear()
})
```

- [ ] **Step 4: Write a failing smoke test**

Create `lib/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })

  it('has jsdom + localStorage', () => {
    window.localStorage.setItem('x', '1')
    expect(window.localStorage.getItem('x')).toBe('1')
  })
})
```

- [ ] **Step 5: Run tests to verify setup**

Run: `pnpm test`
Expected: PASS — 2 tests passing in `lib/sanity.test.ts`.

- [ ] **Step 6: Delete the smoke test**

Run: `Remove-Item lib/sanity.test.ts` (or delete the file)

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json pnpm-lock.yaml
git commit -m "chore: set up Vitest + testing-library with jsdom and localStorage mock"
```

---

## Task 5: Create root layout, home page, and ambient background

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `components/layout/AmbientBackground.tsx`
- Create: `lib/utils.ts` (shadcn helper)
- Create: `README.md`

- [ ] **Step 1: Create `lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create `components/layout/AmbientBackground.tsx`**

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
          'radial-gradient(circle 800px at var(--mx, 50%) var(--my, 50%), oklch(0.32 0.08 260 / 0.25), transparent 60%), radial-gradient(circle at 1px 1px, oklch(0.32 0.02 250 / 0.15) 1px, transparent 0)',
        backgroundSize: 'auto, 24px 24px'
      }}
    />
  )
}
```

- [ ] **Step 3: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <AmbientBackground />
        <div className="relative flex min-h-screen">
          <aside
            id="sidebar-slot"
            className="hidden w-64 shrink-0 border-r border-border md:block"
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <header id="topbar-slot" className="h-14 border-b border-border" />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

> Note: `sidebar-slot` and `topbar-slot` are placeholders. Tasks 11 and 12 replace them with real components.

- [ ] **Step 4: Create `app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-balance text-4xl font-bold tracking-tight">IAM Mastery</h1>
      <p className="text-lg text-muted-foreground">
        Foundation shell is up. Routes, libs, and layout components arrive in subsequent tasks.
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Create `README.md`**

```markdown
# IAM Mastery

Personal IAM mastery learning platform. Complete curriculum from foundations to expert.

## Status

Phase 1 — under construction. See `docs/superpowers/specs/2026-05-25-iam-mastery-platform-design.md`.

## Develop

```bash
pnpm install
pnpm dev
```

## Test

```bash
pnpm test
```
```

- [ ] **Step 6: Verify dev server**

Run: `pnpm dev` (in background)
Open: `http://localhost:3000`
Expected: Page renders with "IAM Mastery" heading, dark background, and the subtle dot grid + mouse-tracking glow. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx components/layout/AmbientBackground.tsx lib/utils.ts README.md
git commit -m "feat: add root layout, home page, ambient background"
```

---

## Task 6: Initialize shadcn/ui and install base components

**Files:**
- Create: `components.json`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/scroll-area.tsx`

- [ ] **Step 1: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: Install base shadcn components via CLI**

Run: `pnpm dlx shadcn@latest add button card badge input scroll-area -y`
Expected: Five files created under `components/ui/`. CLI may install peer deps like `@radix-ui/*` packages — accept that.

- [ ] **Step 3: Verify components render**

Modify `app/page.tsx` to test:

```tsx
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-balance text-4xl font-bold tracking-tight">IAM Mastery</h1>
      <p className="text-lg text-muted-foreground">
        Foundation shell is up. Routes, libs, and layout components arrive in subsequent tasks.
      </p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Badge>Phase 1</Badge>
        <Badge variant="secondary">Coming</Badge>
      </div>
    </div>
  )
}
```

Run: `pnpm dev`
Open: `http://localhost:3000`
Expected: Buttons and badges render with shadcn styling against the dark slate theme. Stop server.

- [ ] **Step 4: Commit**

```bash
git add components.json components/ui app/page.tsx package.json pnpm-lock.yaml
git commit -m "feat: initialize shadcn/ui and install base components"
```

---

## Task 7: Scaffold all routes with placeholder pages

**Files:**
- Create: `app/modules/[moduleId]/page.tsx`
- Create: `app/modules/[moduleId]/[sectionId]/page.tsx`
- Create: `app/flashcards/page.tsx`
- Create: `app/flashcards/[moduleId]/page.tsx`
- Create: `app/search/page.tsx`
- Create: `app/progress/page.tsx`
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create `app/modules/[moduleId]/page.tsx`**

```tsx
type Params = Promise<{ moduleId: string }>

export default async function ModulePage({ params }: { params: Params }) {
  const { moduleId } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Module: {moduleId}</h1>
      <p className="text-muted-foreground">Module overview placeholder.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/modules/[moduleId]/[sectionId]/page.tsx`**

```tsx
type Params = Promise<{ moduleId: string; sectionId: string }>

export default async function SectionPage({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        {moduleId} / {sectionId}
      </h1>
      <p className="text-muted-foreground">Section content placeholder.</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/flashcards/page.tsx`**

```tsx
export default function FlashcardsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Flashcards</h1>
      <p className="text-muted-foreground">Cross-module spaced-repetition review placeholder.</p>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/flashcards/[moduleId]/page.tsx`**

```tsx
type Params = Promise<{ moduleId: string }>

export default async function ModuleFlashcardsPage({ params }: { params: Params }) {
  const { moduleId } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Flashcards: {moduleId}</h1>
      <p className="text-muted-foreground">Module-scoped review placeholder.</p>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/search/page.tsx`**

```tsx
type SearchParams = Promise<{ q?: string }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Search</h1>
      <p className="text-muted-foreground">
        {q ? `Results for "${q}" placeholder.` : 'Enter a query.'}
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Create `app/progress/page.tsx`**

```tsx
export default function ProgressPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Progress</h1>
      <p className="text-muted-foreground">Per-module breakdown placeholder.</p>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/settings/page.tsx`**

```tsx
export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Theme, sound, Anthropic API key, model, export/import placeholders.
      </p>
    </div>
  )
}
```

- [ ] **Step 8: Verify all routes**

Run: `pnpm dev`
Open and verify each renders without console errors:
- `http://localhost:3000/`
- `http://localhost:3000/modules/01-foundations`
- `http://localhost:3000/modules/01-foundations/01-identity-crisis`
- `http://localhost:3000/flashcards`
- `http://localhost:3000/flashcards/01-foundations`
- `http://localhost:3000/search?q=kerberos`
- `http://localhost:3000/progress`
- `http://localhost:3000/settings`

Stop server.

- [ ] **Step 9: Commit**

```bash
git add app/modules app/flashcards app/search app/progress app/settings
git commit -m "feat: scaffold all routes with placeholder pages"
```

---

## Task 8: Build content registry, types, and content reader

**Files:**
- Create: `lib/types.ts`
- Create: `content/modules.json`
- Create: `lib/content.ts`
- Create: `lib/content.test.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type Phase = 1 | 2 | 3

export type ModuleId =
  | '01-foundations'
  | '02-protocols'
  | '03-microsoft-identity'
  | '04-pam'
  | '05-iga'
  | '06-powershell'
  | '07-cloud-iam'
  | '08-security-detection'
  | '09-compliance'
  | '10-program-leadership'
  | '11-cert-roadmap'
  | '12-labs'

export type SectionStatus = 'seeded' | 'drafted' | 'personalized' | 'mastered'

export interface ModuleMeta {
  id: ModuleId
  title: string
  phase: Phase
  order: number
  summary: string
  sections: string[]
}

export interface SectionMeta {
  title: string
  section: number
  module: ModuleId
  sc300: boolean
  estimatedMinutes: number
  keywords: string[]
  phase: Phase
  status: SectionStatus
  slug: string
}
```

- [ ] **Step 2: Create `content/modules.json`**

```json
[
  {
    "id": "01-foundations",
    "title": "IAM Foundations",
    "phase": 1,
    "order": 1,
    "summary": "Why identity is the new perimeter.",
    "sections": ["01-identity-crisis", "02-lexicon", "03-ecosystem-map"]
  },
  {
    "id": "02-protocols",
    "title": "Protocols Deep Dive",
    "phase": 1,
    "order": 2,
    "summary": "Speaking the language of identity.",
    "sections": ["01-kerberos", "02-saml", "03-oauth-oidc", "04-ldap", "05-fido2", "06-scim"]
  },
  {
    "id": "03-microsoft-identity",
    "title": "Microsoft Identity Platform",
    "phase": 1,
    "order": 3,
    "summary": "Entra ID and Active Directory masterclass.",
    "sections": ["01-active-directory", "02-entra-id", "03-hybrid-identity"]
  },
  {
    "id": "04-pam",
    "title": "Privileged Access Management",
    "phase": 2,
    "order": 4,
    "summary": "Protecting the keys to the kingdom. (Phase 2 — Coming)",
    "sections": []
  },
  {
    "id": "05-iga",
    "title": "Identity Governance & Administration",
    "phase": 2,
    "order": 5,
    "summary": "Who has access to what, and should they? (Phase 2 — Coming)",
    "sections": []
  },
  {
    "id": "06-powershell",
    "title": "PowerShell for IAM",
    "phase": 1,
    "order": 6,
    "summary": "Your force multiplier.",
    "sections": ["01-fundamentals", "02-cookbook", "03-tips-tricks"]
  },
  {
    "id": "07-cloud-iam",
    "title": "Cloud IAM",
    "phase": 3,
    "order": 7,
    "summary": "Identity across AWS, Azure, and GCP. (Phase 3 — Coming)",
    "sections": []
  },
  {
    "id": "08-security-detection",
    "title": "IAM Security & Threat Detection",
    "phase": 2,
    "order": 8,
    "summary": "Thinking like the attacker. (Phase 2 — Coming)",
    "sections": []
  },
  {
    "id": "09-compliance",
    "title": "Compliance & Audit",
    "phase": 3,
    "order": 9,
    "summary": "Proving it to the auditors. (Phase 3 — Coming)",
    "sections": []
  },
  {
    "id": "10-program-leadership",
    "title": "IAM Program Leadership",
    "phase": 3,
    "order": 10,
    "summary": "Running the program, not just the tools. (Phase 3 — Coming)",
    "sections": []
  },
  {
    "id": "11-cert-roadmap",
    "title": "Certification Roadmap",
    "phase": 1,
    "order": 11,
    "summary": "Stacking credentials strategically.",
    "sections": ["01-sc300-roadmap", "02-study-strategy"]
  },
  {
    "id": "12-labs",
    "title": "Hands-On Labs",
    "phase": 2,
    "order": 12,
    "summary": "Build it, break it, fix it. (Phase 2 — Coming)",
    "sections": []
  }
]
```

- [ ] **Step 3: Write failing test for content reader**

Create `lib/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAllModules, getModule, isPhaseOneModule } from './content'

describe('lib/content', () => {
  it('returns all 12 modules in order', () => {
    const modules = getAllModules()
    expect(modules).toHaveLength(12)
    expect(modules[0].id).toBe('01-foundations')
    expect(modules[11].id).toBe('12-labs')
  })

  it('returns module by id', () => {
    const mod = getModule('03-microsoft-identity')
    expect(mod).toBeDefined()
    expect(mod!.title).toBe('Microsoft Identity Platform')
    expect(mod!.phase).toBe(1)
    expect(mod!.sections).toHaveLength(3)
  })

  it('returns undefined for unknown module id', () => {
    // @ts-expect-error invalid id for negative test
    expect(getModule('99-bogus')).toBeUndefined()
  })

  it('identifies Phase 1 modules correctly', () => {
    expect(isPhaseOneModule('01-foundations')).toBe(true)
    expect(isPhaseOneModule('04-pam')).toBe(false)
    expect(isPhaseOneModule('11-cert-roadmap')).toBe(true)
  })

  it('Phase 1 module ids are exactly: 01, 02, 03, 06, 11', () => {
    const phase1 = getAllModules().filter((m) => m.phase === 1).map((m) => m.id)
    expect(phase1).toEqual([
      '01-foundations',
      '02-protocols',
      '03-microsoft-identity',
      '06-powershell',
      '11-cert-roadmap'
    ])
  })
})
```

- [ ] **Step 4: Run tests to verify failure**

Run: `pnpm test lib/content.test.ts`
Expected: FAIL — module `./content` not found.

- [ ] **Step 5: Implement `lib/content.ts`**

```ts
import modulesJson from '@/content/modules.json'
import type { ModuleId, ModuleMeta } from './types'

const MODULES: ModuleMeta[] = (modulesJson as ModuleMeta[]).slice().sort((a, b) => a.order - b.order)

export function getAllModules(): ModuleMeta[] {
  return MODULES
}

export function getModule(id: ModuleId): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id)
}

export function isPhaseOneModule(id: ModuleId): boolean {
  const m = getModule(id)
  return m?.phase === 1
}

export function getPhaseModules(phase: 1 | 2 | 3): ModuleMeta[] {
  return MODULES.filter((m) => m.phase === phase)
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `pnpm test lib/content.test.ts`
Expected: PASS — all 5 tests passing.

- [ ] **Step 7: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/types.ts lib/content.ts lib/content.test.ts content/modules.json
git commit -m "feat: add modules registry with content reader and tests"
```

---

## Task 9: Build progress library with versioned localStorage schema

**Files:**
- Create: `lib/progress.ts`
- Create: `lib/progress.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/progress.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  markSectionVisited,
  markSectionCompleted,
  recordQuizAttempt,
  resetState,
  STORAGE_KEY,
  CURRENT_VERSION
} from './progress'

beforeEach(() => {
  window.localStorage.clear()
})

describe('lib/progress', () => {
  it('returns default state when storage is empty', () => {
    const s = loadState()
    expect(s.version).toBe(CURRENT_VERSION)
    expect(s.progress.sections).toEqual({})
    expect(s.streak.currentDays).toBe(0)
    expect(s.settings.soundEnabled).toBe(false)
  })

  it('persists and reloads state', () => {
    const s = loadState()
    s.settings.soundEnabled = true
    saveState(s)
    const reloaded = loadState()
    expect(reloaded.settings.soundEnabled).toBe(true)
  })

  it('writes to the expected storage key', () => {
    saveState(loadState())
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('markSectionVisited stores a timestamp', () => {
    markSectionVisited('02-protocols/01-kerberos')
    const s = loadState()
    expect(s.progress.sections['02-protocols/01-kerberos'].visitedAt).toBeTruthy()
  })

  it('markSectionCompleted stores a completion timestamp', () => {
    markSectionCompleted('02-protocols/01-kerberos')
    const s = loadState()
    expect(s.progress.sections['02-protocols/01-kerberos'].completedAt).toBeTruthy()
  })

  it('recordQuizAttempt appends to attempts and updates bestScore', () => {
    recordQuizAttempt('quiz-1', { at: '2026-05-25T10:00:00Z', score: 0.7, answers: [0, 1, 2] })
    recordQuizAttempt('quiz-1', { at: '2026-05-25T11:00:00Z', score: 0.9, answers: [1, 1, 2] })
    const s = loadState()
    expect(s.quizzes['quiz-1'].attempts).toHaveLength(2)
    expect(s.quizzes['quiz-1'].bestScore).toBe(0.9)
  })

  it('resetState clears storage', () => {
    saveState(loadState())
    resetState()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('emits state-change event on save', () => {
    let called = 0
    const handler = () => { called++ }
    window.addEventListener('iam-mastery:state-change', handler)
    saveState(loadState())
    window.removeEventListener('iam-mastery:state-change', handler)
    expect(called).toBe(1)
  })

  it('migrates unknown version to current default by overwriting', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, foo: 'bar' }))
    const s = loadState()
    expect(s.version).toBe(CURRENT_VERSION)
    expect(s.progress.sections).toEqual({})
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test lib/progress.test.ts`
Expected: FAIL — module `./progress` not found.

- [ ] **Step 3: Implement `lib/progress.ts`**

```ts
export const STORAGE_KEY = 'iam-mastery:v1'
export const CURRENT_VERSION = 1 as const

export interface QuizAttempt {
  at: string
  score: number
  answers: number[]
}

export interface SectionProgress {
  visitedAt: string
  completedAt?: string
  timeSpentSeconds: number
  status?: 'drafted' | 'personalized' | 'mastered'
}

export interface FlashcardProgress {
  leitnerBox: 1 | 2 | 3 | 4 | 5
  lastReviewed: string
  nextDue: string
  correctStreak: number
}

export interface StoredState {
  version: typeof CURRENT_VERSION
  progress: {
    sections: Record<string, SectionProgress>
    modules: Record<string, { completionPercent: number }>
  }
  quizzes: Record<string, { attempts: QuizAttempt[]; bestScore: number }>
  flashcards: Record<string, FlashcardProgress>
  streak: {
    currentDays: number
    lastStudyDate: string
    longestDays: number
  }
  session: { startedAt: string }
  settings: {
    soundEnabled: boolean
    anthropicApiKey?: string
    tutorModel: string
    sidebarCollapsed: boolean
    moduleExpanded: Record<string, boolean>
  }
  tutorHistory: Record<string, {
    sectionId: string
    messages: { role: 'user' | 'assistant'; content: string; at: string }[]
  }>
}

function defaultState(): StoredState {
  return {
    version: CURRENT_VERSION,
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

export function loadState(): StoredState {
  if (typeof window === 'undefined') return defaultState()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultState()
  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>
    if (parsed.version !== CURRENT_VERSION) return defaultState()
    return { ...defaultState(), ...(parsed as StoredState) }
  } catch {
    return defaultState()
  }
}

export function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
}

export function resetState(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
}

export function markSectionVisited(sectionKey: string): void {
  const s = loadState()
  const existing = s.progress.sections[sectionKey]
  s.progress.sections[sectionKey] = {
    visitedAt: new Date().toISOString(),
    timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    completedAt: existing?.completedAt,
    status: existing?.status
  }
  saveState(s)
}

export function markSectionCompleted(sectionKey: string): void {
  const s = loadState()
  const existing = s.progress.sections[sectionKey]
  s.progress.sections[sectionKey] = {
    visitedAt: existing?.visitedAt ?? new Date().toISOString(),
    timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    completedAt: new Date().toISOString(),
    status: existing?.status
  }
  saveState(s)
}

export function recordQuizAttempt(quizId: string, attempt: QuizAttempt): void {
  const s = loadState()
  const existing = s.quizzes[quizId] ?? { attempts: [], bestScore: 0 }
  existing.attempts.push(attempt)
  existing.bestScore = Math.max(existing.bestScore, attempt.score)
  s.quizzes[quizId] = existing
  saveState(s)
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test lib/progress.test.ts`
Expected: PASS — all 9 tests passing.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/progress.ts lib/progress.test.ts
git commit -m "feat: add versioned localStorage progress library with full test coverage"
```

---

## Task 10: Build flashcard spaced-repetition library

**Files:**
- Create: `lib/flashcards.ts`
- Create: `lib/flashcards.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/flashcards.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  promoteCard,
  demoteCard,
  intervalDaysForBox,
  computeNextDue,
  isDue,
  reviewQueue,
  initialCardState
} from './flashcards'
import type { FlashcardProgress } from './progress'

const FROZEN = '2026-05-25T12:00:00Z'

describe('lib/flashcards (Leitner)', () => {
  it('initialCardState starts in box 1', () => {
    const c = initialCardState(FROZEN)
    expect(c.leitnerBox).toBe(1)
    expect(c.correctStreak).toBe(0)
    expect(c.lastReviewed).toBe(FROZEN)
  })

  it('intervalDaysForBox returns Leitner schedule', () => {
    expect(intervalDaysForBox(1)).toBe(1)
    expect(intervalDaysForBox(2)).toBe(3)
    expect(intervalDaysForBox(3)).toBe(7)
    expect(intervalDaysForBox(4)).toBe(14)
    expect(intervalDaysForBox(5)).toBe(30)
  })

  it('promoteCard moves up one box (cap at 5) and increments streak', () => {
    const c = initialCardState(FROZEN)
    const promoted = promoteCard(c, FROZEN)
    expect(promoted.leitnerBox).toBe(2)
    expect(promoted.correctStreak).toBe(1)

    const capped = promoteCard({ ...promoted, leitnerBox: 5 }, FROZEN)
    expect(capped.leitnerBox).toBe(5)
  })

  it('demoteCard resets to box 1 and zeroes streak', () => {
    const c: FlashcardProgress = {
      leitnerBox: 4,
      lastReviewed: FROZEN,
      nextDue: FROZEN,
      correctStreak: 3
    }
    const demoted = demoteCard(c, FROZEN)
    expect(demoted.leitnerBox).toBe(1)
    expect(demoted.correctStreak).toBe(0)
  })

  it('computeNextDue uses the box interval', () => {
    const due = computeNextDue(2, '2026-05-25T12:00:00Z')
    // box 2 = 3 days
    expect(due).toBe('2026-05-28T12:00:00.000Z')
  })

  it('isDue returns true when nextDue <= now', () => {
    expect(isDue({ ...initialCardState(FROZEN), nextDue: '2026-05-25T11:00:00Z' }, FROZEN)).toBe(true)
    expect(isDue({ ...initialCardState(FROZEN), nextDue: '2026-05-26T12:00:00Z' }, FROZEN)).toBe(false)
  })

  it('reviewQueue returns only due cards, sorted by oldest first', () => {
    const cards: Record<string, FlashcardProgress> = {
      a: { leitnerBox: 1, lastReviewed: FROZEN, nextDue: '2026-05-25T08:00:00Z', correctStreak: 0 },
      b: { leitnerBox: 2, lastReviewed: FROZEN, nextDue: '2026-05-26T08:00:00Z', correctStreak: 0 },
      c: { leitnerBox: 1, lastReviewed: FROZEN, nextDue: '2026-05-24T08:00:00Z', correctStreak: 0 }
    }
    const queue = reviewQueue(cards, FROZEN)
    expect(queue).toEqual(['c', 'a'])
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test lib/flashcards.test.ts`
Expected: FAIL — module `./flashcards` not found.

- [ ] **Step 3: Implement `lib/flashcards.ts`**

```ts
import type { FlashcardProgress } from './progress'

const LEITNER_DAYS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
}

export function intervalDaysForBox(box: 1 | 2 | 3 | 4 | 5): number {
  return LEITNER_DAYS[box]
}

export function initialCardState(now: string): FlashcardProgress {
  return {
    leitnerBox: 1,
    lastReviewed: now,
    nextDue: computeNextDue(1, now),
    correctStreak: 0
  }
}

export function computeNextDue(box: 1 | 2 | 3 | 4 | 5, now: string): string {
  const ms = Date.parse(now)
  const days = LEITNER_DAYS[box]
  return new Date(ms + days * 24 * 60 * 60 * 1000).toISOString()
}

export function promoteCard(card: FlashcardProgress, now: string): FlashcardProgress {
  const nextBox = (Math.min(card.leitnerBox + 1, 5) as 1 | 2 | 3 | 4 | 5)
  return {
    leitnerBox: nextBox,
    lastReviewed: now,
    nextDue: computeNextDue(nextBox, now),
    correctStreak: card.correctStreak + 1
  }
}

export function demoteCard(_card: FlashcardProgress, now: string): FlashcardProgress {
  return {
    leitnerBox: 1,
    lastReviewed: now,
    nextDue: computeNextDue(1, now),
    correctStreak: 0
  }
}

export function isDue(card: FlashcardProgress, now: string): boolean {
  return Date.parse(card.nextDue) <= Date.parse(now)
}

export function reviewQueue(cards: Record<string, FlashcardProgress>, now: string): string[] {
  const due = Object.entries(cards).filter(([, c]) => isDue(c, now))
  due.sort(([, a], [, b]) => Date.parse(a.nextDue) - Date.parse(b.nextDue))
  return due.map(([id]) => id)
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test lib/flashcards.test.ts`
Expected: PASS — all 7 tests passing.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/flashcards.ts lib/flashcards.test.ts
git commit -m "feat: add Leitner box flashcard library with full test coverage"
```

---

## Task 11: Build Sidebar component with module navigation

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Sidebar.test.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/layout/Sidebar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the IAM Mastery wordmark', () => {
    render(<Sidebar />)
    expect(screen.getByText('IAM Mastery')).toBeInTheDocument()
  })

  it('renders all 12 module titles', () => {
    render(<Sidebar />)
    expect(screen.getByText('IAM Foundations')).toBeInTheDocument()
    expect(screen.getByText('Protocols Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Identity Platform')).toBeInTheDocument()
    expect(screen.getByText('Privileged Access Management')).toBeInTheDocument()
    expect(screen.getByText('Hands-On Labs')).toBeInTheDocument()
  })

  it('renders a Phase 2 badge on Module 4', () => {
    render(<Sidebar />)
    const module4 = screen.getByText('Privileged Access Management').closest('a, button, div')!
    expect(module4.textContent).toMatch(/Phase 2/)
  })

  it('renders a Phase 3 badge on Module 7', () => {
    render(<Sidebar />)
    const m7 = screen.getByText('Cloud IAM').closest('a, button, div')!
    expect(m7.textContent).toMatch(/Phase 3/)
  })

  it('does not render a Phase badge on Phase 1 modules', () => {
    render(<Sidebar />)
    const m1 = screen.getByText('IAM Foundations').closest('a, button, div')!
    expect(m1.textContent).not.toMatch(/Phase 2|Phase 3/)
  })

  it('renders footer links (Flashcards, Search, Progress)', () => {
    render(<Sidebar />)
    expect(screen.getByText('Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test components/layout/Sidebar.test.tsx`
Expected: FAIL — Sidebar component does not exist.

- [ ] **Step 3: Implement `components/layout/Sidebar.tsx`**

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
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/30 md:flex"
    >
      <div className="px-5 py-5">
        <Link href="/" className="block text-lg font-bold tracking-tight">
          IAM Mastery
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-1">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-muted/60',
                  m.phase === 1 ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {m.order}. {m.title}
                  </span>
                </div>
                {m.phase !== 1 && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Phase {m.phase}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-3 py-4">
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            <Link
              href="/flashcards"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Flashcards
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Search
            </Link>
          </li>
          <li>
            <Link
              href="/progress"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Progress
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test components/layout/Sidebar.test.tsx`
Expected: PASS — all 6 tests passing.

- [ ] **Step 5: Wire Sidebar into root layout**

Modify `app/layout.tsx` — replace the `aside#sidebar-slot` placeholder:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <AmbientBackground />
        <div className="relative flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <header id="topbar-slot" className="h-14 border-b border-border" />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify in dev server**

Run: `pnpm dev`
Open: `http://localhost:3000`
Expected: Sidebar renders on the left with all 12 modules. Modules 4, 5, 7, 8, 9, 10, 12 show their phase badge. Footer shows Flashcards / Search / Progress links. Clicking any module navigates to its overview page. Stop server.

- [ ] **Step 7: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/Sidebar.test.tsx app/layout.tsx
git commit -m "feat: add Sidebar with all 12 modules and Phase 2/3 badges"
```

---

## Task 12: Build Topbar component with session timer and search input

**Files:**
- Create: `components/layout/Topbar.tsx`
- Create: `components/layout/Topbar.test.tsx`
- Create: `hooks/use-session-timer.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing tests for the session timer hook**

Create `hooks/use-session-timer.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimer } from './use-session-timer'

describe('useSessionTimer', () => {
  it('starts at 0 and increments each second', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSessionTimer())
    expect(result.current).toBe(0)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current).toBe(3)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run hook test to verify failure**

Run: `pnpm test hooks/use-session-timer.test.ts`
Expected: FAIL — hook not found.

- [ ] **Step 3: Implement `hooks/use-session-timer.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

export function useSessionTimer(): number {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return seconds
}

export function formatSessionTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
```

- [ ] **Step 4: Run hook test to verify pass**

Run: `pnpm test hooks/use-session-timer.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing tests for Topbar**

Create `components/layout/Topbar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  it('renders the search input', () => {
    render(<Topbar />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders the session timer in HH:MM:SS format', () => {
    render(<Topbar />)
    expect(screen.getByText(/^0:0[0-9]:0[0-9]$/)).toBeInTheDocument()
  })

  it('renders the settings link', () => {
    render(<Topbar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders the mastery progress indicator', () => {
    render(<Topbar />)
    expect(screen.getByLabelText(/overall mastery/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run Topbar tests to verify failure**

Run: `pnpm test components/layout/Topbar.test.tsx`
Expected: FAIL — Topbar component not found.

- [ ] **Step 7: Implement `components/layout/Topbar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

export function Topbar() {
  const seconds = useSessionTimer()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div
          aria-label="Overall mastery"
          className="flex h-9 items-center gap-2 rounded-full border border-border bg-card/50 px-3 text-xs font-medium text-muted-foreground"
        >
          <span className="size-2 rounded-full bg-primary" />
          0% mastered
        </div>
      </div>

      <form action="/search" className="hidden flex-1 max-w-md md:block">
        <Input
          type="search"
          name="q"
          placeholder="Search modules, terms, recipes…"
          className="h-9 bg-card/40"
        />
      </form>

      <div className="flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          <Settings className="size-4" />
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 8: Run Topbar tests to verify pass**

Run: `pnpm test components/layout/Topbar.test.tsx`
Expected: PASS — all 4 tests passing.

- [ ] **Step 9: Wire Topbar into root layout**

Modify `app/layout.tsx` — replace the `header#topbar-slot` placeholder:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
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

- [ ] **Step 10: Verify in dev server**

Run: `pnpm dev`
Open: `http://localhost:3000`
Expected: Sidebar on left (all 12 modules with Phase badges), Topbar across the top with "0% mastered" pill, search input, ticking timer, and settings cog. Navigate to other routes and verify the layout persists. Stop server.

- [ ] **Step 11: Run the full test suite**

Run: `pnpm test`
Expected: PASS — all tests (content, progress, flashcards, Sidebar, Topbar, useSessionTimer) green.

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS or warnings only.

- [ ] **Step 12: Commit**

```bash
git add components/layout/Topbar.tsx components/layout/Topbar.test.tsx hooks/use-session-timer.ts hooks/use-session-timer.test.ts app/layout.tsx
git commit -m "feat: add Topbar with session timer, search input, and settings link"
```

---

## Plan 1 acceptance criteria

Phase 1 Foundation is done when:

1. ✅ `pnpm dev` starts cleanly with no console errors on every route listed in Task 7
2. ✅ Sidebar renders all 12 modules with correct phase badges (5 Phase 1, 7 with Phase 2/3 badges)
3. ✅ Topbar shows mastery indicator, search input, ticking session timer, settings link
4. ✅ Ambient grid background and mouse-tracking glow visible
5. ✅ All routes resolve (`/`, `/modules/[id]`, `/modules/[id]/[sectionId]`, `/flashcards`, `/flashcards/[id]`, `/search`, `/progress`, `/settings`)
6. ✅ `lib/content.ts` returns all 12 modules, supports lookup by id, identifies Phase 1 modules
7. ✅ `lib/progress.ts` persists state to `iam-mastery:v1` with versioned schema, emits state-change events
8. ✅ `lib/flashcards.ts` implements Leitner box logic with promote, demote, due calculation, review queue
9. ✅ `pnpm test` passes all unit tests
10. ✅ `pnpm typecheck` passes with no errors
11. ✅ `pnpm lint` passes with no errors
12. ✅ 12 commits on `main` branch, one per task

---

## Self-review notes

**Spec coverage check:**
- Tech stack (spec 3.1): ✅ all dependencies in Task 1
- Project layout (spec 3.2): ✅ structure matches; MDX components / diagrams / tutor deferred to Plan 2
- Content model (spec 3.3): ✅ `modules.json` + types in Task 8; MDX frontmatter parsing deferred to Plan 2 when sections render real content
- Custom MDX components (spec 3.4): ❌ Plan 2 — explicitly out of scope
- Routes (spec 4.1): ✅ all 8 routes scaffolded in Task 7
- Sidebar behavior (spec 4.3): ✅ Phase badges, Phase 1 emphasis; checkmarks and progress indicators come when sections persist visited/completed state in Plan 2
- Topbar (spec 4.2): ✅ mastery pill, search input, session timer, settings link
- Persistence (spec 6.2): ✅ schema, helpers, state-change event, versioning all in Task 9
- Backup/restore (spec 6.4): ❌ Plan 2 — settings UI deferred
- Quiz/Flashcard/Tutor/Diagrams/Search/HUD: ❌ Plan 2 / Plan 3 — explicitly out of scope

**Placeholder scan:** No "TBD" or "implement later" in any step. Every code block is complete.

**Type consistency:** `FlashcardProgress` defined in `progress.ts` and imported by `flashcards.ts` consistently. `ModuleId` referenced consistently across `types.ts` and `content.ts`.

---

## Next plan

After Plan 1 completes via `superpowers:subagent-driven-development`:

- **Plan 2** — MDX content components (Quiz, Flashcard, callouts, PowerShellBlock, CommandReference, Definition) + interaction layer (command palette, motion, sound, keyboard shortcuts, focus glow, breadcrumbs, prev/next nav)
- Will be authored after verifying Plan 1's foundation is solid, so it can reference real files and patterns.
