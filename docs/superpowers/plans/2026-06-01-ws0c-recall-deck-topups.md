# WS0B + 0C — Recall-Deck Top-Ups for Modules 1, 2, 6, 11

**Goal:** Close the Phase-1 recall-deck gaps by adding 15 flashcards to Module 1, 4 to Module 2, 5 cards + 2 quizzes to Module 6, and 7 cards + 5 SC-300 sample quizzes to Module 11 — all as inline-MDX edits to existing sections, with every non-obvious claim cited to a real RFC / NIST SP / Microsoft Learn / vendor doc.

**Architecture note:** This is pure prose/interactive-content authoring inside files that already exist, are already registered in `lib/content-loader.ts`, and already have `lib/sections.ts` + `content/modules.json` entries. `<Flashcard>` and `<Quiz>` tags are extracted at runtime by `lib/content-index.ts` (`extractFlashcards` via `/<Flashcard\b([^>]*?)\/>/g`; quiz prompts via `prompt:\s*"([^"]+)"`). There are NO JSON sidecars and NO new section slugs.

**Prereqs / conventions pointer:**
- **NO two-file sync needed.** Every target slug already exists in both `content/modules.json` (the `sections[]` arrays for `01-foundations`, `02-protocols`, `06-powershell`, `11-cert-roadmap`) and `lib/sections.ts` (`SECTION_TITLES`; the Module 11 slugs are already in `SC300_SECTIONS`). Adding cards/quizzes does not add slugs, so the drift test (`tests`/sections sync) is unaffected. **Do not touch `modules.json`, `lib/sections.ts`, or `lib/content-loader.ts` for this workstream.**
- **NO content-loader wiring needed.** All five files (`AUTHORED_SECTIONS` + import `case`) are already registered (`lib/content-loader.ts:46-113`).
- **Tag-format rules enforced by the extractor — violate these and a card/quiz silently fails to extract:**
  1. `<Flashcard>` MUST be self-closing on a single logical line: `<Flashcard front="..." back="..." />`. The regex is `/<Flashcard\b([^>]*?)\/>/g` with `front="([^"]*)"` / `back="([^"]*)"`.
  2. **No literal double-quote inside `front`/`back`.** The attribute is delimited by `"` and the regex stops at the first `"`. Write code identifiers and values bare (e.g. `Connect-MgGraph -Scopes User.Read.All`) or use `&quot;` (it is decoded by `decodeEntities`). Existing cards follow this — e.g. `06-powershell/01-fundamentals.mdx:154` writes `Connect-MgGraph -Scopes User.Read.All, Group.Read.All` with no quotes.
  3. Apostrophes are fine raw (e.g. `user's`); `&#39;`, `&amp;`, `&lt;`, `&gt;` are all decoded.
  4. `<Quiz>` uses the object form `<Quiz question={{ id: "moduleId/slug/qN", prompt: "...", options: [...], correctIndex: N, explanation: "..." }} />`. `id` MUST be globally unique and follow the existing `${moduleId}/${slug}/q${n}` convention. **Continue the existing q-number sequence per file** (e.g. Module 6 fundamentals already has q1+q2 → new ones are q3, q4).
  5. Inside a `prompt`/`explanation` string you MAY use escaped `\"` (the JS string survives MDX) — see existing `06-powershell/01-fundamentals.mdx:180`. But the search extractor regex `prompt:\s*"([^"]+)"` stops at the first unescaped `"`, so a `\"` inside the prompt truncates the *search-index* title (not the rendered quiz). Prefer single quotes or backticks for inline literals inside prompts, matching existing cookbook quizzes.
- **House-style:** these modules already follow the spec house style. New cards go into the existing `## Recall drill` block of each section (append after the last `<Flashcard>`). New quizzes go into the existing `## Check your understanding` / `## Drill` block (append after the last `<Quiz>`). Module 11 needs a NEW `## Check your understanding` block (it currently has none).
- **Accuracy:** sources cited per card below. Items I could not fully verify from memory carry `[VERIFY]` — the author confirms before publishing.

---

## Section map

> Only sections receiving edits are listed. Word targets here are *deltas* (added recall content), not full-section rewrites — the prose bodies already exceed the ~2,700-word benchmark and are out of scope.

### Module 1 — `01-foundations` (+15 flashcards: 25 → 40)

Distribute the 15 new cards across the three sections so each deck deepens without bloating one file. Proposed split: **identity-crisis +5, lexicon +5, ecosystem-map +5.**

#### `01-foundations/01-identity-crisis` — +5 flashcards (~250 words added)
- **Topics / study material (uncovered angles only — avoid the 8 existing cards on PDP/PEP/CAE/BeyondCorp/per-session):**
  - The seven tenets of NIST 800-207 as an enumerated recall item (existing prose lists them at `01-identity-crisis.mdx:48`; no card pins them). Source: **NIST SP 800-207 §2.1**.
  - Implicit-trust-zone reduction / "assume breach" as a Zero Trust design assumption distinct from "never trust." Source: **NIST SP 800-207 §2** and **Microsoft Zero Trust guidance (aka.ms/zerotrust)** "assume breach / verify explicitly / least privilege" three principles. [VERIFY] the exact three Microsoft principle names.
  - Verizon DBIR as the empirical basis for credential-centric defense (prose cites it at `:28`; no card). Source: **Verizon 2024 DBIR** — stolen credentials remain a top initial-access vector. [VERIFY] exact percentage if a number is used; keep the card qualitative to avoid a stale figure.
  - Operation Aurora → CVE-2010-0249 as the IE zero-day (prose `:26`). Source: **MITRE CVE-2010-0249 / Microsoft Security Advisory 979352**.
  - Trust algorithm: the PDP's decision input set (subject + asset + behavioral + environmental) as a named 800-207 construct. Source: **NIST SP 800-207 §3.3 (Trust Algorithm)**.
- **Components to embed:** 5 `<Flashcard>` appended after `01-identity-crisis.mdx:73`.
- **SC-300 alignment:** Zero Trust framing is SC-900/SC-300 foundational. This slug is NOT in `SC300_SECTIONS` and should stay out (it is framing, not an exam objective). No `<SC300Badge />`.

#### `01-foundations/02-lexicon` — +5 flashcards (~250 words added)
- **Topics (uncovered — existing 10 cover AAA, AuthN vs AuthZ, identity/account, federation/delegation/impersonation, SAML vs OIDC, AAL1-3, claim/attribute/assertion, subject/principal/actor):**
  - RBAC vs ABAC vs ReBAC vs PBAC one-card discriminator (prose `:44-47`; no single recall card). Sources: **NIST SP 800-162 (ABAC)**; **NIST RBAC model / INCITS 359**; **Google Zanzibar paper (2019) for ReBAC**.
  - The "role vs group" distinction that caused the lexicon war story (prose `:24`, `:83`). Source: section's own `<Definition term="role">`/`<Definition term="group">`.
  - Credential rotation does not kill a live session (prose `:65`) — restate as a crisp recall card tying to the four-layer model. Source: **OAuth/OIDC session semantics + Entra `Revoke-MgUserSignInSession`** (Microsoft Learn).
  - Accounting / the third A as the audit-trail layer most under-invested (prose `:49`). Source: **AAA model; NIST SP 800-53 AU control family** for the audit-log mapping.
  - Authentication factor *types* (something you know/have/are) vs assurance *levels* (AAL) — a common conflation; no existing card separates them. Source: **NIST SP 800-63B §4 (AALs) and §5 (authenticator types)**.
- **Components to embed:** 5 `<Flashcard>` appended after `02-lexicon.mdx:102`.
- **SC-300 alignment:** foundational vocabulary; slug not in `SC300_SECTIONS`; keep as-is. No badge.

#### `01-foundations/03-ecosystem-map` — +5 flashcards (~250 words added)
- **Topics (uncovered — existing 7 cover cloud-vs-workforce, JIT, IdP def, IGA def, PAM 3 capabilities, CIAM, directory-vs-IdP):**
  - MDM/UEM as a Zero Trust device-signal source feeding the PDP (prose `:74-76`; no card). Source: **Microsoft Intune compliance → Conditional Access device-state signal (Microsoft Learn)**.
  - Entra Connect (formerly Azure AD Connect) as the directory→IdP sync component in hybrid (prose `:72`). Source: **Microsoft Learn — Microsoft Entra Connect Sync**.
  - SCIM/provisioning as the wire between IGA and downstream apps (ties Module 2's SCIM section to the ecosystem). Source: **RFC 7644** + **Microsoft Entra app provisioning (Learn)**.
  - HashiCorp Vault = secrets management (machine creds/API keys/TLS) vs CyberArk = human privileged-session vaulting; the category boundary (prose `:62`). Source: **HashiCorp Vault docs**; **CyberArk PAM product docs**. [VERIFY] product-scope wording stays vendor-neutral.
  - "Platform vs best-of-breed" as a team-size/operational-overhead tradeoff (prose `:140-148` quiz exists; add a recall card distilling the decision rule). Source: section's own consolidation war story.
- **Components to embed:** 5 `<Flashcard>` appended after `03-ecosystem-map.mdx:108`.
- **SC-300 alignment:** vendor-landscape framing; slug not in `SC300_SECTIONS`; keep as-is. No badge.

### Module 2 — `02-protocols` (+4 flashcards: 46 → 50)

Pick 4 uncovered, high-value topics, one card each, spread across 4 different sections to avoid front-string collisions with the existing 46 (full existing inventory reviewed; see card list below for exact non-overlap).

#### `02-protocols/01-kerberos` — +1 flashcard
- **Topic:** Kerberos delegation types — unconstrained vs constrained (S4U2Self/S4U2Proxy) vs Resource-Based Constrained Delegation (RBCD) — none of the 8 existing cards (Golden/Silver ticket, krbtgt, Kerberoasting, gMSA, 5 messages, PAC) cover delegation. Source: **MS-SFU (Microsoft [MS-SFU] Kerberos S4U extension spec)**; **MS-KILE**; unconstrained-delegation risk per **Microsoft Tier-0 guidance**.
- **Embed:** append after `01-kerberos.mdx:70`.

#### `02-protocols/02-saml` — +1 flashcard
- **Topic:** SAML metadata exchange (entityID, ACS URL, signing cert) as the trust-bootstrap, plus optional XML assertion *encryption* (EncryptedAssertion) vs signing. Existing 8 cards cover XSW, NameID persistent/transient, statement types, SP-vs-IdP initiated, Conditions window, bindings, Response-vs-Assertion signing — none cover metadata. Source: **OASIS SAML 2.0 Metadata spec (saml-metadata-2.0-os)**; **SAML 2.0 Core §6 (encryption)**.
- **Embed:** append after `02-saml.mdx:77`.

#### `02-protocols/05-fido2` — +1 flashcard
- **Topic:** The RP ID (Relying Party Identifier) and origin binding — *why* the browser/authenticator scopes a credential to the RP ID is the mechanism behind FIDO2's phishing resistance at the protocol layer. Existing 7 cards cover resident vs server-side creds, phishing-resistance-vs-TOTP (the *claim*), the two specs, registration vs assertion ceremony, attestation, passkey, UV flag — none pin RP ID / origin binding (the *how*). Source: **W3C WebAuthn Level 2 §5.1.3 / §13 (RP ID, origin validation)**.
- **Embed:** append after `05-fido2.mdx:151`.

#### `02-protocols/06-scim` — +1 flashcard
- **Topic:** SCIM filtering + pagination on the `/Users` query endpoint (`filter=userName eq "..."`, `startIndex`, `count`) — the read side. Existing 7 cards cover PATCH ops, externalId vs id, the two RFCs, CRUD→HTTP map, add vs replace, Entra/app roles, 200-not-sufficient — none cover query/filtering. Source: **RFC 7644 §3.4.2 (Querying Resources) — filtering, sorting, pagination**.
- **Embed:** append after `06-scim.mdx:142`.

### Module 6 — `06-powershell` (+5 flashcards: 25 → 30; +2 quizzes: 6 → 8)

All Module 6 content is **PowerShell-syntax recall** — cite the cmdlet/module for each. Distribute 5 cards + 2 quizzes; keep quiz q-numbers continuing each file's existing sequence (every file currently has q1, q2 → new = q3).

#### `06-powershell/01-fundamentals` — +2 flashcards
- **Topics (uncovered — existing 8 cover Connect-MgGraph -Scopes/403, -UseDeviceCode, Get-MgContext, cert-vs-secret, endsWith+ConsistencyLevel, server-vs-client filter, Disconnect-MgGraph, objects-not-text):**
  - `Find-MgGraphCommand` / `Find-MgGraphPermission` — how to discover which cmdlet maps to a Graph URI and what scope it needs. Source: **Microsoft.Graph.Authentication module — `Find-MgGraphCommand`, `Find-MgGraphPermission` (Microsoft Learn)**.
  - Module surface: `Microsoft.Graph` is a meta-module of sub-modules (e.g. `Microsoft.Graph.Users`, `Microsoft.Graph.Groups`); importing the whole thing is slow — import sub-modules. Source: **Microsoft Graph PowerShell SDK install guidance (Learn)**.
- **Embed:** cards after `01-fundamentals.mdx:161`.

#### `06-powershell/02-cookbook` — +2 flashcards + 1 quiz (q3)
- **Topics (uncovered — existing 10 cover PasswordProfile, Set-MgUserManagerByRef, Update-MgUser -AccountEnabled, New-MgGroup flags, TransitiveMemberOf, Get-MgAuditLogSignIn, Revoke-MgUserSignInSession, role assignment expand, Search-ADAccount, -WhatIf):**
  - `Get-MgUserAppRoleAssignment` / `Get-MgServicePrincipalAppRoleAssignedTo` for who-can-call-what app-permission audits (Recipe 3 territory, no card). Source: **Microsoft.Graph.Applications cmdlets (Learn)**.
  - `Update-MgUser` PATCH semantics — additive vs full-replace and the `-BodyParameter` hashtable splat (Recipe 7 uses it; no card). Source: **Microsoft.Graph.Users `Update-MgUser` (Learn)** + **Graph PATCH semantics**.
  - **Quiz q3:** stale-account audit correctness — `LastLogonDate`/`signInActivity` vs `LastLogon`. Source: **AD `LastLogonTimestamp` replication (~14-day latency) vs per-DC `LastLogon`**; **Graph `signInActivity` requires Entra ID P1/P2 + `AuditLog.Read.All`**.
- **Embed:** cards after `02-cookbook.mdx:325`; quiz after `02-cookbook.mdx:353`.

#### `06-powershell/03-tips-tricks` — +1 flashcard + 1 quiz (q3)
- **Topics (uncovered — existing 7 cover Invoke-Expression, ConvertTo-SecureString, ConvertTo-Json -Depth, ForEach-Object -Parallel, $PSDefaultParameterValues, server-side filter, SecretManagement):**
  - **Card:** `Set-StrictMode -Version Latest` + `$ErrorActionPreference = "Stop"` as the two top-of-script safety defaults (scaffold uses both, `03-tips-tricks.mdx:70-71`; no card). Source: **about_Set-StrictMode / about_Preference_Variables (Learn)**.
  - **Quiz q3:** `SupportsShouldProcess` + `-WhatIf`/`-Confirm` — what `[CmdletBinding(SupportsShouldProcess)]` buys you and why it matters for a destructive bulk script. Source: **about_Functions_CmdletBindingAttribute / about_Functions_Advanced_Methods `ShouldProcess` (Learn)**.
- **Embed:** card after `03-tips-tricks.mdx:271`; quiz after `03-tips-tricks.mdx:298`.

> Module 6 totals after edits: cards 8+2, 10+2, 7+1 = **30**; quizzes 2, 2+1, 2+1 = **8**. ✓

### Module 11 — `11-cert-roadmap` (+7 flashcards: 13 → 20; +5 SC-300 sample quizzes: 0 → 5)

Quizzes are **SC-300 sample exam questions** weighted to the MS exam outline. Per the current SC-300 study guide the four functional groups are (ranges, not exact): identities/groups/external ~20-25%, authentication & access management ~25-30%, app access ~10-15%, identity governance ~25-30% (`01-sc300-roadmap.mdx:51-58`). **[VERIFY] the live percentage ranges and group names against the current "Study guide for Exam SC-300" before publishing — they revise periodically.** Map the 5 sample questions to that weighting:
- Q1 — Authentication & access management (Conditional Access) — highest-weight group.
- Q2 — Identity governance (PIM eligible vs active / JIT).
- Q3 — Identity governance (Entitlement Management — access packages / catalogs / connected orgs).
- Q4 — Identities/external (B2B guest vs B2C / External ID).
- Q5 — App access (service principal vs managed identity vs app registration).

This gives 2 governance, 1 auth/access, 1 identities/external, 1 app access — matching the "governance + auth carry the majority" pattern stated in the section.

#### `11-cert-roadmap/01-sc300-roadmap` — +4 flashcards + 5 quizzes
- **Flashcard topics (uncovered — existing 8 cover the 4 functional groups, SC-300 cost/time, the 4-cert sequence, SC-300 job tasks, lab-first, SC-900 prereq, CISSP-last, 80% readiness):**
  - SC-900 vs SC-300 vs SC-100 positioning — fundamentals vs associate vs expert (SC-100 = Cybersecurity Architect Expert). Source: **Microsoft Learn certification catalog**. [VERIFY] SC-100 is current/active.
  - Security+ SY0-701 domain that is hardest for IAM specialists (Security Operations, 28%) — already in prose `:88`; no card. Source: **CompTIA SY0-701 exam objectives**.
  - CISSP experience requirement (5 years across ≥2 of 8 CBK domains; Associate of ISC2 otherwise) — prose `:110`; no card. Source: **ISC2 CISSP certification requirements**.
  - SC-300 question formats to expect (case studies / drag-drop sequencing / build-list) and the no-back-navigation case-study behavior. Source: **Microsoft exam format / "About exams" (Learn)**. [VERIFY] case-study back-navigation rule.
- **Quiz topics (SC-300 sample questions, 5):** see drafted Q1-Q5 below.
- **Components to embed:** 4 `<Flashcard>` appended after `01-sc300-roadmap.mdx:146`; a **new `## Check your understanding`** block (this file has none) holding 5 `<Quiz>` blocks, inserted after the Recall drill block (after the new flashcards, before EOF).
- **SC-300 alignment:** slug IS in `SC300_SECTIONS` already (`lib/sections.ts:51`). The 5 quizzes ARE SC-300 sample items. **Optionally render `<SC300Badge />`** at the top of the new quiz block — but `<SC300Badge />` rollout is **Workstream 0D's** job (component used in zero files today; see roadmap `0D`). To avoid overlap, this plan does NOT add the badge; leave a one-line author note in the commit body that 0D will tag this section. `sc300` flag already set — no `lib/sections.ts` change.

#### `11-cert-roadmap/02-study-strategy` — +3 flashcards
- **Flashcard topics (uncovered — existing 5 cover 80% rule, Ebbinghaus, review cadence, active recall/Feynman, diagnostic-vs-calibration):**
  - Interleaving vs blocked practice as a retention technique distinct from spaced repetition. Source: **cognitive-science literature on interleaving (Rohrer & Taylor); Make It Stick (Brown, Roediger, McDaniel)**. [VERIFY] attribution if named.
  - Pearson VUE OnVUE proctoring gotcha distilled to a recall card (second-monitor-HDMI / install-48h-early) — prose `:91-97`; no card. Source: **Pearson VUE OnVUE system requirements**. [VERIFY] vendor (confirm Microsoft/CompTIA/ISC2 all route through Pearson VUE at publish time).
  - Post-exam logging window (the 20 minutes after submit) + fail→domain-breakdown→targeted-drill loop — prose `:109-115`; no card. Source: section's own guidance.
- **Components to embed:** 3 `<Flashcard>` appended after `02-study-strategy.mdx:133`.
- **SC-300 alignment:** slug already in `SC300_SECTIONS` (`lib/sections.ts:52`). No quiz added here. No badge (defer to 0D).

> Module 11 totals after edits: cards 8+4, 5+3 = **20**; quizzes 5+0 = **5**. ✓

---

## Flashcards (drafted)

> Paste each block verbatim into the section's `## Recall drill` list, after the last existing `<Flashcard>`. Numbering here is for review only; it is not part of the tag.

### Module 1 — `01-foundations/01-identity-crisis` (5)
1. front: `What are the seven tenets of NIST SP 800-207, summarized?` → back: `(1) All data sources and services are resources; (2) all communication is secured regardless of network location; (3) access is granted per-session; (4) access is determined by dynamic policy; (5) the org monitors the posture of all owned and associated assets; (6) authentication and authorization are dynamic and strictly enforced before access; (7) the org collects telemetry to continuously improve security posture.` [src: NIST SP 800-207 §2.1]
2. front: `Zero Trust is built on three guiding principles in Microsoft's model — what are they?` → back: `Verify explicitly (authenticate and authorize on all available signals), use least-privilege access (just-in-time and just-enough access, risk-based adaptive policy), and assume breach (segment, minimize blast radius, verify end-to-end encryption, use analytics for detection). These operationalize NIST 800-207.` [src: Microsoft Zero Trust guidance, aka.ms/zerotrust] [VERIFY exact principle wording]
3. front: `Why does the credential-theft trend make the network perimeter actively harmful for detection?` → back: `When an attacker logs in with valid stolen credentials from outside, the firewall passes the traffic as legitimate and any alert on that traffic looks like a false positive. Stolen credentials are consistently a leading initial-access vector in the Verizon DBIR, so trusting network location hides the very access you most need to catch.` [src: Verizon DBIR; NIST 800-207]
4. front: `What was the CVE behind Operation Aurora, and why does it matter to the identity-perimeter story?` → back: `CVE-2010-0249, an Internet Explorer zero-day delivered via spear-phishing that let attackers pivot from a compromised endpoint into internal systems. It pushed Google to build BeyondCorp — the first production Zero Trust architecture — proving network-location trust was indefensible.` [src: MITRE CVE-2010-0249 / MS Security Advisory 979352]
5. front: `In NIST 800-207, what is the Trust Algorithm and what inputs feed it?` → back: `The Trust Algorithm is the process the Policy Decision Point uses to grant, deny, or revoke access. Its inputs are the access request, subject identity and attributes, asset/device state, resource policy requirements, and threat-intel/behavioral and environmental signals. The decision is a confidence evaluation, not a static rule lookup.` [src: NIST SP 800-207 §3.3]

### Module 1 — `01-foundations/02-lexicon` (5)
1. front: `Distinguish RBAC, ABAC, ReBAC, and PBAC in one line each.` → back: `RBAC grants permissions through roles assigned to subjects (NIST/INCITS 359). ABAC evaluates permissions at runtime from subject, resource, and environment attributes (NIST SP 800-162). ReBAC derives permissions from a relationship graph between subjects and objects (Google Zanzibar). PBAC treats named policies as first-class objects, often used interchangeably with ABAC when the policy language is admin-facing.` [src: NIST SP 800-162; INCITS 359; Zanzibar 2019]
2. front: `Why is a role not the same as a group, and what is the layering between them?` → back: `A group bundles subjects (who is included); a role bundles permissions (what operations are allowed). The normal layering is: assign a role to a group, and users inherit the role by group membership. Treating a permission-bundle role as a membership group — or vice versa — is the vocabulary error that produces unscoped privilege grants.` [src: §02-lexicon Definitions]
3. front: `Why does rotating a credential not, by itself, terminate an attacker's active session?` → back: `The credential, account, identity, and session are four separate layers. Rotation replaces only the credential; an already-issued token, cookie, or Kerberos TGT is a session artifact with its own lifetime and stays valid until it expires or is explicitly revoked. In Entra ID you must also run Revoke-MgUserSignInSession (and ideally disable the account) to cut live sessions.` [src: NIST 800-63B; MS Learn Revoke-MgUserSignInSession]
4. front: `What does the Accounting A in AAA provide, and which NIST 800-53 control family maps to it?` → back: `Accounting (audit) is the log of every access event — successful authentications, failed authorizations, and resource operations — used for forensic reconstruction and compliance evidence. It maps to the NIST SP 800-53 AU (Audit and Accountability) control family. It is the most under-invested A and the one that saves you in a breach or SOX review.` [src: AAA model; NIST SP 800-53 AU family]
5. front: `What is the difference between an authentication factor type and an authentication assurance level?` → back: `A factor type is the category of evidence — something you know (password/PIN), something you have (token/passkey), something you are (biometric). An assurance level (AAL1/2/3 in NIST 800-63B) is the strength tier a combination achieves: AAL2 needs two distinct factor types, AAL3 additionally requires a phishing-resistant hardware authenticator. Having more factors does not raise the AAL unless they satisfy the level's requirements.` [src: NIST SP 800-63B §4-5]

### Module 1 — `01-foundations/03-ecosystem-map` (5)
1. front: `How does MDM/UEM feed a Zero Trust access decision?` → back: `The MDM/UEM platform (Intune, Jamf) reports device posture — managed, compliant, encrypted, patch level, EDR present — to the IdP. The IdP's policy engine (Conditional Access) gates access on that device signal, and a device falling out of compliance mid-session can trigger a near-real-time block via Continuous Access Evaluation.` [src: MS Learn Intune compliance + Conditional Access device state]
2. front: `What does Microsoft Entra Connect do, and why is it central to hybrid identity?` → back: `Entra Connect (formerly Azure AD Connect) synchronizes on-prem Active Directory objects and (optionally) password hashes up to Entra ID, so the cloud IdP can authenticate identities mastered on-prem. It is the bridge that makes the on-prem directory the data source the cloud IdP reads — the directory-vs-IdP distinction made concrete in a hybrid estate.` [src: MS Learn — Microsoft Entra Connect Sync]
3. front: `Which protocol connects the IGA layer to downstream SaaS apps for lifecycle provisioning?` → back: `SCIM 2.0 (RFC 7643 schema, RFC 7644 protocol). IGA decides who should have access; SCIM is the wire that pushes create/update/deactivate operations into the SaaS app. In Microsoft Entra, app provisioning acts as the SCIM client and the SaaS app exposes the SCIM endpoint.` [src: RFC 7643/7644; MS Learn app provisioning]
4. front: `What is the category boundary between HashiCorp Vault and a PAM tool like CyberArk?` → back: `Vault is secrets management — it stores and dynamically issues machine secrets like API keys, database credentials, and TLS certificates for applications and pipelines. CyberArk-class PAM focuses on human privileged access — vaulting privileged account passwords, brokering and recording privileged sessions, and JIT elevation. They overlap at the edges but solve different primary problems.` [src: HashiCorp Vault docs; CyberArk PAM docs] [VERIFY scope wording]
5. front: `What is the core decision rule for platform-suite versus best-of-breed IAM?` → back: `It is primarily a team-size and operational-overhead calculation. Best-of-breed gives deeper capability per category but requires integrating and supporting multiple enterprise products with separate APIs, release cycles, and skill sets. A small team should usually accept a single-vendor suite's shallower depth in exchange for lower operational complexity; a large team that can realize the depth can justify best-of-breed.` [src: §03-ecosystem-map consolidation war story]

### Module 2 — protocols (4, one per section)
- `02-protocols/01-kerberos` — front: `What are the three Kerberos delegation models, and which is the most dangerous?` → back: `Unconstrained delegation lets a service impersonate a user to ANY service (the front-end caches the user's forwardable TGT) — the most dangerous, because compromising that host yields tickets to everything. Constrained delegation (S4U2Self/S4U2Proxy, MS-SFU) limits impersonation to a specified list of target SPNs. Resource-Based Constrained Delegation (RBCD) moves the trust list onto the target resource object itself. Prefer constrained or RBCD; eliminate unconstrained on anything Tier-0-adjacent.` [src: MS-SFU; MS-KILE; Microsoft Tier-0 guidance]
- `02-protocols/02-saml` — front: `What does SAML metadata exchange establish, and how does assertion encryption differ from signing?` → back: `Metadata (OASIS SAML 2.0 Metadata) carries each party's entityID, endpoints (the SP's Assertion Consumer Service URL), and signing/encryption certificates — it bootstraps the IdP-SP trust without manual key sharing. Signing (XML Signature) provides integrity and authenticity of the Response/Assertion; encryption (EncryptedAssertion, SAML Core §6) provides confidentiality so intermediaries cannot read the claims. Signing proves who sent it; encryption hides what it says.` [src: OASIS SAML 2.0 Metadata; SAML 2.0 Core §6]
- `02-protocols/05-fido2` — front: `What is the RP ID in WebAuthn, and why is it the mechanism behind FIDO2 phishing resistance?` → back: `The RP ID (Relying Party Identifier) is the registrable domain a credential is scoped to. The browser binds each assertion to the caller's origin and will only release a credential whose RP ID matches that origin, and the authenticator signs over collected client data including the origin. A phishing site on a different domain cannot satisfy the RP ID/origin check, so the credential is never released — the protocol enforces phishing resistance, not the user.` [src: W3C WebAuthn Level 2 §5.1.3, §13.4.x]
- `02-protocols/06-scim` — front: `How do you query and page SCIM users, and which RFC defines the filter syntax?` → back: `RFC 7644 §3.4.2 defines querying: GET /Users?filter=userName eq &quot;ada@contoso.com&quot; with operators like eq, ne, co, sw, and and. Pagination uses startIndex (1-based) and count, and the response wraps results with totalResults, itemsPerPage, and startIndex. Sorting uses sortBy and sortOrder. Use server-side filtering to avoid pulling the entire resource collection.` [src: RFC 7644 §3.4.2]

### Module 6 — `06-powershell/01-fundamentals` (2)
1. front: `How do you discover which Microsoft Graph PowerShell cmdlet maps to a Graph API URI and what permission it needs?` → back: `Use Find-MgGraphCommand -Uri /users/{id} (or -Command Get-MgUser) to find the cmdlet, API version, and required permissions, and Find-MgGraphPermission user.read to search the permission catalog. Both ship in Microsoft.Graph.Authentication, so they work as soon as the SDK is installed — before you guess at scopes.` [src: MS Learn — Find-MgGraphCommand, Find-MgGraphPermission]
2. front: `Why import Microsoft.Graph sub-modules instead of the whole Microsoft.Graph meta-module?` → back: `Microsoft.Graph is a meta-module that pulls in dozens of sub-modules; importing all of them is slow and memory-heavy. Import only what a script uses — for example Import-Module Microsoft.Graph.Users, Microsoft.Graph.Groups — or declare them with a #Requires -Modules line. Connect-MgGraph lives in Microsoft.Graph.Authentication, which the sub-modules depend on.` [src: MS Learn — Graph PowerShell SDK install/usage]

### Module 6 — `06-powershell/02-cookbook` (2)
1. front: `Which cmdlets show what application permissions an app or service principal holds, for an OAuth consent audit?` → back: `Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId lists the app-role (application) permissions a service principal has been granted, and Get-MgServicePrincipalOauth2PermissionGrant lists its delegated permission grants. Get-MgUserAppRoleAssignment shows app roles assigned to a user. Together they answer who-can-call-what for the OAuth app-consent attack surface.` [src: MS Learn — Microsoft.Graph.Applications cmdlets]
2. front: `How does Update-MgUser apply changes — full replace or partial — and how do you pass the body?` → back: `Update-MgUser issues a Graph PATCH, so it updates only the properties you supply and leaves the rest untouched (partial update). Pass them as parameters (Update-MgUser -UserId x -Department Finance) or splat a hashtable: $body = @{ Department = 'Finance'; JobTitle = 'Analyst' }; Update-MgUser -UserId x @body. Navigation properties like manager are set separately via their own -ByRef cmdlets.` [src: MS Learn — Update-MgUser; Graph PATCH semantics]

### Module 6 — `06-powershell/03-tips-tricks` (1)
1. front: `What two preference settings belong at the top of a production IAM script, and what does each do?` → back: `Set-StrictMode -Version Latest catches uninitialized variables, references to non-existent properties, and bad function-call syntax that would otherwise fail silently. $ErrorActionPreference = 'Stop' promotes non-terminating errors to terminating so a failed cmdlet actually enters your try/catch instead of logging and continuing — critical in a scheduled task where nobody watches the output.` [src: MS Learn — about_Set-StrictMode, about_Preference_Variables]

### Module 11 — `11-cert-roadmap/01-sc300-roadmap` (4)
1. front: `Where do SC-900, SC-300, and SC-100 sit in Microsoft's certification tiers?` → back: `SC-900 (Security, Compliance, and Identity Fundamentals) is a fundamentals-level familiarity exam. SC-300 (Identity and Access Administrator) is associate-level and the IAM practitioner cert. SC-100 (Cybersecurity Architect) is expert-level and assumes a prior associate cert. For an IAM day job, SC-300 is the anchor; SC-100 is a later architect-track goal.` [src: Microsoft Learn certification catalog] [VERIFY SC-100 status]
2. front: `Which Security+ SY0-701 domain is hardest for a pure IAM practitioner, and what is its weight?` → back: `Security Operations, weighted ~28% — the largest domain. It covers detection, incident response, monitoring, and SecOps tooling that an identity specialist touches less day-to-day. Lean into it; it is also the vocabulary CISSP later assumes.` [src: CompTIA SY0-701 exam objectives]
3. front: `What is the CISSP experience requirement, and what happens without it?` → back: `Five years of cumulative paid work experience across two or more of the eight CISSP CBK domains (one year is waivable with an approved degree or credential). Pass the exam without the experience and you become an Associate of ISC2, with up to six years to earn and document it; you also need endorsement by an existing ISC2-certified member to finalize the CISSP.` [src: ISC2 CISSP certification requirements] [VERIFY current waiver/Associate window]
4. front: `What question formats should you expect on SC-300?` → back: `Standard multiple-choice and multiple-response, plus case studies (a scenario with several linked questions), drag-and-drop sequencing, and build-list/ordering items. Case-study sections typically restrict navigation back to earlier scenarios once you move on, so read the full scenario before answering.` [src: Microsoft Learn — exam formats / About exams] [VERIFY case-study navigation rule]

### Module 11 — `11-cert-roadmap/02-study-strategy` (3)
1. front: `What is interleaving, and how does it differ from spaced repetition?` → back: `Interleaving means mixing different topics or problem types within a study session rather than blocking one topic until mastery. It forces your brain to repeatedly retrieve which approach applies, improving discrimination and transfer. Spaced repetition controls WHEN you review; interleaving controls the ORDER and MIX within a session — they are complementary.` [src: Rohrer & Taylor; Make It Stick] [VERIFY attribution]
2. front: `What are the two OnVUE online-proctoring rules that most often disqualify candidates?` → back: `A second monitor that is merely powered off is not enough — if it is still connected (e.g. via HDMI) the proctoring software detects it and ends the session, so physically unplug it. And install/run the OnVUE client and system check ~48 hours before the exam, not the morning of, so a failed check does not burn your slot. The certs in this track schedule through Pearson VUE.` [src: Pearson VUE OnVUE system requirements] [VERIFY all three vendors route through Pearson VUE at publish]
3. front: `What should you do in the 20 minutes after submitting a cert exam, and how do you use a failed attempt?` → back: `Immediately log which topic areas felt hardest and which question types surprised you — that window is your highest-fidelity recall of the live exam and seeds your next study plan. On a fail, save the domain-breakdown score report, convert weak domains into targeted flashcard drilling, take 2-3 days to build the plan, then rebook (most who remediate and resit within 60-90 days pass).` [src: §02-study-strategy guidance]

---

## Quiz (drafted)

> Object form. Append after the last existing `<Quiz>` in each file's quiz block. Continue the file's q-number sequence. Keep inline literals in single quotes/backticks (not `\"`) so the search extractor captures the full prompt.

### Module 6 — `06-powershell/02-cookbook` — q3
- id: `06-powershell/02-cookbook/q3`
- prompt: `You need a quarterly report of accounts that have not signed in for 90+ days, across both on-prem AD and Entra ID. A teammate filters AD on the LastLogon attribute and Entra on a cached property. What is the correct, accurate source for each side?`
- options:
  1. `Use LastLogon in AD (it is replicated to every DC) and the user's whenCreated date in Entra ID.`
  2. `Use LastLogonDate / LastLogonTimestamp in AD (replicated, ~14-day latency) or Search-ADAccount -AccountInactive, and signInActivity.LastSignInDateTime in Entra ID via Get-MgUser, which requires Entra ID P1/P2 and AuditLog.Read.All.`
  3. `Use LastLogon in AD and signInActivity in Entra ID; both are real-time and need no special licensing.`
  4. `Use pwdLastSet in AD and lastPasswordChangeDateTime in Entra ID, since password age is the best proxy for inactivity.`
- correctIndex: 1
- explanation: `LastLogon is per-DC and NOT replicated, so it is wrong for a domain-wide report; use the replicated LastLogonDate/LastLogonTimestamp (note its ~14-day replication latency) or the purpose-built Search-ADAccount -AccountInactive. In Entra ID, signInActivity.LastSignInDateTime is the correct sign-in source but it requires a Microsoft Entra ID P1/P2 license and the AuditLog.Read.All permission. Password age (pwdLastSet) measures a different thing entirely.` [src: AD LastLogonTimestamp replication; MS Learn signInActivity licensing/permissions]

### Module 6 — `06-powershell/03-tips-tricks` — q3
- id: `06-powershell/03-tips-tricks/q3`
- prompt: `You are hardening a script that bulk-disables accounts from a CSV. You add [CmdletBinding(SupportsShouldProcess)] to the script and wrap the disable call in if ($PSCmdlet.ShouldProcess($upn)) { ... }. What does this give you?`
- options: 
  1. `It automatically encrypts any credentials the script handles.`
  2. `It enables -WhatIf and -Confirm on your script for free: -WhatIf prints what each account change WOULD do without making it, and -Confirm prompts per item before acting — the safe way to dry-run a destructive bulk change.`
  3. `It forces the script to run only in PowerShell 7+ and blocks 5.1.`
  4. `It makes all non-terminating errors terminating, replacing $ErrorActionPreference = 'Stop'.`
- correctIndex: 1
- explanation: `Declaring SupportsShouldProcess and gating actions with $PSCmdlet.ShouldProcess() opts your script into the common risk-mitigation parameters -WhatIf and -Confirm. -WhatIf performs a dry run (each gated action reports what it would change), and -Confirm prompts before each action. This is the standard pattern for previewing a destructive bulk operation before it touches live accounts. It does not handle credentials, set a version floor (that is #Requires -Version), or change error action (that is $ErrorActionPreference).` [src: MS Learn — about_Functions_CmdletBindingAttribute, ShouldProcess]

### Module 11 — `11-cert-roadmap/01-sc300-roadmap` — q1 (Authentication & access management)
- id: `11-cert-roadmap/01-sc300-roadmap/q1`
- prompt: `Your organization must block access to Microsoft 365 from outside the corporate countries and require multifactor authentication for all administrators, but a break-glass emergency account must never be locked out by policy. Which Entra ID Conditional Access design is correct?`
- options:
  1. `Create one policy that requires MFA for all users including the break-glass account, and rely on the account's strong password as the exception.`
  2. `Create a named-location-based policy that blocks sign-ins outside the allowed countries, plus a policy requiring MFA for the administrator roles, and EXCLUDE the break-glass account(s) from both policies; monitor those accounts with alerts.`
  3. `Apply MFA at the per-user MFA settings page instead of Conditional Access so it does not affect the break-glass account.`
  4. `Disable Conditional Access and use Security Defaults, which already enforce all of these requirements.`
- correctIndex: 1
- explanation: `Conditional Access uses named locations to scope by country, can target the administrator directory roles for MFA, and supports user/group EXCLUSIONS — the supported way to keep break-glass (emergency access) accounts out of policies that could lock everyone out. Microsoft explicitly recommends excluding break-glass accounts from CA policies and monitoring them. Per-user legacy MFA is being deprecated in favor of CA; Security Defaults are all-or-nothing and cannot express country blocks or per-role rules.` [src: MS Learn — Conditional Access, named locations, emergency access accounts]

### Module 11 — `11-cert-roadmap/01-sc300-roadmap` — q2 (Identity governance — PIM)
- id: `11-cert-roadmap/01-sc300-roadmap/q2`
- prompt: `A Global Administrator wants to grant a help-desk lead the ability to perform Helpdesk Administrator tasks only when needed, with approval and a time limit, instead of a permanent assignment. Which Microsoft Entra capability and assignment type meet this?`
- options:
  1. `Assign the role permanently (active) and rely on access reviews to remove it later.`
  2. `Use Privileged Identity Management (PIM) to make the user ELIGIBLE for the Helpdesk Administrator role, configured to require activation with approval and an expiring activation window (just-in-time).`
  3. `Add the user to a security group that is a member of the Global Administrator role.`
  4. `Use a Conditional Access policy to grant the role at sign-in.`
- correctIndex: 1
- explanation: `Privileged Identity Management distinguishes ELIGIBLE assignments (the user must activate the role just-in-time, optionally with MFA, justification, approval, and a maximum activation duration) from ACTIVE/permanent assignments. Making the help-desk lead eligible for Helpdesk Administrator delivers JIT, time-bound, approval-gated access — the least-standing-privilege answer. A permanent assignment, a nested GA group, and Conditional Access do not provide JIT role activation.` [src: MS Learn — Microsoft Entra PIM, eligible vs active assignments]

### Module 11 — `11-cert-roadmap/01-sc300-roadmap` — q3 (Identity governance — Entitlement Management)
- id: `11-cert-roadmap/01-sc300-roadmap/q3`
- prompt: `External partner users need self-service request access to a bundle of groups, a SharePoint site, and an app, with manager approval and automatic expiry after 180 days, governed in one place. Which Entra Identity Governance feature is designed for this?`
- options:
  1. `A dynamic membership group with a rule based on the partners' domain.`
  2. `Entitlement Management: publish an access package (in a catalog) that bundles the groups, site, and app, scope it to a connected organization for the partner, and configure an access-request policy with approval and a 180-day expiration.`
  3. `A Conditional Access policy that grants the resources to guest users.`
  4. `An access review that re-grants the resources every 180 days.`
- correctIndex: 1
- explanation: `Entitlement Management is built exactly for this: an access PACKAGE bundles resource roles (groups, SharePoint sites, apps) inside a CATALOG, access-request POLICIES define who can request and the approval flow, lifecycle settings set expiration/auto-removal, and CONNECTED ORGANIZATIONS let external partners self-request. Dynamic groups automate membership but do not bundle multi-resource self-service with approval and expiry; CA gates access but does not provision it; access reviews recertify existing access rather than granting bundles.` [src: MS Learn — Entra Entitlement Management: access packages, catalogs, connected organizations]

### Module 11 — `11-cert-roadmap/01-sc300-roadmap` — q4 (Identities & external)
- id: `11-cert-roadmap/01-sc300-roadmap/q4`
- prompt: `A company wants employees of a partner firm to sign in to an internal app using their OWN organization's credentials, and separately wants to build a consumer-facing app where millions of customers self-register. Which Entra External ID models fit each need?`
- options:
  1. `Use B2B collaboration (guest invitations / cross-tenant access) for the partner employees, and Entra External ID for customers (the consumer/CIAM model, succeeding Azure AD B2C) for the consumer app.`
  2. `Use Azure AD B2C for both the partners and the consumers.`
  3. `Create internal member accounts in your own tenant for every partner employee and every consumer.`
  4. `Use B2B collaboration for both scenarios.`
- correctIndex: 0
- explanation: `B2B collaboration invites partner users as guests who authenticate with their home-tenant credentials (governed by cross-tenant access settings) — the right fit for partner-employee access to an internal app. The consumer scenario is CIAM: Microsoft Entra External ID for customers (the successor to Azure AD B2C) is purpose-built for self-service registration, social identities, and consumer scale. Creating member accounts for everyone defeats federation and does not scale to millions.` [src: MS Learn — Entra External ID, B2B collaboration, External ID for customers] [VERIFY B2C-to-External-ID naming at publish]

---

## Wiring tasks

**None.** This workstream is content-only and touches no wiring files:
- `content/modules.json` — **no change** (no new slugs; all five sections already listed).
- `lib/sections.ts` — **no change** (`SECTION_TITLES` already has all five; `SC300_SECTIONS` already contains both Module 11 slugs at lines 51-52; Modules 1/2/6 sections are intentionally NOT SC-300-flagged and stay that way — `<SC300Badge />` rollout is Workstream 0D).
- `lib/content-loader.ts` — **no change** (`AUTHORED_SECTIONS` + import cases already present, lines 46-113).
- `lib/recipes.ts` — **no change** (Module 6 additions are recall cards/quizzes, not new `<CommandReference>` recipes).

The only files edited are the five `.mdx` files:
- `content/modules/01-foundations/01-identity-crisis.mdx`
- `content/modules/01-foundations/02-lexicon.mdx`
- `content/modules/01-foundations/03-ecosystem-map.mdx`
- `content/modules/02-protocols/01-kerberos.mdx`, `02-saml.mdx`, `05-fido2.mdx`, `06-scim.mdx`
- `content/modules/06-powershell/01-fundamentals.mdx`, `02-cookbook.mdx`, `03-tips-tricks.mdx`
- `content/modules/11-cert-roadmap/01-sc300-roadmap.mdx`, `02-study-strategy.mdx`

**Verification per commit (no new test files needed — these are exercised by existing content-index tests):**
1. `pnpm test` — the content-index extraction tests parse every `<Flashcard>`/`<Quiz>`; a malformed tag (stray literal `"`, non-self-closing, duplicate quiz id) will surface here or in a count assertion.
2. After all edits, confirm extracted counts match targets. Quick local check (mirrors the extractor's intent):
   - Module 1: `40` `<Flashcard front=` across the 3 files.
   - Module 2: `50` total across the 6 files.
   - Module 6: `30` cards + `8` `<Quiz question=`.
   - Module 11: `20` cards + `5` `<Quiz question=`.
3. `pnpm build` — MDX must compile (an unescaped brace or broken JSX fails the build).
4. Spot-check the rendered section pages and the global flashcard deck so the new cards appear and quiz ids do not collide.

---

## Diagram

**None.** No new diagram is required for any recall-deck top-up. (New-diagram engineering is tracked in the roadmap §4 / the diagrams plan doc, and applies to Modules 4/5/7 only.)

---

## Commit plan

One commit per module (logical group), on a single feature branch. Each commit is independently green (`pnpm test` + `pnpm build`).

**Branch:** `content/ws0c-recall-topups`

1. `content(mod1): +15 foundations flashcards (25 -> 40)` — edits to the three `01-foundations` files.
2. `content(mod2): +4 protocols flashcards (46 -> 50)` — edits to kerberos/saml/fido2/scim.
3. `content(mod6): +5 powershell cards +2 quizzes (25->30, 6->8)` — edits to the three `06-powershell` files.
4. `content(mod11): +7 cert-roadmap cards +5 SC-300 sample quizzes (13->20, 0->5)` — edits to both `11-cert-roadmap` files. Commit body note: "Section already sc300-flagged; <SC300Badge /> tagging deferred to Workstream 0D."

Resolve all `[VERIFY]` markers before the relevant commit (most are in Modules 1 and 11). After merge, tick Workstream 0B and the 0C Module-1/2/6/11 rows in the roadmap index (separate doc; not edited here).
