# Module 3 (Microsoft Identity Platform) — Recall-Deck Completion + SC-300 Badges

**Goal:** Bring the SC-300 anchor module to its recall-deck targets by inserting **+24 new `<Flashcard>`** (36→60), **+6 new `<Quiz>`** (9→15), and embedding the **`<SC300Badge />`** component (currently used in zero files) across the SC-300-aligned subsections of the three existing section files.

**Architecture note:** This is a **pure EDIT** of three existing `.mdx` files (`content/modules/03-microsoft-identity/01-active-directory.mdx`, `02-entra-id.mdx`, `03-hybrid-identity.mdx`). It inserts inline JSX tags only. No new files, no new sections, no new slugs.

**Prereqs / conventions pointer (verified against the code, 2026-06-01):**
- **No two-file sync needed.** All three Module 3 slugs already exist in `content/modules.json` (`03-microsoft-identity.sections = ["01-active-directory","02-entra-id","03-hybrid-identity"]`, lines 22–24) and in `lib/sections.ts` (`SECTION_TITLES` lines 37–39 **and** `SC300_SECTIONS` lines 50–52). The `sc300` flag is therefore **already `true`** for all three sections — **do not edit `lib/sections.ts`** for this workstream. (Confirmed: every Module 3 slug is in the `SC300_SECTIONS` set today.)
- **No content-loader change needed.** All three sections are already in `AUTHORED_SECTIONS` and have static-import `case`s (`lib/content-loader.ts` lines 56–58 / 94–99). Lighting-up wiring is done.
- **Interactive content is inline MDX**, extracted at runtime by `lib/content-index.ts`. There are no flashcards.json / quizzes.json sidecars. Adding a `<Flashcard>` or `<Quiz>` to the MDX is the *entire* mechanism by which it appears in the review deck / quiz UI / search index.
- **`<SC300Badge />` is already registered** in `mdx-components.tsx` (imported line 6, exposed line 24), so authors use it inline with **no import statement**. It is used in **zero MDX files today** — this workstream is its first rollout.
- **Accuracy is non-negotiable.** Every non-obvious claim below cites MS Learn / the relevant standard. A handful carry a `[VERIFY]` marker where the exact phrasing or a version-specific detail should be confirmed against current MS Learn before publishing.

---

## How the inline tags are parsed (so insertions don't break extraction)

Verified against `lib/content-index.ts`:

- **Flashcards** are matched by `/<Flashcard\b([^>]*?)\/>/g` with `front="([^"]*)"` and `back="([^"]*)"`. This means:
  - Each card is a **self-closing** `<Flashcard ... />`.
  - Attribute values are **double-quoted** and **must not contain a literal `"`** (the regex stops at the first `"`). Use `&quot;` for any quotation mark inside front/back (the extractor calls `decodeEntities`, so `&quot; &amp; &lt; &gt; &#39;` are all decoded). Existing cards follow this (none contain raw inner quotes).
  - Card `id` is a hash of `${moduleId}/${slug}|${front}` — so **the `front` text must be unique within its section** or the second card silently collapses onto the first id. All drafted fronts below are distinct from existing fronts (checked against the three files).
- **Quizzes** are JSX objects: `<Quiz question={{ id: "...", prompt: "...", options: [...], correctIndex: N, explanation: "..." }} />`. The search index only extracts `prompt:\s*"([^"]+)"`, so **the `prompt` value must be a single double-quoted string with no inner unescaped `"`** (use `&quot;`/`'`). `QuizQuestion` shape (from `components/content/Quiz.tsx`): `{ id, prompt, options: string[], correctIndex: number, explanation?: string }`. Options render A–D in order; `correctIndex` is 0-based.
- **Quiz `id` convention** (from existing files): `"<moduleId>/<slug>/q<N>"`, continuing the per-section counter. AD currently ends at `q3`, Entra at `q3`, Hybrid at `q3` — new ones start at `q4`.
- **`<SC300Badge />`** renders an inline `<span>` (see `components/content/SC300Badge.tsx`). It MUST sit on the **same line as the heading text it annotates** (e.g. `### Conditional Access — the policy engine <SC300Badge />`), never on its own line, or it will render as a stray badge in a paragraph of its own.

---

## Section map

Distribution to hit targets: **AD +8 cards (12→20), +2 quiz (3→5)** · **Entra +9 cards (14→23), +3 quiz (3→6)** · **Hybrid +7 cards (10→17), +1 quiz (3→4)**. Module totals: **60 cards / 15 quiz.** Entra gets the most because it is "the center of gravity" for SC-300 and currently under-covers App Reg-vs-Enterprise-App nuance, Managed Identities, Entra ID Governance, and break-glass operational detail.

> Card-count check: 12+8=20, 14+9=23, 10+7=17 → **60**. Quiz check: 3+2=5, 3+3=6, 3+1=4 → **15**. ✅

---

### `01-active-directory` — Active Directory Domain Services
**Word target:** already ~3,000+ (over benchmark); **add ~450–550 words** of new recall material only (cards + 2 quizzes + a short "Certificate Services & trusts" recall paragraph if needed to seat ADCS cards). Do not pad prose.

**Topics / study material (gaps to fill — existing prose already covers forest/domain/OU, FSMO, LSDOU, AGDLP/AGUDLP, trusts basics, tiering, BloodHound):**
- **OU design purpose vs. security boundary.** OUs are for *delegation of administration* and *GPO linking* — they are **not** a security boundary; the domain/forest is. Source: MS Learn "Organizational units" / AD DS design guide. Existing prose names OUs but never states they are not a security boundary — this is a tested distinction.
- **GPO precedence modifiers.** Beyond LSDOU: **Block Inheritance** (on an OU, stops higher GPOs) and **Enforced / "No Override"** (on a link, beats Block Inheritance and wins conflicts). Enforced always wins. Source: MS Learn "Group Policy processing and precedence." Existing prose mentions these in passing in a Definition; a card pins the precedence rule.
- **Security group vs. distribution group.** Security groups can be ACL'd (security principal, has a SID); distribution groups are mail-only and cannot be used for permissions. Source: MS Learn "Active Directory security groups." (The AD war story hinges on a *distribution list* that was somehow granted rights — worth a card clarifying the normal rule.)
- **gMSA (group Managed Service Accounts).** Automatically-rotated (every 30 days by default), AD-managed service-account passwords; the Kerberoasting mitigation for service accounts. Source: MS Learn "Group Managed Service Accounts overview." Directly answers the Kerberoasting attack the existing prose raises but never mitigates.
- **AD CS (Active Directory Certificate Services) + ESC1.** The forest PKI role; issues certs for smart-card logon, etc. The ESC1 misconfiguration (a certificate template that allows requester-supplied SAN + client-auth EKU + low enrollment rights) lets any user enroll a cert impersonating any account — the certificate-based path to Domain Admin popularized by SpecterOps "Certified Pre-Owned" (2021). Source: SpecterOps "Certified Pre-Owned" whitepaper; MS Learn "AD CS." `[VERIFY]` the ESC1 condition list against the current whitepaper before publishing.
- **Read-Only Domain Controller (RODC).** Holds a read-only, filtered copy of AD DS (no writable directory, selective password caching via the Password Replication Policy) for branch/edge sites where physical security is weak. Source: MS Learn "RODC features." Good branch-bank scenario card.
- **Selective Authentication on a forest trust.** A trust option that defaults to *no* access — admins must explicitly grant "Allowed to authenticate" on each resource — vs. forest-wide (domain-wide) authentication which trusts all. The control that contains a forest trust's blast radius. Source: MS Learn "Selective authentication." Extends the existing trust cards.
- **SID filtering / SID history.** SID filtering (quarantine) drops SIDs from outside the trusted domain to block SID-history injection escalation across a trust. Source: MS Learn "Security considerations for trusts." Pairs with the trust cards.

**Components to embed:** +8 `<Flashcard>`, +2 `<Quiz>`. No new diagram (the existing `<EcosystemMap />` suffices). Optionally one new `<SC300Badge />` — see note below.

**SC-300 alignment:** This section is mapped to SC-300 *hybrid-identity foundations* (the on-prem source-of-truth side of "Implement an identity management solution"). It is the weakest direct-exam-objective fit of the three (most AD DS internals are Security+/CISSP, not SC-300 line items). **Section-level `sc300` flag is already `true`** — leave it. **Badge guidance:** embed **one** `<SC300Badge />` on the `# Active Directory Domain Services` H1 line is **too broad**; instead place it only where the content genuinely maps to an SC-300 objective — the cleanest fit is on the H1 (since the COVERS panel already claims the hybrid-foundations objective). Decision: **add `<SC300Badge />` to the H1** so this anchor module visibly carries the badge, matching the `sc300:true` flag. (See Wiring tasks for exact line.)

---

### `02-entra-id` — Entra ID
**Word target:** already ~3,200+ (over benchmark); **add ~500–650 words** of new recall material (cards + 3 quizzes + small recall notes seating Managed Identity, access-package, and tenant-type cards). Do not pad prose.

**Topics / study material (gaps — existing prose covers CA engine/signals/report-only, MFA ladder, PIM eligible-vs-active, Identity Protection sign-in-vs-user risk, App Reg vs Enterprise App, admin consent, licensing P1/P2, CAE, named locations, break-glass, managed-identity system-vs-user):**
- **Tenant types: Microsoft Entra (workforce) vs. Azure AD B2C vs. External ID.** Workforce tenant = employees; **External ID** (the successor to B2C for new projects) = customer/partner identities with separate user store and custom sign-up/sign-in. Source: MS Learn "Microsoft Entra External ID overview" / "What is Azure AD B2C." `[VERIFY]` the current B2C-vs-External-ID positioning (Microsoft is steering new CIAM projects to External ID; B2C remains for existing tenants). Distinct from the existing "tenant" prose which only covers the single workforce tenant.
- **Administrative Units (AUs).** Scope a directory role to a *subset* of users/groups/devices (e.g. a Helpdesk admin who can reset passwords only for the Ohio region). The delegation primitive in Entra ID — the cloud analogue of an AD OU delegation. Source: MS Learn "Administrative units." Not in current prose.
- **Conditional Access exclusions are mandatory for break-glass.** A CA *block-legacy-auth* or *require-MFA-for-admins* policy must **exclude** the break-glass accounts or you can lock yourself out (the exact failure the war story narrowly avoided). Source: MS Learn "Manage emergency access accounts." Extends the existing break-glass card with the CA-exclusion specific.
- **Security defaults vs. Conditional Access.** Security defaults = a free, all-or-nothing baseline (enforces MFA registration, blocks legacy auth) for tenants without P1; CA = the granular P1+ engine. You cannot run both — enabling CA requires turning security defaults off. Source: MS Learn "Security defaults." Tested either/or distinction; not in current prose.
- **Access packages / entitlement management (P2).** An access package bundles resources (groups, apps, SharePoint sites) + a policy (who can request, approval, expiration/access-review) for self-service, time-bound access — the lifecycle answer for guest and project access. Source: MS Learn "What is entitlement management." Existing prose names entitlement management once in the licensing list but never defines an access package.
- **Access reviews (P2).** Periodic attestation campaigns where reviewers (the user, manager, or a designated reviewer) confirm continued need for group membership / app assignment / role; can auto-remove on no-response. Source: MS Learn "What are access reviews." Named in licensing list; undefined.
- **Entra ID Governance.** The P2+ / Entra Suite umbrella that packages **entitlement management + access reviews + PIM + lifecycle workflows** (automated joiner/mover/leaver) into the IGA offering. Source: MS Learn "What is Microsoft Entra ID Governance." The roadmap explicitly calls for an Entra ID Governance card here.
- **Lifecycle Workflows.** Automate joiner/mover/leaver tasks (e.g. on a user's hire date, add to groups and send a welcome; on termination, disable and revoke sessions). Part of Entra ID Governance. Source: MS Learn "What are lifecycle workflows." Distinct from access packages.
- **Managed identity — how a workload gets a token (IMDS).** A managed identity gets an Entra token from the **Azure Instance Metadata Service** endpoint (`169.254.169.254`) with no secret in code — the credential is issued and rotated by the platform. Source: MS Learn "How managed identities work for Azure resources." Existing prose has a system-vs-user card but never explains the *no-secret* token-acquisition mechanism, which is the "why it matters."

**Components to embed:** +9 `<Flashcard>`, +3 `<Quiz>`. No new diagram. Multiple `<SC300Badge />` (this is the primary badge-rollout section).

**SC-300 alignment:** **The core SC-300 section.** Conditional Access, MFA/auth methods, Identity Protection, PIM, app registrations/consent, and identity governance (access packages, access reviews, lifecycle workflows) are all named SC-300 exam objectives. **Section `sc300` flag already `true`** — leave it. **Render `<SC300Badge />` on these subsection headings** (exact lines in Wiring tasks): `### Conditional Access — the policy engine`, `### MFA — the authenticator landscape`, `### Privileged Identity Management — just-in-time elevation`, `### Identity Protection — risk-based signals`, `### App registrations, enterprise apps, and the consent model`, and a new `### Identity governance — access packages, reviews, and lifecycle` subsection (if the governance cards warrant a short prose home) — plus the H1.

---

### `03-hybrid-identity` — Hybrid Identity
**Word target:** already ~3,000+ (over benchmark); **add ~350–450 words** of new recall material (cards + 1 quiz). Do not pad prose.

**Topics / study material (gaps — existing prose covers PHS derivation chain, PHS auth-in-cloud resilience, PTA step-by-step, PTA trade-offs, ADFS/Solorigate, Seamless SSO + AZUREADSSOACC rotation, Connect-vs-Cloud-Sync + parity gaps):**
- **Cloud Sync provisioning agent vs. Connect Sync agent — and HA.** Cloud Sync supports **multiple lightweight agents** for high availability with no metadirectory; Connect Sync runs **one active server + an optional staging server** (the staging server is read-only/standby, promoted manually for failover). Source: MS Learn "Microsoft Entra Cloud Sync" + "Entra Connect staging server." Existing prose contrasts the two architectures but not their HA models.
- **Password writeback.** Self-Service Password Reset writes a cloud password change *back* to on-prem AD DS (so the on-prem password stays in sync). Available with **both** Connect Sync and Cloud Sync; requires Entra ID P1. Source: MS Learn "How password writeback works." Not in current prose; common SC-300/SSPR scenario.
- **Seamless SSO works with PHS or PTA but NOT Federation.** Federation does its own SSO via ADFS/WIA, so Seamless SSO is for the non-federated sign-in methods. Source: MS Learn "Microsoft Entra Seamless SSO." Sharpens the existing Seamless SSO card.
- **Staged Rollout.** Migrate *selected groups* off federation to cloud auth (PHS or PTA) for testing **without converting the whole domain** — the controlled de-risking path the ADFS war story would have used. Source: MS Learn "Migrate from federation to cloud authentication — Staged Rollout." Directly serves the "decision tree / migration" gap the roadmap names.
- **Decision tree (PHS → PTA → Federation).** The prescriptive ordering: **choose PHS** unless a documented requirement forces otherwise; **choose PTA** only when on-prem must own/validate every credential and no hash may leave the network; **choose Federation** only for an existing investment or a third-party MFA / smart-card-at-IdP / on-prem-disconnected requirement Microsoft can't meet natively. Source: MS Learn "Choose the right authentication method for your Microsoft Entra hybrid identity solution" (the official decision flowchart). The roadmap explicitly asks for a decision-tree card.
- **Source Anchor / `ms-DS-ConsistencyGuid` (immutableID).** The attribute that ties an on-prem object to its Entra ID object across syncs; modern Connect uses `ms-DS-ConsistencyGuid` (not `objectGUID`) so the anchor survives a forest migration. Source: MS Learn "Microsoft Entra Connect: Design concepts — sourceAnchor." Not in current prose; explains "why the link survives."
- **Hard match vs. soft match.** *Soft match* links an on-prem object to an existing cloud object by primary SMTP/UPN; *hard match* links by writing the `immutableID`. The mechanism behind "duplicate object" sync errors. Source: MS Learn "Microsoft Entra Connect sync: How matching works." `[VERIFY]` the exact soft-match attribute precedence (proxyAddresses/mail vs. UPN) against current MS Learn.

**Components to embed:** +7 `<Flashcard>`, +1 `<Quiz>`. Existing `<HybridIdentityDiagram />` already present. Optionally one `<SC300Badge />` on the H1.

**SC-300 alignment:** SC-300 *Implement an identity management solution → hybrid identity* (Connect/Cloud Sync, PHS/PTA/Federation, SSPR password writeback). **Section `sc300` flag already `true`** — leave it. **Badge:** add `<SC300Badge />` to the H1 line.

---

## Flashcards

> Authoring rules restated: self-closing `<Flashcard front="..." back="..." />`; no raw `"` inside values (use `&quot;`); every `front` unique within its section. Insert each card at the indicated point. Numbering below is for this plan only — cards carry no number in the MDX.

### `01-active-directory` — +8 cards (12 → 20)
**Insertion point:** append all 8 to the existing **`## Recall drill`** block (after the last existing `<Flashcard ... />`, which ends with the forest-vs-external-trust card on line ~97, before `## Check your understanding`).

1. **front:** `Are Organizational Units (OUs) a security boundary in AD DS?` **back:** `No. OUs exist to delegate administration and to link Group Policy — they are containers, not security boundaries. The security boundary is the forest (and the domain is an administrative/replication boundary). Compromising rights over an OU is an admin-delegation problem, not a boundary crossing; do not treat OU placement as isolation.`
2. **front:** `In Group Policy, how do Block Inheritance and Enforced ("No Override") change the normal LSDOU precedence?` **back:** `Block Inheritance, set on an OU, stops GPOs linked higher up (site/domain) from applying to that OU. Enforced (No Override), set on a GPO link, forces that GPO to apply and win conflicts even past a Block Inheritance — Enforced always wins. So precedence is: Enforced links beat everything, then Block Inheritance, then the normal LSDOU order (innermost OU wins).`
3. **front:** `What is the difference between a security group and a distribution group in AD DS?` **back:** `A security group is a security principal — it has a SID and can be placed on an ACL to grant or deny permissions (and can also be mail-enabled). A distribution group is for email distribution only — it has no SID for authorization and cannot be used to assign resource permissions. If you need to grant access, you must use a security group.`
4. **front:** `What is a group Managed Service Account (gMSA) and which AD DS attack does it mitigate?` **back:** `A gMSA is a service account whose password is generated and automatically rotated by AD DS (every 30 days by default) and retrieved only by authorized hosts — no human knows or sets it. Because the password is long and random and rotates, gMSAs largely defeat Kerberoasting: even if an attacker cracks a captured service ticket, the password has rotated and the cracked value is useless.`
5. **front:** `What is Active Directory Certificate Services (AD CS) and why is the ESC1 misconfiguration dangerous?` **back:** `AD CS is the forest PKI that issues certificates (smart-card logon, server auth, etc.). ESC1 is a misconfigured certificate template that combines client-authentication EKU, requester-supplied Subject Alternative Name, and low enrollment rights — letting any permitted user request a certificate that impersonates any account, including Domain Admin. It is a certificate-based path to domain compromise (SpecterOps "Certified Pre-Owned").`
6. **front:** `What is a Read-Only Domain Controller (RODC) and where is it used?` **back:** `An RODC holds a read-only, filtered replica of AD DS — no writable directory and, by default, no cached credentials except those allowed by its Password Replication Policy. It is deployed at branch or edge sites with weak physical security so that a stolen DC exposes few or no privileged credentials and cannot be used to write changes back into the directory.`
7. **front:** `On a forest trust, what does Selective Authentication do, and how does it differ from forest-wide authentication?` **back:** `Forest-wide (default for some trusts) lets all users in the trusted forest authenticate to any resource. Selective Authentication denies access by default — an admin must explicitly grant the "Allowed to authenticate" right on each specific resource a trusted-forest user may reach. It shrinks a trust's blast radius to only the resources you intend to share.`
8. **front:** `What is SID filtering on an AD DS trust and what attack does it block?` **back:** `SID filtering (a.k.a. quarantine) makes the trusting domain drop any SIDs in an inbound token that do not belong to the trusted domain. It blocks SID-history injection, where an attacker stamps a privileged SID (e.g. a Domain Admins SID) from the trusting domain into a token from the trusted domain to escalate across the trust. It is enabled by default on most modern trusts.`

### `02-entra-id` — +9 cards (14 → 23)
**Insertion point:** append all 9 to the existing **`## Recall drill`** block (after the last existing `<Flashcard ... />`, the admin-consent card on line ~137, before `## Check your understanding`). If you add the optional governance prose subsection, the 4 governance cards (10–13) may instead be authored inline right after that subsection — either placement is extracted identically.

1. **front:** `What is the difference between a Microsoft Entra (workforce) tenant and Microsoft Entra External ID?` **back:** `A workforce tenant holds your employees and internal apps. External ID (the successor to Azure AD B2C for new projects) is for customer and partner identities — a separate user population with customizable self-service sign-up/sign-in and external identity providers. You keep employees and customers in distinct directories so consumer scale and branding never touch the workforce tenant.`
2. **front:** `What is an Administrative Unit (AU) in Entra ID?` **back:** `An AU is a container that scopes a directory role to a subset of users, groups, or devices — for example, a Helpdesk Administrator who can reset passwords only for users in the Ohio AU. It is the cloud delegation primitive, analogous to delegating admin over an on-prem OU, and it enforces least privilege for distributed administration.`
3. **front:** `Why must break-glass (emergency access) accounts be excluded from Conditional Access policies?` **back:** `Because a CA policy (require-MFA-for-admins, require-compliant-device, block-legacy-auth, or a federation dependency) can lock out every normal admin. The break-glass accounts are your recovery path, so they must be excluded from those policies — otherwise the very lockout you are recovering from also blocks the recovery accounts. Microsoft requires this exclusion for emergency access accounts.`
4. **front:** `What is the difference between Security Defaults and Conditional Access, and can you run both?` **back:** `Security Defaults is a free, all-or-nothing baseline (enforces MFA registration, requires MFA for admins, blocks legacy auth) for tenants without premium licensing. Conditional Access (P1+) is the granular policy engine. You cannot run both at once — enabling Conditional Access requires disabling Security Defaults. Security Defaults is the floor; CA replaces it when you need granularity.`
5. **front:** `What is an access package in Entra ID entitlement management?` **back:** `An access package bundles a set of resources (groups, apps, SharePoint sites) with an assignment policy that defines who can request it, who approves, and how long access lasts before expiry or review. It gives users self-service, time-bound, approved access — especially for guests and project teams — instead of standing membership an admin must remember to remove.`
6. **front:** `What do access reviews do in Entra ID, and what license do they require?` **back:** `Access reviews are recurring attestation campaigns where a reviewer (the user, their manager, or a designated reviewer) confirms whether continued access — group membership, app assignment, or a privileged role — is still needed; unreviewed access can be auto-removed. They are an Entra ID P2 (Entra ID Governance) feature and are core SC-300 governance material.`
7. **front:** `What is Microsoft Entra ID Governance and what does it bundle?` **back:** `Entra ID Governance is Microsoft's IGA offering (P2 / Entra Suite). It bundles entitlement management (access packages), access reviews, Privileged Identity Management (PIM), and lifecycle workflows into one governance layer answering "who has access, should they, and for how long." It is the SC-300 "plan and implement identity governance" domain.`
8. **front:** `What are Lifecycle Workflows in Entra ID?` **back:** `Lifecycle Workflows automate joiner/mover/leaver tasks against user lifecycle events — for example, on a hire date add the user to groups and send onboarding; before a leave date, disable the account, remove group memberships, and revoke sessions. They are part of Entra ID Governance and remove the manual, error-prone steps that create orphaned access.`
9. **front:** `How does a workload get an Entra ID token using a managed identity, with no secret in code?` **back:** `The code calls the Azure Instance Metadata Service (IMDS) endpoint at 169.254.169.254, which returns an Entra access token for the resource's managed identity. The credential is issued, stored, and rotated by the Azure platform — there is no client secret or certificate to embed, leak, or rotate. This is why managed identities are preferred over app registrations with stored secrets for Azure-hosted workloads.`

### `03-hybrid-identity` — +7 cards (10 → 17)
**Insertion point:** append all 7 to the existing **`## Recall drill`** block (after the only existing `<Flashcard ... />` in that block — the PHS-recommendation card on line ~86 — i.e. add a second `<Flashcard>` plus the rest there; note this section's recall cards are currently split between inline cards mid-prose and the one card under `## Recall drill`, so append after that one, before `## War story`). **Double-check** the file: most Hybrid cards are inline under `## Recall drill` is actually only the 8 cards after `### Cloud Sync vs. Connect Sync`. Place all 7 new cards in the `## Recall drill` block immediately before `## Check your understanding`.

1. **front:** `How does high availability differ between Entra Connect (Connect Sync) and Cloud Sync?` **back:** `Connect Sync runs one active server; HA is an optional staging server kept read-only/standby that you promote manually during failover or maintenance — there is no automatic active-active. Cloud Sync supports multiple lightweight provisioning agents that provide automatic high availability with no metadirectory and no manual promotion. Cloud Sync's HA model is simpler and more resilient.`
2. **front:** `What is password writeback, and which sync methods and license support it?` **back:** `Password writeback lets a cloud password change (via Self-Service Password Reset) flow back into on-prem AD DS so the two stay in sync. It works with both Connect Sync and Cloud Sync and requires Entra ID P1. It is what lets a user who resets their password in the cloud still log into on-prem domain resources with the new password.`
3. **front:** `Which hybrid sign-in methods does Seamless SSO support, and which one does it not?` **back:** `Seamless SSO works with Password Hash Sync (PHS) and Pass-Through Authentication (PTA). It is not used with Federation, because ADFS already provides its own single sign-on through Windows Integrated Authentication. Seamless SSO exists precisely to give non-federated deployments the silent desktop SSO that federation otherwise provided.`
4. **front:** `What is Staged Rollout in a federation-to-cloud migration?` **back:** `Staged Rollout moves selected pilot groups off Federation onto cloud authentication (PHS or PTA) for testing without converting the entire federated domain. It de-risks an ADFS migration by validating cloud auth for a controlled population first, then expanding, instead of a single all-or-nothing domain conversion that breaks everyone if something is missed.`
5. **front:** `What is the prescriptive Microsoft decision order for hybrid sign-in: PHS, PTA, or Federation?` **back:** `Choose Password Hash Sync (PHS) by default — it gives cloud-side auth, outage resilience, and leaked-credential detection. Choose Pass-Through Authentication (PTA) only when policy requires on-prem to validate every credential and no hash may leave the network. Choose Federation only for an existing investment or a requirement Microsoft can't meet natively (e.g. third-party/smart-card auth at the IdP, or a disconnected forest).`
6. **front:** `What is the Source Anchor (immutableID) in Entra Connect, and which attribute does modern Connect use?` **back:** `The Source Anchor is the immutable value that links an on-prem object to its Entra ID object across every sync cycle. Modern Entra Connect uses ms-DS-ConsistencyGuid rather than objectGUID, so the anchor can be written and preserved even through a forest migration or domain change — keeping the cloud object tied to the right on-prem identity instead of creating a duplicate.`
7. **front:** `What is the difference between a soft match and a hard match in Entra Connect sync?` **back:** `A soft match links a syncing on-prem object to an existing cloud object automatically by matching primary SMTP/email (and falling back to UPN). A hard match links them by writing the on-prem immutableID (Source Anchor) to the cloud object. Both resolve the "object already exists in the cloud" case so sync does not create a duplicate; hard match is the explicit, authoritative link.`

---

## Quiz

> Authoring rules restated: `<Quiz question={{ id, prompt, options, correctIndex, explanation }} />`; `prompt` is one double-quoted string (use `&quot;`/`'` for any inner quote); `correctIndex` is 0-based (A=0, B=1, C=2, D=3); ids continue the per-section `q<N>` counter.

### `01-active-directory` — +2 quizzes (q4, q5)
**Insertion point:** append after the existing `q3` `<Quiz ... />` at the end of **`## Check your understanding`** (end of file).

**q4 — id `03-microsoft-identity/01-active-directory/q4`**
- **prompt:** `A junior admin places a department's users directly into an Organizational Unit and tells you "the OU isolates them as a security boundary." Why is this statement wrong?`
- **options:**
  - A. `Because users must be placed in the domain root, never in an OU.`
  - B. `Because an OU is a delegation-of-administration and Group Policy container, not a security boundary — the forest is the AD DS security boundary and the domain is an administrative/replication boundary.`
  - C. `Because OUs cannot contain user objects, only computer objects.`
  - D. `Because an OU only becomes a security boundary once a GPO is linked to it.`
- **correctIndex:** 1
- **explanation:** `OUs exist to delegate administrative control and to scope Group Policy — they are organizational containers, not isolation/security boundaries. In AD DS the forest is the true security boundary and the domain is an administrative and replication boundary. Treating an OU as isolation leads to delegation mistakes (the very pattern behind many BloodHound escalation paths).`

**q5 — id `03-microsoft-identity/01-active-directory/q5`**
- **prompt:** `Your environment has dozens of service accounts with old, never-rotated passwords, and a recent assessment flagged Kerberoasting risk. Which AD DS feature most directly mitigates Kerberoasting for these service accounts?`
- **options:**
  - A. `Enabling Selective Authentication on all domain trusts.`
  - B. `Converting the service accounts to group Managed Service Accounts (gMSAs), whose long passwords are auto-generated and rotated by AD DS (every 30 days by default).`
  - C. `Moving the service accounts into a dedicated OU with Block Inheritance.`
  - D. `Promoting a Read-Only Domain Controller in the data center.`
- **correctIndex:** 1
- **explanation:** `Kerberoasting works by requesting a service ticket for an SPN and cracking the service account's password hash offline. gMSAs defeat this because their passwords are long, random, machine-managed, and rotated automatically (default 30 days) — even a cracked ticket yields a password that has already changed. Selective Authentication (trusts), OUs/Block Inheritance (GPO scope), and RODCs (branch resilience) do not address the offline-cracking root cause.`

### `02-entra-id` — +3 quizzes (q4, q5, q6)
**Insertion point:** append after the existing `q3` `<Quiz ... />` at the end of **`## Check your understanding`** (end of file).

**q4 — id `03-microsoft-identity/02-entra-id/q4`**
- **prompt:** `A contractor needs access to a project's group, an app, and a SharePoint site for 90 days, with manager approval and automatic removal at the end. Which Entra ID feature is the right fit?`
- **options:**
  - A. `A Conditional Access policy scoped to the contractor.`
  - B. `An entitlement management access package with an assignment policy (approval + 90-day expiration).`
  - C. `A Privileged Identity Management eligible role assignment.`
  - D. `A static security group the admin remembers to delete in 90 days.`
- **correctIndex:** 1
- **explanation:** `Entitlement management access packages bundle resources (group + app + SharePoint site) with a policy controlling who may request, approval workflow, and time-bound expiration/review — exactly the self-service, approved, auto-expiring access this scenario needs. Conditional Access governs how a sign-in is allowed, not what resources are granted; PIM is for privileged role activation; a manual static group reintroduces the orphaned-access problem access packages exist to solve.`

**q5 — id `03-microsoft-identity/02-entra-id/q5`**
- **prompt:** `You are enabling Conditional Access for the first time and notice Security Defaults is currently on. What must happen, and why?`
- **options:**
  - A. `Nothing — Security Defaults and Conditional Access run together and reinforce each other.`
  - B. `You must disable Security Defaults, because a tenant cannot have both Security Defaults and Conditional Access enabled at the same time; CA replaces the all-or-nothing baseline with granular policy.`
  - C. `You must upgrade to Entra ID P2, because Conditional Access requires P2.`
  - D. `You must enable Security Defaults on each user individually before CA will apply.`
- **correctIndex:** 1
- **explanation:** `Security Defaults is a free, all-or-nothing baseline and is mutually exclusive with Conditional Access — enabling CA requires turning Security Defaults off. CA is a P1 feature (not P2; P2 adds PIM and Identity Protection). Security Defaults is not per-user, and it does not coexist with CA. The exam tests this either/or relationship directly.`

**q6 — id `03-microsoft-identity/02-entra-id/q6`**
- **prompt:** `An Azure App Service needs to read secrets from Azure Key Vault. A developer proposes storing a client secret in the app's configuration. What is the more secure Entra ID-native approach, and how does it obtain a token?`
- **options:**
  - A. `Keep the client secret but rotate it weekly via a script.`
  - B. `Assign the App Service a managed identity and grant it access to Key Vault; the app obtains an Entra token from the Azure Instance Metadata Service (IMDS) endpoint with no secret stored in code.`
  - C. `Federate the App Service to an on-prem ADFS server for token issuance.`
  - D. `Use a shared Global Administrator account credential in the app configuration.`
- **correctIndex:** 1
- **explanation:** `A managed identity removes the stored secret entirely: the platform issues and rotates the credential, and the app retrieves an Entra access token from the IMDS endpoint (169.254.169.254). You then grant that identity access to Key Vault. Storing or rotating a client secret still leaves a leakable credential; ADFS federation and a shared Global Admin account are both wrong and far less secure.`

### `03-hybrid-identity` — +1 quiz (q4)
**Insertion point:** append after the existing `q3` `<Quiz ... />` at the end of **`## Check your understanding`** (end of file).

**q4 — id `03-microsoft-identity/03-hybrid-identity/q4`**
- **prompt:** `A bank still runs ADFS federation and wants to move to cloud authentication, but cannot risk converting the whole domain at once after a prior outage. Which Microsoft capability lets them migrate selected pilot groups to PHS or PTA first, without converting the federated domain?`
- **options:**
  - A. `Seamless SSO.`
  - B. `Staged Rollout, which moves selected groups to cloud authentication (PHS or PTA) for testing while the domain remains federated for everyone else.`
  - C. `Password writeback.`
  - D. `Selective Authentication.`
- **correctIndex:** 1
- **explanation:** `Staged Rollout is purpose-built for de-risking a federation-to-cloud migration: you move pilot groups onto PHS or PTA and validate cloud authentication for that population while the rest of the domain stays federated, then expand. Seamless SSO is a desktop SSO add-on, password writeback syncs cloud password changes to on-prem, and Selective Authentication is a forest-trust access control — none provides a phased federation cutover.`

---

## SC300Badge placement (the badge rollout)

`<SC300Badge />` is an inline `<span>` and must be appended to the **end of a heading's text on the same line**. Below are the exact target headings (current text → edited text). Section-level `sc300` flags are already `true` for all three — **no `lib/sections.ts` change**.

**`02-entra-id.mdx` (primary rollout — these are the named SC-300 objective areas):**
- `# Entra ID` → `# Entra ID <SC300Badge />`
- `### Conditional Access — the policy engine` → `### Conditional Access — the policy engine <SC300Badge />`
- `### MFA — the authenticator landscape` → `### MFA — the authenticator landscape <SC300Badge />`
- `### Privileged Identity Management — just-in-time elevation` → `### Privileged Identity Management — just-in-time elevation <SC300Badge />`
- `### Identity Protection — risk-based signals` → `### Identity Protection — risk-based signals <SC300Badge />`
- `### App registrations, enterprise apps, and the consent model` → `### App registrations, enterprise apps, and the consent model <SC300Badge />`
- If you add the governance prose subsection: `### Identity governance — access packages, reviews, and lifecycle <SC300Badge />`

**`01-active-directory.mdx`:**
- `# Active Directory Domain Services` → `# Active Directory Domain Services <SC300Badge />` (H1 only — internal AD subsections are Security+/CISSP-leaning, not discrete SC-300 line items)

**`03-hybrid-identity.mdx`:**
- `# Hybrid Identity` → `# Hybrid Identity <SC300Badge />` (H1 carries the hybrid-identity objective; the prose subsections are all in-scope, so the H1 badge covers the section cleanly)

> Rationale: the SC300Badge's purpose is to flag exam-aligned material to a studying user. Entra ID is where SC-300 objectives map to discrete subsections, so it gets per-subsection badges. AD and Hybrid get a single H1 badge — over-badging every AD internals heading would dilute the signal (most AD internals are not SC-300 objectives, even though the section overall supports the hybrid-foundations objective). This matches the existing `SC300_SECTIONS` flags exactly without inflating them.

---

## Wiring tasks

**No data/config wiring is required** — all three sections are already fully wired:

1. **`content/modules.json`** — NO CHANGE. `03-microsoft-identity.sections` already lists all three slugs (lines 22–24).
2. **`lib/sections.ts`** — NO CHANGE.
   - `SECTION_TITLES` already has all three Module 3 keys (lines 37–39).
   - `SC300_SECTIONS` already contains `03-microsoft-identity/01-active-directory`, `/02-entra-id`, `/03-hybrid-identity` (lines 50–52), so `sc300:true` is already returned for every Module 3 section. **Do not add or remove entries.**
3. **`lib/content-loader.ts`** — NO CHANGE. All three sections are in `AUTHORED_SECTIONS` (lines 56–58) and `ALL_KNOWN_SECTIONS` (lines 130–132) with import `case`s (lines 94–99).
4. **`mdx-components.tsx`** — NO CHANGE. `SC300Badge` is already imported (line 6) and exposed (line 24), so inline `<SC300Badge />` works with no per-file import.

The only edits in this entire workstream are **inside the three `.mdx` files**: 24 `<Flashcard>` tags, 6 `<Quiz>` tags, and the `<SC300Badge />` heading annotations enumerated above.

---

## Verification (run after edits, before commit)

- **Counts:** `<Flashcard>` total across the three files must be **60** (AD 20 / Entra 23 / Hybrid 17); `<Quiz>` total must be **15** (AD 5 / Entra 6 / Hybrid 4). Grep each file: `<Flashcard\b` and `<Quiz\b`.
- **Extraction integrity:** `pnpm test` — the `lib/content-index` extraction tests and the `modules.json` ↔ `sections.ts` drift test must stay green (the drift test should be unaffected since no slugs changed). Verify no card `front` collides with an existing one in the same section (would silently merge ids).
- **Quiz id uniqueness:** new ids must be `.../q4`, `.../q5`, `.../q6` with no duplicate of an existing id.
- **No raw double-quotes** inside any `front`/`back`/`prompt`/`explanation` value (the attribute regex truncates at the first `"`). Use `&quot;` (already done in the drafts above where needed).
- **Build:** `pnpm build` clean; spot-check each section page renders the new cards/quizzes and the SC-300 badge appears on the annotated headings.
- **Resolve `[VERIFY]` markers** before publishing: ESC1 condition list (AD card 5 / q5 context), B2C-vs-External-ID current positioning (Entra card 1), soft-match attribute precedence (Hybrid card 7).

---

## Commit plan

Branch: **`module-03-recall-decks`** (off `main`).

One commit per section file, plus a final badge commit if you prefer to isolate the rollout — recommended grouping:

1. `feat(mod3): +8 AD DS flashcards & 2 quizzes (forest/OU/GPO/gMSA/ADCS/RODC/trusts)` — edits `01-active-directory.mdx`.
2. `feat(mod3): +9 Entra ID flashcards & 3 quizzes (tenant/AU/governance/managed-identity)` — edits `02-entra-id.mdx`.
3. `feat(mod3): +7 hybrid-identity flashcards & 1 quiz (cloud-sync/SSPR/staged-rollout/decision-tree)` — edits `03-hybrid-identity.mdx`.
4. `feat(mod3): roll out <SC300Badge /> across SC-300-aligned subsections` — the heading-annotation edits across all three files (or fold into commits 1–3 per file).

Merge to `main` when `pnpm test` and `pnpm build` are green and counts verify at 60/15. Then tick workstream **0A** (and **0D** for Module 3) in `docs/superpowers/plans/2026-06-01-remaining-work-roadmap.md`.
