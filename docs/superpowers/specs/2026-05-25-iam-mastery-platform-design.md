# IAM Mastery Platform — Design (Phase 1)

**Status:** Approved (2026-05-25)
**Owner:** Kolton Bernhardt
**Project:** `~/projects/iam-mastery`
**Repo:** New private GitHub repo (to be created in Wave 4.3)
**Deployment:** Vercel (private)
**Execution method:** `superpowers:subagent-driven-development` after `superpowers:writing-plans` produces the implementation plan

---

## 1. Vision

The IAM Mastery Platform is a personal learning system that takes Kolton from "competent IAM practitioner" to "IAM subject-matter expert" with no gaps. It is **not** a SC-300 study guide. It is a complete IAM curriculum and toolkit covering:

- Every major identity protocol (Kerberos, SAML, OAuth/OIDC, LDAP, FIDO2/WebAuthn, SCIM)
- Every major IAM tool category (IdP, PAM, IGA, MFA, CIEM, identity threat detection)
- Every major vendor (Microsoft Entra/AD, Okta, SailPoint, CyberArk, BeyondTrust, Delinea, Saviynt, Omada, One Identity, HashiCorp Vault, AWS, Azure, GCP)
- Every major framework Kolton's work and career touch (NIST 800-53, NIST 800-63, NIST 800-207, NIST CSF 2.0, PCI-DSS 4.0, SOX 404, FFIEC, HIPAA, GDPR, FedRAMP)
- Full PowerShell mastery for IAM operations
- Hands-on labs for every major topic
- Identity-focused threat detection and incident response
- IAM program leadership and career architecture

The platform is the learner's single source of truth for IAM mastery. It is built once at full architectural scale and grows in content over time across three delivery phases.

### 1.1 Curriculum scope (full vision)

| Module | Title | Phase |
|---|---|---|
| 1 | IAM Foundations | 1 |
| 2 | Protocols Deep Dive | 1 |
| 3 | Microsoft Identity Platform (Entra ID / AD) | 1 |
| 4 | Privileged Access Management | 2 |
| 5 | Identity Governance & Administration | 2 |
| 6 | PowerShell for IAM | 1 |
| 7 | Cloud IAM (AWS / Azure / GCP) | 3 |
| 8 | IAM Security & Threat Detection | 2 |
| 9 | Compliance & Audit | 3 |
| 10 | IAM Program Leadership | 3 |
| 11 | Certification Roadmap | 1 |
| 12 | Hands-On Labs | 2 |

Phase 1 ships the engineering foundation plus curriculum for the modules with the highest immediate leverage (foundations, all protocols, Microsoft ecosystem, PowerShell, the SC-300 study roadmap). Phases 2 and 3 layer additional curriculum into the same shell with no architectural change.

---

## 2. Phase 1 scope

### 2.1 What ships in Phase 1

**Engineering — full-scale shell.** The application is built at the scale of the full vision. Routes, navigation, search, persistence, interaction layer, AI Tutor, and diagram primitives all support the complete 12-module curriculum from day one. Adding Phase 2 and Phase 3 modules later requires only authoring content — no architectural work.

**Curriculum — five seeded modules.** Modules 1, 2, 3, 6, and 11 ship with substantive AI-generated starting content that Kolton revises and extends as he studies.

**Module placeholders.** Modules 4, 5, 7, 8, 9, 10, and 12 appear in the sidebar marked "Phase 2" or "Phase 3" with a stub landing page. This proves the architecture scales and gives the learner a visible map of where the curriculum is going.

### 2.2 What is explicitly NOT in Phase 1

- Curriculum content for Modules 4, 5, 7, 8, 9, 10, 12
- Voice commands
- Three.js / WebGL 3D diagrams
- Agentic proactive study companion
- Multi-device sync / cloud backup / user accounts
- Public publishing of the site

---

## 3. Architecture & content model

### 3.1 Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Component library:** shadcn/ui (dark slate theme)
- **Content:** MDX via `@next/mdx`, frontmatter via `gray-matter`
- **Motion:** Framer Motion
- **Command palette:** `cmdk`
- **Search:** Fuse.js (client-side, build-time index)
- **Sound:** Howler.js (opt-in)
- **AI Tutor:** `@anthropic-ai/sdk` (`claude-sonnet-4-6` default)
- **Deployment:** Vercel
- **Package manager:** pnpm

### 3.2 Project layout

```
~/projects/iam-mastery/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── modules/[moduleId]/page.tsx
│   ├── modules/[moduleId]/[sectionId]/page.tsx
│   ├── flashcards/page.tsx
│   ├── flashcards/[moduleId]/page.tsx
│   ├── search/page.tsx
│   ├── progress/page.tsx
│   └── settings/page.tsx
├── content/
│   ├── modules.json
│   ├── 01-foundations/
│   ├── 02-protocols/
│   ├── 03-microsoft-identity/
│   ├── 04-pam/                 # Phase 2 stub
│   ├── 05-iga/                 # Phase 2 stub
│   ├── 06-powershell/
│   ├── 07-cloud-iam/           # Phase 3 stub
│   ├── 08-security-detection/  # Phase 2 stub
│   ├── 09-compliance/          # Phase 3 stub
│   ├── 10-program-leadership/  # Phase 3 stub
│   ├── 11-cert-roadmap/
│   └── 12-labs/                # Phase 2 stub
├── components/
│   ├── layout/
│   ├── content/
│   ├── ui/
│   ├── diagrams/
│   ├── tutor/
│   └── search/
├── lib/
│   ├── content.ts
│   ├── search.ts
│   ├── progress.ts
│   ├── flashcards.ts
│   └── tutor.ts
├── docs/superpowers/specs/
│   └── 2026-05-25-iam-mastery-platform-design.md
├── .wolf/                      # OpenWolf state
├── tailwind.config.ts
├── next.config.mjs
├── package.json
└── README.md
```

### 3.3 Content model

#### MDX section files

Each section lives as a single `.mdx` file with frontmatter:

```yaml
---
title: "Kerberos — The Gatekeeper"
section: 1
module: 02-protocols
sc300: false
estimatedMinutes: 25
keywords: [kerberos, krbtgt, tgt, golden-ticket, kerberoasting]
phase: 1
status: seeded | drafted | personalized | mastered
---
```

`status` lets the learner mark progress on the content itself, independent of quiz/flashcard progress:
- `seeded` — AI-generated starting content, not yet reviewed
- `drafted` — reviewed once
- `personalized` — annotated with personal notes and connections
- `mastered` — confident in the material

#### JSON sidecars

Each module folder may include:
- `quizzes.json` — quiz question pool
- `flashcards.json` — flashcard deck
- `recipes.json` — PowerShell command recipes (Module 6 only)
- `commands.json` — module-specific command bank (Modules 3, 6)

> **As-built note (2026-06-03):** The JSON-sidecar model above was not how this shipped. There are no `recipes.json` / `flashcards.json` / `quizzes.json` sidecar files. PowerShell recipes live as a typed array in `lib/recipes.ts` (`export const IAM_RECIPES`), surfaced by `<CommandReference />`. Quiz and flashcard data are extracted from the inline `<Quiz>` / `<Flashcard>` MDX usages at runtime via `lib/content-index.ts` (no separate deck files). Section metadata lives in `lib/sections.ts`. This is the current source of truth; the sidecar wording is retained for history.

#### `modules.json` schema

Top-level registry of all modules, controls sidebar order and metadata:

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
    "id": "04-pam",
    "title": "Privileged Access Management",
    "phase": 2,
    "order": 4,
    "summary": "Protecting the keys to the kingdom. (Phase 2 — Coming)",
    "sections": []
  }
  // ... etc
]
```

### 3.4 Custom MDX components (auto-registered)

All components below are available inside any `.mdx` file without imports.

| Component | Purpose |
|---|---|
| `<Quiz id="...">` | Renders an interactive quiz from `quizzes.json` |
| `<Flashcard front="..." back="...">` | Inline flashcard preview |
| `<WarStory title="...">` | Crimson left-border real-world incident callout |
| `<ProTip>` | Amber-tinted tip callout with lightbulb icon |
| `<SC300Badge />` | Blue pill marking SC-300-aligned content |
| `<PowerShellBlock>` | Styled PowerShell command block with copy button |
| `<CommandReference category="...">` | Filterable command table from `recipes.json` |
| `<Definition term="...">` | Inline glossary term highlight with hover card |
| `<KerberosFlowDiagram />` | Animated Kerberos flow |
| `<SAMLFlowDiagram />` | Animated SAML flow (SP/IdP-initiated toggle) |
| `<OAuthFlowDiagram />` | Animated OAuth/OIDC flow with PKCE |
| `<HybridIdentityDiagram />` | Animated PHS/PTA/Federation comparison |
| `<EcosystemMap />` | Pan/zoom IAM ecosystem map |

Additional diagram components (e.g., `<CyberArkArchDiagram />`, `<SailPointAggregationDiagram />`, `<AWSIAMEvalDiagram />`) are added in Phases 2 and 3 as needed. The base diagram primitive (`<FlowDiagram>` in `components/diagrams/`) is generic and serves as the foundation.

---

## 4. Navigation, routes, layout

### 4.1 Routes

| Route | Renders |
|---|---|
| `/` | Home dashboard: mastery ring, module tiles, flashcards due, activity sparkline, streak, "resume where you left off" |
| `/modules/[moduleId]` | Module overview: section list with completion checkmarks, estimated time, module quiz CTA |
| `/modules/[moduleId]/[sectionId]` | Renders section MDX with sidebar TOC, breadcrumbs, prev/next nav |
| `/flashcards` | Cross-module spaced-repetition review |
| `/flashcards/[moduleId]` | Module-scoped flashcard review |
| `/search` | Global search results with type and module filters |
| `/progress` | Per-module breakdown, quiz history, flashcard stats, streak chart |
| `/settings` | Theme, sound, Anthropic API key, tutor model, export/import |

### 4.2 Persistent layout

`app/layout.tsx` wraps every route with:

- **Left sidebar** — collapsible, sticky, animated checkmarks, persisted collapse state per module
- **Top bar** — overall mastery ring, search input, session timer, settings icon, breadcrumbs
- **Content area** — max-width 1024px, typography-styled prose
- **Ambient background** — subtle grid pattern, mouse-tracking radial glow
- **Command palette** — keyboard-accessible from anywhere (`Cmd+K` / `Ctrl+K`)

### 4.3 Sidebar behavior

- Active module/section: blue-400 left border + brighter text
- Completed sections: emerald-400 checkmark
- In-progress section: half-filled dot
- Phase 2/3 modules: badge ("Phase 2"), muted text, clickable to a stub page explaining "Coming in Phase 2"
- Mobile (< 768px): hamburger drawer

### 4.4 Prev/next nav

Every section page ends with a two-card strip linking the previous and next sections. Order derives from `modules.json` and section frontmatter.

### 4.5 Breadcrumbs

Topbar shows breadcrumbs on section pages: `Module 2: Protocols › Kerberos`. Each segment is a link.

---

## 5. Interactive components & interaction layer

### 5.1 Content components (used inside MDX)

Described in section 3.4. Each component has explicit behavior requirements documented in the implementation plan; the most consequential below:

#### `<Quiz>` behavior

- Renders multi-choice, true/false, and scenario-match question types from `quizzes.json`
- Smooth answer reveal with Framer Motion
- Correct answer: emerald glow + checkmark animation, sound (if enabled)
- Wrong answer: red shake + explanation slides in
- Tracks attempts in localStorage; shows best score in module overview

#### `<Flashcard>` behavior

- 3D card flip on click or spacebar
- Front: question/prompt. Back: answer + optional explanation
- Inline previews are passive; full deck reviewed in `/flashcards` with Leitner box logic

#### `<PowerShellBlock>` behavior

- Dark slate-950 background, monospace font, blue-cyan syntax tinting
- Copy button in top-right; confirmation toast on click
- Optional `title` prop for context labeling

### 5.2 Interaction layer (app-wide)

| Feature | Library | Behavior |
|---|---|---|
| Command palette | `cmdk` | `Cmd+K` opens; fuzzy-searches all sections, glossary terms, recipes, quizzes; supports actions ("Review flashcards due today", "Ask the professor about this section") |
| Page transitions | Framer Motion | Sections fade-and-slide on navigation; sidebar checkmarks animate; topbar progress ring springs to new value |
| Stagger reveals | Framer Motion | List items appear with 30ms stagger |
| Ambient background | CSS only | Fixed-viewport dot/grid pattern with mouse-tracking radial blue glow |
| Focus glow | Tailwind + CSS | Focused interactive elements get a soft blue-400 ring |
| Session timer | Plain React | Live ticking timer in topbar; resets on page reload |
| Keyboard shortcuts | Custom hook | `Cmd+K` palette, `J`/`K` next/prev section, `Space` flip flashcard, `1-4` quiz answers, `?` shortcut help overlay |
| Sound (opt-in) | Howler.js | Subtle tick on flashcard flip, soft chime on quiz correct, deeper tone on wrong. Off by default. |

### 5.3 Animated flow diagrams

Each diagram is a React component built on a shared `<FlowDiagram>` primitive. Play controls animate packets/tokens along arrows with per-step tooltips.

Phase 1 ships these five:

| Diagram | Animates |
|---|---|
| `<KerberosFlowDiagram />` | Full AS-REQ → AS-REP → TGS-REQ → TGS-REP → AP-REQ. Click any step for ticket contents detail. |
| `<SAMLFlowDiagram />` | SP-initiated and IdP-initiated flows with a toggle. Click steps for AuthnRequest, Response, Assertion XML detail. |
| `<OAuthFlowDiagram />` | Authorization Code + PKCE animation with token endpoint exchange and refresh rotation. Implicit Grant rendered with strikethrough animation. |
| `<HybridIdentityDiagram />` | PHS/PTA/Federation modes. Arrows reroute when switching mode. |
| `<EcosystemMap />` | Pan/zoom IAM ecosystem map. Click any node to highlight its connections. |

The base `<FlowDiagram>` primitive is general-purpose. Phase 2 and Phase 3 add specific diagrams (CyberArk vault architecture, SailPoint aggregation flow, AWS IAM policy evaluation, etc.) by composing it.

### 5.4 AI Study Tutor — "Ask the Professor"

A right-pane modal powered by `@anthropic-ai/sdk`. Two entry points:

- "Ask the Professor about this topic" button at the bottom of every section
- Command palette action: "Ask the professor…"

**Configuration:**
- Default model: `claude-sonnet-4-6`
- System prompt: the Ivy-League IAM professor persona — passionate, precise, zero fluff; teaches the what, why, how, and a real-world war story
- Context injection: the current section's MDX content is loaded into the request so answers stay grounded
- Conversation history: persisted in localStorage per section, so returning to a section restores the prior conversation
- API key: stored in localStorage with a clear "stored in browser" warning in settings

**Phase 1 scope:**
- Single-turn or short multi-turn Q&A
- No tool use, no proactive suggestions, no voice
- Token usage bounded by section-scoped context

### 5.5 Dashboard HUD widgets

The home page (`/`) is the HUD. Built from:

- **Mastery progress ring** — large SVG circular progress, animates from 0 → current % on mount, gradient stroke (blue → emerald)
- **Module tiles grid** — 12 cards (5 Phase 1, 7 Phase 2/3 placeholders). Each shows progress bar, last-visited timestamp, hover lift.
- **Flashcards due today** — count with pulse if > 0, "Start Review" CTA
- **Activity sparkline** — past 14 days of study minutes
- **Streak counter** — consecutive days with study activity, flame icon
- **"Resume where you left off"** — last section visited, deep-link button

---

## 6. Search & persistence

### 6.1 Search

**Library:** Fuse.js — pure client-side, no network.

> **As-built note (2026-06-03):** No `search-index.json` file is emitted at build time. The search index is built in-memory on demand and memoized (`lib/content-index.ts` — `let cached` guards a single `build()` promise), drawing from the same inline-MDX extraction described in the §3.3 as-built note. The `SearchEntry` shape below still describes the index entries; only the "emit a JSON file at `next build`" mechanism changed.

**Index build:** At `next build`, `lib/content.ts` walks the `content/` tree and emits `search-index.json` containing:

```ts
type SearchEntry = {
  id: string;
  type: 'section' | 'glossary' | 'recipe' | 'quiz' | 'flashcard' | 'warstory';
  title: string;
  body: string;          // first ~500 chars, stripped of MDX
  keywords: string[];
  href: string;
  module: string;
  sc300: boolean;
};
```

**Weights:** `title: 3`, `keywords: 2`, `body: 1`. Threshold tuned during integration.

**Entry points:**
- Topbar search input → `/search?q=...` results page with type + module chip filters
- Command palette → live top-8 results with action items

### 6.2 Persistence

All transient state lives in browser localStorage under root key `iam-mastery:v1`. Schema is versioned to allow clean migrations.

```ts
type StoredState = {
  version: 1;
  progress: {
    sections: Record<string, {
      visitedAt: string;
      completedAt?: string;
      timeSpentSeconds: number;
      status?: 'drafted' | 'personalized' | 'mastered';
    }>;
    modules: Record<string, { completionPercent: number }>;
  };
  quizzes: Record<string, {
    attempts: { at: string; score: number; answers: number[] }[];
    bestScore: number;
  }>;
  flashcards: Record<string, {
    leitnerBox: 1 | 2 | 3 | 4 | 5;
    lastReviewed: string;
    nextDue: string;
    correctStreak: number;
  }>;
  streak: {
    currentDays: number;
    lastStudyDate: string;
    longestDays: number;
  };
  session: { startedAt: string };
  settings: {
    soundEnabled: boolean;
    anthropicApiKey?: string;
    tutorModel: string;
    sidebarCollapsed: boolean;
    moduleExpanded: Record<string, boolean>;
  };
  tutorHistory: Record<string, {
    sectionId: string;
    messages: { role: 'user' | 'assistant'; content: string; at: string }[];
  }>;
};
```

`lib/progress.ts` exposes typed read/write helpers. No component touches localStorage directly. Each write dispatches a `iam-mastery:state-change` event so widgets re-render.

### 6.3 Anthropic API key

Stored in localStorage with a clear settings warning. Suitable for a private personal app on a single workstation. If stricter handling is needed later, the migration to a Vercel route handler with `ANTHROPIC_API_KEY` env var is small.

### 6.4 Backup and restore

Settings page provides:
- **Export** — downloads full localStorage state as `iam-mastery-backup-YYYY-MM-DD.json`
- **Import** — restores from a backup file
- Weekly nudge after 7 days without an export — **CUT / deferred (2026-06-03):** export and import shipped and work; the 7-day reminder was intentionally not built. Not an open requirement.

No auto-sync in Phase 1.

---

## 7. Phase 1 deliverables

### 7.1 Engineering deliverables (full-scale shell)

The engineering ships at the scale of the full 12-module vision. It does not require revision in Phase 2 or Phase 3.

| Bucket | Deliverables |
|---|---|
| Project foundation | Next.js 16 App Router scaffold, TypeScript strict, Tailwind 4, shadcn/ui with dark slate theme, `@next/mdx` configured, ESLint, Prettier, pnpm, `package.json` scripts |
| Layout | Root layout with sidebar, topbar, breadcrumbs, prev/next nav, ambient background |
| Routes | All routes listed in section 4.1 |
| MDX components | All components listed in section 3.4 (5 callouts, 5 diagrams, Quiz, Flashcard, CommandReference, Definition, PowerShellBlock) |
| Interaction layer | Command palette, page transitions, stagger reveals, focus glow, session timer, keyboard shortcuts, opt-in sound |
| AI Study Tutor | Right-pane UI, Anthropic SDK wiring, key management, section-scoped system prompt, conversation persistence |
| Dashboard HUD | Mastery ring, 12-tile module grid (with Phase 2/3 placeholders), flashcards-due counter, activity sparkline, streak counter, resume card |
| Search | Build-time index generator, Fuse.js client, results page, command palette wiring |
| Persistence | Typed `lib/progress.ts`, versioned schema, state-change events, export/import |
| Settings | Theme, sound toggle, API key entry, model selector, export/import |
| Vercel deployment | `vercel.json`, private GitHub repo, first deploy, env vars |
| Documentation | README explaining how to add a section, recipe, war story, and how to deploy |

### 7.2 Phase 1 curriculum content

Targets, not hard limits.

**Module 1 — IAM Foundations** (~3,500 words seeded)
- `01-identity-crisis.mdx` — perimeter collapse, Zero Trust (NIST SP 800-207), attack surface, breach case studies (SolarWinds, Okta/Lapsus$, MGM Resorts)
- `02-lexicon.mdx` — 40+ terms with definition, why-it-matters, example
- `03-ecosystem-map.mdx` — narrative around `<EcosystemMap />`
- `quizzes.json` — 10 questions
- `flashcards.json` — 40 cards

**Module 2 — Protocols Deep Dive** (~6,500 words seeded)
- Kerberos (with Kerberoasting, Golden/Silver Ticket, Pass-the-Ticket attacks)
- SAML 2.0 (SP/IdP-initiated, assertion anatomy, real-world Salesforce/ServiceNow pattern, common misconfigurations)
- OAuth 2.0 + OpenID Connect (grant types, PKCE, ID/Access/Refresh token anatomies, scopes/claims, sign-in-with-Microsoft anatomy)
- LDAP (DN/RDN/CN/OU/DC, LDIF, LDAPS, PowerShell examples)
- FIDO2 / WebAuthn / Passkeys (ceremonies, enterprise deployment, security keys)
- SCIM 2.0 (schema, CRUD, Entra→SaaS provisioning)
- `quizzes.json` — 12 questions
- `flashcards.json` — 50 cards

**Module 3 — Microsoft Identity Platform** (~8,000 words seeded — the SC-300 anchor)
- AD deep dive: forest/domain/OU, GPOs (LSDOU, inheritance, WMI filtering), AGDLP/AGUDLP, trusts (types, directions, transitivity), ADCS, full PS command bank
- Entra ID: tenant architecture, PHS/PTA/Federation, Entra Connect/Cloud Sync, Conditional Access (named locations, device compliance, risk levels), break-glass account pattern, App Reg vs Enterprise App, Managed Identities (system vs user), PIM, Entra ID Governance, CIEM, Graph PowerShell + Azure CLI command banks
- Hybrid identity: PHS/PTA/Federation decision tree, ADFS sunset path, staged rollout
- Every SC-300-aligned subsection gets `<SC300Badge />`
- `quizzes.json` — 15 questions
- `flashcards.json` — 60 cards

**Module 6 — PowerShell for IAM** (~4,000 words + structured recipes)
- Fundamentals: pipeline, AD/Graph/Az modules, error handling, credential management
- Cookbook (30 recipes in `recipes.json`): User Lifecycle, Group Management, Access Auditing, Security Hygiene, Automation Patterns

> **As-built note (2026-06-03):** The 30-recipe target stays — it is the live goal. The cookbook is being expanded toward 30 recipes in `lib/recipes.ts` (the `IAM_RECIPES` array; not a `recipes.json` sidecar — see the §3.3 as-built note). This is a separate content lane; the target of 30 is unchanged.
- Tips & tricks: `$PSDefaultParameterValues`, `Out-GridView -PassThru`, `Measure-Command`, `-WhatIf`/`-Confirm`, `ConvertTo-Json -Depth`, parallel iteration
- `quizzes.json` — 8 questions including "write the command for X"
- `flashcards.json` — 30 cards on cmdlet syntax

**Module 11 — Certification Roadmap** (~2,500 words seeded)
- SC-300 study plan with topic weights from MS exam outline
- Lab recommendations (Microsoft Learn sandbox, personal tenant)
- Exam tips, practice question patterns
- Study strategy: Feynman, spaced repetition, lab-first
- `quizzes.json` — 5 SC-300 sample questions
- `flashcards.json` — 20 cards on exam-objective recall

**Totals:** ~24,500 words, ~50 quiz questions, ~200 flashcards, 30 PowerShell recipes.

### 7.3 Phase 1 acceptance criteria

Phase 1 is done when all of these are true:

1. `pnpm dev` starts cleanly on Windows; no console errors on any route
2. All five Phase 1 modules render their sections with seeded content
3. All seven Phase 2/3 placeholder modules render their stub pages with a "Coming in Phase X" message
4. Quizzes, flashcards, and the PowerShell cookbook work end-to-end with progress persisted across reloads
5. All five animated flow diagrams play correctly
6. Command palette opens with `Cmd+K`, jumps to any section, runs "Ask the Professor"
7. AI Study Tutor returns a coherent reply when an API key is configured
8. Dashboard widgets show real data driven by actual session and progress state
9. Export → Import round-trip restores state exactly
10. Deployed to Vercel on a private repo with a working URL accessible from mobile
11. README explains how to add a section, a recipe, a war story, and how to deploy
12. A sample Phase 2 module stub demonstrates the architecture handles future modules without code changes

---

## 8. Implementation plan — wave structure

The implementation plan (produced by `superpowers:writing-plans` after this spec is approved) organizes work into five waves. `superpowers:subagent-driven-development` executes them.

### Wave 0 — Foundation (sequential)

| Task | Description |
|---|---|
| 0.1 | Scaffold `~/projects/iam-mastery` with Next.js 16 App Router, TypeScript strict, Tailwind 4, MDX, ESLint, Prettier, pnpm, base scripts |
| 0.2 | Initialize shadcn/ui with dark slate theme tokens; install Framer Motion, cmdk, Fuse.js, Howler.js, `@anthropic-ai/sdk`, gray-matter |
| 0.3 | Root layout shell (`app/layout.tsx`), sidebar skeleton, topbar skeleton, ambient grid background, base typography |
| 0.4 | OpenWolf init for the new project |

### Wave 1 — Parallel infrastructure (6 subagents)

| Task | Description |
|---|---|
| 1.1 | Route scaffolding — `page.tsx` stubs for all routes in section 4.1 |
| 1.2 | `lib/content.ts` — read MDX/JSON from `content/`, return typed metadata |
| 1.3 | `lib/progress.ts` — typed localStorage helpers, versioned schema, state-change events |
| 1.4 | `lib/flashcards.ts` — Leitner box logic, due-date calculation, review queue |
| 1.5 | Sidebar implementation with collapsible modules, animated checkmarks, mobile drawer, Phase 2/3 badges |
| 1.6 | Topbar implementation with mastery ring, search input, session timer, settings icon |

### Wave 2 — Components + interactions (~18 parallel subagents)

**MDX content components (5)**
- 2.1 `<Quiz>`
- 2.2 `<Flashcard>` (with 3D flip)
- 2.3 `<WarStory>`, `<ProTip>`, `<SC300Badge>`, `<Definition>`
- 2.4 `<PowerShellBlock>`
- 2.5 `<CommandReference>`

**Interaction layer (5)**
- 2.6 Command palette (cmdk) with sections, actions, recently visited
- 2.7 Framer Motion page/list transition primitives + global motion config
- 2.8 Ambient background with mouse-tracking glow + focus glow utility
- 2.9 Session timer hook + keyboard shortcuts registry + `?` help overlay
- 2.10 Sound system with Howler, opt-in toggle, settings persistence

**Animated diagrams (5)** — each gets a dedicated subagent for quality
- 2.11 `<KerberosFlowDiagram />`
- 2.12 `<SAMLFlowDiagram />`
- 2.13 `<OAuthFlowDiagram />`
- 2.14 `<HybridIdentityDiagram />`
- 2.15 `<EcosystemMap />`

**Dashboard, search, tutor (3)**
- 2.16 Dashboard HUD widgets (ring, tiles grid, sparkline, streak, resume card)
- 2.17 Search — index generator + Fuse client + results page + filters
- 2.18 AI Study Tutor — SDK wiring, key management, right-pane UI, system prompt, section-scoped context, conversation persistence

### Wave 3 — Content seeding (7 parallel subagents)

Each subagent gets the same style guide (voice, structure, citation discipline, embedding conventions for components) so all modules feel like one author.

| Task | Description |
|---|---|
| 3.1 | Module 1 — IAM Foundations (~3,500 words + 10 quiz + 40 flashcards) |
| 3.2 | Module 2A — Protocols (Kerberos, SAML, OAuth/OIDC) (~3,500 words + 6 quiz + 25 flashcards) |
| 3.3 | Module 2B — Protocols (LDAP, FIDO2, SCIM) (~3,000 words + 6 quiz + 25 flashcards) |
| 3.4 | Module 3A — Active Directory deep dive + PS command bank (~4,000 words + 8 quiz + 30 flashcards) |
| 3.5 | Module 3B — Entra ID + Hybrid + Graph/CLI banks (~4,000 words + 7 quiz + 30 flashcards) |
| 3.6 | Module 6 — PowerShell (fundamentals + 30 recipes + tips) (~4,000 words + 8 quiz + 30 flashcards) |
| 3.7 | Module 11 — Cert Roadmap + Study Strategy (~2,500 words + 5 quiz + 20 flashcards) |

**Quality gates on each content subagent:**
- Style guide bundled into prompt: voice, structure (what / why / how / war-story), citation discipline (cite NIST SP / RFC / MS Learn — never invent), required embedded components per section
- Output reviewed against a checklist: word count met, components correctly embedded, claims sourced, SC-300 tags applied where applicable, no placeholder text, no "as an AI" tells
- Cross-module review pass — Module 2 and Module 3 cross-references are coherent, flashcards and quizzes align with same source content

### Wave 4 — Integration, deploy, polish (sequential)

| Task | Description |
|---|---|
| 4.1 | Full integration QA — every route renders, every component works, persistence round-trips, all five diagrams play, command palette opens, Tutor responds, search returns sensible results |
| 4.2 | Acceptance criteria walkthrough — verify all 12 Phase 1 criteria against live app |
| 4.3 | Vercel deployment — private GitHub repo created, Vercel project linked, first deploy, env var setup |
| 4.4 | README authoring — how to add sections, recipes, war stories, how to deploy |
| 4.5 | OpenWolf cerebrum updated with conventions, key learnings, content authoring patterns |
| 4.6 | Final punch-list pass — fix all rough edges surfaced during 4.1 before declaring Phase 1 done |

**Estimated total tasks:** ~40 atomic subagent tasks.

---

## 9. Phase 2 and Phase 3 outline

Phase 2 and Phase 3 add curriculum content into the same shell with no architectural change. Each phase's modules use the same content structure described in section 3.3 and the same MDX components described in section 3.4 (plus any vendor-specific diagrams added under `components/diagrams/`).

### Phase 2 — Job-relevant deep dives

- **Module 4 — Privileged Access Management:** CyberArk deep dive (Vault, PVWA, CPM, PSM, AAM/Conjur), BeyondTrust, Delinea, HashiCorp Vault, cloud-native PAM (AWS Session Manager, Azure PIM, GCP OS Login), PAM program design
- **Module 5 — IGA:** SailPoint IdentityIQ / IdentityNow, Okta (Universal Directory, Lifecycle Management, Workflows, OIG, API Access Management), Saviynt, One Identity, Omada, Microsoft Entra ID Governance
- **Module 8 — IAM Security & Threat Detection:** MITRE ATT&CK identity-based techniques, Microsoft Defender for Identity, CrowdStrike Falcon Identity, Semperis, KQL identity hunting in Sentinel, identity incident response
- **Module 12 — Hands-On Labs:** 15+ guided labs (AD lab from scratch, Entra Connect setup, Conditional Access policies, SAML/SCIM integration, LAPS, JML automation, PIM, CyberArk onboarding, Okta SSO + lifecycle, SailPoint certification campaign, Kerberoasting hunt, Power BI identity dashboard, automated stale account cleanup, FIDO2 enterprise deployment)

### Phase 3 — Career capstone

- **Module 7 — Cloud IAM:** AWS IAM (policy evaluation, Organizations + SCPs, IAM Identity Center, Access Analyzer, cross-account access), Azure IAM beyond Entra (RBAC scope hierarchy, custom roles, Managed Identities, Azure Policy, Azure Lighthouse), GCP IAM (resource hierarchy, predefined vs custom roles, service accounts, workload identity federation), multi-cloud identity strategy, CIEM
- **Module 9 — Compliance & Audit:** NIST 800-53 AC and IA families, NIST CSF 2.0, PCI-DSS 4.0 (Req 7, 8), SOX 404 ITGC, FFIEC, HIPAA, GDPR, FedRAMP, IAM controls matrix template, audit preparation playbook
- **Module 10 — IAM Program Leadership:** Maturity model, IAM roadmap development, stakeholder mapping, budgeting and vendor evaluation, IAM metrics and reporting, vendor RFP design, IAM career architecture

---

## 10. Open questions

None blocking. The following are documented for visibility:

- **Vercel deployment region:** Default to closest to Ohio (likely `iad1` or `cle1`). Confirm during Wave 4.3.
- **Domain:** Vercel-provided subdomain in Phase 1. Custom domain optional for Phase 2.
- **API key rotation cadence:** Manual for Phase 1. Settings page surfaces "last set" date.
- **Backup automation:** Manual export in Phase 1. Optional Phase 2: scheduled Vercel route handler that triggers a download.

---

## 11. Glossary of design decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Vercel native, MDX integration, ecosystem familiarity, dynamic route segments scale to full vision |
| Content storage | Markdown in repo (git-versioned) | Durable, version-controlled, editable in VS Code, accessible on phone via GitHub, no DB |
| Content format | MDX | Embedded React components inside markdown (quiz, diagrams, flashcards inline with prose) |
| Component library | shadcn/ui | Premium dark aesthetic, full ownership of components, Tailwind native |
| Search | Fuse.js (client-side, build-time index) | No infrastructure, instant, sufficient for full vision content size |
| Persistence | localStorage with versioned schema | Single-user personal tool; cloud sync deferred until needed |
| AI Tutor model | `claude-sonnet-4-6` default | Cost/quality balance for section-scoped Q&A; configurable per-user |
| Deployment | Vercel (private repo, private URL) | Mobile flashcard access, zero infrastructure, one-click deploys |
| Execution method | `superpowers:subagent-driven-development` after `writing-plans` | Parallelism on independent tasks, quality control through bounded subagent scope |
| Phase 1 content scope | Modules 1, 2, 3, 6, 11 | Highest leverage for immediate SC-300 study + foundational protocols + PowerShell — engineering shell scales to all 12 |
| Phase 2/3 placeholders | Stub pages visible from day one | Proves architecture, motivates the learner with a visible roadmap |

---

**End of design.**
