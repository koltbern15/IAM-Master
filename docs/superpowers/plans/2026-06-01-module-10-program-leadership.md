# Module 10 — IAM Program Leadership (Phase 3 capstone)

**Goal:** Author Module 10 (`content/modules/10-program-leadership/`) as four `status: seeded` *personalizable scaffolding* sections — frameworks, prompts, fill-in templates, and scoring tools the author completes from real Richwood Bank + Ohio National Guard + TruePath/IAM-consulting experience — so the module becomes the strategic capstone that powers his consulting ambitions, not dense AI prose.

**Architecture note:** No engineering / no new diagram (`newDiagram = ""`). This is pure MDX authoring plus the standard three-file wiring (`content/modules.json`, `lib/sections.ts`, `lib/content-loader.ts`). The shell already renders any registered section data-driven; lighting these four up is the only app-code touch. **The drift unit test `lib/sections.test.ts` hardcodes "17 authored sections" in two places (lines 26 and 29 region) — it MUST be bumped to 21 when these land, or `pnpm test` fails.** That test file is the one exception to "MDX-only" for this module.

**Prereqs / conventions pointer (read before authoring):**
1. **Two-file sync (enforced by `lib/sections.test.ts`):** add all four slugs to `content/modules.json` → `10-program-leadership.sections[]` AND add a `SECTION_TITLES` entry per slug in `lib/sections.ts`. Add the one SC-300-aligned slug (`03-metrics-and-rfp` — see alignment note) to `SC300_SECTIONS`.
2. **Content-loader registration:** add each `10-program-leadership/<slug>` key to `AUTHORED_SECTIONS` **and** `ALL_KNOWN_SECTIONS` in `lib/content-loader.ts`, plus a static `import` `case` in `loadAuthoredComponent`. This is the only code wiring a section needs.
3. **Interactive content is INLINE MDX** extracted at runtime by `lib/content-index.ts`. Author `<Flashcard front back />`, `<Quiz question={{...}} />`, `<Definition term>`, `<WarStory title>`, `<ProTip>` inline. No JSON sidecars. No PowerShell recipes in this module (it is strategy, not ops) so no `lib/recipes.ts` / `<CommandReference>` edits.
4. **House style:** mirror the *lighter* end of the Phase-1 style (study `content/modules/11-cert-roadmap/02-study-strategy.mdx` and the COVERS block of `content/modules/03-microsoft-identity/02-entra-id.mdx`). Each section opens with an optional `<HoloPanel label="COVERS">` cert-mapping block (only `03` truly maps to a cert), then prose, then the scaffolding the section is built around (templates/prompts/tables), `<Definition>`/`<ProTip>`/`<WarStory>` callouts, embedded `<Quiz>`/`<Flashcard>`.
5. **ACCURACY:** cite real maturity-model / framework concepts (Gartner IAM maturity, NIST, ISACA/COBIT, SABSA, FAIR, SBA/VA VOSB-SDVOSB program) at a *high level*. Append `[VERIFY]` to ANY specific figure, named maturity-level label, control number, or program detail the author must confirm before publishing. Never invent vendor behavior or quote a "Gartner level 3 = X" definition as fact without `[VERIFY]`.

### Component prop reference (verified against the codebase — use exactly these shapes)
- `<HoloPanel label="COVERS">…markdown…</HoloPanel>` — also supports `intent="warn"` / `intent="threat"` for caution callouts. (`components/jarvis/HoloPanel.tsx`)
- `<Definition term="X">inline definition body</Definition>` (`components/content/Definition.tsx`)
- `<ProTip>…</ProTip>` / `<WarStory title="…">…</WarStory>` (`components/content/`)
- `<SC300Badge />` — **parameterless**; currently used in zero content files. (`components/content/SC300Badge.tsx`)
- `<Flashcard front="…" back="…" />` — string props.
- `<Quiz question={{ id: "10-program-leadership/<slug>/qN", prompt: "…", options: ["…","…","…","…"], correctIndex: <0-3>, explanation: "…" }} />` — exact object shape from `02-protocols/01-kerberos.mdx`.

### Design philosophy for this module (put this front-of-mind while authoring)
This module is **scaffolding, not a lecture.** Word target ~2,700/section is met largely through *frameworks the author fills in*: prompt lists ("Answer these about your environment…"), copy-paste templates (roadmap table, stakeholder RACI, business-case skeleton, KPI dashboard, RFP scoring matrix, skills matrix, capability statement), and decision criteria — interleaved with just enough authoritative prose to teach the concept. Frontmatter `status: seeded` on every file signals "AI starting point, personalize me." Flashcards are optional/light (~20 total across the module on frameworks & terms). Quizzes are light & reflective (~6 total). The win is a set of reusable consulting artifacts, not exam recall.

---

## Section map

### `01-maturity-and-roadmap` — IAM Maturity Models, Current-vs-Target Assessment, Roadmap Sequencing
- **Word target:** ~2,700 (heavy on the assessment template + roadmap table)
- **Topics / study material (subtopic → what to teach → source to cite):**
  - **Why maturity models exist** — they convert a sprawling "are we good at IAM?" question into a repeatable, comparable scorecard; they are the on-ramp to a defensible roadmap and budget ask. Frame against capability-maturity thinking generally (CMMI 5-level lineage: Initial → Managed → Defined → Quantitatively Managed → Optimizing). Cite CMMI lineage at concept level; `[VERIFY]` if quoting exact CMMI level names against any specific model.
  - **The maturity models that matter for IAM** — (a) **Gartner IAM Maturity Model** (commonly described as a 5-level scale, "Initial/Ad-hoc" through "Optimized/Transformational"). `[VERIFY]` exact Gartner level names/count — Gartner content is paywalled and revised; teach the *shape* not specific copyrighted labels. (b) **NIST CSF 2.0 Tiers** (Tier 1 Partial → Tier 2 Risk Informed → Tier 3 Repeatable → Tier 4 Adaptive) as a credible, free, citable maturity lens applicable to the IAM-relevant Functions (esp. **Protect (PR.AA — Identity Management, Authentication, Access Control)** and **Govern (GV)**). Cite **NIST CSF 2.0 (Feb 2024)**. (c) **IDPro / vendor IAM maturity self-assessments** as practitioner references. `[VERIFY]` any IDPro specifics. (d) **FFIEC / banking lens** — note that in a regulated bank, "maturity" is partly defined by examiner expectations (FFIEC IT Handbook authentication/access guidance). `[VERIFY]` exact FFIEC booklet names.
  - **The IAM capability domains to score** (the rows of the assessment) — teach a domain taxonomy: Authentication & MFA, Authorization/RBAC-ABAC, Identity Lifecycle (JML), Privileged Access (PAM), Identity Governance (access reviews, SoD), Directory & Federation, Secrets/Workload identity, Identity Threat Detection & Response, Governance/Policy/Ownership. Cross-reference the platform's own modules (PAM=Mod 4, IGA=Mod 5, Detection=Mod 8) so the author sees the curriculum *is* the capability map.
  - **Current-vs-target ("gap") assessment** — score each capability domain today (current state) and the target state for the org's risk appetite; the delta is the work. Teach that target ≠ "level 5 everywhere" — target is risk-driven and budget-bounded.
  - **Roadmap sequencing** — order initiatives by (value × risk-reduction) ÷ (cost × effort), honoring dependencies (you cannot run meaningful access reviews before you have a clean identity inventory; PAM before broad privilege analytics). Teach wave/horizon planning (Now / Next / Later, or 0-6-12-18 month horizons) and the "quick wins to fund the marathon" principle. Reference portfolio-prioritization thinking generally (e.g., WSJF/cost-of-delay) — `[VERIFY]` if naming a specific framework.
  - **Personalization prompts** — explicit fill-in questions tying it to Richwood Bank (what's our real current state per domain? what does an FFIEC examiner expect? where is the krbtgt/PAM gap from Module 2/4?) and to consulting clients (how do I run this assessment as a paid engagement?).
- **Scaffolding/templates this section provides:**
  1. **IAM Maturity Self-Assessment matrix** (markdown table): rows = capability domains above; columns = `Current Level (1-5)`, `Target Level (1-5)`, `Gap`, `Evidence/Notes`, `Priority`. Pre-filled with placeholder rows + a `[VERIFY]`'d level-descriptor legend.
  2. **Roadmap table** (markdown table): `Initiative | Capability domain | Horizon (Now/Next/Later) | Dependency | Est. effort | Value/Risk rationale | Owner`.
  3. **Roadmap one-pager prompt list** — the questions to answer to turn the matrix into an executive narrative.
- **Components to embed:** `<HoloPanel label="HOW TO USE THIS">` framing the scaffolding (no cert COVERS block — not cert-aligned); `<Definition term="capability maturity model">`, `<Definition term="target operating model">`; `<ProTip>` on "target ≠ maximum"; one `<WarStory title="…">` *prompt-shell* the author fills from a real assessment; 1 `<Quiz>`; ~5 `<Flashcard>`.
- **SC-300 alignment:** None. Do **not** render `<SC300Badge />`; do **not** add to `SC300_SECTIONS`.

### `02-stakeholders-and-budget` — Stakeholder Mapping, Business Case / ROI, Budgeting, Vendor Evaluation Criteria
- **Word target:** ~2,700
- **Topics / study material:**
  - **Stakeholder mapping** — identify every party with influence over or interest in IAM: CISO, CIO, IT Ops, app owners, HR (the JML source of truth), Internal Audit, Compliance/Risk, Legal/Privacy, Finance, the Board/risk committee, and end users. Teach the **power/interest grid** (Manage Closely / Keep Satisfied / Keep Informed / Monitor) and **RACI** for IAM decisions. Cite power/interest grid as standard stakeholder-management practice (Mendelow's matrix lineage) — `[VERIFY]` attribution; teach a **RACI** (Responsible/Accountable/Consulted/Informed) as the operational tool.
  - **Speaking each stakeholder's language** — auditors want evidence and control coverage; Finance wants ROI and TCO; the Board wants risk reduction in dollars; app owners want no disruption; end users want fewer passwords. The business case must be *re-framed per audience*.
  - **Building the business case / ROI** — components: problem statement (risk in business terms), options considered, recommended option, cost (TCO: license + implementation + run + opex headcount), benefit (risk reduction, audit-finding avoidance, helpdesk password-reset cost reduction, provisioning-time savings, breach-cost avoidance), and payback/ROI. Teach **quantifying loss exposure with FAIR (Factor Analysis of Information Risk)** at concept level — Annualized Loss Expectancy (ALE = SLE × ARO) is the classic, citable risk-quantification primitive (NIST SP 800-30 risk-assessment context). Cite **NIST SP 800-30 Rev.1** for risk-assessment framing and **FAIR** (Open Group standard) at concept level; `[VERIFY]` any specific dollar figures or breach-cost benchmarks (e.g., do not assert an IBM "Cost of a Data Breach" number without `[VERIFY]`).
  - **Budgeting** — CapEx vs OpEx (and how cloud/SaaS IAM shifts spend to OpEx subscription), the annual budget cycle, multi-year program funding vs project funding, the "run vs change" split, and contingency. Teach how to defend a number to Finance.
  - **Vendor evaluation criteria** — the dimensions to score any IAM tool: capability fit, integration/connector coverage, deployment model (SaaS vs self-hosted), scalability, security posture of the vendor itself (SOC 2 / ISO 27001 / FedRAMP for gov work), support & professional-services ecosystem, roadmap viability/vendor stability, total cost of ownership, and exit/portability. Distinguish **build vs buy vs managed-service**. Cite SOC 2 / ISO 27001 / FedRAMP as the standard vendor-assurance artifacts; `[VERIFY]` any claim about a specific vendor holding a specific certification.
  - **Personalization prompts** — map *your* Richwood stakeholders to the grid; draft the business case for one real initiative (e.g., funding a PAM rollout or access-review tooling); for the consulting business, how do you package "IAM business-case development" as a billable deliverable?
- **Scaffolding/templates this section provides:**
  1. **Stakeholder map template** (table): `Stakeholder | Role/Title | Power (H/M/L) | Interest (H/M/L) | What they care about | Engagement strategy | RACI on IAM decisions`.
  2. **Business-case skeleton** (fill-in headings): Executive summary → Problem & risk (in $) → Options → Recommendation → Cost (TCO breakdown) → Benefit/ROI → Risks of not acting → Ask. With an inline **ALE = SLE × ARO** worked-example placeholder marked `[VERIFY]` for the figures.
  3. **Vendor-evaluation criteria checklist** (weighted-criteria table preview that section 03's RFP scoring reuses): `Criterion | Weight | Why it matters`.
- **Components to embed:** `<HoloPanel label="HOW TO USE THIS">`; `<Definition term="total cost of ownership (TCO)">`, `<Definition term="annualized loss expectancy (ALE)">`, `<Definition term="RACI">`; `<ProTip>` on re-framing per audience; `<WarStory title="…">` prompt-shell (a budget ask that won/lost — author fills); 2 `<Quiz>`; ~6 `<Flashcard>`.
- **SC-300 alignment:** None. No `<SC300Badge />`, not in `SC300_SECTIONS`.

### `03-metrics-and-rfp` — IAM KPIs/Metrics & Exec Reporting, RFP Design and Scoring
- **Word target:** ~2,800 (carries the metrics catalog + the RFP scoring matrix)
- **Topics / study material:**
  - **KPIs vs KRIs vs metrics** — operational metrics (counts), KPIs (performance vs target), KRIs (leading risk indicators). Teach the distinction so the author reports the right thing to the right audience.
  - **The IAM metrics catalog to choose from** — Lifecycle: mean time to provision/deprovision, % of terminations deprovisioned within SLA (e.g., 24h), orphaned/stale account count, % accounts with an owner. Access governance: % access reviews completed on time, # of access-review revocations (a *healthy* number is non-zero), Segregation-of-Duties (SoD) violations open/aged, % privileged accounts under PAM, # standing-privilege accounts eliminated (JIT adoption). Authentication: MFA coverage %, phishing-resistant MFA coverage %, legacy-auth sign-in count trend, password-reset helpdesk ticket volume/cost. Risk/IR: risky sign-ins, mean time to detect/respond to identity incidents. Program: % apps integrated with SSO, automation coverage %. Tie each to the capability domains from section 01. Cite measurement framing to **NIST SP 800-55** (information security measurement) at concept level; map identity controls to **NIST SP 800-53 Rev.5 AC (Access Control) and IA (Identification & Authentication)** families so metrics trace to controls. `[VERIFY]` specific SLA numbers (24h is illustrative, not a standard).
  - **Executive reporting** — the one-slide IAM dashboard: 5-7 metrics max, trend arrows, RAG (red/amber/green) status, "so what" narrative, and the ask. Teach that exec reporting is storytelling with evidence, not a data dump; report risk reduction and trend, not raw tool telemetry.
  - **RFP design** — when to issue an RFI vs RFP vs RFQ; anatomy of an IAM RFP (background & objectives, scope, mandatory vs desirable requirements, technical requirements traced to the capability domains, security/compliance requirements, SLAs, pricing template, implementation & support expectations, evaluation methodology disclosed to bidders). Teach **writing requirements as testable, weighted statements** rather than vague wishes. Cite public-sector procurement practice generally; for the VOSB/SDVOSB angle, note federal procurement runs through **FAR (Federal Acquisition Regulation)** and SBA set-aside rules — `[VERIFY]` any specific FAR clause or threshold.
  - **RFP scoring** — the **weighted scoring matrix**: criteria × weight × bidder score = weighted score; how to keep scoring defensible and bias-resistant (independent scorers, documented rationale, separate technical vs cost scoring, sometimes a price-performance ratio). Reuse the vendor-eval criteria from section 02 as the scoring rows.
  - **Personalization prompts** — pick the 6 KPIs *you* would put on Richwood's IAM exec dashboard and why; draft requirement statements for a real tool selection; for consulting, package "RFP design + vendor scoring facilitation" as a fixed-fee deliverable.
- **Scaffolding/templates this section provides:**
  1. **IAM metrics catalog table**: `Metric | Type (Op/KPI/KRI) | Audience | Target/SLA [VERIFY] | Maps to control (NIST AC/IA) | Data source`.
  2. **One-slide exec dashboard template** (markdown mock): 6 metric tiles with RAG + trend + a "so what" line + "the ask."
  3. **RFP requirements template** (table): `Req ID | Requirement (testable) | Mandatory/Desirable | Weight | How scored`.
  4. **RFP weighted scoring matrix** (table): `Criterion | Weight | Vendor A score (1-5) | Vendor B | Weighted A | Weighted B`, with a worked total row.
- **Components to embed:** `<HoloPanel label="COVERS">` — **this is the one section with a real (light) cert tie** (see alignment); `<Definition term="key risk indicator (KRI)">`, `<Definition term="weighted scoring matrix">`, `<Definition term="segregation of duties (SoD)">`; `<ProTip>` on "report trend + risk, not telemetry"; `<WarStory title="…">` prompt-shell (an RFP that picked the wrong tool — author fills); 2 `<Quiz>`; ~6 `<Flashcard>`. Render `<SC300Badge />` once, next to the metrics/governance-reporting subheading.
- **SC-300 alignment:** **Light but real.** SC-300's *Plan and implement identity governance* objective covers access reviews and entitlement management — the governance-metrics portion (access-review completion %, SoD, PIM/privileged coverage) is exam-relevant reporting on those features. Set the `sc300` flag for this slug, add to `SC300_SECTIONS`, and render `<SC300Badge />` at the governance-metrics subsection only (not the RFP half). `[VERIFY]` exact SC-300 objective wording against the current MS exam outline before publishing.

### `04-career-architecture` — IAM Career Ladder, Skills Matrix, Certification Stacking, Consulting / VOSB-SDVOSB Positioning
- **Word target:** ~2,700 (the most personal section — heavy on self-assessment templates)
- **Topics / study material:**
  - **The IAM career ladder** — IC track (IAM Analyst → IAM Engineer → Senior IAM Engineer → IAM/Identity Architect → Principal/Distinguished) vs leadership track (IAM Team Lead → IAM Manager → Director of IAM → CISO-adjacent). Teach the inflection from "doing the tickets" to "owning the program." Frame generically; `[VERIFY]` any specific salary-band figures (do not assert market comp numbers without `[VERIFY]`).
  - **The IAM skills matrix** — competency dimensions to self-rate: protocols (Mod 2), Microsoft identity (Mod 3), PAM (Mod 4), IGA (Mod 5), PowerShell/automation (Mod 6), cloud IAM (Mod 7), detection/IR (Mod 8), compliance (Mod 9), and program/leadership (this module). The matrix doubles as a personal development plan and a hiring rubric. Cross-reference the curriculum so the matrix rows == the modules.
  - **Certification stacking strategy** — the author's actual path (SC-900 → SC-300 → Security+ → CISSP) and how each cert signals a layer: SC-900 (Microsoft security fundamentals), SC-300 (Microsoft identity administrator), Security+ (DoD 8570/8140 baseline IAT-II — relevant to the Guard role), CISSP (management/architecture credibility, the consulting door-opener). Add adjacent stacking options: Microsoft SC-100 (architect), Okta/SailPoint/CyberArk vendor certs (sales-channel + delivery credibility for consulting), AWS/Azure/GCP IAM-adjacent certs. Cite DoD **8140/8570** for the Security+ baseline relevance — `[VERIFY]` current 8140 status (8570 is being superseded by the 8140 manual). Cite vendor cert programs at name level only; `[VERIFY]` exam codes.
  - **Consulting positioning** — productizing the frameworks built in sections 01-03 into billable deliverables (maturity assessment, roadmap, business case, RFP facilitation, access-review program stand-up). Teach the **capability statement** as the core consulting marketing artifact and how to anchor it to a niche (regulated/community-bank IAM + federal/VOSB).
  - **VOSB / SDVOSB positioning** — what the designations are (**Veteran-Owned Small Business** / **Service-Disabled Veteran-Owned Small Business**), that federal certification now runs through the **SBA's VetCert program** (the Vets First / SBA Veteran Small Business Certification — moved from the VA CVE to SBA effective Jan 2023), the **3% federal SDVOSB contracting goal**, set-aside / sole-source eligibility, and SAM.gov registration as the front door. Cite **SBA VetCert** + the **3% SDVOSB goal (15 U.S.C. §644(g))** at concept level. `[VERIFY]` every specific eligibility rule, percentage, threshold, and program name — this is the highest `[VERIFY]` density in the module because the rules changed recently and are litigable. Add the **Ohio** state-level VOSB/MBE/EDGE angle as a prompt (state set-asides differ) — `[VERIFY]`.
  - **Personalization prompts** — fill the skills matrix honestly today; write your 18-month cert + skills plan; draft your capability statement's "core competencies" and NAICS codes (e.g., 541512 / 541519 / 541611 — `[VERIFY]` the right NAICS for IAM consulting); list the 5 contract vehicles or buyers to target.
- **Scaffolding/templates this section provides:**
  1. **IAM skills matrix template** (table): `Competency (= module) | Self-rating (1-5) | Evidence | Target | Gap action`.
  2. **Certification roadmap table** (table): `Cert | Signals | Prereq | Status | Target date` — pre-seeded with the author's SC-900→SC-300→Sec+→CISSP path.
  3. **Capability statement skeleton** (the standard 1-page gov-contracting format): Company overview, Core competencies, Differentiators, Past performance, Certifications/codes (NAICS, CAGE, UEI, set-aside designations), Contact. All values as `[VERIFY]`/fill-in placeholders.
  4. **VOSB/SDVOSB readiness checklist** (table): `Step | What | Where (SBA VetCert / SAM.gov / Ohio) | Status` — `[VERIFY]` each step.
- **Components to embed:** `<HoloPanel label="PERSONALIZE THIS">`; `<Definition term="SDVOSB">`, `<Definition term="capability statement">`, `<Definition term="NAICS code">`; `<ProTip>` on "your frameworks ARE your products"; `<WarStory title="…">` prompt-shell (a career inflection or first consulting win — author fills); 1 `<Quiz>` (reflective); ~3 `<Flashcard>` (terms: VOSB/SDVOSB/capability statement).
- **SC-300 alignment:** None directly (it *discusses* SC-300 as a career step but isn't exam material). No `<SC300Badge />`, not in `SC300_SECTIONS`.

---

## Flashcards

> Light by design (~20 total). All on durable frameworks/terms, not personalized facts. Front → back. `[VERIFY]` appended where a figure must be confirmed.

### `01-maturity-and-roadmap` (5)
1. What is a capability maturity model, in one sentence? → A repeatable scale (commonly 5 levels, Initial → Optimizing in the CMMI lineage) used to rate how consistently and effectively a capability is performed, so you can compare current vs target state and justify investment.
2. Why is the "target" maturity level rarely "level 5 everywhere"? → Target maturity is risk- and budget-driven; over-investing a low-risk capability to level 5 wastes money. Target = the level that satisfies the org's risk appetite and regulatory bar.
3. Which free, citable framework gives an IAM-applicable maturity lens via Tiers? → NIST CSF 2.0 (Feb 2024) Tiers 1-4 (Partial → Risk Informed → Repeatable → Adaptive), applied to the Protect (PR.AA) and Govern (GV) functions. [VERIFY] tier names.
4. Name three IAM capability domains you would score in a maturity assessment. → Any of: Authentication/MFA, Identity Lifecycle (JML), Privileged Access (PAM), Identity Governance (access reviews/SoD), Directory & Federation, Identity Threat Detection & Response.
5. What is the core rule for sequencing an IAM roadmap? → Order by value × risk-reduction relative to cost/effort, respecting dependencies (clean identity inventory before access reviews; PAM before privilege analytics); fund the marathon with early quick wins.

### `02-stakeholders-and-budget` (6)
1. What does a power/interest grid tell you about a stakeholder? → How to engage them: high power + high interest = manage closely; high power + low interest = keep satisfied; low power + high interest = keep informed; low/low = monitor.
2. What does RACI stand for? → Responsible, Accountable, Consulted, Informed — one Accountable party per decision.
3. What is Total Cost of Ownership (TCO) for an IAM tool? → License/subscription + implementation/professional services + ongoing run/opex (including headcount) over the asset's life — not just the sticker license price.
4. What is the ALE formula used to quantify risk in a business case? → Annualized Loss Expectancy = Single Loss Expectancy × Annualized Rate of Occurrence (ALE = SLE × ARO).
5. Why must an IAM business case be re-framed per audience? → Different stakeholders value different outcomes: Finance wants ROI/TCO, the Board wants risk reduction in dollars, auditors want control coverage/evidence, app owners want zero disruption.
6. Name three standard vendor-assurance artifacts to check when evaluating an IAM vendor. → SOC 2 (Type II), ISO/IEC 27001, and FedRAMP authorization (for federal/gov work). [VERIFY] before asserting a specific vendor holds one.

### `03-metrics-and-rfp` (6)
1. Difference between a KPI and a KRI? → A KPI measures performance against a target (lagging/outcome); a KRI is a leading indicator that risk exposure is rising before an incident occurs.
2. Give two IAM identity-lifecycle metrics. → Mean time to deprovision; % of terminations deprovisioned within SLA; orphaned/stale account count. (Any two.)
3. Why is a non-zero access-review revocation count a healthy sign? → It proves the reviews are real — reviewers are actually removing inappropriate access, not rubber-stamping. Zero revocations often means rubber-stamping.
4. What belongs on a one-slide IAM exec dashboard? → 5-7 metrics max, RAG status, trend arrows, a "so what" narrative, and the ask — risk-and-trend storytelling, not raw telemetry.
5. What is a weighted scoring matrix in an RFP? → Score = Σ(criterion weight × bidder rating); makes vendor selection defensible by quantifying weighted fit across disclosed, agreed criteria.
6. Which NIST control families do most IAM metrics trace back to? → AC (Access Control) and IA (Identification & Authentication) in NIST SP 800-53 Rev.5.

### `04-career-architecture` (3)
1. What is the difference between a VOSB and an SDVOSB? → VOSB = Veteran-Owned Small Business; SDVOSB = Service-Disabled Veteran-Owned Small Business (owner has a service-connected disability rating). SDVOSB unlocks federal set-aside/sole-source eligibility. [VERIFY] current eligibility rules.
2. Where is federal SDVOSB certification handled as of 2023? → The SBA Veteran Small Business Certification (VetCert) program — moved from the VA CVE to the SBA effective Jan 1, 2023. [VERIFY].
3. What is a capability statement? → A standardized 1-page government-contracting marketing document: company overview, core competencies, differentiators, past performance, and codes/certs (NAICS, CAGE, UEI, set-aside designations).

---

## Quiz

> Light & reflective (6 total). Object shape: `<Quiz question={{ id, prompt, options[4], correctIndex, explanation }} />`.

### `01-maturity-and-roadmap` (1)
- **q1 — stem:** Your IAM maturity assessment scores "Identity Governance" at current level 1 and "Authentication/MFA" at current level 4. The board asks why you are not pushing MFA to level 5 next year. What is the best-defended answer?
  - A. MFA is already strong; investment should go to the lowest-maturity, highest-risk domain (Identity Governance), because target maturity is risk-driven, not "maximum everywhere." ✅
  - B. We should raise every domain to level 5 simultaneously for consistency.
  - C. MFA to level 5 first, because authentication is always the top priority regardless of other gaps.
  - D. Maturity scores are subjective, so the sequencing does not matter.
  - **correctIndex:** 0
  - **explanation:** Target maturity is set by risk appetite and budget, not a race to level 5. A domain already at level 4 yields diminishing returns; the level-1 governance gap is the larger unmanaged risk and the right next investment.

### `02-stakeholders-and-budget` (2)
- **q1 — stem:** You are presenting the same PAM funding request to the CFO and to Internal Audit. What should change between the two versions?
  - A. Nothing — the business case should be identical for fairness.
  - B. The framing: the CFO version leads with TCO, ROI, and payback; the Audit version leads with control coverage, evidence, and findings the tool remediates. ✅
  - C. Only the cover slide; the body stays the same.
  - D. The CFO version should hide the cost to improve approval odds.
  - **correctIndex:** 1
  - **explanation:** Stakeholders value different outcomes. Re-framing the same recommendation in each audience's language (dollars/ROI for Finance, control coverage/evidence for Audit) is the core skill — not changing the underlying ask or hiding cost.
- **q2 — stem:** An IAM initiative has SLE = $200,000 and ARO = 0.5. A $40,000/yr tool reduces ARO to 0.1. What is the annual risk-reduction benefit, and does the spend look justified on this metric alone? [VERIFY figures are illustrative]
  - A. Benefit = $80,000/yr (ALE drops $100k → $20k); the $40k spend is justified on risk-reduction alone. ✅
  - B. Benefit = $200,000/yr; spend trivially justified.
  - C. Benefit = $40,000/yr; spend exactly breaks even.
  - D. ALE cannot be computed from SLE and ARO.
  - **correctIndex:** 0
  - **explanation:** ALE = SLE × ARO. Before: $200k × 0.5 = $100k. After: $200k × 0.1 = $20k. Reduction = $80k/yr vs $40k/yr cost — a positive net on this metric. (Real cases also weigh TCO, soft benefits, and uncertainty.)

### `03-metrics-and-rfp` (2)
- **q1 — stem:** Your quarterly access-review campaign reports "100% completed on time, 0 revocations." What is the most likely interpretation a mature program would flag?
  - A. The program is perfect and needs no attention.
  - B. Likely rubber-stamping — reviewers are approving everything without scrutiny; a healthy campaign almost always produces some revocations. ✅
  - C. Access reviews are unnecessary and should be stopped.
  - D. The 0 revocations proves access is provisioned perfectly at the JML stage.
  - **correctIndex:** 1
  - **explanation:** A non-zero revocation rate is evidence reviews are real. 100%/0 is the classic rubber-stamp signature; the KPI to add is revocation rate and reviewer challenge rate, not just completion %.
- **q2 — stem:** You are scoring two IGA vendors with a weighted matrix. Vendor A scores higher on capability but Vendor B is far cheaper and you personally prefer B. How do you keep the selection defensible?
  - A. Override the matrix and pick B; cost always wins.
  - B. Use the disclosed weights and documented rationale; if cost should matter more, that belongs in the weights agreed before scoring, scored independently from technical fit — not as an after-the-fact thumb on the scale. ✅
  - C. Re-score A downward until B wins.
  - D. Cancel the RFP and sole-source to B.
  - **correctIndex:** 1
  - **explanation:** Defensibility comes from agreeing weights up front, scoring technical and cost separately, and documenting rationale. Adjusting scores to fit a preference is exactly the bias the matrix exists to prevent.

### `04-career-architecture` (1)
- **q1 — stem:** You have built maturity-assessment, roadmap, business-case, and RFP-scoring templates for your own bank. How does this best translate into the consulting business?
  - A. It does not — internal templates have no external value.
  - B. Each framework becomes a packaged, billable deliverable (e.g., "IAM maturity assessment," "RFP facilitation") anchored to a niche like regulated community-bank + VOSB/federal IAM. ✅
  - C. Give the templates away free to build goodwill and hope for referrals.
  - D. Sell the raw templates as downloads with no engagement attached.
  - **correctIndex:** 1
  - **explanation:** The repeatable frameworks are the product. Productizing them as fixed-scope deliverables in a defensible niche is the consulting business model; the capability statement markets exactly these competencies.

---

## Wiring tasks

Apply all three edits together (the drift test enforces sync) plus the test-count bump.

**1. `content/modules.json`** — replace the `10-program-leadership` object's empty `sections: []` and drop the "(Phase 3 — Coming)" suffix from the summary:
```json
{
  "id": "10-program-leadership",
  "title": "IAM Program Leadership",
  "phase": 3,
  "order": 10,
  "summary": "Running the program, not just the tools.",
  "sections": [
    "01-maturity-and-roadmap",
    "02-stakeholders-and-budget",
    "03-metrics-and-rfp",
    "04-career-architecture"
  ]
}
```

**2. `lib/sections.ts`** — add four entries to `SECTION_TITLES`:
```ts
'10-program-leadership/01-maturity-and-roadmap': 'IAM Maturity & Roadmap',
'10-program-leadership/02-stakeholders-and-budget': 'Stakeholders & Budget',
'10-program-leadership/03-metrics-and-rfp': 'Metrics & RFP Design',
'10-program-leadership/04-career-architecture': 'IAM Career Architecture',
```
…and add the single SC-300-aligned slug to `SC300_SECTIONS`:
```ts
'10-program-leadership/03-metrics-and-rfp',
```

**3. `lib/content-loader.ts`** — add all four keys to BOTH `AUTHORED_SECTIONS` and `ALL_KNOWN_SECTIONS`, and add four `case`s to `loadAuthoredComponent`:
```ts
case '10-program-leadership/01-maturity-and-roadmap':
  return (await import('@/content/modules/10-program-leadership/01-maturity-and-roadmap.mdx')).default
case '10-program-leadership/02-stakeholders-and-budget':
  return (await import('@/content/modules/10-program-leadership/02-stakeholders-and-budget.mdx')).default
case '10-program-leadership/03-metrics-and-rfp':
  return (await import('@/content/modules/10-program-leadership/03-metrics-and-rfp.mdx')).default
case '10-program-leadership/04-career-architecture':
  return (await import('@/content/modules/10-program-leadership/04-career-architecture.mdx')).default
```

**4. `lib/sections.test.ts`** — the drift test hardcodes the authored-section count. Bump `17` → `21` (the `toHaveLength(17)` assertion and the accompanying comment "17 authored sections"). The title/sc300 sync guards then automatically cover the four new slugs once steps 1-3 are done. Re-run `pnpm test` to confirm green.

**Frontmatter for every section file** — set `status: seeded` to mark these as personalizable scaffolding:
```yaml
---
title: "IAM Maturity & Roadmap"   # match the section H1 / SECTION_TITLES entry
section: 1
module: 10-program-leadership
sc300: false                      # true ONLY for 03-metrics-and-rfp
estimatedMinutes: 22
keywords: [iam-maturity, roadmap, gap-assessment, target-operating-model]
phase: 3
status: seeded
---
```

---

## Diagram

None. `newDiagram = ""`. This module is tables, frameworks, and prose; no `FlowDiagram`-based animation fits. If a future visual is wanted, a static maturity-ladder graphic could be added later, but it is explicitly out of scope here.

---

## Commit plan

**Branch:** `module-10-program-leadership`

One commit per section so each is reviewable, with a final wiring commit (wiring must land last or alongside the first section to keep the build/test green — recommend wiring + section 01 together, then one commit per remaining section):

1. `feat(mod10): scaffold program-leadership module + maturity-and-roadmap section` — adds the three-file wiring (modules.json, sections.ts, content-loader.ts), the `lib/sections.test.ts` count bump (17→21) **plus a temporary stub or the real `01` file**, and `01-maturity-and-roadmap.mdx`. (Wiring + first section together so `pnpm test`/`pnpm build` stay green from the first commit — webpack import cases require the `.mdx` files to exist.)
   - *Alternative if authoring sections across sessions:* land all four `.mdx` files first in one content commit, then the wiring commit — but the static-import `case`s will fail to build until the files exist, so files-before-wiring is the safe order.
2. `feat(mod10): author stakeholders-and-budget section` — `02-stakeholders-and-budget.mdx`.
3. `feat(mod10): author metrics-and-rfp section + SC300 badge` — `03-metrics-and-rfp.mdx` (the only `<SC300Badge />` + `sc300:true` section).
4. `feat(mod10): author career-architecture section (VOSB/SDVOSB positioning)` — `04-career-architecture.mdx`.

After the last commit: run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, confirm all four sections render at `/modules/10-program-leadership/<slug>`, confirm the SC-300 badge shows only on `03`, then merge to `main`. **Per the author's working rules: propose this plan and get explicit approval before executing; do not run git without permission.**

---

## Self-review against the brief
- 4 sections, ~2,700 words each, scaffolding-first (`status: seeded`) — ✅
- Flashcards optional/light (20 total) on frameworks/terms; quizzes light/reflective (6 total) — ✅
- Frameworks cited at high level (CMMI/NIST CSF 2.0/NIST SP 800-30/800-53/800-55/FAIR/SBA VetCert) with `[VERIFY]` on every specific figure, level label, control number, and program rule — ✅
- `newDiagram = ""` — ✅
- Two-file sync + content-loader + the hardcoded test-count bump all specified with exact edits — ✅
- Component prop shapes verified against the actual codebase (Quiz `question={{}}`, Flashcard `front/back`, HoloPanel `label`, parameterless SC300Badge) — ✅
