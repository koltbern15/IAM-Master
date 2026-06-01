# Module 8 — IAM Security & Threat Detection: Complete Content Plan

> **Goal:** Author the 5-section Module 8 (`content/modules/08-security-detection/`) teaching identity attack techniques, identity threat-detection products (Microsoft Defender for Identity, CrowdStrike Falcon Identity, Semperis), KQL identity hunting in Sentinel, and identity incident response — so an engineer with zero context can author the whole module from this doc.

**Architecture note:** Pure authoring. No architectural change. Each section is a single `.mdx` file rendered data-driven by the existing shell. Interactive content (`<Flashcard>`, `<Quiz>`, `<Definition>`, `<WarStory>`, `<ProTip>`, `<HoloPanel>`, `<SC300Badge/>`) is authored **inline** and extracted at runtime by `lib/content-index.ts`. KQL and PowerShell commands render via `<PowerShellBlock>` (it is a generic styled code block, not PowerShell-specific) or fenced code. The optional attack-path diagram, if built, composes the existing `components/diagrams/FlowDiagram.tsx` primitive (it already supports `intent: 'threat'` red nodes/steps) — see "Optional diagram" below.

**Prereqs / conventions (read before authoring — verified against the codebase):**

1. **Two-file sync (a unit test enforces it).** Adding sections requires editing BOTH `content/modules.json` (the `08-security-detection` `sections: []` array) AND `lib/sections.ts` (`SECTION_TITLES` entry for every slug + `SC300_SECTIONS` entry for cert-aligned slugs). `lib/sections.test.ts` asserts every `modules.json` slug has a curated title. **NOTE:** that test currently hardcodes `expect(ordered).toHaveLength(17)` (`lib/sections.test.ts:27`) and order assertions; adding 5 sections makes the curriculum 22 sections, so the `toHaveLength(17)` literal must be bumped to `22` (and the last-section assertion at lines 40–45 still holds because Module 11 stays last). Flag this in the wiring commit. Reference: `lib/sections.ts:27-54`.
2. **Content-loader registration.** Each new MDX section needs an entry in `lib/content-loader.ts` in BOTH `AUTHORED_SECTIONS` (the `Set` at lines 46-64) AND `ALL_KNOWN_SECTIONS` (lines 120-138) AND a static-import `case` in `loadAuthoredComponent` (lines 75-112). This is the only app-code touch to light up a section. Reference: `lib/content-loader.ts`.
3. **Interactive content is INLINE MDX.** No `flashcards.json` / `quizzes.json` sidecars. The runtime extractors in `lib/content-index.ts` impose **hard syntax rules** (verified against `lib/content-index.ts:90-139`):
   - **`<Flashcard>` must be a single self-closing tag** matching `/<Flashcard\b([^>]*?)\/>/` with double-quoted `front="..."` and `back="..."`. **No literal double-quotes inside attribute values** — use the HTML entity `&quot;` (the extractor decodes `&quot; &amp; &lt; &gt; &#39;`). No newlines that break the single-tag match; keep each card on as few lines as the existing files do (they put the whole tag on one line).
   - **`<Quiz>`** prompts are harvested via `/prompt:\s*"([^"]+)"/`, so the `prompt:` value must be a plain double-quoted string with **no embedded unescaped double-quotes** (entity-encode or rephrase). Quizzes use the object form `<Quiz question={{ id, prompt, options: [...], correctIndex, explanation }} />` — copy the exact shape from `02-protocols/01-kerberos.mdx:74-98`. Each `id` must be unique: use `08-security-detection/<slug>/q<n>`.
   - **`<Definition term="...">body</Definition>`** and **`<WarStory title="...">body</WarStory>`** are block tags with double-quoted attributes; bodies feed search/glossary. Entity-encode any double-quotes in the `term`/`title` attributes.
4. **House style** (mirror `02-protocols/01-kerberos.mdx` and `03-microsoft-identity/02-entra-id.mdx`): open with an MDX comment `{/* Objectives current as of 2026-06-01. Re-verify each before a cert sitting. */}`, then a `<HoloPanel label="COVERS">` markdown-bullet block mapping to SC-300 / Security+ SY0-701 / CISSP where relevant, then the H1, then prose in the **what / why / how-under-the-hood / war-story / recall-drill / check-your-understanding** rhythm using `<Definition>`, `<ProTip>`, `<WarStory>`, embedded `<Quiz>` and `<Flashcard>`, and a diagram where one fits. **Depth benchmark: ~2,700–3,000 words/section** (Kerberos = 2,736 words).
5. **ACCURACY IS NON-NEGOTIABLE.** Cite the real MITRE ATT&CK technique ID, MS Learn doc, vendor doc, RFC, or NIST SP for every non-obvious claim. Never invent product behavior, detection names, table/column names, or control numbers. Anything you are not certain of is drafted below with a trailing **[VERIFY]** marker — the author must confirm against the live source before publishing. Cross-link Module 2 Kerberos attack content (`02-protocols/01-kerberos.mdx`) rather than re-deriving it.

**SC-300 alignment:** Module 8 is mostly post-SC-300 depth, but **Entra ID Protection (risk detections, sign-in/user risk)** and **risk-based Conditional Access** are squarely SC-300 "Implement access management — Identity Protection" objectives. Those subsections get `<SC300Badge />` inline. Per the assignment, set the `sc300` flag in `lib/sections.ts` for the two sections where Identity Protection / risk-based CA is load-bearing: **`02-defender-for-identity`** (MDI feeds Identity Protection / XDR risk) and **`05-identity-incident-response`** (tenant-wide token revocation + risk-based CA remediation). Sections 01/03/04 stay `sc300: false` (attack theory, third-party tools, KQL are beyond the SC-300 blueprint) but still render `<SC300Badge />` *inline* at any paragraph that touches an Identity Protection risk concept. **[VERIFY]** the exact SC-300 objective wording against the current MS exam outline (skills measured) before the cert sitting.

---

## Section map

### `01-identity-attack-techniques` — Identity Attack Techniques (MITRE ATT&CK)
- **Title (SECTION_TITLES):** `Identity Attack Techniques`
- **Word target:** ~3,000
- **sc300 flag:** `false` (render `<SC300Badge />` inline only where risk-based detection is referenced)
- **SC-300 alignment:** Indirect — this is the threat model that risk-based CA and Identity Protection defend against. No `sc300` flag; one inline `<SC300Badge />` where Identity Protection detections map to these TTPs.
- **Topics / study material (every subtopic + the authoritative source to cite):**
  - **Framing — the identity kill chain.** Position these TTPs on the credential-access → lateral-movement → privilege-escalation arc. Cite **MITRE ATT&CK Enterprise** matrix, tactics **TA0006 Credential Access**, **TA0008 Lateral Movement**, **TA0004 Privilege Escalation** (attack.mitre.org). Cross-link `02-protocols/01-kerberos.mdx` for the protocol mechanics — do not re-explain AS-REQ/TGS-REP here, *attack* it.
  - **Kerberoasting** — any authenticated user requests a service ticket (TGS) for an SPN; ticket is encrypted with the service account's long-term key; crack offline (esp. RC4). Cite **MITRE ATT&CK T1558.003 (Steal or Forge Kerberos Tickets: Kerberoasting)**. Mitigation: AES-only `msDS-SupportedEncryptionTypes`, gMSA. Cross-link Kerberos section.
  - **AS-REP Roasting** — accounts with `DONT_REQ_PREAUTH` (Kerberos pre-auth disabled) let an attacker request an AS-REP whose encrypted blob is crackable offline without any credential. Cite **MITRE ATT&CK T1558.004 (AS-REP Roasting)**. Mitigation: never disable pre-auth; alert on `userAccountControl` flag 0x400000. **[VERIFY]** the UAC flag name `DONT_REQUIRE_PREAUTH` value.
  - **Golden Ticket** — forged TGT signed with the `krbtgt` long-term key; impersonate any principal. Cite **MITRE ATT&CK T1558.001 (Golden Ticket)**. Cross-link the Kerberos war story (the un-rotated 2008 krbtgt). Remediation lands in section 05.
  - **Silver Ticket** — forged service ticket signed with a single service account key; never contacts the KDC (stealthier, no KDC event). Cite **MITRE ATT&CK T1558.002 (Silver Ticket)**.
  - **Diamond Ticket** (newer variant) — request a *real* TGT then modify its PAC in memory; generates legitimate KDC events. Cite CrowdStrike / SpecterOps research and reference **T1558** parent. Mark **[VERIFY]** — there is no dedicated ATT&CK sub-ID for Diamond Ticket; describe it as a variant, do not invent an ID.
  - **Pass-the-Hash (PtH)** — reuse a captured NTLM hash to authenticate without cracking it (NTLM challenge/response uses the hash directly). Cite **MITRE ATT&CK T1550.002 (Use Alternate Authentication Material: Pass the Hash)**. Mitigation: LAPS, Credential Guard, Tier-0 isolation, disabling NTLM where possible.
  - **Pass-the-Ticket (PtT)** — inject a stolen/forged Kerberos TGT or service ticket into a session. Cite **MITRE ATT&CK T1550.003 (Pass the Ticket)**.
  - **OS Credential Dumping** as the enabler — LSASS memory dump → Mimikatz. Cite **MITRE ATT&CK T1003.001 (LSASS Memory)**. This is the precursor to PtH/PtT/Golden/Silver.
  - **DCSync** — abuse the **Directory Replication Service Remote Protocol (MS-DRSR / `DRSGetNCChanges`)** to ask a DC to replicate password hashes (including `krbtgt`) as if you were another DC. Cite **MITRE ATT&CK T1003.006 (DCSync)**. Requires `Replicating Directory Changes` + `Replicating Directory Changes All` rights — audit who holds them.
  - **OAuth consent phishing / illicit consent grant** — trick a user into consenting to a malicious app requesting scopes like `Mail.ReadWrite`, `offline_access`; attacker gets a refresh token, no password needed, survives password reset. Cite **MITRE ATT&CK T1528 (Steal Application Access Token)** + **MS Learn: "Illicit consent grant" / app consent policies**. Cross-link `03-microsoft-identity/02-entra-id.mdx` (admin consent control). Mitigation: restrict user consent, admin consent workflow, app governance.
  - **Token theft / AiTM (adversary-in-the-middle) session-cookie replay** — phishing proxy (Evilginx-style) steals the post-MFA session token/cookie and replays it, bypassing MFA. Cite **MITRE ATT&CK T1550.004 (Web Session Cookie)** + **MS Learn AiTM phishing / token protection (token binding)**. Mitigation: phishing-resistant MFA (FIDO2), token protection / CAE, sign-in risk policies.
  - **Primary Refresh Token (PRT) abuse** — stealing/forging a device-bound PRT for SSO. Cite Microsoft / Dirk-jan Mollema research; mark **[VERIFY]** for any specific ATT&CK mapping.
  - **Defensive throughline:** every technique maps to a detection in sections 02–04 and a containment step in 05. End with a table-style paragraph mapping technique → ATT&CK ID → primary detector (MDI / Identity Protection / Sentinel KQL).
- **Components to embed:** `<HoloPanel label="COVERS">`; `<Definition>` for Kerberoasting, DCSync, Pass-the-Hash, illicit consent grant, AiTM; `<ProTip>` (RC4 = the crack accelerant; cross-link Kerberos); `<WarStory>` (the AiTM token-theft incident below); 5 inline `<Flashcard>`; 2 inline `<Quiz>`; optional `<IdentityAttackPathDiagram />` if the diagram is built (else cross-link `<KerberosFlowDiagram />`).

### `02-defender-for-identity` — Microsoft Defender for Identity
- **Title (SECTION_TITLES):** `Microsoft Defender for Identity`
- **Word target:** ~2,800
- **sc300 flag:** `true` (MDI signals feed Identity Protection / Defender XDR risk → risk-based CA)
- **SC-300 alignment:** Identity Protection risk feed is SC-300 "Implement access management." Render `<SC300Badge />` at the Identity-Protection-integration paragraph. **[VERIFY]** exact objective wording.
- **Topics / study material:**
  - **What MDI is** — agentless-from-the-DC sensor that reads on-prem AD (and now AD CS / Entra Connect) signals to detect identity attacks; part of **Microsoft Defender XDR**, formerly "Azure ATP." Cite **MS Learn: "What is Microsoft Defender for Identity".**
  - **Sensor architecture** — the **Defender for Identity sensor** installed directly on **Domain Controllers, AD CS, and AD FS servers**; reads local traffic + Windows events + ETW, no port mirroring needed (the legacy "standalone sensor" with SPAN is deprecated). Cite **MS Learn: "Defender for Identity architecture" / sensor types.** **[VERIFY]** current supported sensor server roles (DC, AD CS, AD FS, Entra Connect) against the live doc.
  - **Data sources** — network traffic to/from the DC, Windows security events (e.g., 4776, 4624, 4768/4769 Kerberos, 4662 for DCSync-relevant directory access), and ETW. Cite **MS Learn: "Event collection / Configure audit policies for Defender for Identity".** **[VERIFY]** the specific event IDs MDI consumes.
  - **Detection categories mapped to the kill chain** — Reconnaissance (account/SMB/DNS enum), Compromised credentials (brute force, suspected Kerberoasting, AS-REP), Lateral movement (PtH, PtT, overpass-the-hash, exposure paths), Domain dominance (Golden Ticket, suspected DCSync, skeleton key, malicious replication, remote code execution on DC). Cite **MS Learn: "Defender for Identity security alerts" reference.** Pull a handful of *real* alert names verbatim and mark **[VERIFY]** for each exact string (e.g., "Suspected DCSync attack (replication of directory services)", "Suspected Golden Ticket usage (encryption downgrade)", "Suspected Kerberoasting"). Cross-link section 01 technique IDs.
  - **Lateral Movement Paths (LMPs)** — MDI graphs paths from a non-sensitive entry account to a sensitive (Tier-0) account via local-admin overlap and active sessions; surfaces "how an attacker could reach Domain Admin." Cite **MS Learn: "Understand lateral movement paths".**
  - **Honeytokens (decoy / honeytoken accounts)** — designate dormant accounts as honeytokens in MDI; any authentication attempt against them is high-fidelity alert. Cite **MS Learn: "Defender for Identity honeytoken / entity tags / sensitive accounts".** **[VERIFY]** current config location (Identity settings → entity tags → Honeytoken).
  - **Identity security posture / ITDR recommendations** — MDI surfaces posture assessments (unsecure account attributes, legacy protocols, weak encryption) and exposure recommendations now folded into Microsoft Secure Score / Exposure Management. Cite **MS Learn: "Identity security posture assessments".** **[VERIFY]** current product surface (some assessments migrated to Exposure Management).
  - **Integration into Defender XDR + Identity Protection + Sentinel** — MDI alerts roll into Defender XDR incidents, contribute to the **user risk** signal Entra ID Identity Protection consumes (`<SC300Badge />` here), and can be ingested into Microsoft Sentinel for KQL hunting (sets up section 04). Cite **MS Learn: "Defender for Identity and Identity Protection integration" / Defender XDR + Sentinel unified portal.** **[VERIFY]** exact integration wording.
  - **Action accounts / response actions** — MDI can disable a user, reset a password, or suspend an account via a configured **gMSA action account** (directory service / managed action account). Cite **MS Learn: "Defender for Identity action accounts / remediation actions".** Sets up section 05 containment.
  - **Licensing** — MDI is included in **Microsoft Defender for Identity** standalone or as part of **Microsoft 365 E5 / E5 Security**. Cite **MS Learn: "Defender for Identity licensing".** **[VERIFY]** current SKU bundling.
- **Components to embed:** `<HoloPanel label="COVERS">` (with one SC-300 line for Identity Protection); `<Definition>` for sensor, Lateral Movement Path, honeytoken, action account; `<SC300Badge />` inline at the Identity-Protection-integration paragraph; `<ProTip>` (deploy a sensor on EVERY DC + AD CS + AD FS or you have blind spots); `<WarStory>` (the DCSync that MDI caught — below); ~11 `<Flashcard>`; 3 `<Quiz>`. No diagram required (optional cross-link to the attack-path diagram).

### `03-crowdstrike-semperis` — CrowdStrike Falcon Identity & Semperis
- **Title (SECTION_TITLES):** `CrowdStrike Falcon Identity & Semperis`
- **Word target:** ~2,800
- **sc300 flag:** `false`
- **SC-300 alignment:** None (third-party ITDR). No badge except an inline `<SC300Badge />` if you draw a contrast to Identity Protection.
- **Topics / study material:**
  - **The ITDR product category** — Identity Threat Detection and Response; where it sits relative to EDR/XDR/SIEM. Cite **Gartner "Identity Threat Detection and Response (ITDR)" definition.** Frame the section as: detection (CrowdStrike) vs. AD-specific resilience + recovery (Semperis).
  - **CrowdStrike Falcon Identity Protection** — agentless? no: it uses a lightweight collector tied to the Falcon platform + DC integration to watch AD and Entra ID auth in real time; enforces risk-based **conditional access / MFA challenge** on risky authentications, detects PtH/PtT/Golden Ticket/DCSync/anomalous service-account use. Cite **CrowdStrike "Falcon Identity Protection" product docs / datasheet.** **[VERIFY]** the deployment model (collector vs. on-DC) and exact capability names against current CrowdStrike docs — do not invent module names.
  - **Falcon Identity — risk scoring & policy** — continuous identity risk score per account; policy can step up to MFA or block; integrates with the broader Falcon detections (endpoint → identity correlation). Cite CrowdStrike docs. **[VERIFY].**
  - **Service-account visibility** — Falcon Identity flags stale/over-privileged service accounts and anomalous service-account authentication (a recurring banking pain point). Cite CrowdStrike docs. **[VERIFY].**
  - **Semperis Directory Services Protector (DSP)** — continuous AD (and Entra) threat detection focused on dangerous changes, with an auto-undo capability for malicious changes and indicators of exposure/compromise (IoE/IoC). Cite **Semperis "Directory Services Protector" docs.** **[VERIFY]** the auto-remediation feature name.
  - **Semperis ADFR (Active Directory Forest Recovery)** — automated, malware-free, bare-metal forest recovery to a clean state after a destructive attack (ransomware / wiper / Golden-Ticket-poisoned forest); addresses Microsoft's notoriously manual 28-step forest-recovery runbook. Cite **Semperis "Active Directory Forest Recovery (ADFR)" docs** and **Microsoft "AD Forest Recovery" guide** for the manual baseline it automates. **[VERIFY]** the "28-step" figure or describe it as "a long manual runbook" without a number if unsure.
  - **Purple Knight** — Semperis's free AD/Entra security assessment tool (IoE scanner). Cite **Semperis "Purple Knight".** **[VERIFY].**
  - **When you reach for which** — decision framing: MDI (native, included in E5, deep MS integration) vs. CrowdStrike Falcon Identity (best-of-breed real-time enforcement, endpoint correlation) vs. Semperis (AD-specific change detection + the only credible *recovery* story). Stress: detection without a tested *recovery* path is incomplete — Semperis fills the recovery gap MDI/Falcon don't own. This sets up section 05.
  - **Vendor-neutral honesty:** mark product-specific capability claims **[VERIFY]** generously; vendor feature names change and this is the section most prone to drift.
- **Components to embed:** `<HoloPanel label="COVERS">` (Security+/CISSP "identity threat detection" angle; note no direct SC-300 mapping); `<Definition>` for ITDR, Indicator of Exposure (IoE), forest recovery; `<ProTip>` (you can detect Golden Tickets all day — if you can't *recover the forest* you haven't solved the problem); `<WarStory>` (ransomware-poisoned forest recovered with ADFR — below); ~10 `<Flashcard>`; 2 `<Quiz>`. No diagram.

### `04-kql-identity-hunting` — KQL Identity Hunting in Microsoft Sentinel
- **Title (SECTION_TITLES):** `KQL Identity Hunting`
- **Word target:** ~3,000
- **sc300 flag:** `false`
- **SC-300 alignment:** None (Sentinel/KQL is SC-200 territory) — but SigninLogs/AuditLogs are the Entra logs SC-300 mentions for monitoring. One inline `<SC300Badge />` where Entra sign-in monitoring touches the SC-300 "monitor identity" objective is acceptable.
- **Topics / study material (use `<PowerShellBlock>` or fenced code for every query; KQL is not PowerShell but the block is a generic styled code box):**
  - **What KQL + Sentinel are** — Kusto Query Language, read-only, pipe-based (`|`) analytics over Log Analytics tables; Microsoft Sentinel = cloud-native SIEM/SOAR on Log Analytics. Cite **MS Learn: "Kusto Query Language overview" + "What is Microsoft Sentinel".**
  - **The core identity tables** — `SigninLogs` (interactive sign-ins), `AADNonInteractiveUserSignInLogs`, `AADServicePrincipalSignInLogs`, `AuditLogs` (directory changes: role assignments, app consents, CA policy edits), `IdentityInfo` (UEBA-enriched user context), `IdentityLogonEvents` / `BehaviorAnalytics` (UEBA), `SecurityAlert` (MDI/Defender alerts). Cite **MS Learn table references** for each. **[VERIFY]** exact table names and that they're in the customer's workspace (some require connectors/UEBA enabled).
  - **KQL fundamentals for hunting** — `where`, `project`, `summarize ... by bin(TimeGenerated, 1h)`, `count()`, `dcount()`, `extend`, `join kind=inner`, `make-set`, `arg_max()`, time filters `ago(7d)`. Cite **MS Learn KQL operator references.** Teach by building queries, not by listing operators.
  - **Detection-engineering patterns** — translate each section-01 TTP into a hunting query:
    - **Password spray** — one source IP / many distinct target users / many failed sign-ins (ResultType 50126) in a short window: `SigninLogs | where ResultType == 50126 | summarize dcount(UserPrincipalName) by IPAddress, bin(TimeGenerated, 1h)`. **[VERIFY]** ResultType 50126 = "invalid username or password." Cite **MS Learn sign-in error codes.**
    - **Impossible travel / atypical location** — two sign-ins from geographically impossible locations within minutes (note Identity Protection already does this; the query demonstrates the logic). `<SC300Badge />` near this paragraph.
    - **MFA fatigue** — repeated MFA-required/denied events for one user. **[VERIFY]** the AuthenticationDetails / ResultType signature.
    - **Illicit consent grant** — `AuditLogs | where OperationName has "Consent to application"` — surface new app consents to risky scopes. **[VERIFY]** exact `OperationName` string.
    - **New CA policy / CA policy disabled** — `AuditLogs` operations `Add conditional access policy` / `Update conditional access policy` (attacker weakening controls). **[VERIFY]** exact operation names.
    - **Risky sign-in correlation** — join `SigninLogs` RiskLevelDuringSignIn with `SecurityAlert` to enrich.
    - **Dormant account suddenly active / first-time service-principal sign-in** — `arg_max`/`make-set` over historical baselines.
  - **Analytics rules vs. hunting queries** — scheduled analytics rule (generates incidents) vs. ad-hoc hunting query vs. the **Hunting** blade and **bookmarks**; mention the community **Azure-Sentinel** GitHub repo as a source of vetted queries (cite **github.com/Azure/Azure-Sentinel**). **[VERIFY]** repo path/name (it may be under `Azure/Azure-Sentinel` or microsoft).
  - **Operational notes** — query performance (time-filter first), `parse`/dynamic columns for nested JSON (`AuditLogs` `TargetResources`), watchlists for known-good IPs, and the cost model (ingestion-based). Cite **MS Learn Sentinel pricing / KQL best practices.**
  - **Detection-as-code** — version queries in git, deploy analytics rules via ARM/Bicep or the Sentinel `Microsoft.SecurityInsights` API; sets the maturity bar.
- **Components to embed:** `<HoloPanel label="COVERS">`; `<PowerShellBlock title="KQL — PASSWORD SPRAY">` (and one per pattern, ~5-6 query blocks total) — **author every query so it parses; mark logic [VERIFY] where a ResultType / OperationName / table column is asserted**; `<Definition>` for KQL, analytics rule, UEBA, hunting bookmark; `<ProTip>` (always time-filter first; ResultType codes are your friend); `<WarStory>` (the KQL hunt that found the password-spray foothold — below); ~12 `<Flashcard>`; 3 `<Quiz>`. No diagram.

### `05-identity-incident-response` — Identity Incident Response
- **Title (SECTION_TITLES):** `Identity Incident Response`
- **Word target:** ~2,800
- **sc300 flag:** `true` (tenant-wide token revocation + risk-based CA remediation are Identity Protection / access-management objectives)
- **SC-300 alignment:** Risk-based CA remediation, secure-password-reset-on-high-user-risk, and session/token revocation are SC-300 "Implement access management — Identity Protection." Render `<SC300Badge />` at those paragraphs. **[VERIFY]** objective wording.
- **Topics / study material:**
  - **IR framing** — map to **NIST SP 800-61** (Computer Security Incident Handling Guide) phases: Preparation, Detection & Analysis, Containment/Eradication/Recovery, Post-Incident. Cite **NIST SP 800-61 (Rev. 2, and Rev. 3 / 800-61r3 if published)** — **[VERIFY]** current revision number/title. Identity IR specializes the generic playbook.
  - **Containing a compromised cloud identity (Entra ID)** — disable/block sign-in, **revoke refresh tokens / sessions** (`Revoke-MgUserSignInSession` in Microsoft Graph PowerShell; portal "Revoke sessions"), force password reset, require re-registration of MFA if MFA methods may be attacker-controlled, review/revoke app consents and remove malicious enterprise apps. Cite **MS Learn: "Respond to compromised accounts" / "Remediate risks and unblock users"** + **Graph PowerShell `Revoke-MgUserSignInSession`.** `<SC300Badge />` here. **[VERIFY]** cmdlet name.
  - **Continuous Access Evaluation (CAE)** — why token revocation isn't instant without CAE (access tokens valid ~1h) and how CAE near-real-time-revokes on disable/password-reset/high-risk. Cross-link `03-microsoft-identity/02-entra-id.mdx` (CAE flashcard). Cite **MS Learn: "Continuous Access Evaluation".**
  - **Tenant-wide token revocation / mass remediation** — when many identities are compromised: bulk session revocation, conditional-access "block all + break-glass exception," tenant-wide consent revocation, rotating compromised app credentials/secrets. Cite **MS Learn mass-remediation guidance.** Note the break-glass account caveat (must be excluded from the block — cross-link Entra break-glass flashcard). `<SC300Badge />` here.
  - **Containing a compromised on-prem identity** — disable account, reset password **twice** for privileged accounts (to clear cached/PtH-usable material), invalidate Kerberos tickets, isolate the host, hunt for persistence (added group memberships, ACL backdoors, scheduled tasks, AdminSDHolder abuse). Cite **MS "Securing privileged access" / Tier model.** **[VERIFY]** the "reset twice" rationale wording.
  - **Golden Ticket remediation & the krbtgt double-reset** — THE marquee runbook. A Golden Ticket is signed with `krbtgt`; the only way to invalidate forged TGTs is to **reset the `krbtgt` password twice in succession** (AD retains the current + previous key version `N`/`N-1`; one reset invalidates current-key tickets but `N-1` still validates; the second reset, after sufficient replication convergence, invalidates the previous-key window). Stress: **wait for full replication between the two resets** (don't reset back-to-back faster than replication completes or you can break authentication). Cite **MS Learn: "AD Forest Recovery — Resetting the krbtgt password"** and the Microsoft **`New-KrbtgtKeys.ps1`** script (GitHub `microsoft/New-KrbtgtKeys.ps1`). Cross-link the Module 2 Kerberos war story (the un-rotated 2008 krbtgt) and its q2 quiz — this section is where that war story's lesson becomes a runbook. **[VERIFY]** script name/repo and the replication-wait guidance.
  - **Eradicating Kerberos persistence beyond krbtgt** — Silver Tickets survive a krbtgt reset (they're signed with the *service account* key, not krbtgt) → must rotate compromised service-account passwords / convert to gMSA. Skeleton key, DSRM-account abuse, and SID-history injection as other persistence to hunt. Cite **MITRE ATT&CK T1558.002 (Silver Ticket)** + **MS "Securing privileged access."** **[VERIFY].**
  - **Forest-level destruction → recovery** — when AD itself is poisoned/ransomed, detection ends and *recovery* begins: clean-OS forest recovery (Microsoft's manual runbook) or Semperis ADFR (cross-link section 03). Cite **Microsoft "AD Forest Recovery" guide.**
  - **Post-incident** — rotate all Tier-0 secrets, review who held `DCSync` rights / `DS-Replication-Get-Changes`, tighten consent policies, deploy honeytokens (cross-link section 02), add detections for the TTP used (cross-link section 04 KQL), tabletop the runbook. Cite **NIST SP 800-61 lessons-learned phase.**
  - **The hard truth** — identity IR is harder than endpoint IR because tokens/tickets are portable and long-lived; you must invalidate *credentials and the trust material that mints them*, not just clean a box.
- **Components to embed:** `<HoloPanel label="COVERS">` (with SC-300 lines for Identity Protection remediation); `<Definition>` for token revocation, krbtgt double-reset, CAE, AdminSDHolder; `<SC300Badge />` at token-revocation and risk-based-remediation paragraphs; `<PowerShellBlock title="GRAPH — REVOKE SESSIONS">` for `Revoke-MgUserSignInSession` and a `New-KrbtgtKeys.ps1` invocation note (mark **[VERIFY]**); `<ProTip>` (reset krbtgt twice, but wait for replication between resets); `<WarStory>` (the Golden Ticket 9-month remediation — reuse/extend the Module 2 bank war story as the IR runbook view, below); ~12 `<Flashcard>`; 2 `<Quiz>`. No diagram.

**Section flashcard/quiz tally:** 01: 5 cards / 2 quiz · 02: 11 / 3 · 03: 10 / 2 · 04: 12 / 3 · 05: 12 / 2 → **50 flashcards, 12 quizzes** (meets target).

---

## Flashcards (drafted)

> Author each as a **single self-closing** `<Flashcard front="..." back="..." />` tag. **Replace every literal double-quote inside text with `&quot;`** (the extractor regex breaks on raw `"` inside attributes). Keep each tag on one line in the MDX.

### 01-identity-attack-techniques (5)
1. What is Kerberoasting and which MITRE ATT&CK technique ID identifies it? -> Any authenticated domain user requests a service ticket (TGS) for a target SPN; the ticket is encrypted with the service account's long-term key, so it can be cracked offline (especially under RC4). MITRE ATT&CK T1558.003. Mitigation: AES-only encryption and gMSAs.
2. What is AS-REP Roasting and what account condition enables it? -> When an account has Kerberos pre-authentication disabled (DONT_REQ_PREAUTH), an attacker can request an AS-REP whose encrypted portion is crackable offline without any credential. MITRE ATT&CK T1558.004. Mitigation: never disable pre-auth; alert on the userAccountControl flag.
3. What does DCSync abuse and what rights does it require? -> DCSync uses the Directory Replication Service protocol (MS-DRSR DRSGetNCChanges) to make a domain controller replicate password hashes (including krbtgt) to the attacker as if they were a DC. It requires the Replicating Directory Changes and Replicating Directory Changes All rights. MITRE ATT&CK T1003.006.
4. How does Pass-the-Hash differ from Pass-the-Ticket? -> Pass-the-Hash (T1550.002) reuses a captured NTLM password hash to authenticate over NTLM without cracking it. Pass-the-Ticket (T1550.003) injects a stolen or forged Kerberos TGT/service ticket into a logon session. Both reuse credential material rather than a plaintext password.
5. What is OAuth consent phishing (illicit consent grant) and why does it survive a password reset? -> An attacker lures a user into consenting to a malicious app requesting scopes like Mail.ReadWrite and offline_access; the app receives OAuth access and refresh tokens, so it retains access without the password and a password reset alone does not revoke it. MITRE ATT&CK T1528. Remediation requires revoking the consent/app and the refresh tokens.

### 02-defender-for-identity (11)
1. What is Microsoft Defender for Identity (MDI)? -> A Microsoft Defender XDR component that detects identity-based attacks on-premises by running a sensor on domain controllers (and AD CS / AD FS), analyzing AD traffic, Windows events, and ETW. Formerly Azure ATP.
2. Where is the MDI sensor installed and why does that matter? -> Directly on domain controllers (and AD CS / AD FS servers). Running on the DC lets it read local authentication traffic and events without port mirroring, so every DC needs a sensor or you have detection blind spots.
3. Which domain-dominance attacks does MDI detect? -> Suspected Golden Ticket usage, suspected DCSync (directory replication), skeleton key, and malicious directory replication / remote code execution on a DC, among others. [VERIFY exact alert names]
4. What is a Lateral Movement Path in MDI? -> A graph MDI builds showing how an attacker could pivot from a non-sensitive account to a sensitive (Tier-0) account through shared local-admin rights and active sessions, exposing the route to Domain Admin.
5. What is a honeytoken account in MDI and why is it high-fidelity? -> A dormant decoy account tagged as a honeytoken that no legitimate user should ever touch; any authentication attempt against it is almost certainly malicious, producing a low-false-positive alert.
6. How does MDI relate to Entra ID Identity Protection? -> MDI feeds on-prem identity signals into Microsoft Defender XDR, which contributes to the user risk signal Identity Protection consumes, allowing risk-based Conditional Access to react to on-prem compromise.
7. What is an MDI action account? -> A configured (often gMSA-backed) account that lets MDI perform response actions such as disabling a user, forcing a password reset, or suspending an account directly in Active Directory.
8. Which Windows event categories must be audited for MDI to detect attacks? -> Kerberos authentication events (4768/4769), NTLM (4776), logon events (4624), and directory-service access (4662 for DCSync-relevant reads), among others; advanced audit policies must be configured. [VERIFY event IDs]
9. What does MDI identity security posture provide? -> Posture assessments and exposure recommendations (unsecure attributes, legacy protocols, weak encryption) surfaced through Secure Score / Exposure Management to reduce the identity attack surface. [VERIFY current surface]
10. What licensing includes Defender for Identity? -> Microsoft Defender for Identity standalone, or as part of Microsoft 365 E5 / E5 Security. [VERIFY current SKU bundling]
11. How does MDI fit with Microsoft Sentinel? -> MDI alerts surface as Defender XDR incidents and can be ingested into Microsoft Sentinel, where SecurityAlert and related tables are queried with KQL for hunting and correlation.

### 03-crowdstrike-semperis (10)
1. What does ITDR stand for and what gap does it fill? -> Identity Threat Detection and Response: a category (per Gartner) focused on detecting and responding to attacks against identity infrastructure (AD/Entra), sitting between EDR/XDR and SIEM by specializing in identity-layer threats.
2. What does CrowdStrike Falcon Identity Protection do? -> Provides real-time visibility into AD and Entra authentication, scores identity risk continuously, and can enforce step-up MFA or block on risky authentications, detecting PtH, PtT, Golden Ticket, DCSync, and anomalous service-account use. [VERIFY capability names]
3. What is a recurring identity-risk finding Falcon Identity surfaces in enterprises? -> Stale and over-privileged service accounts and anomalous service-account authentication, a common and high-impact blind spot. [VERIFY]
4. What is Semperis Directory Services Protector (DSP)? -> A product for continuous AD (and Entra) threat detection that flags dangerous changes, surfaces indicators of exposure/compromise, and can automatically roll back malicious directory changes. [VERIFY auto-rollback feature name]
5. What does Semperis ADFR do? -> Active Directory Forest Recovery automates malware-free, bare-metal recovery of an entire AD forest to a clean state after a destructive attack, replacing Microsoft's long manual forest-recovery runbook.
6. Why is forest recovery a distinct problem from threat detection? -> Detecting an attack does not undo a poisoned or destroyed directory; after a Golden-Ticket-compromised or ransomed forest you must rebuild trust from a clean state, which is a recovery discipline detection tools alone do not provide.
7. What is Purple Knight? -> Semperis's free security-assessment tool that scans AD and Entra for indicators of exposure and misconfiguration. [VERIFY]
8. How do you choose between MDI, CrowdStrike Falcon Identity, and Semperis? -> MDI is native and included in E5 with deep Microsoft integration; Falcon Identity is best-of-breed real-time enforcement with endpoint correlation; Semperis specializes in AD change detection and the only credible automated recovery story. They are complementary, not strictly substitutes.
9. What is an Indicator of Exposure (IoE) in the AD security context? -> A configuration or state that an attacker could exploit (e.g., risky delegation, weak krbtgt hygiene, dangerous ACLs) even before any active attack, surfaced by tools like Purple Knight / DSP.
10. Why is detection without a tested recovery path incomplete for AD? -> Because credential and trust material (krbtgt, service-account keys) can be forged and persist; if the forest is compromised at the trust level, only a validated recovery process restores integrity, so resilience requires both detection and recovery.

### 04-kql-identity-hunting (12)
1. What is KQL and where does Microsoft Sentinel run it? -> Kusto Query Language is a read-only, pipe-based analytics language; Microsoft Sentinel is a cloud-native SIEM/SOAR built on Azure Log Analytics, where KQL queries the ingested identity and security tables.
2. Which Sentinel table holds Entra interactive sign-ins? -> SigninLogs. Non-interactive and service-principal sign-ins are in AADNonInteractiveUserSignInLogs and AADServicePrincipalSignInLogs respectively. [VERIFY table names]
3. Which table records Entra directory changes like role assignments and app consents? -> AuditLogs, where OperationName identifies the change and TargetResources holds the affected objects.
4. Write the KQL shape to detect password spray. -> SigninLogs | where ResultType == 50126 | summarize FailedUsers = dcount(UserPrincipalName) by IPAddress, bin(TimeGenerated, 1h) | where FailedUsers > threshold. ResultType 50126 = invalid username or password. [VERIFY code]
5. What does summarize ... by bin(TimeGenerated, 1h) do? -> It aggregates rows into one-hour time buckets, computing aggregates (count, dcount) per bucket, which is how you spot bursts like spray or fatigue over time.
6. What is the difference between a Sentinel analytics rule and a hunting query? -> An analytics rule runs on a schedule and generates incidents automatically; a hunting query is run ad hoc (or saved as a bookmark) to proactively investigate without raising an incident.
7. How would you hunt illicit consent grants in KQL? -> Query AuditLogs for consent operations (e.g., OperationName has "Consent to application") and inspect the granted scopes in TargetResources for high-risk permissions like Mail.ReadWrite. [VERIFY OperationName]
8. What is the IdentityInfo table used for? -> It provides UEBA-enriched user context (department, manager, account attributes) to enrich identity hunting and join against sign-in/audit events. [VERIFY]
9. Which KQL operator joins two tables and what should you watch for? -> join (e.g., kind=inner); watch the join order and dataset size for performance, and filter each side by time before joining.
10. Why filter by time first in a KQL query? -> Log Analytics is time-partitioned; a leading TimeGenerated filter (e.g., where TimeGenerated > ago(7d)) drastically reduces scanned data, improving speed and cost.
11. What does arg_max() accomplish in identity hunting? -> It returns the row with the maximum value of an expression per group (e.g., the latest sign-in per user), useful for baselining last-seen activity and spotting dormant accounts going active.
12. What is detection-as-code for Sentinel? -> Versioning KQL analytics rules in git and deploying them via ARM/Bicep or the SecurityInsights API, so detections are reviewed, tested, and reproducible rather than hand-edited in the portal.

### 05-identity-incident-response (12)
1. Which NIST publication defines the incident-response lifecycle? -> NIST SP 800-61 (Computer Security Incident Handling Guide): Preparation; Detection & Analysis; Containment, Eradication & Recovery; Post-Incident Activity. [VERIFY current revision]
2. How do you contain a compromised Entra ID cloud account? -> Block sign-in, revoke refresh tokens/sessions (Revoke-MgUserSignInSession), force a password reset, re-register MFA if methods may be attacker-controlled, and review/revoke risky app consents.
3. Why does revoking a session not take effect instantly without CAE? -> Access tokens are typically valid ~1 hour, so a revoked user keeps working until token expiry unless Continuous Access Evaluation is in play to near-real-time reject tokens on disable, password reset, or high risk.
4. What is the krbtgt double-reset and why two resets? -> Resetting the krbtgt password twice in succession invalidates forged Golden Ticket TGTs: AD keeps the current and previous key version, so one reset still validates tickets signed with the previous key; the second reset (after replication converges) closes that window.
5. Why must you wait between the two krbtgt resets? -> The two key versions must replicate to all domain controllers between resets; resetting faster than replication completes can break legitimate Kerberos authentication across the domain.
6. Do Silver Tickets survive a krbtgt reset? -> Yes. A Silver Ticket is a forged service ticket signed with a service account's long-term key, not krbtgt, so it survives a krbtgt reset; you must rotate the affected service account's password (or convert it to a gMSA).
7. What Graph PowerShell cmdlet revokes a user's sessions? -> Revoke-MgUserSignInSession, which invalidates the user's refresh tokens so existing sessions must re-authenticate. [VERIFY]
8. How do you perform tenant-wide token revocation in a mass compromise? -> Bulk-revoke sessions, apply a Conditional Access block (with break-glass accounts excluded), revoke risky app consents, and rotate compromised app secrets/credentials, relying on CAE for near-real-time effect.
9. Why must break-glass accounts be excluded from an emergency CA block? -> Because a tenant-wide block intended to contain attackers would otherwise lock out the very emergency-access accounts you need to manage the response.
10. What persistence should you hunt after a domain-dominance attack besides krbtgt? -> Silver-ticket-enabling service accounts, skeleton key, DSRM-account abuse, SID-history injection, AdminSDHolder/ACL backdoors, and rogue accounts holding DCSync (Replicating Directory Changes) rights.
11. When does identity IR shift from containment to recovery? -> When the directory itself is poisoned or destroyed (e.g., ransomware or a trust-level compromise) you can no longer just clean accounts; you must recover the forest to a clean state via Microsoft's manual runbook or an automated tool like Semperis ADFR.
12. Why is identity IR harder than endpoint IR? -> Tokens and tickets are portable and long-lived, so you must invalidate the credentials and the trust material that mints them (krbtgt, service-account keys, refresh tokens) rather than simply re-imaging a single machine.

---

## Quiz (drafted)

> Use the exact object shape from `02-protocols/01-kerberos.mdx`: `<Quiz question={{ id: "08-security-detection/<slug>/q<n>", prompt: "...", options: ["...","...","...","..."], correctIndex: N, explanation: "..." }} />`. Entity-encode any `"` inside `prompt`/`explanation`. IDs below are final.

### 01-identity-attack-techniques (2)
**q1** — Prompt: A penetration tester, authenticated as an ordinary domain user, requests Kerberos service tickets for every account that has an SPN and exports them for offline cracking. Which technique is this and what makes it work?
- A. DCSync; the tester replicated the password database.
- B. Kerberoasting (MITRE ATT&CK T1558.003); any authenticated user can request a service ticket for any SPN, and the ticket is encrypted with the service account's long-term key, so weak (e.g., RC4) keys can be cracked offline. ✅
- C. Golden Ticket; the tester forged TGTs with the krbtgt key.
- D. Pass-the-Hash; the tester reused an NTLM hash.
- Explanation: Kerberoasting (T1558.003) abuses the fact that service-ticket issuance is available to any authenticated principal and the ticket is encrypted under the service account key. DCSync needs replication rights, Golden Ticket needs krbtgt, and PtH reuses an NTLM hash — none match requesting-and-cracking SPN tickets.

**q2** — Prompt: An attacker phishes a user into approving an OAuth consent screen for an app requesting Mail.ReadWrite and offline_access. The security team forces a password reset, yet the attacker keeps reading mail. Why, and what is the correct fix?
- A. The password reset failed to replicate; reset it again.
- B. The app holds a valid refresh token (illicit consent grant, MITRE ATT&CK T1528); a password reset does not revoke OAuth tokens, so you must revoke the app's consent/tokens and remove the app. ✅
- C. The attacker used Pass-the-Ticket, which is unaffected by cloud password resets.
- D. The mailbox has a forwarding rule that survives password changes.
- Explanation: An illicit consent grant (T1528) gives the malicious app its own access and refresh tokens, independent of the user's password. Remediation is revoking the consent, deleting the enterprise app, and revoking refresh tokens — not resetting the password.

### 02-defender-for-identity (3)
**q1** — Prompt: Your organization runs Defender for Identity but has installed sensors on only 3 of its 7 domain controllers. What is the primary risk?
- A. None; one sensor per domain is sufficient.
- B. Detection blind spots — attacks whose authentication traffic and events land on the 4 unmonitored DCs may go undetected, since the MDI sensor analyzes traffic local to the DC it runs on. ✅
- C. Duplicate alerts will be generated for the monitored DCs.
- D. The sensors will fail to license without full coverage.
- Explanation: The MDI sensor reads the authentication traffic and events local to its DC; unmonitored DCs are blind spots. Best practice is a sensor on every DC (and AD CS / AD FS).

**q2** — Prompt: Defender for Identity raises a "Suspected DCSync attack" alert. At the protocol level, what did the attacker attempt?
- A. They requested service tickets for many SPNs to crack offline.
- B. They forged a TGT using the krbtgt key.
- C. They used the directory replication protocol (DRSGetNCChanges) to make a DC replicate password hashes — including krbtgt — to them. ✅
- D. They reused a captured NTLM hash to authenticate.
- Explanation: DCSync (T1003.006) abuses MS-DRSR replication to pull secrets from a DC, which requires the Replicating Directory Changes rights — exactly what MDI watches for. The other options describe Kerberoasting, Golden Ticket, and Pass-the-Hash.

**q3** — Prompt: A security team tags three never-used accounts as honeytokens in Defender for Identity. Why is an alert on these accounts especially valuable?
- A. Honeytokens automatically block the attacker's IP.
- B. Because no legitimate user ever authenticates as them, any sign-in attempt is almost certainly malicious — a high-fidelity, low-false-positive signal. ✅
- C. Honeytokens reset the krbtgt key when triggered.
- D. They reduce the licensing cost of MDI.
- Explanation: A honeytoken is a dormant decoy; legitimate activity against it should be zero, so any authentication is a strong indicator of reconnaissance or compromise.

### 03-crowdstrike-semperis (2)
**q1** — Prompt: A bank can detect Golden Ticket and DCSync attacks but has no plan for a forest that has been ransomware-encrypted and trust-poisoned. Which capability addresses this gap?
- A. Better KQL hunting queries in Sentinel.
- B. Additional Defender for Identity sensors.
- C. An automated Active Directory forest recovery capability such as Semperis ADFR, which restores the forest to a clean, malware-free state. ✅
- D. Enabling Conditional Access risk policies.
- Explanation: Detection tools (MDI, Falcon Identity, Sentinel) do not rebuild a destroyed or trust-poisoned forest. Forest recovery — Microsoft's manual runbook or an automated tool like Semperis ADFR — is the distinct discipline that closes the recovery gap.

**q2** — Prompt: What best describes the ITDR product category that CrowdStrike Falcon Identity Protection and Semperis DSP belong to?
- A. Endpoint Detection and Response focused on workstation malware.
- B. Identity Threat Detection and Response — detecting and responding to attacks against identity infrastructure such as Active Directory and Entra ID. ✅
- C. A SIEM that ingests all enterprise logs.
- D. A privileged access management vault.
- Explanation: ITDR (a Gartner-defined category) specializes in identity-layer threats — distinct from EDR (endpoints), SIEM (broad log analytics), and PAM (privileged credential vaulting).

### 04-kql-identity-hunting (3)
**q1** — Prompt: Which KQL query shape best identifies a password-spray attack against Entra ID?
- A. SigninLogs | where ResultType == 0 | summarize count() by UserPrincipalName
- B. SigninLogs | where ResultType == 50126 | summarize dcount(UserPrincipalName) by IPAddress, bin(TimeGenerated, 1h) | where dcount_UserPrincipalName > threshold ✅
- C. AuditLogs | where OperationName == "Add user" | count
- D. IdentityInfo | project AccountUPN, Department
- Explanation: Password spray is one source attempting many distinct users with failed logons; counting distinct failed UPNs per IP per time bucket (ResultType 50126 = invalid username/password) surfaces it. ResultType 0 is success; the AuditLogs and IdentityInfo queries are unrelated. [VERIFY ResultType 50126]

**q2** — Prompt: You want to find newly granted application consents that might indicate consent phishing. Which table and field do you start with?
- A. SigninLogs / ResultType
- B. AuditLogs / OperationName (e.g., a "Consent to application" operation), inspecting TargetResources for the granted scopes. ✅
- C. IdentityInfo / Manager
- D. SecurityAlert / AlertName only
- Explanation: Directory changes including app consents are recorded in AuditLogs; OperationName identifies the consent event and TargetResources carries the app and granted permissions. [VERIFY OperationName string]

**q3** — Prompt: Why should a hunting query begin with a TimeGenerated filter such as where TimeGenerated > ago(7d)?
- A. It is required syntax for all KQL queries.
- B. Log Analytics is time-partitioned, so a leading time filter sharply reduces the data scanned, improving query speed and lowering cost. ✅
- C. It sorts the results chronologically.
- D. It enables the join operator.
- Explanation: Time filtering first leverages Log Analytics' time partitioning to cut scanned volume; it is a performance/cost best practice, not required syntax, and does not sort or enable joins.

### 05-identity-incident-response (2)
**q1** — Prompt: Incident responders confirm a Golden Ticket attack. Which action invalidates the forged TGTs, and why must it be done twice?
- A. Reset every user's password once; this invalidates all tickets.
- B. Reset the krbtgt password twice in succession (waiting for replication between resets): the first reset invalidates tickets signed with the current key, but AD still honors the previous key version until a second reset closes that window. ✅
- C. Disable and re-enable every SPN-registered service account.
- D. Reboot all domain controllers to flush the ticket cache.
- Explanation: The TGT is signed with the krbtgt key; AD retains current and previous key versions, so a single reset leaves a window where previous-key tickets still validate. Two resets (with replication convergence in between) close it. This mirrors the Module 2 Kerberos remediation.

**q2** — Prompt: After containing a compromised Entra ID account by forcing a password reset, the attacker continues to access the mailbox using a token issued before the reset. What concept explains the lag, and what reduces it?
- A. DNS caching; flush the resolver.
- B. Access tokens remain valid until expiry (about an hour); Continuous Access Evaluation (CAE) lets Entra ID and supporting resources reject tokens near-real-time on password reset, disable, or high risk. ✅
- C. Kerberos ticket lifetime; reset the krbtgt key.
- D. Replication latency between domain controllers.
- Explanation: Cloud access tokens are bearer tokens valid until expiry, so a password reset alone leaves a window; CAE closes it by signaling resource providers to revoke on critical events. Kerberos/krbtgt and DC replication are on-prem concerns, not the cause here.

---

## Wiring tasks (exact edits)

> One small wiring commit after (or alongside) the section that lands, but the cleanest path is a single wiring commit once all 5 MDX files exist. All three files change together.

**1. `content/modules.json`** — populate the `08-security-detection` `sections` array (currently `[]`, lines 58-65):
```json
"sections": ["01-identity-attack-techniques", "02-defender-for-identity", "03-crowdstrike-semperis", "04-kql-identity-hunting", "05-identity-incident-response"]
```

**2. `lib/sections.ts`** — add 5 entries to `SECTION_TITLES` (after the `11-cert-roadmap` block or in module order):
```ts
'08-security-detection/01-identity-attack-techniques': 'Identity Attack Techniques',
'08-security-detection/02-defender-for-identity': 'Microsoft Defender for Identity',
'08-security-detection/03-crowdstrike-semperis': 'CrowdStrike Falcon Identity & Semperis',
'08-security-detection/04-kql-identity-hunting': 'KQL Identity Hunting',
'08-security-detection/05-identity-incident-response': 'Identity Incident Response',
```
Add 2 entries to `SC300_SECTIONS` (the Identity-Protection-aligned sections):
```ts
'08-security-detection/02-defender-for-identity',
'08-security-detection/05-identity-incident-response',
```

**3. `lib/content-loader.ts`** — add all 5 keys to BOTH `AUTHORED_SECTIONS` (lines 46-64) and `ALL_KNOWN_SECTIONS` (lines 120-138):
```ts
'08-security-detection/01-identity-attack-techniques',
'08-security-detection/02-defender-for-identity',
'08-security-detection/03-crowdstrike-semperis',
'08-security-detection/04-kql-identity-hunting',
'08-security-detection/05-identity-incident-response',
```
And add 5 `case` arms in `loadAuthoredComponent` (lines 75-112):
```ts
case '08-security-detection/01-identity-attack-techniques':
  return (await import('@/content/modules/08-security-detection/01-identity-attack-techniques.mdx')).default
case '08-security-detection/02-defender-for-identity':
  return (await import('@/content/modules/08-security-detection/02-defender-for-identity.mdx')).default
case '08-security-detection/03-crowdstrike-semperis':
  return (await import('@/content/modules/08-security-detection/03-crowdstrike-semperis.mdx')).default
case '08-security-detection/04-kql-identity-hunting':
  return (await import('@/content/modules/08-security-detection/04-kql-identity-hunting.mdx')).default
case '08-security-detection/05-identity-incident-response':
  return (await import('@/content/modules/08-security-detection/05-identity-incident-response.mdx')).default
```

**4. `lib/sections.test.ts`** — bump the hardcoded curriculum count. Change `expect(ordered).toHaveLength(17)` (line 27) to `22`, and update the explanatory comment at lines 19-20 (`17 authored sections across modules 01/02/03/06/11` → include `08`). The `toEqual` mapping derives from `modules.json` dynamically so it self-updates; the first/last-section assertions (Module 1 first, Module 11 last) still hold because Module 8 sorts between 06 and 11 by `order`. Also add an sc300 assertion if desired, e.g. `getSectionMeta('08-security-detection','02-defender-for-identity').sc300 === true`.

**No edit to `mdx-components.tsx`** is needed — every component used (`HoloPanel`, `Definition`, `ProTip`, `WarStory`, `SC300Badge`, `Flashcard`, `Quiz`, `PowerShellBlock`) is already registered. (Only an `<IdentityAttackPathDiagram />`, if built, would require a registration line — see optional diagram.)

**Verification after wiring:** `pnpm test` (the `lib/sections.test.ts`, `lib/content-index.test.ts`, `lib/content.test.ts` drift/extraction guards must pass — re-run after each MDX file to catch a malformed `<Flashcard>`/`<Quiz>` tag early), then `pnpm typecheck`, `pnpm lint`, `pnpm build`. Spot-check `/modules/08-security-detection/01-identity-attack-techniques` renders, flashcards appear in `/flashcards/08-security-detection`, and search surfaces the new quiz prompts and glossary terms.

---

## Optional diagram

`newDiagram = ""` — no new diagram is **required**. If desired, an `<IdentityAttackPathDiagram />` composing the existing `components/diagrams/FlowDiagram.tsx` primitive (which already supports `intent: 'threat'` red nodes/steps and `intent: 'warn'` amber, per `FlowDiagram.tsx:8-29,42-46`) would animate an attack path: **Phishing/credential theft → LSASS dump (T1003.001) → Pass-the-Hash lateral move (T1550.002) → DCSync to steal krbtgt (T1003.006) → forge Golden Ticket (T1558.001) → Domain Admin**, with each `FlowStep.detail` carrying the ATT&CK ID and the section-02/04 detector. If built, it follows the roadmap's diagram convention: compose `FlowDiagram`, add a co-located `IdentityAttackPathDiagram.test.tsx` mirroring `KerberosFlowDiagram.test.tsx`, and register it in `mdx-components.tsx`. **The full TDD build plan for any such diagram lives in the diagrams plan doc, not here.** Until/unless built, section 01 cross-links `<KerberosFlowDiagram />`.

---

## Commit plan

Branch: **`content/module-08-security-detection`** (off `main`).

One commit per section (authoring) + one wiring commit, so each is independently reviewable and the build stays green:

1. `feat(mod8): author 01-identity-attack-techniques (MITRE ATT&CK identity TTPs)` — MDX only.
2. `feat(mod8): author 02-defender-for-identity (sensors, detections, LMPs, honeytokens)` — MDX only.
3. `feat(mod8): author 03-crowdstrike-semperis (Falcon Identity + Semperis DSP/ADFR)` — MDX only.
4. `feat(mod8): author 04-kql-identity-hunting (Sentinel KQL detection patterns)` — MDX only.
5. `feat(mod8): author 05-identity-incident-response (containment, krbtgt double-reset, token revocation)` — MDX only.
6. `feat(mod8): wire Module 8 sections (modules.json + sections.ts + content-loader + test count)` — the four wiring edits in one commit; this is the commit that lights the module up and must leave `pnpm test/typecheck/lint/build` green.

(Authoring commits 1-5 can be made before the wiring commit because the section files are inert until registered; alternatively interleave author+wire per section if you prefer to verify each in the running app immediately — but then split the `content-loader`/`sections.ts`/`modules.json` edits per section and only bump the `sections.test.ts` count once all five land.)

Merge to `main` once the full module renders and all four gates pass.
