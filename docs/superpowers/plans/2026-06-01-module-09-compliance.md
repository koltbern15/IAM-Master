# Module 9 — Compliance & Audit (Phase 3) — Complete Content Plan

> **Goal:** Author the five-section Compliance & Audit module so a learner can map IAM controls to NIST 800-53 AC/IA + CSF 2.0, PCI-DSS 4.0 Req 7/8, SOX 404 ITGC, FFIEC, HIPAA, GDPR, and FedRAMP — and walk into a real audit with an evidence kit.
>
> **Architecture note:** Pure content authoring. No new components, no new diagrams (`newDiagram = ""`). Everything renders on the existing shell using already-registered MDX components (`<HoloPanel>`, `<Definition>`, `<WarStory>`, `<ProTip>`, `<Flashcard>`, `<Quiz>`, `<SC300Badge />`) plus GFM pipe tables. The only app-code touches are the two-file sync + content-loader wiring (below).
>
> **Prereqs / conventions pointer:** Before authoring, re-read the cross-cutting conventions in `docs/superpowers/plans/2026-06-01-remaining-work-roadmap.md` §2. Three wiring touchpoints are mandatory and a unit test enforces #1:
> 1. **Two-file sync** — `content/modules.json` (`09-compliance.sections[]` slug array) **and** `lib/sections.ts` (`SECTION_TITLES` entry for every slug + `SC300_SECTIONS` membership for cert-aligned slugs).
> 2. **Content-loader registration** — `lib/content-loader.ts` (`AUTHORED_SECTIONS` set + `ALL_KNOWN_SECTIONS` set + an `import` `case` in `loadAuthoredComponent`).
> 3. **Interactive content is INLINE MDX** — author `<Flashcard front=".." back=".." />`, `<Quiz question={{...}} />`, `<Definition>`, `<WarStory>`, `<ProTip>` inline. No JSON sidecars. (No PowerShell recipes in this module, so no `lib/recipes.ts` work.)

---

## PROMOTION FLAG (read first)

This module is the **single highest real-world-leverage Phase 3 module for Kolton.** It is the connective tissue between his day job (Senior Systems Analyst, IAM focus, **Richwood Bank** — directly governed by **FFIEC**, **SOX 404 ITGC**, and **PCI-DSS** for card processing) and his consulting path (**VOSB/SDVOSB → federal**, where **NIST 800-53**, **FedRAMP**, and **CSF 2.0** are the language of every contract). The roadmap (§3 "Promotion candidate," §5 Strategy B) already names Module 9 as a pull-forward candidate.

**Recommendation:** promote Module 9 ahead of the rest of Phase 3, and consider slotting it right after the Phase 2 banking-relevant modules (PAM/IGA). Sections `02-financial-and-payment` and `05-audit-prep-playbook` are the two with the most immediate work payoff and should be authored first within the module if it is sliced further.

---

## House-style reminders specific to this module (verified against the code)

- **Flashcard extraction is regex-based and brittle.** `lib/content-index.ts` (`extractFlashcards`) matches `/<Flashcard\b([^>]*?)\/>/` then pulls `front="([^"]*)"` and `back="([^"]*)"`. Therefore every `<Flashcard>` MUST be **self-closing** and its `front`/`back` text MUST NOT contain a literal double-quote `"`. Use single quotes, the word "the", or `&quot;` (the extractor decodes `&quot;`, `&amp;`, `&lt;`, `&gt;`, `&#39;`). Do not put `>` inside attribute text un-escaped.
- **Quiz form is the object prop**, not children: `<Quiz question={{ id: "...", prompt: "...", options: [..4..], correctIndex: N, explanation: "..." }} />`. The search indexer extracts `prompt:\s*"([^"]+)"`, so the `prompt` value must be a single double-quoted string with no embedded double quotes. Give each quiz a unique `id` of the form `09-compliance/<slug>/qN`.
- **`<HoloPanel label="COVERS">`** opens every section — a bullet list mapping the section to SC-300 / Security+ / CISSP / and (new for this module) the named compliance standard. Mirror `content/modules/03-microsoft-identity/02-entra-id.mdx:3-11`.
- **`<Definition term="...">prose</Definition>`** is block form (open/close tags). `<WarStory title="...">prose</WarStory>` and `<ProTip>prose</ProTip>` likewise.
- **Tables:** shipped MDX uses GFM pipe tables (`content/modules/11-cert-roadmap/02-study-strategy.mdx:17-23`) and the build is green, so pipe tables are the table mechanism for sections 04/05. **[VERIFY]** during authoring that a multi-row pipe table actually renders as an HTML `<table>` in this module's pages (remark-gfm is not in `next.config.mjs`; if pipe tables silently render as a paragraph, fall back to raw HTML `<table>` markup, which MDX passes through). Test-render `04-iam-controls-matrix` first since it is table-dominant.
- **Depth benchmark:** ~2,700–3,000 words/section (Kerberos = 2,736). Structure each: COVERS panel → "What it is" → "Why it exists / why auditors care" → "How it works / the actual controls" → War story → Recall drill (flashcards) → Check your understanding (quizzes).
- **ACCURACY OF CONTROL IDENTIFIERS IS THE WHOLE POINT.** Cite the exact control number from the source-of-record. Where a number/edition/date is drafted from memory and not re-verified against the primary doc, append `[VERIFY]` inline so the author confirms before publish. Primary sources to cite (not blogs): NIST SP 800-53 Rev. 5, NIST CSF 2.0 (NIST CSWP 29, Feb 2024), PCI-DSS v4.0/v4.0.1 (PCI SSC), SOX §404 + PCAOB AS 2201 + COBIT/ITGC, FFIEC IT Examination Handbook (Information Security + Authentication & Access booklets), HIPAA Security Rule 45 CFR §164.312, EU GDPR Regulation 2016/679, FedRAMP baselines (now aligned to 800-53 Rev. 5 via NIST SP 800-53B).

---

## Section map

### `01-control-frameworks` — "The Control Frameworks: NIST 800-53 & CSF 2.0"
- **Word target:** ~3,000
- **SC-300 alignment:** Low/indirect (SC-300 is product-not-framework). Do **NOT** set `sc300` flag; do **NOT** render `<SC300Badge />`. COVERS panel maps primarily to **CISSP Domain 1 (Security & Risk Management) + Domain 5 (IAM)** and **Security+ SY0-701 Obj 5.x (Governance, Risk, Compliance)**.

**Topics / study material (the substance to teach):**
- **What 800-53 is:** the catalog of security & privacy controls for federal information systems, organized into **control families** identified by a two-letter prefix. Source: **NIST SP 800-53 Rev. 5** (published Sep 2020, the current revision; Rev. 5.1.1 patch release). State it is the catalog; **800-53B** holds the control *baselines* (Low/Moderate/High); **800-37** is the Risk Management Framework that consumes them. [VERIFY] Rev. 5.1.1 is the latest patch designation.
- **The Access Control (AC) family — teach these specific controls verbatim:**
  - **AC-1** Policy and Procedures (every family has an `-1`).
  - **AC-2** Account Management — the lifecycle control: account types, authorized users, group/role membership, **AC-2(1)** Automated System Account Management, **AC-2(3)** Disable Accounts (inactive), **AC-2(13)** Disable Accounts for High-Risk Individuals. This is the JML / deprovisioning control.
  - **AC-3** Access Enforcement — enforce approved authorizations (the PEP doing its job).
  - **AC-5** Separation of Duties — divide responsibilities so no single individual can subvert a critical process.
  - **AC-6** Least Privilege — and its high-value enhancements: **AC-6(1)** Authorize Access to Security Functions, **AC-6(2)** Non-Privileged Access for Non-Security Functions, **AC-6(5)** Privileged Accounts, **AC-6(9)** Log Use of Privileged Functions, **AC-6(10)** Prohibit Non-Privileged Users from Executing Privileged Functions.
  - **AC-7** Unsuccessful Logon Attempts (lockout). **AC-17** Remote Access. **AC-19** Access Control for Mobile Devices. (Mention as breadth.)
  - [VERIFY] each enhancement number against the Rev. 5 catalog — enhancement numbering changed between Rev. 4 and Rev. 5 (e.g., the old AC-2 enhancements were renumbered).
- **The Identification & Authentication (IA) family:**
  - **IA-2** Identification and Authentication (Organizational Users) — and **IA-2(1)** MFA to Privileged Accounts, **IA-2(2)** MFA to Non-Privileged Accounts. (Note Rev. 5 consolidated several MFA enhancements; **[VERIFY]** the current (1)/(2) wording vs Rev. 4's (1)/(2)/(3)/(4) network/local split.)
  - **IA-4** Identifier Management. **IA-5** Authenticator Management — **IA-5(1)** Password-Based Authentication (the control that used to mandate composition/rotation; cross-reference how **NIST SP 800-63B** changed the password guidance away from forced periodic rotation). **IA-5(2)** Public Key-Based Authentication.
  - **IA-8** Identification and Authentication (Non-Organizational Users). Mention **IA-12** Identity Proofing (new family member in Rev. 5, ties to 800-63A).
- **Tie 800-53 to 800-63:** 800-53 says *do MFA / manage authenticators*; **NIST SP 800-63-3** (Digital Identity Guidelines: 800-63A proofing/IAL, 800-63B authentication/AAL, 800-63C federation/FAL) says *how strong*. Note 800-63 **Rev. 4** is finalized/near-final — **[VERIFY]** the publication status of 800-63-4 as of authoring date.
- **NIST CSF 2.0 — the six Functions and the IAM mapping:** Source **NIST CSWP 29 (Cybersecurity Framework 2.0, Feb 26, 2024).** The functions are **GOVERN (GV)** [new in 2.0], **IDENTIFY (ID)**, **PROTECT (PR)**, **DETECT (DE)**, **RESPOND (RS)**, **RECOVER (RC)**. Map IAM to the three the assignment calls out:
  - **GOVERN (GV)** — roles/responsibilities, policy, oversight: where IAM *program ownership* and RACI live (e.g., **GV.RR** Roles, Responsibilities, and Authorities; **GV.PO** Policy). [VERIFY] subcategory IDs.
  - **IDENTIFY (ID)** — **ID.AM** Asset Management includes *identities and credentials are inventoried* — the "you can't govern what you can't see" function.
  - **PROTECT (PR)** — **PR.AA** Identity Management, Authentication, and Access Control (this is the renamed/expanded successor to CSF 1.1's PR.AC — **[VERIFY]** that PR.AA is the 2.0 category id and PR.AC was 1.1). This is the function where the bulk of IAM controls live.
  - Note CSF is **outcome-based and voluntary** (a mapping/communication tool), whereas 800-53 is the prescriptive control catalog. CSF Informative References cross-walk each subcategory to specific 800-53 controls.
- **Definitions to coin:** "control family," "control baseline (Low/Moderate/High)," "control enhancement," "Informative Reference," "compensating control."

**Components to embed:** `<HoloPanel label="COVERS">`; `<Definition>` x3-4 (control family, baseline, control enhancement, compensating control); one GFM pipe table mapping AC/IA control → one-line meaning → IAM mechanism that satisfies it; `<WarStory>`; `<ProTip>` (e.g., "auditors quote the enhancement number, not just AC-6 — know the parenthetical"); 8 `<Flashcard>`; 2 `<Quiz>`.

---

### `02-financial-and-payment` — "Financial & Payment: PCI-DSS, SOX 404, FFIEC"
- **Word target:** ~3,000 (the meatiest, banking-relevant section — author first if sliced)
- **SC-300 alignment:** None. Do not set `sc300` / no badge. COVERS panel maps to **CISSP Domain 1 (compliance, legal/regulatory)** and **Security+ SY0-701 Obj 5.x**. Add a plain-text "**REAL JOB**" note in the panel flagging direct Richwood Bank relevance.

**Topics / study material:**
- **PCI-DSS 4.0 — scope first:** applies to any entity that stores, processes, or transmits cardholder data (CHD) / the Cardholder Data Environment (CDE). Source: **PCI DSS v4.0** (released Mar 2022) and the **v4.0.1** errata (released **June 2024**); the **v3.2.1 retirement / v4.0 mandatory date was 31 Mar 2024**, and the future-dated v4.0 requirements became mandatory **31 Mar 2025**. **[VERIFY]** these two dates against the PCI SSC dates document before publish.
- **Requirement 7 — Restrict Access to System Components and Cardholder Data by Business Need to Know (least privilege):** teach the sub-requirements:
  - **7.1** processes and mechanisms for restricting access are defined/understood.
  - **7.2** access is appropriately defined and assigned — **7.2.1** an access control model; **7.2.2** access assigned based on job classification/function and **least privilege**; **7.2.4** review all user accounts and access privileges **at least once every 6 months** (a v4.0 *new* requirement — call this out, it is a periodic access review mandate); **7.2.5** assignment/management of application and system accounts and least privilege; **7.2.5.1** review application/system account access periodically.
  - **7.3** access control system(s) enforce restrictions (deny-all default). **[VERIFY]** the exact 7.2.x numbering and the 6-month interval against the v4.0/v4.0.1 standard text.
- **Requirement 8 — Identify Users and Authenticate Access to System Components:** teach the sub-requirements:
  - **8.1** processes/mechanisms defined. **8.2** user identification and related accounts are managed — **8.2.1** unique ID for every user before access; **8.2.2** shared/group/generic accounts controlled/only used when necessary; **8.2.4** add/change/delete of IDs is managed; **8.2.5** access for terminated users immediately revoked; **8.2.6** inactive accounts removed/disabled **within 90 days**; **8.2.7** third-party/vendor remote access accounts managed.
  - **8.3** strong authentication established/managed — **8.3.1** all access authenticated via something-you-know/have/are; **8.3.6** v4.0 password minimum **12 characters** (or 8 if the system cannot support 12 — **[VERIFY]**) with letters+numbers; **8.3.9** if passwords are the only factor, change every 90 days *or* dynamic risk analysis.
  - **8.4 / 8.5 — MFA:** **8.4.2** MFA for **all access into the CDE** (a v4.0 expansion — previously only remote/admin) — this became mandatory **31 Mar 2025**; **8.4.3** MFA for all remote network access from outside; **8.5.1** MFA systems are implemented to resist replay and are not bypassable. **[VERIFY]** 8.4.2/8.4.3/8.5.1 numbering and the future-dated status.
- **SOX 404 — ITGC access controls:** Source: **Sarbanes-Oxley Act of 2002 §404** (management assessment of internal control over financial reporting, ICFR) + **PCAOB Auditing Standard AS 2201** (audit of ICFR). Teach that SOX itself names **no IT controls** — the IT control expectations come from the auditor's framework (**COSO** for ICFR, **COBIT** for IT) expressed as **ITGCs** in four domains: **Access to Programs and Data** (this is the IAM domain: provisioning, periodic access recertification, privileged access, segregation of duties), **Program Changes**, **Program Development**, **Computer Operations**. The IAM-relevant SOX evidence: user access reviews (UARs) of financially-significant systems, SoD conflict matrices, terminated-user removal timeliness, privileged-access logging. Coin **"in-scope / financially significant system,"** **"key control vs. compensating control,"** **"control deficiency / significant deficiency / material weakness."** **[VERIFY]** AS 2201 is current PCAOB standard number (it superseded AS 5).
- **FFIEC — the bank regulator angle:** Source: **FFIEC IT Examination Handbook**, specifically the **Information Security booklet** and the **Authentication and Access to Financial Institution Services and Systems** guidance (the Aug 2021 update that replaced the 2005/2011 "Authentication in an Internet Banking Environment" guidance, moving beyond simple two-factor to **layered security + risk-based authentication + MFA for high-risk transactions and admin access**). Teach: FFIEC is the interagency body (FDIC, OCC, Federal Reserve, NCUA, CFPB) that issues exam handbooks; examiners cite these booklets directly; the Authentication guidance is **risk-based**, not a checkbox MFA mandate, and expects identity/access management, periodic access reviews, and customer + employee/administrator authentication controls. **[VERIFY]** the 2021 Authentication guidance title and date.
- **Crosswalk insight to teach:** Req 7 ≈ AC-6 least privilege; Req 8 ≈ IA-2/IA-5; SOX "Access to Programs and Data" ≈ AC-2/AC-5/AC-6; all three converge on the same four IAM primitives (unique ID, least privilege, periodic review, MFA). This sets up section 04's matrix.

**Components to embed:** `<HoloPanel label="COVERS">` (+ REAL JOB note); `<Definition>` x4 (CDE, ITGC, material weakness, least-privilege/need-to-know); a pipe table of "Req 7/8 sub-requirement → plain English → IAM control"; `<WarStory>` (banking — e.g., a UAR finding or a terminated-user-not-removed audit exception); `<ProTip>` (the 6-month PCI review vs annual SOX UAR cadence trap); 10 `<Flashcard>`; 3 `<Quiz>`.

---

### `03-privacy-and-federal` — "Privacy & Federal: HIPAA, GDPR, FedRAMP"
- **Word target:** ~2,800
- **SC-300 alignment:** None. COVERS panel maps to **CISSP Domain 1 (legal/regulatory/privacy)**, **Security+ SY0-701 Obj 5.x**. Add a plain-text "**VOSB/GOV**" note flagging FedRAMP's consulting relevance.

**Topics / study material:**
- **HIPAA Security Rule — the access controls at 45 CFR §164.312 (Technical Safeguards):** Source: **45 CFR Part 164, Subpart C.** Teach the specific citations:
  - **§164.312(a)(1) Access Control** — and its implementation specifications: **(a)(2)(i) Unique User Identification** (Required), **(a)(2)(ii) Emergency Access Procedure** (Required — the break-glass control), **(a)(2)(iii) Automatic Logoff** (Addressable), **(a)(2)(iv) Encryption and Decryption** (Addressable).
  - **§164.312(b) Audit Controls.** **§164.312(c) Integrity.** **§164.312(d) Person or Entity Authentication.** **§164.312(e) Transmission Security.**
  - Teach the **"Required" vs "Addressable"** distinction — Addressable does NOT mean optional; it means implement, or document why an equivalent alternative is reasonable. Also reference the **Administrative Safeguards §164.308(a)(3) Workforce Security** (authorization/supervision, **workforce clearance**, **termination procedures**) and **§164.308(a)(4) Information Access Management** (access authorization, establishment, modification) — the JML controls. **[VERIFY]** every paragraph citation against the CFR text.
- **GDPR — access & data-subject principles relevant to IAM:** Source: **Regulation (EU) 2016/679.** Teach:
  - **Article 5** principles, especially **5(1)(f) integrity and confidentiality (security)** and **5(1)(c) data minimisation** — the IAM least-privilege analogue for personal data.
  - **Article 25** Data protection by design and by default. **Article 32** Security of processing (names access control, confidentiality, the ability to ensure ongoing confidentiality).
  - **Data-subject rights** that IAM/identity stores must service: **Art. 15** right of access, **Art. 16** rectification, **Art. 17** erasure ("right to be forgotten"), **Art. 20** data portability. Teach why IAM matters: you must be able to find, export, and delete a subject's identity/access data, and prove who accessed it.
  - **Article 4** definitions (personal data, controller, processor). **[VERIFY]** article numbers.
- **FedRAMP — the gov/VOSB angle:** Source: **FedRAMP** program (GSA/FedRAMP PMO) + **NIST SP 800-53 Rev. 5 / 800-53B baselines.** Teach:
  - FedRAMP authorizes **cloud service offerings (CSOs)** for federal use; two paths historically: **JAB P-ATO** and **Agency ATO** (note FedRAMP modernization under the **FedRAMP Authorization Act / FY23 NDAA** is shifting the model — **[VERIFY]** current JAB vs program-board status as of 2025/26).
  - **Three impact baselines — Low, Moderate, High** — derived from **FIPS 199** categorization and mapped to **800-53 Rev. 5** control sets via **800-53B**; **FedRAMP Tailored / Li-SaaS** for low-impact SaaS. The **Moderate baseline** is the common commercial target (~300+ controls). **[VERIFY]** the approximate control counts per baseline.
  - The IAM relevance: FedRAMP heavily weights the AC and IA families; **MFA / phishing-resistant authenticator** expectations track **800-63B AAL** and the **OMB M-22-09 Zero Trust** memo (phishing-resistant MFA for federal staff). **[VERIFY]** M-22-09 reference.
  - Why Kolton cares: an SDVOSB selling identity services into federal/DoD must speak FedRAMP + 800-53 + CMMC-adjacent language; this is the credential differentiator.

**Components to embed:** `<HoloPanel label="COVERS">` (+ VOSB/GOV note); `<Definition>` x4 (Addressable vs Required spec, data subject, FIPS 199 categorization, ATO/P-ATO); a pipe table of HIPAA §164.312 spec → Required/Addressable → IAM mechanism; `<WarStory>` (a healthcare shared-workstation / break-glass abuse, or a GDPR access-log failure); `<ProTip>` ("Addressable ≠ optional" trap; or "FedRAMP Moderate is the realistic SDVOSB target"); 8 `<Flashcard>`; 2 `<Quiz>`.

---

### `04-iam-controls-matrix` — "The IAM Controls Matrix: Framework → Control → Evidence"
- **Word target:** ~2,700 (mostly tables + connective prose; this is the reusable template the other four feed into)
- **SC-300 alignment:** None. COVERS panel maps to **CISSP Domain 1/5** and frames this as a practitioner artifact ("the deliverable you hand an auditor").

**Topics / study material:**
- **The thesis to teach:** every framework above is asking the same handful of IAM questions in its own dialect. A **controls matrix** is the single sheet that lets you answer once and cite many. Columns: **IAM Control Objective → 800-53 → PCI-DSS 4.0 → SOX ITGC → HIPAA → CSF 2.0 → Evidence Artifact → Owner → Cadence.**
- **Build the matrix around ~8 universal IAM control objectives** and fill the crosswalk cells (this is the load-bearing accuracy work — cite each cell):
  1. **Unique identification** — 800-53 **IA-4**; PCI **8.2.1**; SOX Access-to-Programs-and-Data; HIPAA **§164.312(a)(2)(i)**; CSF **PR.AA-01** (identities/credentials managed). Evidence: identity register, no-shared-account attestation.
  2. **Strong/MFA authentication** — 800-53 **IA-2(1)/(2)**; PCI **8.4.2 / 8.5.1**; FFIEC Authentication guidance; HIPAA **§164.312(d)**; CSF **PR.AA-03**. Evidence: MFA config export, CA policy report, coverage %.
  3. **Least privilege** — 800-53 **AC-6**; PCI **7.2.2**; SOX SoD/least-priv; HIPAA **§164.308(a)(4)**; CSF **PR.AA-05**. Evidence: role definitions, entitlement report.
  4. **Separation of duties** — 800-53 **AC-5**; PCI (need-to-know) 7.x; SOX SoD matrix; CSF PR.AA. Evidence: SoD conflict matrix + exceptions.
  5. **Access provisioning/JML** — 800-53 **AC-2 / AC-2(1)**; PCI **8.2.4**; SOX access management; HIPAA **§164.308(a)(3)/(4)**. Evidence: JML tickets, approvals.
  6. **Deprovisioning / termination** — 800-53 **AC-2(3)** (disable inactive); PCI **8.2.5** (immediate) / **8.2.6** (90-day inactive); SOX terminated-user timeliness; HIPAA termination procedures. Evidence: term tickets vs HR feed, disable timestamps.
  7. **Periodic access review / recertification** — 800-53 **AC-2** / **AU-6** review; PCI **7.2.4** (6-month) / **7.2.5.1**; SOX UAR (typically quarterly/annual); CSF GV/PR. Evidence: signed recert campaigns.
  8. **Privileged access management & logging** — 800-53 **AC-6(5)/(9)/(10)**, **AU-2/AU-12**; PCI **8.x / 10.x logging**; SOX privileged-access control; CSF PR.AA / DE. Evidence: PIM activation logs, PAM session recordings.
  - **[VERIFY] EVERY cross-framework cell** — the CSF 2.0 PR.AA subcategory ids especially (the 2.0 catalog renumbered from 1.1's PR.AC-N), and the PCI 7.2.x/8.x numbers.
- **Teach how to use it:** map once, reuse across audits; the "Evidence Artifact" column is the bridge to section 05; the "Owner/Cadence" columns turn it from a compliance map into an operating calendar.
- **Render mechanics:** this section is the primary [VERIFY]-the-table-renders test. If GFM pipe tables do not render, fall back to raw `<table>` HTML. Break the master matrix into 2-3 readable tables (one per control-objective cluster) rather than one 9-column monster that overflows on mobile.

**Components to embed:** `<HoloPanel label="COVERS">`; the **2-3 crosswalk tables** (the centerpiece); `<Definition>` x2 (controls matrix, evidence artifact); `<ProTip>` (map once / cite many; keep one source-of-truth matrix in version control); `<WarStory>` optional/short; 6 `<Flashcard>`; 1 `<Quiz>`.

---

### `05-audit-prep-playbook` — "The Audit Prep Playbook"
- **Word target:** ~2,900 (highest day-job payoff alongside 02)
- **SC-300 alignment:** None. COVERS panel frames it as the practitioner capstone ("turn controls into evidence and survive the walkthrough"). Add a plain-text "**REAL JOB**" note.

**Topics / study material:**
- **The audit lifecycle to teach:** scoping / PBC (Provided-By-Client) request list → evidence collection → walkthrough/interviews → testing (design + operating effectiveness) → findings/exceptions → remediation/management response. Coin **"PBC list,"** **"design effectiveness vs operating effectiveness,"** **"sample/population,"** **"test of one (walkthrough)."**
- **Evidence collection — what auditors actually ask IAM for, and how to produce it:**
  - **User access listings** for in-scope systems (full population with role/entitlement) — point at Entra/AD exports (`Get-ADUser`, `Get-MgUser`, access package assignments) without re-teaching Module 6.
  - **Access-review / recertification artifacts** — the signed-off campaign export proving a manager attested to each user's access, with dates (PCI 6-month, SOX UAR cadence). This is the #1 IAM evidence request.
  - **Joiner/Mover/Leaver evidence** — provisioning tickets with approvals; **terminated-user removal evidence** matched against the HR termination feed with timestamps (the timeliness test).
  - **Privileged access evidence** — PIM eligible-vs-active config, activation logs with justification, PAM session recordings, break-glass account usage logs.
  - **Configuration evidence** — MFA coverage report, Conditional Access policy export, password policy screenshot, lockout settings.
  - **SoD evidence** — the conflict matrix and the exception/mitigating-control log.
- **The auditor walkthrough — how to run it:** prepare a control narrative per control; do a screen-share "test of one" tracing a single user from access request → approval → provisioning → review; never volunteer scope; answer the question asked; have the system owner present; keep a tracker of every artifact handed over.
- **Common IAM audit findings (teach the recurring exceptions so the learner can pre-empt them):**
  - Terminated users still enabled / not removed within the required window.
  - Access reviews not performed, performed late, or "rubber-stamped" (no evidence of actual review).
  - Shared/generic/service accounts with interactive logon and no ownership.
  - Excessive privilege / standing Global Admins (no PIM/JIT).
  - SoD conflicts with no documented compensating control.
  - Orphaned accounts (no matching HR record).
  - Stale guest/B2B accounts.
  - Missing or incomplete approval evidence for provisioning.
  - MFA gaps (service accounts, legacy auth, break-glass mis-scoped).
- **Remediation & management response:** how to write a finding response (root cause, corrective action, owner, target date), the difference between a finding remediated vs a compensating control accepted, and feeding findings back into the section-04 matrix as control improvements.
- **Tie-back:** map each evidence artifact to the section-04 matrix "Evidence Artifact" column so the playbook is the operational arm of the matrix.

**Components to embed:** `<HoloPanel label="COVERS">` (+ REAL JOB note); `<Definition>` x3 (PBC list, design vs operating effectiveness, orphaned account); a pipe table "Auditor request → artifact → where to get it (system) → owner"; a pipe table or bulleted **"Top 10 IAM audit findings → root cause → fix"**; `<WarStory>` (a real-flavored audit-week scramble — late access review or unremoved terminations); `<ProTip>` (keep an always-current evidence binder so audit week is a copy-paste, not a fire drill); 8 `<Flashcard>`; 2 `<Quiz>`.

---

## Flashcards (drafted)

> Targets per section: 01=8, 02=10, 03=8, 04=6, 05=8 → **module total = 40.** All are self-closing, no double-quotes inside `front`/`back`. Every non-obvious control number carries a `[VERIFY]` for the author. Author writes them as `<Flashcard front="..." back="..." />`.

### `01-control-frameworks` (8)
1. front: What does NIST SP 800-53 Rev. 5 catalog, and what holds the Low/Moderate/High control baselines? -> back: 800-53 Rev. 5 is the catalog of security and privacy controls organized into families (AC, IA, AU, etc.). The Low/Moderate/High baselines that select subsets of those controls live in the companion document NIST SP 800-53B. [VERIFY]
2. front: What is NIST 800-53 control AC-6, and which enhancement requires logging the use of privileged functions? -> back: AC-6 is Least Privilege. AC-6(9) Log Use of Privileged Functions requires auditing the execution of privileged functions; AC-6(5) restricts privileged accounts to designated personnel. [VERIFY enhancement numbers]
3. front: In NIST 800-53, what is control AC-2 and which control covers Separation of Duties? -> back: AC-2 is Account Management (the account lifecycle control: creation, enabling, modification, review, disabling). Separation of Duties is AC-5. [VERIFY]
4. front: Which 800-53 control family covers MFA, and which control mandates MFA for privileged accounts? -> back: The Identification and Authentication (IA) family. IA-2 covers identification/authentication of organizational users; IA-2(1) requires MFA for privileged accounts (IA-2(2) for non-privileged). [VERIFY Rev. 5 enhancement split]
5. front: What is 800-53 IA-5, and how did NIST 800-63B change its password guidance? -> back: IA-5 is Authenticator Management; IA-5(1) covers password-based authentication. NIST SP 800-63B shifted guidance away from forced periodic password rotation and complexity composition toward length, breach-list screening, and rotation only on evidence of compromise. [VERIFY]
6. front: Name the six Functions of the NIST Cybersecurity Framework 2.0. -> back: GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER. GOVERN was added in CSF 2.0 (NIST CSWP 29, Feb 2024) to elevate governance and risk-management oversight. [VERIFY]
7. front: In CSF 2.0, which category holds Identity Management, Authentication, and Access Control, and what was it called in CSF 1.1? -> back: PR.AA (Identity Management, Authentication, and Access Control) under the PROTECT function. In CSF 1.1 the IAM outcomes lived under PR.AC. [VERIFY category id]
8. front: How does NIST CSF differ in nature from NIST 800-53? -> back: CSF 2.0 is a voluntary, outcome-based framework used to organize and communicate cybersecurity posture; 800-53 is a prescriptive control catalog. CSF subcategories use Informative References to cross-walk to specific 800-53 controls. [VERIFY]

### `02-financial-and-payment` (10)
1. front: What does PCI-DSS 4.0 Requirement 7 govern? -> back: Restricting access to system components and cardholder data by business need-to-know (least privilege) — defining an access control model and assigning access by job function with default deny. [VERIFY]
2. front: What PCI-DSS 4.0 sub-requirement mandates a periodic review of user accounts and access, and how often? -> back: Requirement 7.2.4 requires reviewing all user accounts and related access privileges at least once every 6 months — a new periodic access review mandate added in v4.0. [VERIFY 7.2.4 and interval]
3. front: What does PCI-DSS 4.0 Requirement 8 govern, and what is the unique-ID rule? -> back: Identifying users and authenticating access to system components. Requirement 8.2.1 requires a unique ID assigned to every user before access is granted (no shared interactive accounts). [VERIFY]
4. front: Under PCI-DSS 4.0, within how long must inactive user accounts be removed or disabled? -> back: Requirement 8.2.6 requires inactive user accounts to be removed or disabled within 90 days. Terminated users (8.2.5) must be revoked immediately. [VERIFY numbers]
5. front: What major MFA expansion did PCI-DSS 4.0 introduce, and when did it become mandatory? -> back: Requirement 8.4.2 expands MFA to all access into the Cardholder Data Environment (CDE), not just remote/admin access; it became a mandatory future-dated requirement on 31 Mar 2025. [VERIFY date and number]
6. front: Does the Sarbanes-Oxley Act itself specify IT controls for access? -> back: No. SOX 404 requires management to assess internal control over financial reporting (ICFR); the IT control expectations come from auditor frameworks (COSO/COBIT) expressed as ITGCs. Access controls fall under the Access to Programs and Data ITGC domain. [VERIFY]
7. front: Name the four ITGC domains, and which one contains IAM controls. -> back: Access to Programs and Data, Program Changes, Program Development, and Computer Operations. IAM controls (provisioning, recertification, privileged access, SoD) live in Access to Programs and Data. [VERIFY]
8. front: In SOX terms, what is the difference between a control deficiency, a significant deficiency, and a material weakness? -> back: A control deficiency is a control that does not operate as designed; a significant deficiency is severe enough to merit attention by those overseeing reporting; a material weakness is a deficiency (or combination) creating a reasonable possibility that a material misstatement will not be prevented or detected. [VERIFY]
9. front: What is the FFIEC, and which handbook guidance governs identity authentication at banks? -> back: The FFIEC is the interagency body (FDIC, OCC, Federal Reserve, NCUA, CFPB) that issues IT Examination Handbooks. The 2021 Authentication and Access to Financial Institution Services and Systems guidance sets risk-based, layered authentication expectations replacing the older Internet-banking two-factor guidance. [VERIFY title/date]
10. front: What is the Cardholder Data Environment (CDE) in PCI-DSS? -> back: The CDE is the people, processes, and technology that store, process, or transmit cardholder data (or sensitive authentication data), plus connected systems. PCI-DSS scope is defined by the CDE boundary. [VERIFY]

### `03-privacy-and-federal` (8)
1. front: Where in the CFR are HIPAA Security Rule technical safeguards, and what is the access-control citation? -> back: 45 CFR Part 164, Subpart C (Security Rule). The Access Control standard is 45 CFR 164.312(a)(1). [VERIFY]
2. front: What are the four implementation specifications under HIPAA 164.312(a) Access Control, and which are Required? -> back: Unique User Identification (Required), Emergency Access Procedure (Required), Automatic Logoff (Addressable), and Encryption and Decryption (Addressable). [VERIFY]
3. front: In HIPAA, what does an Addressable implementation specification mean? -> back: Addressable does not mean optional. The covered entity must implement it if reasonable and appropriate, or document why not and implement an equivalent alternative that meets the standard. Required specifications must always be implemented. [VERIFY]
4. front: Which GDPR article covers security of processing, and which principle is the least-privilege analogue? -> back: Article 32 (Security of processing) requires appropriate technical/organizational measures including access control. Article 5(1)(c) data minimisation is the personal-data least-privilege analogue; 5(1)(f) is integrity and confidentiality. [VERIFY]
5. front: Which GDPR data-subject rights most directly depend on IAM/identity data handling? -> back: Article 15 right of access, Article 16 rectification, Article 17 erasure (right to be forgotten), and Article 20 data portability — all require locating, exporting, correcting, or deleting a subject's identity and access data and proving who accessed it. [VERIFY article numbers]
6. front: What are the three FedRAMP impact baselines and what determines which applies? -> back: Low, Moderate, and High. The level is driven by a FIPS 199 categorization of the data's confidentiality/integrity/availability impact and maps to NIST 800-53 Rev. 5 control sets via 800-53B (with FedRAMP Tailored/Li-SaaS for low-impact SaaS). [VERIFY]
7. front: Which NIST 800-53 control families does FedRAMP weight most heavily for identity, and what AAL concept backs MFA strength? -> back: The Access Control (AC) and Identification & Authentication (IA) families. Authenticator strength tracks NIST 800-63B Authenticator Assurance Levels (AAL), with phishing-resistant MFA pushed by OMB M-22-09 for federal Zero Trust. [VERIFY M-22-09]
8. front: Which HIPAA administrative safeguards cover workforce access lifecycle (JML)? -> back: 45 CFR 164.308(a)(3) Workforce Security (authorization/supervision, workforce clearance, termination procedures) and 164.308(a)(4) Information Access Management (access authorization, establishment, modification). [VERIFY]

### `04-iam-controls-matrix` (6)
1. front: What is an IAM controls matrix and what problem does it solve? -> back: A single crosswalk mapping each IAM control objective to its identifier in every framework (800-53, PCI, SOX ITGC, HIPAA, CSF) plus the evidence artifact, owner, and cadence — so you answer each control question once and cite it across many audits.
2. front: For the control objective unique identification, give the 800-53, PCI-DSS, and HIPAA identifiers. -> back: 800-53 IA-4 (Identifier Management); PCI-DSS 8.2.1 (unique ID per user); HIPAA 164.312(a)(2)(i) (Unique User Identification). [VERIFY]
3. front: For least privilege, give the 800-53, PCI-DSS, and CSF 2.0 identifiers. -> back: 800-53 AC-6 (Least Privilege); PCI-DSS 7.2.2 (access by job function, least privilege); CSF 2.0 PR.AA (Identity Management, Authentication, and Access Control). [VERIFY]
4. front: For periodic access review, which identifiers and cadences apply across PCI and SOX? -> back: PCI-DSS 7.2.4 mandates review at least every 6 months; SOX user access reviews are typically quarterly or annual depending on the control design; 800-53 AC-2 covers account review. [VERIFY]
5. front: For deprovisioning/termination, give the 800-53 and PCI identifiers and the timeliness rule. -> back: 800-53 AC-2(3) disable inactive accounts; PCI-DSS 8.2.5 revoke terminated users immediately and 8.2.6 remove/disable inactive accounts within 90 days. [VERIFY]
6. front: Which column of the IAM controls matrix bridges it to the audit playbook, and why? -> back: The Evidence Artifact column — it names the exact deliverable (access listing, signed recert, PIM activation log) that proves the control operates, which becomes the auditor PBC response.

### `05-audit-prep-playbook` (8)
1. front: What is a PBC list in an audit? -> back: Provided-By-Client list — the set of evidence the auditor requests the client to provide (access listings, recertification exports, JML tickets, policy screenshots) ahead of and during fieldwork.
2. front: What is the difference between design effectiveness and operating effectiveness in a control test? -> back: Design effectiveness asks whether the control, as designed, would prevent/detect the risk; operating effectiveness asks whether it actually operated that way over the period, tested against a sample of the population.
3. front: What is the single most-requested IAM audit evidence artifact, and what must it prove? -> back: The access review / recertification export — it must prove a responsible owner actually reviewed each user's access and attested, with dates, on the required cadence (PCI 6-month, SOX UAR cycle). Rubber-stamped reviews with no evidence of analysis are a finding.
4. front: Name three of the most common recurring IAM audit findings. -> back: Terminated users not removed in time; access reviews not performed or rubber-stamped; standing/excessive privileged access (no PIM/JIT) and orphaned or shared accounts. [also: SoD conflicts without compensating control, MFA gaps]
5. front: What is an orphaned account and why is it an audit finding? -> back: An account with no matching active owner/HR record (e.g., a departed employee or a deleted-resource service account). It is a finding because it represents unowned, unreviewed standing access — a textbook least-privilege and account-management violation.
6. front: How should you run an auditor walkthrough (test of one)? -> back: Trace a single in-scope user end to end — access request, approval, provisioning, periodic review — usually via screen-share, with the system owner present, answering only the question asked and logging every artifact handed over.
7. front: What four elements belong in a management response to an audit finding? -> back: Root cause, corrective action, an accountable owner, and a target remediation date — plus whether the gap is being remediated or covered by an accepted compensating control.
8. front: Why keep a standing evidence binder instead of assembling evidence at audit time? -> back: Because audit timelines are short and evidence must reflect the period under review; a continuously maintained binder (current access listings, recert exports, config screenshots) turns audit week into a copy-paste rather than a scramble, and reduces the risk of producing stale or incomplete evidence.

---

## Quiz (drafted)

> Targets per section: 01=2, 02=3, 03=2, 04=1, 05=2 → **module total = 10.** Author as `<Quiz question={{ id, prompt, options:[4], correctIndex, explanation }} />`. No double-quotes inside `prompt`. Unique ids `09-compliance/<slug>/qN`.

### `01-control-frameworks`
**Q1** (id `09-compliance/01-control-frameworks/q1`)
- prompt: An auditor asks which control requires you to log every use of a privileged function. Which NIST 800-53 control and enhancement is the correct citation?
- options: [A) AC-2 Account Management; B) AC-6(9) Log Use of Privileged Functions; C) IA-2 Identification and Authentication; D) AU-2 Event Logging alone]
- correctIndex: 1 (B)
- explanation: AC-6 is Least Privilege; the (9) enhancement specifically requires logging the execution of privileged functions. AU-2 governs which events are logged generally, but the privileged-function logging requirement is cited as AC-6(9). [VERIFY enhancement number]

**Q2** (id `09-compliance/01-control-frameworks/q2`)
- prompt: Which statement best distinguishes NIST CSF 2.0 from NIST SP 800-53?
- options: [A) CSF 2.0 is a prescriptive control catalog; 800-53 is voluntary guidance; B) They are the same document under different names; C) CSF 2.0 is a voluntary, outcome-based framework whose subcategories cross-walk to prescriptive 800-53 controls via Informative References; D) 800-53 applies only to banks; CSF only to federal agencies]
- correctIndex: 2 (C)
- explanation: CSF organizes outcomes into Functions/Categories/Subcategories and is voluntary; 800-53 is the prescriptive control catalog. CSF Informative References map subcategories (e.g., PR.AA) to specific 800-53 controls. [VERIFY]

### `02-financial-and-payment`
**Q1** (id `09-compliance/02-financial-and-payment/q1`)
- prompt: A QSA reviewing your CDE asks for evidence that user accounts and access privileges are reviewed on a defined cadence. Which PCI-DSS 4.0 requirement and interval are they testing?
- options: [A) 8.2.6 every 30 days; B) 7.2.4 at least every 6 months; C) 10.6 daily log review; D) 8.3.9 every 90 days]
- correctIndex: 1 (B)
- explanation: PCI-DSS 4.0 Requirement 7.2.4 newly mandates reviewing all user accounts and related access privileges at least once every 6 months. 8.2.6 is the 90-day inactive-account rule; 8.3.9 is password change cadence; 10.6 is log review. [VERIFY 7.2.4]

**Q2** (id `09-compliance/02-financial-and-payment/q2`)
- prompt: During a SOX 404 audit, the auditor tests whether terminated employees lose access to financially significant systems promptly. Which ITGC domain does this control fall under?
- options: [A) Program Changes; B) Computer Operations; C) Access to Programs and Data; D) Program Development]
- correctIndex: 2 (C)
- explanation: Termination/deprovisioning is an access-management control, which sits in the Access to Programs and Data ITGC domain — the IAM-relevant domain of the four ITGC categories. [VERIFY]

**Q3** (id `09-compliance/02-financial-and-payment/q3`)
- prompt: A community bank examiner cites the FFIEC for not applying stronger authentication to high-risk transactions and administrative access. Which characterization of the FFIEC authentication expectation is correct?
- options: [A) FFIEC mandates a single hardware token for all customers; B) FFIEC sets risk-based, layered authentication expectations, with stronger controls for high-risk access; C) FFIEC defers entirely to PCI-DSS and sets no authentication expectation; D) FFIEC requires SMS OTP specifically]
- correctIndex: 1 (B)
- explanation: The FFIEC 2021 Authentication and Access guidance is risk-based and layered, expecting stronger (often multifactor) controls for high-risk transactions and administrative/privileged access rather than a one-size checkbox. [VERIFY title/date]

### `03-privacy-and-federal`
**Q1** (id `09-compliance/03-privacy-and-federal/q1`)
- prompt: Under the HIPAA Security Rule, the Automatic Logoff implementation specification is marked Addressable. What does that obligate a covered entity to do?
- options: [A) Nothing; Addressable means optional; B) Implement it exactly as written with no exceptions; C) Implement it if reasonable and appropriate, or document why not and adopt an equivalent alternative; D) Seek OCR approval before implementing]
- correctIndex: 2 (C)
- explanation: Addressable specifications (here 164.312(a)(2)(iii)) are not optional — the entity must implement, or document a rationale and an equivalent measure that meets the standard. Required specifications must always be implemented. [VERIFY citation]

**Q2** (id `09-compliance/03-privacy-and-federal/q2`)
- prompt: An SDVOSB wants its identity SaaS authorized for a typical federal agency handling moderate-impact data. Which FedRAMP baseline and underlying categorization apply?
- options: [A) High baseline, based on PCI-DSS scoping; B) Moderate baseline, based on a FIPS 199 categorization mapped to 800-53 Rev. 5 via 800-53B; C) Low baseline, automatically, for all SaaS; D) No baseline; FedRAMP does not use 800-53]
- correctIndex: 1 (B)
- explanation: The baseline (Low/Moderate/High) is set by a FIPS 199 impact categorization and realized through the corresponding NIST 800-53 Rev. 5 control set defined in 800-53B; Moderate is the common commercial target. [VERIFY]

### `04-iam-controls-matrix`
**Q1** (id `09-compliance/04-iam-controls-matrix/q1`)
- prompt: You are filling the least privilege row of an IAM controls matrix. Which set of identifiers correctly populates the 800-53 and PCI-DSS columns?
- options: [A) IA-2 and 8.4.2; B) AC-5 and 7.1; C) AC-6 and 7.2.2; D) AU-6 and 10.6]
- correctIndex: 2 (C)
- explanation: Least privilege is 800-53 AC-6 and PCI-DSS 7.2.2 (access assigned by job function with least privilege). AC-5 is Separation of Duties; IA-2 is authentication; AU-6 is audit review. [VERIFY]

### `05-audit-prep-playbook`
**Q1** (id `09-compliance/05-audit-prep-playbook/q1`)
- prompt: An auditor receives a quarterly access review export where every manager clicked Approve on every user within the same minute, with no comments or removals. What finding is this most likely to generate?
- options: [A) No finding; approval is approval; B) A rubber-stamped review finding — no evidence the reviewer actually analyzed access; C) A password-policy finding; D) An encryption finding]
- correctIndex: 1 (B)
- explanation: Recertification must show evidence of genuine review (some changes, comments, time spent, or removals over time). Uniform instant approvals indicate a rubber-stamp, which auditors treat as an ineffective control even though the artifact exists. 

**Q2** (id `09-compliance/05-audit-prep-playbook/q2`)
- prompt: Which item is NOT typically part of an IAM PBC (Provided-By-Client) evidence request?
- options: [A) User access listings for in-scope systems; B) Access recertification sign-off exports; C) The auditor's internal staffing budget; D) Terminated-user removal evidence matched to the HR feed]
- correctIndex: 2 (C)
- explanation: The PBC list is evidence the client provides about its controls — access listings, recert exports, termination evidence. The auditor's own staffing/budget is internal to the audit firm and never a client deliverable.

---

## Wiring tasks (exact edits)

> Do these together in the same commit as (or immediately before) each section's MDX so the drift test and the loader stay consistent. Section directory on disk: `content/modules/09-compliance/`.

**1. `content/modules.json`** — replace the `09-compliance` object's empty `sections: []` with the ordered slug array, and update the summary off the "Coming" placeholder:
```jsonc
{
  "id": "09-compliance",
  "title": "Compliance & Audit",
  "phase": 3,
  "order": 9,
  "summary": "Proving IAM controls to the auditors — frameworks, evidence, and the playbook.",
  "sections": [
    "01-control-frameworks",
    "02-financial-and-payment",
    "03-privacy-and-federal",
    "04-iam-controls-matrix",
    "05-audit-prep-playbook"
  ]
}
```

**2. `lib/sections.ts`** — add five `SECTION_TITLES` entries (titles must match each MDX H1 exactly):
```ts
'09-compliance/01-control-frameworks': 'The Control Frameworks: NIST 800-53 & CSF 2.0',
'09-compliance/02-financial-and-payment': 'Financial & Payment: PCI-DSS, SOX 404, FFIEC',
'09-compliance/03-privacy-and-federal': 'Privacy & Federal: HIPAA, GDPR, FedRAMP',
'09-compliance/04-iam-controls-matrix': 'The IAM Controls Matrix: Framework, Control, Evidence',
'09-compliance/05-audit-prep-playbook': 'The Audit Prep Playbook',
```
Do **NOT** add any of these slugs to `SC300_SECTIONS` — none are SC-300-aligned. (If the author later decides any subsection warrants the badge, add the slug to the set and render `<SC300Badge />`; the default for this module is no badge.)

**3. `lib/content-loader.ts`** — add the five keys to **both** `AUTHORED_SECTIONS` and `ALL_KNOWN_SECTIONS`, and add five `case` arms in `loadAuthoredComponent`:
```ts
// AUTHORED_SECTIONS and ALL_KNOWN_SECTIONS — add these five keys to each set:
'09-compliance/01-control-frameworks',
'09-compliance/02-financial-and-payment',
'09-compliance/03-privacy-and-federal',
'09-compliance/04-iam-controls-matrix',
'09-compliance/05-audit-prep-playbook',
```
```ts
// loadAuthoredComponent switch — add:
case '09-compliance/01-control-frameworks':
  return (await import('@/content/modules/09-compliance/01-control-frameworks.mdx')).default
case '09-compliance/02-financial-and-payment':
  return (await import('@/content/modules/09-compliance/02-financial-and-payment.mdx')).default
case '09-compliance/03-privacy-and-federal':
  return (await import('@/content/modules/09-compliance/03-privacy-and-federal.mdx')).default
case '09-compliance/04-iam-controls-matrix':
  return (await import('@/content/modules/09-compliance/04-iam-controls-matrix.mdx')).default
case '09-compliance/05-audit-prep-playbook':
  return (await import('@/content/modules/09-compliance/05-audit-prep-playbook.mdx')).default
```
> Important ordering rule: a key may only be added to `AUTHORED_SECTIONS` / the `switch` **after** the matching `.mdx` file exists on disk (webpack resolves these imports at build time). So per-section flow is: write the `.mdx` → add the loader case → add the modules.json slug + sections.ts title → run tests/build.

**4. Frontmatter** — each `.mdx` gets standard frontmatter (mirror existing sections): `title` matching the H1, `section: N`, `module: 09-compliance`, `sc300: false`, `estimatedMinutes`, `keywords: [...]`, `phase: 3`, `status: seeded`.

**5. No diagram, no recipes** — `newDiagram = ""`; no `mdx-components.tsx` change; no `lib/recipes.ts` change.

---

## Diagram

None. `newDiagram = ""`. This module's visual artifacts are crosswalk **tables/matrices** (sections 04 and 05), not an animated flow. No `FlowDiagram` composition, no `.test.tsx`, no `mdx-components.tsx` registration. (Table-render verification is tracked as a [VERIFY] in the house-style notes above, not a diagram build.)

---

## Verification (per section, before commit)

1. `pnpm test` — the modules.json ↔ sections.ts drift test must pass (it will fail if any slug lacks a title entry).
2. `pnpm build` — confirms each new `import` case resolves to a real `.mdx` file.
3. `pnpm dev` — open `/modules/09-compliance` and each `/modules/09-compliance/<slug>`; confirm: H1 matches the SECTION_TITLES entry; every `<Flashcard>` appears in `/flashcards/09-compliance`; every `<Quiz>` renders and grades; tables render as tables (the section-04 [VERIFY]); no console errors.
4. Word-count check per section (~2,700–3,000).
5. Accuracy pass: grep the section for `[VERIFY]` markers and resolve each against the primary source before declaring the section done.

---

## Commit plan

Branch: `feat/module-09-compliance`

One commit per section (each commit = the `.mdx` + its three-file wiring so the repo stays green at every commit):
1. `feat(compliance): add 01-control-frameworks (NIST 800-53 AC/IA + CSF 2.0)`
2. `feat(compliance): add 02-financial-and-payment (PCI-DSS 4.0 Req 7/8, SOX 404, FFIEC)`
3. `feat(compliance): add 03-privacy-and-federal (HIPAA 164.312, GDPR, FedRAMP)`
4. `feat(compliance): add 04-iam-controls-matrix (framework-control-evidence crosswalk)`
5. `feat(compliance): add 05-audit-prep-playbook (evidence, walkthrough, findings)`

Then merge to `main` once `pnpm test` + `pnpm build` are green and all `[VERIFY]` markers are resolved. Per the promotion flag, sequence 02 and 05 first if the module is sliced across sessions.
