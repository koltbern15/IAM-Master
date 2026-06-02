# IAM Mastery — Remaining Work Roadmap

> **For agentic workers:** This is a ROADMAP / INDEX, not a directly-executable task plan. It sequences all remaining work into workstreams. Each workstream gets its own bite-size, TDD-structured implementation plan (`docs/superpowers/plans/YYYY-MM-DD-<workstream>.md`) authored via `superpowers:writing-plans` *when it is picked up*, then executed via `superpowers:subagent-driven-development`. Do not implement directly from this file.

**Goal:** Give Kolton a single, deliberately-sequenced map of everything left to take IAM Mastery from "Phase 1 shipped" to "full 12-module vision," so he can choose order with eyes open.

**Architecture:** No architectural change is required for any remaining content. The shell built in Phase 1 already renders all 12 modules data-driven; Phase 2/3 modules are pure authoring plus 3 net-new diagram components named in the spec. Polish items are localized changes to existing components/config.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind 4, MDX (inline interactive components extracted at runtime by `lib/content-index.ts`), Vitest (233 tests today). pnpm.

**Source of truth:** Design spec `docs/superpowers/specs/2026-05-25-iam-mastery-platform-design.md` + the 2026-06-01 four-dimension audit (build/lint/typecheck/233 tests all green at time of writing).

---

## 1. Where things stand (2026-06-01)

**Phase 1 is shipped and healthy.** Verified by the audit:

- All 8 routes build and render, including `app/settings/page.tsx`.
- All 5 animated diagrams exist on the shared `FlowDiagram` primitive, are registered in `mdx-components.tsx`, and are actually used in MDX.
- AI Tutor ("Ask the Professor") wired both entry points (section rail + command palette) with per-section localStorage history (`lib/anthropic-client.ts`, `hooks/use-tutor-chat.ts`).
- Search runs Fuse.js client-side over a runtime-extracted index with the spec's exact weights + type/module filters.
- Persistence (`lib/progress.ts`, versioned `iam-mastery:v1`) + export/import backup file download both work.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (233 passing / 54 files), `pnpm build` (clean, 2.4s) all green.
- Of 7 previously-deferred items, **5 are done** (3D stack removed, palette tutor action, activity sparkline, export/import file, dead-dep cleanup). **2 remain** (`reactStrictMode` still off; no section TOC/anchors).

**What's left = the bulk the user noticed.** The 7 Phase 2/3 modules are genuine content-only stubs (empty `sections: []` in `content/modules.json`, no folders on disk), plus a finish-line of Phase 1 recall decks and a handful of UX-polish items.

---

## 1b. Detailed plans authored 2026-06-01 (the full mapping)

Every workstream below now has a complete, execution-ready plan doc in this folder — sections, topic outlines, **all flashcards and quizzes drafted**, study sources cited, diagrams spec'd. This index is the map; open the linked doc for the detail.

| Workstream | Plan doc | Sections | New flashcards | New quizzes | New diagram |
|---|---|---|---|---|---|
| W0A — Mod 3 decks + SC-300 badges | `2026-06-01-module-03-recall-decks.md` | edits to 3 existing | **+24** | **+6** | — |
| W0B — Mod 1/2/6/11 decks | `2026-06-01-ws0c-recall-deck-topups.md` | edits to existing | **+31** | **+7** | — |
| W1 — UX/mobile polish + diagrams | `2026-06-01-ux-polish-and-diagrams.md` | 9 TDD tasks | — | — | 3 (CyberArk, SailPoint, AWS) |
| W2A — Mod 4 PAM | `2026-06-01-module-04-pam.md` | 6 | 50 | 12 | CyberArkArchDiagram |
| W2B — Mod 5 IGA | `2026-06-01-module-05-iga.md` | 6 | 50 | 12 | SailPointAggregationDiagram |
| W2C — Mod 8 Security & Threat Detection | `2026-06-01-module-08-security-detection.md` | 5 | 50 | 12 | (optional attack-path) |
| W2D — Mod 12 Labs | `2026-06-01-module-12-labs.md` | 13 | 26 | 4 | — |
| W3A — Mod 7 Cloud IAM | `2026-06-01-module-07-cloud-iam.md` | 5 | 50 | 12 | AWSIAMEvalDiagram |
| W3B — Mod 9 Compliance & Audit | `2026-06-01-module-09-compliance.md` | 5 | 40 | 10 | — |
| W3C — Mod 10 Program Leadership | `2026-06-01-module-10-program-leadership.md` | 4 | 20 | 6 | — |

**Grand totals mapped:** 44 new sections · 341 new flashcards drafted · 81 new quizzes drafted · 3 new diagram components · ~193 `[VERIFY]` markers planted for fact-confirmation.

**Curriculum end-state once executed:** 17 → **61 sections** · 145 → **486 flashcards** · 42 → **123 quizzes** · 5 → **8 diagrams**.

### Execution gotchas discovered during mapping (apply to ALL content workstreams)

1. **`lib/sections.test.ts` hard-codes the authored-section count** (`toHaveLength(17)`). Adding any section breaks it — bump the literal **once per authoring wave** (e.g., all of Phase 2 → 17+30 = 47). Caught independently by four agents; don't get surprised by a red test.
2. **`remark-gfm` is NOT in `next.config.mjs`** yet shipped MDX uses GFM pipe tables and builds green. Render-check table-heavy sections (esp. Module 9 §04 controls matrix); documented fallback is raw `<table>` HTML.
3. **Inline-extractor quote constraint:** `<Flashcard>` front/back and `<Quiz>` prompt/explanation cannot contain literal double-quotes (the regex in `lib/content-index.ts` truncates at the first `"`). Use `&quot;` or apostrophes. All drafted cards already comply.
4. **~193 `[VERIFY]` markers are a feature, not a defect.** The agents drafted from model knowledge and flagged every version-specific product detail, control identifier, and cert price/format they weren't certain of, rather than inventing. **A source-verification pass against primary docs is part of executing every content workstream — nothing here ships unverified.**
5. **Module 9 (Compliance) is a promotion candidate** out of Phase 3 — highest banking + VOSB leverage; pull it forward if Phase 2 finishes early.
6. **Module 12 (Labs) authors last** — its labs cross-link Modules 4/5/8.

---

## 2. Cross-cutting conventions (read before ANY content workstream)

These apply to every module-authoring task. A detailed per-module plan must restate the relevant ones.

1. **Two-file sync (enforced by a unit test).** Adding sections means updating BOTH:
   - `content/modules.json` → the module's `sections: [...]` slug array.
   - `lib/sections.ts` → `SECTION_TITLES` map (every slug) and `SC300_SECTIONS` set (cert-aligned slugs).
   - A drift test fails if a `modules.json` slug has no `sections.ts` entry. Always change them together.
2. **Content loader registration.** Each new MDX section needs an entry in `lib/content-loader.ts` (`AUTHORED_SECTIONS` + a static import `case`). This is the only code touch needed to light up a new section.
3. **Interactive content is INLINE MDX, not JSON sidecars.** `<Flashcard>`, `<Quiz>`, `<Definition>`, `<WarStory>` are authored inline in the `.mdx` and extracted at runtime by `lib/content-index.ts`. There are no `flashcards.json` / `quizzes.json` files despite the spec's section 3.3 wording. PowerShell recipes are the exception: they live in `lib/recipes.ts` (`IAM_RECIPES`) and render via `<CommandReference>`.
4. **House style per section** (mirror existing Phase 1 sections): a top `<HoloPanel>` "COVERS" block mapping to SC-300/Security+/CISSP where relevant, then prose using `<Definition>`, `<WarStory>`, `<ProTip>`, embedded `<Quiz>` and `<Flashcard>` tags, and a diagram where one fits. Benchmark depth: ~2,700–3,000 words/section (e.g. `01-kerberos.mdx` = 2,736 words). Cite real sources (NIST SP / RFC / MS Learn / vendor docs) — never invent product behavior.
5. **New diagrams** compose the generic `components/diagrams/FlowDiagram.tsx`, get a co-located `.test.tsx` mirroring the Phase 1 diagram tests, and must be registered in `mdx-components.tsx` so authors use them without imports.
6. **TDD + frequent commits.** Every workstream plan is written test-first where code is involved (components, hooks, config). Pure prose-authoring tasks verify via the content-index extraction tests and a build.

---

## 3. Workstreams

Four workstreams, smallest/highest-leverage first. Each bullet is a future standalone plan.

### Workstream 0 — Phase 1 finish line (content-only, no new deps)

Prose is over target everywhere; only the recall decks lag. Total flashcards today: 145 / 200 target. This workstream directly serves active SC-300 study.

| ID | Scope | Gap to close |
|---|---|---|
| 0A | **Module 3 — MS Identity** recall decks + SC-300 badges | +24 `<Flashcard>` (36→60), +6 `<Quiz>` (9→15), embed `<SC300Badge />` in SC-300 subsections |
| 0B | **Module 11 — Cert Roadmap** quizzes (it has ZERO) | +5 `<Quiz>` SC-300 sample questions, +7 `<Flashcard>` (13→20) |
| 0C | **Module 1 / 6 / 2** card top-ups | M1 +15 cards (25→40); M6 +5 cards (25→30) +2 quiz (6→8); M2 +4 cards (46→50) |
| 0D | **`<SC300Badge />` rollout** | Component is used in **zero** files today; tag all SC-300-aligned subsections (Mod 3 primary; any in 1/2/11) and set `sc300` flags in `lib/sections.ts` |

Notes: 0A and 0B are the highest-value (SC-300 anchor module + the cert module that currently has no quiz at all). 0D can fold into 0A.

### Workstream 1 — UX / mobile polish (independent of content)

| ID | Scope | Why it matters |
|---|---|---|
| 1A | **Mobile nav drawer** — add a `<768px` hamburger + slide-in drawer reusing the `Sidebar` nav list, mounted in `ReadShell` | `Sidebar.tsx:12` is `hidden md:flex` — on a phone, read pages have **no navigation at all**. Kolton reviews flashcards on mobile, so this is real. |
| 1B | **Keyboard nav** — J/K prev/next section, 1–4 quiz answer keys in `Quiz.tsx`, and reconcile the `?` help overlay (it lists 3 flashcard grades; `FlashcardReview` implements 2) | Spec 5.2 shortcuts; the overlay/code mismatch is a visible inconsistency |
| 1C | **`reactStrictMode: true`** in `next.config.mjs:9` + a dev double-mount pass over `ParticleField` rAF cleanup, `SectionMountTracker`, state-change listeners | Last dead-3D cleanup item; surfaces effect bugs early |
| 1D | **Section TOC + heading anchors** — add `rehype-slug` (+ optional `rehype-autolink-headings`) to `next.config.mjs` and a TOC component on the section page | Spec 4.2 sidebar TOC; deep-linkable headings. Adds a dep. |
| 1E | *(optional)* Command palette searches the full Fuse index (glossary/recipes/quizzes), not just section/module nav | Spec 5.2/6.1 |
| 1F | *(optional)* Resume card tracks true most-recent `visitedAt` (verify `lib/home-telemetry.ts` doesn't fall back to first section); add last-visited timestamps to tiles + streak flame glyph | Spec 5.5 fidelity |

### Workstream 2 — Phase 2 content (highest job leverage for banking IAM)

Each module = its own plan. Sizes are ~2,700 words/section. Recommended authoring order within the phase: 4 → 5 → 8 → 12 (labs reference the others).

| ID | Module | Proposed sections | New engineering |
|---|---|---|---|
| 2A | **04 — PAM** | `01-pam-fundamentals`, `02-cyberark`, `03-beyondtrust-delinea`, `04-hashicorp-vault`, `05-cloud-native-pam`, `06-pam-program-design` (6) | **`<CyberArkArchDiagram />`** (Vault/PVWA/CPM/PSM) |
| 2B | **05 — IGA** | `01-iga-fundamentals`, `02-sailpoint`, `03-okta`, `04-saviynt-oneidentity-omada`, `05-entra-id-governance`, `06-sod-and-rbac-design` (6) | **`<SailPointAggregationDiagram />`** |
| 2C | **08 — Security & Threat Detection** | `01-identity-attack-techniques`, `02-defender-for-identity`, `03-crowdstrike-semperis`, `04-kql-identity-hunting`, `05-identity-incident-response` (5) | None required (optional attack-path view from primitive) |
| 2D | **12 — Hands-On Labs** | one MDX per lab, ~13: `01-build-an-ad-lab` … `12-fido2-deployment`, `13-powerbi-identity-dashboard` | None; heavy `<PowerShellBlock>` + Module 6 recipes |

SC-300 cross-tags: Azure PIM (in 04) and Entra ID Governance (in 05) are SC-300-aligned → `<SC300Badge />` + `sc300` flag. 2A has the highest direct Richwood-Bank relevance.

### Workstream 3 — Phase 3 capstone (career-broadening)

| ID | Module | Proposed sections | New engineering |
|---|---|---|---|
| 3A | **07 — Cloud IAM** | `01-aws-iam`, `02-azure-rbac`, `03-gcp-iam`, `04-multi-cloud-strategy`, `05-ciem` (5) | **`<AWSIAMEvalDiagram />`** (policy-eval logic) |
| 3B | **09 — Compliance & Audit** | `01-control-frameworks`, `02-financial-and-payment`, `03-privacy-and-federal`, `04-iam-controls-matrix`, `05-audit-prep-playbook` (5) | None (tables/matrices) |
| 3C | **10 — Program Leadership** | `01-maturity-and-roadmap`, `02-stakeholders-and-budget`, `03-metrics-and-rfp`, `04-career-architecture` (4) | None |

**Promotion candidate:** Module 9 (PCI-DSS Req 7/8, SOX 404 ITGC, FFIEC) is arguably higher real-world leverage for Kolton's banking + VOSB consulting work than its Phase-3 slot implies. Consider pulling it forward if Phase 2 finishes early. Module 10 is best authored as `status: seeded` scaffolding Kolton personalizes from real Richwood/Guard/TruePath experience, not dense AI prose.

---

## 4. New diagram engineering (tracked separately from authoring)

Three diagrams named in spec 3.4/5.3 don't exist yet and are real component work (build on `FlowDiagram`, add `.test.tsx`, register in `mdx-components.tsx`):

- `<CyberArkArchDiagram />` — gates full quality of Module 4 (build alongside 2A).
- `<SailPointAggregationDiagram />` — gates Module 5 (build alongside 2B).
- `<AWSIAMEvalDiagram />` — gates Module 7 (build alongside 3A).

---

## 5. Recommended sequencing (Kolton chooses)

Two coherent strategies — they differ in what comes after the finish line:

**Strategy A — "Pass SC-300, then go deep" (study-first):**
`0A → 0B → 0D → 0C` (finish-line decks) → `1A`+`1B` (mobile + keyboard so the study app is great on the phone) → `2A` (PAM) → `2B` (IGA) → `2C` (Security) → `2D` (Labs) → Phase 3.

**Strategy B — "Maximize job leverage now" (work-first):**
`0A`+`0B` (minimum SC-300 polish) → `2A` (PAM — most banking-relevant) → `2B` (IGA) → `3B` (Compliance, promoted) → `2C` (Security) → remaining finish-line/polish as time allows → `2D` Labs → rest of Phase 3.

Either way, **Workstream 0 comes first** — it's small, it's done with no new deps, and it makes the app fully deliver on its Phase-1 promise for active study. **1A (mobile drawer)** is the single highest-value polish item because the app is currently broken for navigation on a phone.

### Rough sizing

| Workstream | Effort |
|---|---|
| 0 (finish-line decks + badges) | Small — ~55 flashcards + ~13 quizzes + badge tagging, no deps |
| 1 (UX/mobile polish) | Small–medium — 1A/1B/1C quick; 1D adds a dep; 1E/1F optional |
| 2 (Phase 2 content) | Large — 4 modules, ~22 sections, 2 new diagrams |
| 3 (Phase 3 content) | Large — 3 modules, ~14 sections, 1 new diagram |

---

## 6. What happens when you pick a workstream

1. I author a detailed, bite-size, TDD-structured plan for just that workstream (e.g. `docs/superpowers/plans/2026-06-0X-module-04-pam.md`) — exact files, content/code per step, commands, commits — via `superpowers:writing-plans`.
2. You approve it.
3. We execute it via `superpowers:subagent-driven-development` (fresh subagent per task, review between tasks), committing per task on a feature branch, merged when green.

This roadmap stays the index; it gets a checkmark as each workstream lands.

---

## 7. Self-review (against the spec)

- **Spec coverage:** Every spec module (1–12) and every Phase-1 acceptance criterion is accounted for — Phase 1 as "done/verified," Phases 2/3 as workstreams 2/3 with the spec §9 topic lists, the 3 spec §5.3 future diagrams as §4 here, and the 2 outstanding deferred items (strict mode, TOC) as 1C/1D. ✅
- **Independence:** Each workstream produces working, testable software on its own (a module lights up via the content-loader; a polish item is localized). ✅
- **No placeholders:** This is an index by design; the granular "show the code" detail lives in each per-workstream plan written at pickup time, per the skill's Scope Check. Section slugs, file paths, and gap counts are concrete. ✅
- **Naming consistency:** Module ids, section slugs, and component names match `content/modules.json`, `lib/sections.ts`, and `components/` as verified in the audit. ✅
