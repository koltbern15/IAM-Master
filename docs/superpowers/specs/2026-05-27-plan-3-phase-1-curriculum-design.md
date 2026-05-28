# Plan 3 — Phase 1 Curriculum Authoring Design

**Status:** Approved (2026-05-27)
**Owner:** Kolton Bernhardt
**Project:** `~/projects/iam-mastery`
**Builds on:** Plan 2C (MDX content components shipped) + Home Polish Wave (3D constellation + mini panels). The platform's component shell is complete; this wave fills it with real curriculum.
**Execution method:** Staged authoring (calibration first, then mass production) — `superpowers:writing-plans` → `superpowers:subagent-driven-development`.

---

## 1. What this design does

Authors the **17 Phase 1 curriculum sections** as real MDX content, wires them into the existing section route, and replaces the tutor's placeholder section context with the actual section body. The platform graduates from "empty cinematic shell" to "actual IAM learning material."

**Scope:** 5 modules / 17 sections.

| Module | Sections |
|---|---|
| 01-foundations | 01-identity-crisis, 02-lexicon, 03-ecosystem-map |
| 02-protocols | 01-kerberos, 02-saml, 03-oauth-oidc, 04-ldap, 05-fido2, 06-scim |
| 03-microsoft-identity | 01-active-directory, 02-entra-id, 03-hybrid-identity |
| 06-powershell | 01-fundamentals, 02-cookbook, 03-tips-tricks |
| 11-cert-roadmap | 01-sc300-roadmap, 02-study-strategy |

Phase 2 and Phase 3 modules (04-pam, 05-iga, 07-cloud-iam, 08-security-detection, 09-compliance, 10-program-leadership, 12-labs) are **deferred** — each gets its own future wave once Phase 1 is locked.

---

## 2. Decisions locked

| # | Decision | Choice |
|---|---|---|
| 01 | Authoring model | Claude drafts, user reviews + corrects |
| 02 | Wave scope | All 17 Phase 1 sections in one wave |
| 03 | Section depth | Medium — 1,200–1,800 words per section, ~6–10 min read |
| 04 | Voice | Ivy-League IAM professor (matches the AI tutor system prompt) |
| 05 | Cert alignment | Each section opens with an explicit cert objective map panel (SC-900 / SC-300 / Security+ SY0-701 / CISSP) + inline `<SC300Badge>`s on cert-tested facts |
| 06 | War story angle | Mixed — banking/community-bank anchored with strategic asides for SaaS / defense / healthcare contexts |
| 07 | Interactive density | Rich — 6–9 blocks per section |
| 08 | Quiz authoring | Original scenario-based MCQs (3–5 per section). NO reproduction of vendor practice questions |
| 09 | Workflow staging | Stage 1: Calibration section drafted first → user voice review → Stage 2: rest of Module 01 → Stage 3: Modules 02–11 module-by-module |

---

## 3. Per-section structural template

Every curriculum section (Modules 01, 02, 03) follows this shape:

```mdx
<HoloPanel label="COVERS">
  - SC-300 Objective <n.n> — <objective title>
  - Security+ SY0-701 Objective <n.n> — <objective title>
  - CISSP Domain <n.n> — <domain title>
  (Use [VERIFY] tag on anything I'm uncertain about; user confirms during review.)
</HoloPanel>

# Section Title

Lead paragraph — what this section IS in 1–2 sharp sentences.

## What it is
~250 words. Define the concept. Inline `<Definition term="...">` on 1–2 key terms.

## Why it exists
~300 words. Historical / threat context. The forcing function. 1 `<ProTip>`.

## How it works under the hood
~500–700 words. The mechanism. RFCs / vendor docs by number.
- Diagram if relevant (Kerberos → `<KerberosFlowDiagram />`, etc.)
- `<PowerShellBlock>` if relevant
- 1–2 inline `<Flashcard front back>` for memorable facts

## War story
<WarStory title="...">
  Banking-anchored incident + 1–2 strategic asides ("in a SaaS context...", "for a defense contractor...").
</WarStory>

## Check your understanding
<Quiz id="<module>/<section>/check">3–5 scenario questions, 4 choices each</Quiz>
```

**Block count target:** 1 cert map + 1–2 Definitions + 1 ProTip + 0–1 diagrams + 0–1 PowerShellBlocks + 1–2 Flashcards + 1 WarStory + 1 Quiz = **6–9 blocks**.

---

## 4. Per-module template variants

| Module | Sections | Variant |
|---|---|---|
| 02-protocols 01/02/03 (Kerberos/SAML/OAuth) | 3 | Template literal + the matching FlowDiagram |
| 02-protocols 04/05/06 (LDAP/FIDO2/SCIM) | 3 | Template literal but NO diagram (deferred polish wave). Structural breakdown via `<HoloPanel>` instead |
| 03-microsoft-identity 01 (AD DS) | 1 | Template literal + `<EcosystemMap />` |
| 03-microsoft-identity 02 (Entra ID) | 1 | Template literal + `<EcosystemMap />` (largest section — CA / MFA / PIM / app registrations) |
| 03-microsoft-identity 03 (Hybrid) | 1 | Template literal + `<HybridIdentityDiagram />` |
| 06-powershell (all 3) | 3 | **Reference/cookbook template** — see §4.1 below |
| 11-cert-roadmap (both) | 2 | **Meta-content template** — see §4.2 below |

### 4.1 Module 06 PowerShell — cookbook template

```mdx
<HoloPanel label="COVERS">...</HoloPanel>

# Title

## When to reach for it (~150 words)
## The recipes (~600 words around <PowerShellBlock>s + <CommandReference>)
## Pitfalls (1–2 <ProTip>, 1 <WarStory>)
## Drill (optional <Quiz> on cmdlet behaviors)
```

Word count: 1,000–1,400.

### 4.2 Module 11 cert-roadmap — meta-content template

```mdx
# Title

## The path (HoloPanel timeline SC-900 → SC-300 → Security+ → CISSP)
## Per-cert breakdown (exam code, format, time, cost, official link, prep recommendation)
## Study strategy (spaced repetition + active recall guidance; ties into Flashcards module)
```

No Quiz, no diagrams. Word count: 800–1,200.

---

## 5. Cert objective sourcing

| Cert | Source | Citation format |
|---|---|---|
| SC-900 | Microsoft Learn exam page | "SC-900 Study Area <n> — <name>" |
| SC-300 | Microsoft Learn exam page | "SC-300 Objective <n.n> — <name>" |
| Security+ SY0-701 | CompTIA published objectives PDF | "Security+ SY0-701 Objective <n.n> — <name>" |
| CISSP | ISC2 CBK Domains | "CISSP Domain <n.n> — <name>" |

Rules:
- No fabricated objective numbers
- Anything I'm uncertain about → `[VERIFY]` tag for user confirmation during review
- Each cert map gets a dated comment: `<!-- Objectives current as of 2026-05-27 -->` for future drift tracking
- Quizzes are ORIGINAL scenario MCQs — no reproduction of vendor practice questions

---

## 6. Infrastructure (in this wave alongside the content)

The content can't render without these:

| Task | What it does |
|---|---|
| **MDX content loader** | A `lib/content-loader.ts` (or similar) that resolves `${moduleId}/${sectionId}` → loads the `.mdx` file from `content/modules/` |
| **Section page rewrite** | `app/modules/[moduleId]/[sectionId]/page.tsx` swaps its placeholder for real MDX rendering via `useMDXComponents`. Fires `markSectionVisited` on mount. Reads section MDX-as-text and passes it as `tutorSectionContent` to `ReadShell` (replaces the placeholder string) |
| **Module overview page build-out** | `app/modules/[moduleId]/page.tsx` lists real sections with per-section completion status from `state.progress.sections` |
| `recordQuizAttempt` is already wired into `<Quiz>` from Plan 2B T11 — no work needed | (Just calling it out) |

---

## 7. Staged authoring workflow

**Stage 1 — Calibration (this turn).** Draft `01-foundations/01-identity-crisis` end-to-end. User reviews, flags voice / depth / cert map / quiz difficulty issues. We iterate this one section until "lock it in."

**Stage 2 — Module 01 remainder.** Voice locked, I draft `02-lexicon` + `03-ecosystem-map` in one batch. Spot-check review.

**Stage 3 — Modules 02–11.** Module-by-module batches:
- Batch A: Module 02 (6 sections)
- Batch B: Module 03 (3 sections)
- Batch C: Module 06 (3 sections)
- Batch D: Module 11 (2 sections)

Each batch = its own commit + push so review happens against a stable state and any module can be reverted cleanly.

**Review tooling.** User reads either:
- The rendered MDX at `http://localhost:3000/modules/{moduleId}/{sectionId}` in dev mode (preferred for final pass)
- The raw `.mdx` file directly (faster for prose-only feedback)

Corrections come back as either inline edits to the `.mdx` file (preferred) or a note describing the change.

---

## 8. Acceptance criteria

This wave is done when:

1. All 17 `.mdx` files exist at `content/modules/{moduleId}/{sectionId}.mdx`
2. Every `/modules/{moduleId}/{sectionId}` route renders the rich MDX with all interactive blocks working
3. Module overview pages list real sections with completion indicators
4. Tutor opens with real section MDX content as `tutorSectionContent` (verified by asking the tutor to quote from the section)
5. Visiting a section updates `state.progress.sections[...].visitedAt` — home `RESUME` panel reflects it
6. Every section's cert objective map verified against published exam blueprints (any `[VERIFY]` tags resolved by user)
7. Every Quiz has 3–5 original scenario questions; quiz attempts persist via `recordQuizAttempt`
8. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:visual` all pass
9. At least one section's Playwright screenshot regenerated

---

## 9. Out of scope (explicit defers)

- Phase 2 modules (04-pam, 05-iga, 08-security-detection, 12-labs) — separate future waves
- Phase 3 modules (07-cloud-iam, 09-compliance, 10-program-leadership) — separate future waves
- `<LDAPDiagram>` / `<FIDO2Diagram>` / `<SCIMDiagram>` components — those Module 02 sections use `<HoloPanel>` structural prose; diagrams added in a later micro-wave
- Active Directory / Entra ID dedicated visual diagrams beyond what `<EcosystemMap>` already shows
- Real audio sound files (still silent WAV stubs from Plan 2B)
- Microsoft Learn integration / cert exam practice tests
- "Mark this section mastered" UX beyond the existing `markSectionCompleted` API
- Vercel deploy (separate Plan 5 wave)

---

**End of design.**
