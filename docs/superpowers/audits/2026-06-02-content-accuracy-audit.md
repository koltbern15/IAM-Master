# IAM Mastery — Content Accuracy Audit (2026-06-02)

**Scope:** Source-verified fact-check of the 44 AI-seeded Phase 2/3 sections (modules 04, 05, 07, 08, 09, 10, 12). Phase 1 modules (01, 02, 03, 06, 11) were authored earlier and were not re-audited in this pass.

**Why:** Phases 2/3 content was AI-drafted and web-checked during authoring but never given a human SME pass. This audit hunts the failure mode that authoring misses: specific, falsifiable details (ports, dates, requirement IDs, product architecture, cert objective names, command syntax) that are wrong in a way only primary-source verification catches.

## Method (two independent passes + apply)

1. **Audit** — one SME-grade fact-checker per section, batched 4 at a time (rate-limit safe), each web-verifying every falsifiable claim against authoritative primary sources (vendor docs, NIST, PCI SSC, PCAOB, FFIEC, IETF, official cert pages). **719 discrete claims checked across 44 sections.**
2. **Adversarial verify** — every flagged finding re-checked by a *second, independent* agent that did its own primary-source lookup rather than trusting the first. This is what kept a wrong "correction" out of your content (see f16 below).
3. **Apply** — only double-confirmed, unambiguous corrections were written to the MDX. Each verified error was also swept for **recurrences** elsewhere and fixed consistently.

## Results

- **719 claims checked → 32 flagged → 31 confirmed wrong → 1 refuted (kept as-is).**
- Curriculum accuracy on the seeded content: **~95.6%** of checked claims were correct as written.
- **31 corrections applied** across **17 files** (some errors recurred, so 35 individual edits).
- **All gates green after edits:** `typecheck` ✓ · `lint` ✓ · **265 tests** ✓ · production build ✓.
- Structural integrity re-checked: 516 flashcards / 127 quizzes still parse cleanly; no extraction-breaking quotes introduced.

---

## Fixes applied — by module

### Module 4 — PAM *(your Richwood lane)*
| Section | Was | Now | Source |
|---|---|---|---|
| 04-hashicorp-vault | Security+ objective "4.1 — secrets management" | **1.4 — key management** (4.1 is computing-resource hardening; secrets mgmt isn't an SY0-701 objective) | CompTIA SY0-701 Objectives v5.0 |
| 04-hashicorp-vault | "master key" (×3: prose, definition, flashcard) | **"root key"** — HashiCorp's current term; first use notes the old name | developer.hashicorp.com/vault |

### Module 5 — IGA
| Section | Was | Now | Source |
|---|---|---|---|
| 05-entra-id-governance | "richer Lifecycle Workflows automation" implied LCW exists at P2 | The **entire Lifecycle Workflows feature** requires the ID Governance add-on / Entra Suite — none at P2 (prose + flashcard) | learn.microsoft.com ID Governance licensing |

### Module 7 — Cloud IAM
| Section | Was | Now | Source |
|---|---|---|---|
| 01-aws-iam | "the **two** finding types in IAM Access Analyzer" | Three: external, **internal**, and unused access | docs.aws.amazon.com Access Analyzer |
| 02-azure-rbac | Deny assignments "created by … Azure Policy, Defender for Cloud" | Removed those — Policy/Defender use a separate **Deny effect**, not RBAC deny assignments (prose + flashcard) | learn.microsoft.com deny-assignments |
| 05-ciem | Entra Permissions Management described as a current product | Past tense + **retired Nov 1 2025** (end of sale Apr 1 2025); kept as concept reference (product desc + flashcard) | MS Learn (archived) |

### Module 8 — Security & Threat Detection
| Section | Was | Now | Source |
|---|---|---|---|
| 04-kql-identity-hunting | `make-set()` | `make_set()` (KQL has no hyphenated form; rest of file already correct) | learn.microsoft.com KQL |
| 05-identity-incident-response | krbtgt script "New-KrbtgtHistory" | **New-KrbtgtKeys.ps1** (the "New-KrbtgtHistory" name was fabricated) + community Reset-KrbTgt script | github.com/microsoftarchive |

### Module 9 — Compliance *(your audit lane)*
| Section | Was | Now | Source |
|---|---|---|---|
| 01-control-frameworks | "authentication was promoted into the [CSF] category name in 2.0" | PR.AC in **1.1 already** said "Identity Management, **Authentication** and Access Control"; the real change was the ID (PR.AC→PR.AA) + subcategory reorg (prose + flashcard) | csf.tools NIST CSF 1.1 |
| 04-iam-controls-matrix | "AC-2(3) Disable **Inactive** Accounts" | "AC-2(3) **Disable Accounts**" (Rev 5 title; "Disable Inactive Accounts" was Rev 4 — and the matrix anchors to Rev 5) | csf.tools NIST 800-53 r5 |
| 05-audit-prep-playbook | "Security+ Domain 5.x (Governance, Risk, and Compliance)" | "**Security Program Management and Oversight**" (the GRC title was SY0-601's) | CompTIA SY0-701 Objectives v5.0 |

### Module 12 — Hands-On Labs
| Section | Fix | Source |
|---|---|---|
| 03-conditional-access-lab | 2 SC-300 objective names corrected to the verbatim April-2026 study-guide titles ("Plan, implement, and manage Microsoft Entra Conditional Access"; break-glass mapped to "Plan and implement privileged access") | MS Learn SC-300 study guide |
| 04-saml-scim-integration | 2 SC-300 objective names corrected ("Plan, implement, and monitor the integration of enterprise applications"; "Assign, classify, and manage users, groups, and app roles…") | MS Learn SC-300 study guide |
| 06-pim-and-access-reviews | (1) Graph scope `RoleManagementPolicy.Read.AzureADGroup` → `.Read.Directory` (the AzureADGroup scope is PIM-for-Groups, wrong surface); (2) access-review recurrence rewritten to the real `patternedRecurrence` schema (the `RecurrenceType="quarterly"` form doesn't exist); (3) "P1 only covers Conditional Access" softened — P1 includes much more | MS Learn Graph + licensing |
| 07-cyberark-onboarding | `New-PASSafe` → **`Add-PASSafe`** (psPAS has no New-PASSafe) — prose + code block | pspas.pspete.dev |
| 08-okta-sso-lifecycle | "Developer Edition" → **"Integrator Free Plan"** (Developer Edition orgs were retired Jul 2025) | developer.okta.com |
| 09-sailpoint-cert-campaign | CLI command `sailpoint` → **`sail`** (5 places); PowerShell SDK is **official**, not community; noted v2026 API exists alongside v2025 | developer.sailpoint.com |
| 10-kerberoasting-hunt | Event 4771 = password spray / brute force, **not AS-REP roasting** (AS-REP roasting leaves no pre-auth failure; it's 4768 pre-auth type 0) | attack.mitre.org T1558.004 |
| 12-fido2-deployment | **A TAP is not phishing-resistant** — it only satisfies the MFA strength, never the built-in Phishing-resistant strength (2 spots corrected) + 1 SC-300 objective name | MS Learn authentication strengths |

---

## The one I did NOT change (and why it matters)

**f16 — Module 10 / 04-career-architecture, SDVOSB certification timeline.** The first audit pass flagged this and proposed "correcting" the self-certification-elimination date to 2024. The **adversarial second pass refuted that** — your content is right as written: the SBA took over certification **Jan 1 2023** under the FY2021 NDAA §862, and self-certification for non-VA SDVOSB set-asides was eliminated on that same transition (one-year grace period ending Jan 1 2024). The proposed "fix" conflated this with a *separate* 2024 SBA rule about self-cert credit on *unrestricted* awards. **Applying the first agent's correction would have injected an error into your VOSB lane.** This is exactly why the second verification pass exists. Left untouched.

---

## Follow-up items — flagged, then resolved same day (2026-06-02)

> All three items below were resolved in a same-day follow-up sweep (commit after this report). (1) The CIEM section's remaining present-tense Entra Permissions Management references were cleaned up everywhere (HoloPanel, the PCI-metric intro, the native-analyzer "free floor" sentence, a flashcard, and the quiz option — relabeled to a live example, Wiz). (2) The FIDO2 title was corrected to **"Plan, implement, and manage Microsoft Entra user authentication."** (3) All **14** "SC-300:" alignment labels across the curriculum were checked against the authoritative current outline (MS Learn, *skills measured as of April 27, 2026*) — **8 were already correct, 6 were corrected**, including retiring the legacy "Implement an identity management solution" label (now "Implement and manage user identities") and adding the official "in Microsoft Entra" suffix to the access-reviews heading. Re-verified green (typecheck/lint/265 tests/build) and structural-clean. The original flags, for the record:

1. **CIEM section (07-cloud-iam/05-ciem):** the two headline references to Entra Permissions Management are now past-tense with the retirement note, but the product is still named in present tense in ~4 lower-stakes spots (the PCI-metric intro, the native-analyzer list, a flashcard list item, a quiz option). Worth a quick consistency sweep — none are outright wrong as *concept* references, but they read as "live product."
2. **fido2 lab HoloPanel line 4** still says *"SC-300: Plan and implement authentication methods."* It's the same suspect pattern as the names I fixed, but I couldn't confirm the exact current objective title, and the text itself marks it "informational, not a graded objective," so I left it. Confirm against the SC-300 study guide.
3. **SC-300 objective titles, generally:** I fixed the 5 that were verified wrong. The other "Aligns with SC-300:" HoloPanel lines across the labs weren't each individually verified — a one-pass sweep against the current study guide would close this out fully, and it directly serves your SC-300 prep.

## What stands now

- 12-module curriculum: 61 sections · 516 flashcards · 127 quizzes · 8 diagrams.
- Seeded Phase 2/3 content is now source-verified at the claim level, with 31 corrections applied and every fix backed by a primary source.
- All four gates green. Committed locally; **not pushed** (awaiting your go-ahead).
