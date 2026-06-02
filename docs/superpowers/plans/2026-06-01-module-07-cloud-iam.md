# Module 7 — Cloud IAM: Complete Content Plan

> **For agentic workers:** This is an execution-ready authoring plan. Author each section as inline MDX (no JSON sidecars for flashcards/quizzes). Mirror house style from `content/modules/02-protocols/01-kerberos.mdx` and `content/modules/03-microsoft-identity/02-entra-id.mdx`. Wire each new section through the two-file sync + content-loader before expecting it to render. One new diagram component (`<AWSIAMEvalDiagram />`) gates full quality of section 01 — its TDD build plan lives in the diagrams plan doc (see "Diagram" section).

**Goal:** Author Module 7 (Cloud IAM) — 5 sections (~2,700–3,000 words each) teaching AWS IAM policy evaluation, Azure RBAC beyond Entra, GCP IAM, multi-cloud identity strategy, and CIEM — so the learner masters cloud entitlement models across the three major providers with exam-grade precision on the AWS policy-evaluation order.

**Architecture note:** No architectural change. Module 7 lights up by (a) authoring 5 `.mdx` files under `content/modules/07-cloud-iam/`, (b) the two-file sync (`content/modules.json` sections array + `lib/sections.ts` `SECTION_TITLES`/`SC300_SECTIONS`), (c) registering each section in `lib/content-loader.ts` (`AUTHORED_SECTIONS` + `ALL_KNOWN_SECTIONS` + a static import `case`), and (d) the one net-new diagram `<AWSIAMEvalDiagram />` registered in `mdx-components.tsx`. Flashcards/quizzes/definitions/war-stories are extracted at runtime from the inline MDX by `lib/content-index.ts` — there are NO sidecar files.

**Prereqs / conventions (verify against code, do not assume):**
1. **Two-file sync (enforced by `lib/sections.test.ts`).** Adding sections means updating BOTH `content/modules.json` (`07-cloud-iam` `sections: [...]`) AND `lib/sections.ts` (`SECTION_TITLES` entry per slug + `SC300_SECTIONS` for cert-aligned slugs). The drift test asserts `getOrderedSections()` length and that every slug has a curated title. It currently expects 17 sections — **that hard-coded count and the assertions in `lib/sections.test.ts` and `lib/content-index.test.ts` must be updated as part of wiring** (the test says "17 authored sections"; after this module it is 22). Treat the test update as part of the wiring commit.
2. **Content-loader registration.** Each new MDX section needs an entry in `lib/content-loader.ts`: add the `${moduleId}/${slug}` key to `AUTHORED_SECTIONS`, to `ALL_KNOWN_SECTIONS`, and a static `import` `case` in `loadAuthoredComponent`. This is the only app-code touch to light up a section.
3. **Interactive content is INLINE MDX.** Author `<Flashcard front="..." back="..." />`, `<Quiz question={{...}} />`, `<Definition term="...">...</Definition>`, `<WarStory title="...">...</WarStory>`, `<ProTip>...</ProTip>` inline. The extractor regexes in `lib/content-index.ts` are strict:
   - **Flashcard** must be a self-closing tag with **double-quoted** `front="..."` and `back="..."` attributes. **No literal double-quote characters inside front/back text** (the regex is `front="([^"]*)"`). Use single quotes or `&quot;` if a quote is unavoidable; prefer rephrasing. Keep each card on conceptually one logical attribute (multiline is fine, but no `"` inside).
   - **Quiz** uses `question={{ id, prompt, options: [...], correctIndex, explanation }}`. The search index extracts `prompt: "..."` — keep the prompt a single double-quoted string with no inner double-quotes.
   - **Definition / WarStory** use double-quoted `term="..."` / `title="..."` and a closing tag.
4. **House style per section:** top `<HoloPanel label="COVERS">` mapping to SC-300 / Security+ / CISSP where relevant (use a leading `{/* Objectives current as of 2026-06-01. Re-verify before a cert sitting. */}` comment like existing sections), then prose with `## What it is` / `## Why it exists` / `## How it works under the hood`, `<Definition>` for key terms, a `<WarStory>`, `<ProTip>`s, an embedded diagram where one fits, a `## Recall drill` block of `<Flashcard>`s, and a `## Check your understanding` block of `<Quiz>`es. Depth benchmark: ~2,700–3,000 words/section.
5. **ACCURACY IS NON-NEGOTIABLE.** Cite the real AWS/Azure/GCP doc, NIST SP, or RFC for every non-obvious claim. **Get the AWS policy-evaluation order EXACTLY right** (see section 01 — common exam trap). Where a specific limit, default, or behavior is asserted and not 100% certain, draft it and append `[VERIFY]` so the author confirms before publishing.

**Cross-link discipline (avoid duplicating Module 3):** Module 3 (`03-microsoft-identity/02-entra-id.mdx`) already covers Entra ID tenants, Conditional Access, PIM, Identity Protection, and Managed Identities at the *control-plane / identity-provider* level. Section 02 (`02-azure-rbac`) must NOT re-teach Entra ID. It covers the **Azure Resource Manager authorization layer** (RBAC scope hierarchy, role definitions, role assignments) — the "what can this identity DO to which Azure resources" layer that sits on top of Entra ID authentication. Whenever Entra concepts come up, link back: e.g. "Entra ID issues the token (see Module 3 → Entra ID); Azure RBAC decides what that token can touch." Managed Identities are introduced in Module 3 at the identity level; section 02 covers them again only from the *role-assignment* angle (assigning RBAC roles to a managed identity), referencing Module 3 for the system-vs-user distinction.

**Module totals (targets):** ~14,000 words, **~50 flashcards**, **~12 quiz questions**, 1 new diagram (`<AWSIAMEvalDiagram />`), 1 SC-300-tagged section (02-azure-rbac — partial; see alignment notes).

---

## Section map

### `01-aws-iam` — AWS IAM: Policy Evaluation, Organizations & Identity Center
**Word target:** ~3,000 (densest section — carries the diagram and the exam-trap material)

**SC-300 alignment:** None. AWS is not on SC-300. Do **not** render `<SC300Badge />`; `sc300 = false` in `lib/sections.ts`. (Brief Security+ SY0-701 cloud-IAM relevance only — note in `<HoloPanel>` under Security+/CISSP, not SC-300.)

**`<HoloPanel label="COVERS">` mapping:**
- **Security+ SY0-701** Obj 4.6 — cloud identity providers / cloud IAM concepts (policy-based access control)
- **CISSP** Domain 5 — implement and manage authorization mechanisms (policy evaluation, least privilege at scale)
- (No SC-300 — AWS is out of SC-300 scope; say so explicitly so the learner isn't confused.)

**Topics / study material (detailed outline — this is the substance to teach):**

- **The IAM object model.** Users, groups, roles, and policies as the four primitives. **Roles are the cloud-native default** (assumed via STS, temporary credentials) vs long-lived IAM user access keys (discouraged). Define `<Definition term="IAM role">` and `<Definition term="trust policy">` (the role's `AssumeRole` trust relationship — who is *allowed to assume* the role, distinct from the permissions the role *grants*). Source: AWS IAM User Guide, "Identities (users, groups, and roles)" and "Roles terms and concepts."
- **Policy types and where they attach.** Identity-based policies (attached to users/groups/roles), resource-based policies (attached to a resource, e.g. an S3 bucket policy or KMS key policy — these include a `Principal` element), permission boundaries (a managed policy that sets the *maximum* permissions an identity-based policy can grant — it does not grant anything itself), Service Control Policies (SCPs — Organizations guardrails that set the max permissions for accounts in an OU/org; also do not grant), session policies (passed inline when assuming a role), and ACLs/RCPs (mention Resource Control Policies as the newer org-wide resource guardrail, 2024 — `[VERIFY]` RCP availability/behavior). Source: AWS IAM User Guide, "Policies and permissions in IAM," "Permissions boundaries," and AWS Organizations User Guide "SCPs."
- **THE POLICY EVALUATION LOGIC — get this EXACTLY right (the exam trap).** This is the heart of the section and the diagram. The authoritative order from AWS IAM User Guide, "Policy evaluation logic" → "Determining whether a request is allowed or denied within an account" and "cross-account":
  1. **Default = implicit deny.** Every request starts denied.
  2. **Evaluate all applicable policies and collect Allows/Denies.** AWS evaluates SCPs, resource-based policies, identity-based policies, permission boundaries, and session policies together.
  3. **An explicit `Deny` in ANY policy overrides everything.** If any policy returns `Deny`, the final decision is **deny** — full stop. (Explicit deny always wins.)
  4. **If no explicit deny, AWS checks the guardrails/boundaries in this precedence:** the request must be **Allowed** by *each* applicable boundary type that is present:
     - **Organizations SCPs** — if SCPs apply, the action must be allowed by an SCP (an SCP that does not allow it is an implicit deny at the org level). SCPs filter; they never grant.
     - **Resource-based policy** — an explicit Allow here can grant access (and in cross-account, can independently authorize a principal). **Within the same account**, an Allow in *either* the identity-based policy *or* the resource-based policy is sufficient (their permissions are a union). **Cross-account**, BOTH the identity-based policy in the caller's account AND the resource-based policy in the resource's account must allow it.
     - **Permission boundary** — if a boundary is attached to the principal, the action must be within the boundary (boundary AND identity-policy must both allow). The boundary caps; it never grants.
     - **Session policy** — if present (assumed-role session), the action must be within it too.
     - **Identity-based policy** — must allow (unless a resource-based policy independently allows in the same account, per the union rule above).
  5. **If, after all that, nothing explicitly allows → implicit deny → request denied.**
  - **The exam-correct one-liner to teach and drill:** *Explicit Deny → (then everything below must each Allow) SCP → resource-based policy → permission boundary → session policy → identity-based policy → otherwise implicit Deny.* Emphasize: **explicit deny always wins; the boundary/SCP/session policy types only ever *restrict*, never grant; an Allow must come from an identity-based or resource-based policy.** This matches the assignment's required order: `explicit deny → SCP → permission boundary → identity/resource policy → implicit deny`. Cite AWS IAM User Guide "Policy evaluation logic" (the flow chart diagram in that doc is the canonical reference — the `<AWSIAMEvalDiagram />` animates exactly this).
- **AWS Organizations & SCPs.** Management account vs member accounts, OUs, the root, consolidated billing. SCPs attach to root/OU/account and **filter** the permissions available to IAM principals in member accounts (they do **not** affect the management account, and do **not** affect service-linked roles). `FullAWSAccess` default SCP. Allow-list vs deny-list SCP strategy. Source: AWS Organizations User Guide, "Service control policies (SCPs)."
- **AWS IAM Identity Center** (formerly AWS SSO). The recommended way to manage human (workforce) access across many accounts: an external IdP (Entra ID, Okta) federates in via SAML/SCIM; **permission sets** (collections of policies) get assigned to users/groups for specific accounts; users get a portal and short-lived role credentials. Distinguish from IAM users (which are per-account, long-lived). Cross-link: "Entra ID can be the IdP feeding Identity Center via SAML + SCIM (see Module 2 → SCIM, Module 3 → Entra)." Source: AWS IAM Identity Center User Guide.
- **IAM Access Analyzer.** Two capabilities: (1) **external access** findings — analyzes resource-based policies to find resources shared outside your account/org (zone of trust); (2) **unused access** findings — flags unused roles, unused access keys, unused permissions (least-privilege right-sizing, the bridge to the CIEM section). Also **policy validation** and **policy generation** (generate least-privilege policy from CloudTrail activity). Source: AWS IAM Access Analyzer docs.
- **Cross-account roles.** The canonical pattern: account A's principal assumes a role in account B via `sts:AssumeRole`; the role in B has a trust policy naming A's account/principal, and a permissions policy granting what it can do in B. `ExternalId` for the confused-deputy problem (third-party/vendor cross-account access). Role chaining and the 1-hour max session on chained roles `[VERIFY]`. Source: AWS IAM User Guide, "Cross-account access" and STS docs.

**Components to embed:** `<HoloPanel label="COVERS">`, `<AWSIAMEvalDiagram />` (placed in "How it works under the hood" right after the evaluation-order prose), `<Definition>` (IAM role, trust policy, SCP, permission boundary, resource-based policy), `<ProTip>` (SCPs/boundaries never grant — only filter), `<WarStory>`, `## Recall drill` `<Flashcard>` block, `## Check your understanding` `<Quiz>` block.

---

### `02-azure-rbac` — Azure RBAC: The Resource Authorization Layer
**Word target:** ~2,800

**SC-300 alignment:** **Partial.** Azure RBAC scope hierarchy and Managed Identity role assignment touch SC-300's "plan and implement identity governance" and Azure resource access, but the core RBAC-on-ARM material is more AZ-104/AZ-500 than SC-300. **Render `<SC300Badge />` only in the Managed Identities subsection** (which directly extends Module 3's SC-300 managed-identity material) and **set `sc300 = true`** for this slug in `lib/sections.ts` `SC300_SECTIONS` (it's the only Module 7 slug that earns it). Note in the `<HoloPanel>` that the RBAC-engine material is primarily AZ-500/AZ-104.

**`<HoloPanel label="COVERS">` mapping:**
- **SC-300** Plan and implement privileged access — role assignment and scope (Managed Identities and resource-scope governance; cross-reference Module 3 PIM)
- **AZ-500 / AZ-104** — Azure RBAC, custom roles, Azure Policy (note: this is where the bulk lives)
- **CISSP** Domain 5 — authorization mechanisms at resource scope

**Topics / study material:**

- **Cross-link framing first.** Entra ID (Module 3) authenticates and issues the token. **Azure RBAC is the authorization layer of Azure Resource Manager (ARM)** — it decides what an already-authenticated identity can do to Azure *resources*. Distinguish **Azure RBAC** (resource access, ARM) from **Entra roles** (directory roles like Global Administrator — covered in Module 3). This distinction is a classic point of confusion. Source: MS Learn, "What is Azure role-based access control (Azure RBAC)?" and "Azure roles, Microsoft Entra roles, and classic subscription administrator roles."
- **The three elements of a role assignment:** **security principal** (user, group, service principal, or managed identity) + **role definition** (a collection of `Actions`/`NotActions`/`DataActions`/`NotDataActions`) + **scope**. An assignment = principal × role × scope. Source: MS Learn, "Understand Azure role assignments."
- **Scope hierarchy (4 levels, inherited downward):** **management group → subscription → resource group → resource.** Assignments at a parent scope are **inherited** by all children. Define `<Definition term="management group">`. Effective permissions = the **union** of all role assignments that apply at or above the resource's scope. Source: MS Learn, "Understand scope for Azure RBAC."
- **How Azure RBAC evaluates (contrast with AWS):** Azure is **additive (union) for Allow**, but **`Deny` assignments override Allow** (deny assignments are created by Azure Blueprints / managed apps, not directly by users `[VERIFY]` current authoring path). Net: deny assignment > role-assignment Allow > default no-access. This is a deliberate teaching contrast with AWS's explicit-deny-wins-then-boundary model. Source: MS Learn, "How Azure RBAC determines if a user has access to a resource."
- **Built-in vs custom roles.** Owner / Contributor / Reader / User Access Administrator as the core built-ins (Owner = full + can delegate; Contributor = full except can't grant access; Reader = view). **Custom roles** when built-ins don't fit: JSON with `Actions`, `NotActions`, `DataActions`, `NotActions`, and `AssignableScopes`. Limit `[VERIFY]` (e.g. 5,000 custom roles per tenant / 5,000 role assignments per subscription — confirm current limits). Source: MS Learn, "Azure built-in roles," "Azure custom roles."
- **Managed Identities — the role-assignment angle (SC-300 badge here).** System-assigned (1:1 with a resource, lifecycle-bound) vs user-assigned (standalone, attachable to many) — *brief recap, cross-link Module 3 → Entra ID for the identity-level detail*. The Module-7 value-add: **you grant a managed identity access by assigning it an Azure RBAC role at a scope** (e.g. assign a VM's system-assigned MI the "Storage Blob Data Reader" role on a storage account). This is how secretless workload access works in Azure. Source: MS Learn, "Managed identities for Azure resources" + "Assign Azure roles to a managed identity."
- **Azure Policy (distinct from RBAC).** RBAC controls *who can do what*; **Azure Policy controls *what configurations are allowed*** (e.g. "deny creation of public IPs," "require a tag," "audit untagged resources"). Policy effects: Audit, Deny, Append, Modify, DeployIfNotExists. Initiatives (policy sets). Cross-cloud parallel: Azure Policy ≈ AWS SCP/Config guardrails for resource configuration, NOT for identity permissions. Source: MS Learn, "What is Azure Policy?" and "Azure Policy definition structure."
- **Azure Lighthouse.** Cross-tenant delegated resource management — an MSP/consultant manages a customer's Azure resources from the MSP's own tenant via **delegated role assignments** scoped to the customer's subscription/RG, without guest accounts in the customer tenant. Relevant to Kolton's consulting path (multi-tenant management). Source: MS Learn, "What is Azure Lighthouse?"

**Components to embed:** `<HoloPanel label="COVERS">`, `<SC300Badge />` (Managed Identities subsection only), `<Definition>` (Azure RBAC, role definition, scope, management group, deny assignment, Azure Policy), `<ProTip>` (Azure additive Allow + deny-assignment override vs AWS explicit-deny model), `<WarStory>`, `## Recall drill`, `## Check your understanding`. No new diagram (scope hierarchy is described in prose + optionally reuse a generic mention; do NOT build a new diagram for this section).

---

### `03-gcp-iam` — Google Cloud IAM: Resource Hierarchy, Roles & Workload Identity
**Word target:** ~2,700

**SC-300 alignment:** None. `sc300 = false`. Security+/CISSP relevance only.

**`<HoloPanel label="COVERS">` mapping:**
- **Security+ SY0-701** Obj 4.6 — cloud identity providers
- **CISSP** Domain 5 — authorization at scale, federation, service accounts
- (No SC-300.)

**Topics / study material:**

- **The GCP IAM model: who (principal) + can do what (role) + on which resource.** A **policy** (allow policy) binds **members/principals** to **roles** at a resource node. Source: Google Cloud "IAM overview."
- **Resource hierarchy (inherited downward):** **Organization → Folder(s) → Project → Resource.** Policies set at a parent are inherited by descendants; the effective policy is the **union** of the resource's own policy and all ancestors'. Projects are the fundamental unit that owns resources and billing. Define `<Definition term="GCP project">` and `<Definition term="organization node">`. Source: Google Cloud "Resource hierarchy" and "Policy inheritance."
- **GCP evaluation model — additive, and historically no explicit deny.** GCP IAM allow policies are **purely additive** (union); there is no "deny by being absent from a role" beyond simply not being granted. Google later added **IAM deny policies** (deny rules evaluated *before* allow — an applicable deny wins). Teach: allow policies are additive/union; **deny policies are evaluated first and override allows**. This is the third distinct model to contrast with AWS (explicit-deny-wins + boundaries) and Azure (additive + deny assignments). Source: Google Cloud "IAM deny overview" and "Policy evaluation."
- **Role types: basic vs predefined vs custom.** **Basic roles** (Owner/Editor/Viewer) — legacy, overly broad, discouraged for production. **Predefined roles** — granular, Google-managed, per-service (e.g. `roles/storage.objectViewer`), the recommended default. **Custom roles** — you compose specific permissions when predefined don't fit; note custom-role maintenance burden (Google adds permissions to predefined roles automatically; custom roles you must maintain). Source: Google Cloud "Understanding roles," "Custom roles."
- **Service accounts.** A `<Definition term="service account">` is a special account used by a workload (VM, app, function), not a human — identified by an email, authenticated by Google-managed keys (or user-managed keys, discouraged). **Service account impersonation** (`iam.serviceAccounts.getAccessToken`) as the modern least-privilege pattern vs downloading long-lived JSON keys (a major exfiltration risk — teach this). Source: Google Cloud "Service accounts overview," "Best practices for using service accounts."
- **Workload Identity Federation.** The keystone for multi-cloud (sets up section 04): lets **external identities** (AWS IAM roles, Azure/Entra workloads, GitHub Actions OIDC, any OIDC/SAML IdP) impersonate a GCP service account **without service-account keys** — exchange an external token for short-lived GCP credentials via STS. This is how you avoid storing GCP keys in AWS/Azure/CI. Define `<Definition term="workload identity federation">`. Source: Google Cloud "Workload Identity Federation."
- **(Brief) Workload Identity (for GKE)** — distinct from federation: maps Kubernetes service accounts to GCP service accounts so pods get GCP creds without node keys. Mention to disambiguate the similarly-named feature. `[VERIFY]` current naming ("Workload Identity Federation for GKE"). Source: Google Cloud GKE "Workload Identity."
- **IAM Recommender / Policy Analyzer** — least-privilege right-sizing (flags excess permissions from usage), bridging to the CIEM section. Source: Google Cloud "IAM Recommender."

**Components to embed:** `<HoloPanel>`, `<Definition>` (project, organization node, service account, workload identity federation), `<ProTip>` (service-account keys are the #1 GCP credential-exfil risk — prefer impersonation/federation), `<WarStory>`, `## Recall drill`, `## Check your understanding`. No new diagram.

---

### `04-multi-cloud-strategy` — Multi-Cloud Identity Strategy
**Word target:** ~2,700

**SC-300 alignment:** None. `sc300 = false`.

**`<HoloPanel label="COVERS">` mapping:**
- **CISSP** Domain 5 — federated identity management, identity-as-a-service, trust across boundaries
- **NIST SP 800-207** (Zero Trust Architecture) — consistent identity-centric policy across environments
- (No SC-300.)

**Topics / study material:**

- **The core problem:** three providers, three entitlement models (AWS explicit-deny + boundaries; Azure additive + deny assignments; GCP additive + deny policies), three role vocabularies. A consistent identity strategy avoids one set of long-lived credentials per cloud and one ungoverned admin model per cloud. Frame against **NIST SP 800-207 Zero Trust** — identity as the control plane across all environments.
- **One human IdP, federate everywhere.** The dominant pattern: a single workforce IdP (Entra ID or Okta) is the source of truth for human identities, federated into each cloud's access layer — Entra/Okta → **AWS IAM Identity Center** (SAML+SCIM, permission sets), Entra/Okta → **Azure** (it's already Entra-native), Entra/Okta → **GCP** (SAML/OIDC SSO + Cloud Identity / Google Workspace directory sync, or Workforce Identity Federation). Cross-link Module 2 (SAML, OIDC, SCIM) and Module 3 (Entra). Define `<Definition term="workforce identity federation">` (the GCP feature for human users, distinct from *workload* identity federation). Source: each provider's federation docs; Google "Workforce Identity Federation."
- **Workload identity across clouds (no static keys).** The secretless pattern: a workload in cloud A assumes/impersonates an identity in cloud B via token exchange — e.g. an AWS-hosted workload uses **GCP Workload Identity Federation** to get GCP creds; an AWS workload uses an **Entra federated credential** (workload identity federation in Entra) to call Azure; GitHub Actions OIDC into all three. The principle: **trust an OIDC issuer, exchange tokens for short-lived creds, never store long-lived keys cross-cloud.** Source: provider workload-federation docs (cross-reference section 01 STS, section 03 WIF).
- **Landing zones.** `<Definition term="landing zone">` — a pre-architected, governed, multi-account/multi-project baseline you deploy into before workloads land. **AWS:** Control Tower + Landing Zone (multi-account, guardrails via SCPs, centralized logging, Identity Center baseline). **Azure:** Cloud Adoption Framework (CAF) enterprise-scale landing zones (management-group hierarchy, Azure Policy guardrails, centralized identity subscription). **GCP:** the GCP enterprise foundations blueprint (org/folder/project hierarchy, org policies). Teach the common shape: a management/identity boundary, environment OUs/folders/management-groups, policy guardrails, centralized logging. Source: AWS Control Tower docs; Microsoft CAF landing zone docs; Google Cloud "Enterprise foundations blueprint."
- **Guardrails parity.** Map the three guardrail mechanisms side by side: **AWS SCPs / RCPs**, **Azure Policy + management-group-scoped role assignments**, **GCP Organization Policy Service**. Note: these constrain *configuration and permission ceilings*, not grant access. (Reinforces the cross-cloud mental model from 01–03.)
- **Consistency tactics:** standardized role/permission naming, infrastructure-as-code for all role assignments (Terraform), a single CIEM/posture tool spanning clouds (sets up section 05), centralized log aggregation (CloudTrail + Azure Activity Log + GCP Cloud Audit Logs → one SIEM — cross-link Module 8 if/when authored).

**Components to embed:** `<HoloPanel>`, `<Definition>` (workforce identity federation, landing zone, control plane), `<ProTip>` (one human IdP + per-cloud workload federation = zero standing cross-cloud secrets), `<WarStory>`, a small comparison framing (prose table of the 3 evaluation models is fine — Markdown table, not a component), `## Recall drill`, `## Check your understanding`. No new diagram.

---

### `05-ciem` — CIEM: Cloud Infrastructure Entitlement Management
**Word target:** ~2,700

**SC-300 alignment:** None directly, but **Microsoft Entra Permissions Management** is Microsoft's CIEM and brushes SC-300's governance theme. `sc300 = false` (keep the badge off — it's not an exam objective). Mention SC-300's PIM/governance link in prose only.

**`<HoloPanel label="COVERS">` mapping:**
- **CISSP** Domain 5 — least privilege, entitlement reviews, privilege right-sizing
- **NIST SP 800-53** AC-6 (Least Privilege) and AC-2 (Account Management) — CIEM operationalizes these in cloud
- (No SC-300.)

**Topics / study material:**

- **What CIEM is.** `<Definition term="CIEM (Cloud Infrastructure Entitlement Management)">` — a category of tooling that discovers, visualizes, and right-sizes *cloud entitlements* (who/what can do what across IaaS/PaaS), with the goal of enforcing least privilege at cloud scale. Coined by Gartner ~2020. Distinct from PAM (privileged session/secret control), IGA (joiner-mover-leaver lifecycle + certification), and CSPM (resource misconfiguration). Source: Gartner CIEM definition `[VERIFY]` exact wording; vendor docs.
- **Why it exists — the permissions gap.** Cloud identities (especially machine/workload identities, which vastly outnumber humans) accumulate far more permissions than they use. The metric to teach: the gap between **permissions granted vs permissions used** (the "Permissions Creep Index" in Microsoft Entra Permissions Management, or analogous "effective vs used" in other tools). Over-permissioned identities = blast radius. Source: Microsoft Entra Permissions Management docs ("Permissions Creep Index").
- **Core CIEM capabilities:** (1) **multi-cloud entitlement discovery** (normalize AWS/Azure/GCP permission models into one view); (2) **right-sizing recommendations** (analyze actual usage from CloudTrail / Azure Activity Log / GCP audit logs, recommend trimming unused permissions — generate least-privilege policies); (3) **anomaly/threat detection** on identity activity; (4) **continuous monitoring + alerting** on new high-risk grants; (5) **remediation** (auto-generate scoped-down policies). Map each to the native analyzers already introduced: AWS **IAM Access Analyzer unused-access**, Azure (Entra Permissions Management), GCP **IAM Recommender** — CIEM tools generalize these across clouds.
- **Tools — name and differentiate:**
  - **Microsoft Entra Permissions Management** (formerly CloudKnox) — Microsoft's multi-cloud CIEM covering AWS, Azure, GCP; Permissions Creep Index; auto-generated least-privilege policies. Source: MS Learn "What's Microsoft Entra Permissions Management?"
  - **Wiz** — CNAPP with strong CIEM (effective-permissions graph across cloud + identity, toxic-combination/attack-path analysis). Note it's broader than pure CIEM (CSPM + CWPP + CIEM). `[VERIFY]` precise CIEM feature naming.
  - Brief mentions: **Sonrai**, **CrowdStrike (Falcon Cloud Security)**, **Palo Alto Prisma Cloud** as other CIEM-capable platforms; native tools (Access Analyzer, IAM Recommender) as the "free floor."
- **Operating model — how a team uses CIEM.** Baseline current entitlements → identify unused/excessive → right-size (least privilege) → set guardrails to prevent regression → continuously monitor + periodic access review. Tie to **NIST 800-53 AC-6** least privilege and to IGA access certification (cross-link Module 5 IGA if/when authored). Position CIEM as the cloud-scale, machine-identity-aware complement to human-focused IGA.
- **CIEM vs PAM vs IGA vs CSPM — the boundary table** (prose Markdown table): CIEM = entitlement right-sizing (esp. machine identities); PAM = privileged session/credential vaulting (Module 4); IGA = lifecycle + certification (Module 5); CSPM = resource misconfiguration. This disambiguation is high-value and commonly muddled.

**Components to embed:** `<HoloPanel>`, `<Definition>` (CIEM, Permissions Creep Index, least privilege), `<ProTip>` (machine identities outnumber humans 10:1+ in cloud `[VERIFY]` ratio — they're the real CIEM target), `<WarStory>`, comparison Markdown table, `## Recall drill`, `## Check your understanding`. No new diagram.

---

## Flashcards (drafted — ~50 total across the module)

> Authoring constraint reminder: each must be `<Flashcard front="..." back="..." />` self-closing, double-quoted, **no literal `"` inside front/back**. Cards below are written to honor that (apostrophes/single quotes only). IDs are generated by the content-index hash — do not add an id attribute.

### `01-aws-iam` (14 cards)
1. front: What are the four core identity primitives in AWS IAM? -> back: Users, groups, roles, and policies. Roles (assumed via STS for temporary credentials) are the cloud-native default; long-lived IAM user access keys are discouraged.
2. front: In AWS policy evaluation, what always wins regardless of any Allow? -> back: An explicit Deny. If any applicable policy (identity, resource, SCP, boundary, or session) returns Deny, the final decision is deny. Explicit deny always overrides explicit allow.
3. front: State the AWS policy evaluation order in one line. -> back: Start at implicit deny; an explicit Deny anywhere wins; otherwise the request must be allowed by each applicable guardrail in turn (Organizations SCP, then resource-based policy, then permission boundary, then session policy, then identity-based policy); if nothing allows, implicit deny denies it.
4. front: Do permission boundaries and SCPs ever grant permissions? -> back: No. Boundaries, SCPs, RCPs, and session policies only restrict (set a maximum). The actual grant must come from an identity-based or resource-based policy. This is the most common AWS exam trap.
5. front: What is an AWS permission boundary? -> back: A managed policy attached to an IAM user or role that sets the maximum permissions that identity can have. The effective permissions are the intersection of the boundary and the identity-based policy. It grants nothing on its own.
6. front: Same-account: where can the Allow come from for an action on a resource? -> back: From either the identity-based policy on the principal or the resource-based policy on the resource (their permissions form a union). Either one allowing is sufficient, absent an explicit deny.
7. front: Cross-account: what must be true for a principal in account A to act on a resource in account B? -> back: BOTH the identity-based policy in account A AND the resource-based policy in account B must allow the action. Cross-account requires allows on both sides (no union shortcut).
8. front: What does an SCP do, and what does it NOT affect? -> back: A Service Control Policy sets the maximum permissions for IAM principals in member accounts of an Organizations OU/account. It filters, never grants. It does not affect the management account or service-linked roles.
9. front: What is the difference between a role's trust policy and its permissions policy? -> back: The trust policy defines who is allowed to assume the role (the sts:AssumeRole principal). The permissions policy defines what the role can do once assumed. They are separate documents serving separate questions.
10. front: What is AWS IAM Identity Center and how does it differ from IAM users? -> back: Identity Center (formerly AWS SSO) manages workforce access across many accounts by federating an external IdP and assigning permission sets to users/groups per account, issuing short-lived credentials. IAM users are per-account and long-lived; Identity Center is the recommended human-access model.
11. front: Name the two finding types in AWS IAM Access Analyzer. -> back: External access findings (resources shared outside your zone of trust, from resource-based policy analysis) and unused access findings (unused roles, access keys, and permissions for least-privilege right-sizing). It also does policy validation and policy generation from CloudTrail.
12. front: What problem does ExternalId solve in a cross-account role trust policy? -> back: The confused-deputy problem. When a third party assumes a role in your account, requiring a unique ExternalId prevents another customer of that third party from tricking it into accessing your resources.
13. front: How does a same-account request begin in AWS authorization? -> back: With an implicit deny. Every request is denied by default until an applicable identity-based or resource-based policy explicitly allows it and no explicit deny or guardrail blocks it.
14. front: What is a resource-based policy and how do you recognize one? -> back: A policy attached directly to a resource (such as an S3 bucket policy or KMS key policy) that includes a Principal element naming who it applies to. Identity-based policies have no Principal element because they are already attached to the principal.

### `02-azure-rbac` (10 cards)
15. front: What is the difference between Azure RBAC and Entra ID roles? -> back: Azure RBAC controls access to Azure resources via Azure Resource Manager (e.g. Contributor on a resource group). Entra ID (directory) roles control access to Entra ID itself (e.g. Global Administrator). They are separate authorization systems often confused on exams.
16. front: What three elements make up an Azure role assignment? -> back: A security principal (user, group, service principal, or managed identity), a role definition (a set of allowed Actions/DataActions), and a scope. Assignment equals principal applied to role at scope.
17. front: List the four Azure RBAC scope levels from broadest to narrowest. -> back: Management group, subscription, resource group, resource. Role assignments are inherited downward, so an assignment at a parent scope applies to all child resources.
18. front: How does Azure RBAC combine multiple role assignments? -> back: Additively. Effective permissions are the union of all role assignments at and above the resource scope. There is no inherent deny from omission; a separate deny assignment, if present, overrides allows.
19. front: Compare the Owner, Contributor, and Reader built-in roles. -> back: Owner has full access including the right to delegate (assign roles). Contributor has full management access but cannot grant access to others. Reader can only view resources. User Access Administrator can manage access but not the resources themselves.
20. front: When do you need an Azure custom role, and what defines it? -> back: When no built-in role fits. A custom role is JSON specifying Actions, NotActions, DataActions, NotDataActions, and AssignableScopes (where it can be assigned).
21. front: How does a managed identity get permission to an Azure resource? -> back: You assign it an Azure RBAC role at a scope, exactly like any other principal (e.g. give a VM system-assigned managed identity Storage Blob Data Reader on a storage account). This enables secretless workload access.
22. front: What is the difference between Azure RBAC and Azure Policy? -> back: Azure RBAC controls who can perform actions on resources. Azure Policy controls what resource configurations are allowed (e.g. deny public IPs, require tags) with effects like Audit, Deny, and DeployIfNotExists. They are complementary, not the same.
23. front: What does Azure Lighthouse enable? -> back: Cross-tenant delegated resource management. A service provider manages a customer's Azure resources from its own tenant via delegated role assignments scoped to the customer's subscription or resource group, without creating guest accounts in the customer tenant.
24. front: A deny assignment and a role assignment both apply to a principal. Which wins? -> back: The deny assignment. In Azure RBAC, deny assignments override (block) actions even when a role assignment would allow them. Deny assignments are created by Azure managed apps and Blueprints, not directly by administrators.

### `03-gcp-iam` (10 cards)
25. front: List the GCP resource hierarchy levels from top to bottom. -> back: Organization, folder, project, resource. IAM allow policies set at a higher node are inherited by all descendants; effective access is the union of a resource's policy and all ancestor policies.
26. front: How do GCP IAM allow policies combine, and how do deny policies change that? -> back: Allow policies are purely additive (union) across the hierarchy. IAM deny policies are evaluated before allow policies; an applicable deny rule blocks the action regardless of allows.
27. front: Compare GCP basic, predefined, and custom roles. -> back: Basic roles (Owner/Editor/Viewer) are legacy and overly broad. Predefined roles are granular, Google-managed, per-service, and the recommended default. Custom roles are user-composed for cases predefined roles do not cover, but you must maintain them.
28. front: What is a GCP service account and how should workloads authenticate with it? -> back: A non-human account used by a workload (VM, app, function), identified by an email. Best practice is service account impersonation or workload identity federation for short-lived credentials, avoiding downloaded long-lived JSON keys, which are a major exfiltration risk.
29. front: What does GCP Workload Identity Federation do? -> back: It lets external identities (AWS roles, Entra workloads, GitHub Actions OIDC, any OIDC/SAML IdP) impersonate a GCP service account and obtain short-lived GCP credentials by exchanging an external token, eliminating the need to store service account keys outside GCP.
30. front: What is the fundamental resource-owning and billing unit in GCP? -> back: The project. Resources belong to a project, billing attaches to a project, and IAM policies and APIs are enabled per project. Projects sit under optional folders and an organization node.
31. front: Why are downloaded service account keys considered high risk in GCP? -> back: They are long-lived static credentials that, if leaked (committed to code, exfiltrated), grant standing access with no expiry. Google recommends impersonation or federation for short-lived tokens instead.
32. front: What is the difference between GCP Workload Identity Federation and Workload Identity for GKE? -> back: Workload Identity Federation lets external (non-Google) identities impersonate a service account. Workload Identity for GKE maps Kubernetes service accounts to GCP service accounts so pods get credentials without node keys. Different features, similar names.
33. front: What does the GCP IAM Recommender do? -> back: It analyzes actual permission usage and recommends removing excess permissions to move identities toward least privilege, similar in purpose to AWS Access Analyzer unused-access findings.
34. front: In GCP IAM, what does a policy binding connect? -> back: It binds one or more principals (members) to a single role on a resource. The resource's allow policy is the set of such bindings, combined additively with inherited ancestor bindings.

### `04-multi-cloud-strategy` (8 cards)
35. front: What is the dominant pattern for human identity across multiple clouds? -> back: One workforce IdP (Entra ID or Okta) as the source of truth, federated into each cloud's access layer via SAML/OIDC and SCIM (e.g. into AWS IAM Identity Center permission sets, native into Azure, and into GCP via SSO or Workforce Identity Federation).
36. front: What is the secretless pattern for workloads spanning clouds? -> back: Trust an OIDC issuer and exchange its token for short-lived credentials in the target cloud (GCP Workload Identity Federation, Entra federated credentials, GitHub OIDC), so no long-lived keys are stored cross-cloud.
37. front: Define a landing zone. -> back: A pre-architected, governed, multi-account or multi-project baseline (identity boundary, environment separation, policy guardrails, centralized logging) you deploy into before workloads land.
38. front: Name the landing-zone framework for each major cloud. -> back: AWS Control Tower (Landing Zone), Azure Cloud Adoption Framework enterprise-scale landing zones, and the Google Cloud enterprise foundations blueprint.
39. front: Map the guardrail mechanism in each cloud. -> back: AWS uses Service Control Policies (and Resource Control Policies); Azure uses Azure Policy plus management-group-scoped role assignments; GCP uses the Organization Policy Service. All cap configuration or permissions; none grant access.
40. front: How do the three clouds differ in deny handling? -> back: AWS: explicit deny always wins, then SCP/boundary/session guardrails must each allow. Azure: additive allow with deny assignments overriding. GCP: additive allow with deny policies evaluated first. All three let a deny override, but the allow models differ.
41. front: What is the difference between workforce and workload identity federation? -> back: Workforce identity federation is for human users signing in from an external IdP. Workload identity federation is for non-human workloads exchanging a token for short-lived credentials. Same token-exchange idea, different subject.
42. front: Why is centralized log aggregation part of a multi-cloud identity strategy? -> back: AWS CloudTrail, Azure Activity Log, and GCP Cloud Audit Logs each record identity and access events; routing all three into one SIEM gives a single place to detect cross-cloud identity threats and prove access for audit.

### `05-ciem` (8 cards)
43. front: What is CIEM? -> back: Cloud Infrastructure Entitlement Management: tooling that discovers, visualizes, and right-sizes cloud entitlements (who or what can do what across AWS/Azure/GCP) to enforce least privilege at cloud scale. The category was named by Gartner around 2020.
44. front: What is the Permissions Creep Index? -> back: A Microsoft Entra Permissions Management metric for the gap between permissions an identity is granted and the permissions it actually uses. A high index means an over-permissioned identity and a larger blast radius.
45. front: Why are machine/workload identities the primary CIEM target? -> back: In cloud they vastly outnumber human identities and tend to accumulate far more permissions than they use, often unmonitored, making them a large and under-governed attack surface.
46. front: How does CIEM relate to the native cloud analyzers? -> back: CIEM tools generalize across clouds what native tools do per-cloud: AWS IAM Access Analyzer unused-access, Azure (Entra Permissions Management), and GCP IAM Recommender all surface excess permissions; CIEM unifies and acts on them.
47. front: Name Microsoft's CIEM product and one signature capability. -> back: Microsoft Entra Permissions Management (formerly CloudKnox); it computes the Permissions Creep Index across AWS, Azure, and GCP and can auto-generate least-privilege policies.
48. front: How does CIEM differ from PAM? -> back: CIEM right-sizes standing entitlements across cloud identities (especially machine identities). PAM vaults and brokers privileged credentials and sessions for sensitive accounts. CIEM is about how much access exists; PAM is about controlling privileged use of it.
49. front: How does CIEM differ from IGA and from CSPM? -> back: IGA handles human identity lifecycle (joiner-mover-leaver) and access certification. CSPM finds resource misconfigurations. CIEM focuses on right-sizing entitlements (who/what can do what), complementing both.
50. front: What is the CIEM operating loop? -> back: Baseline current entitlements, identify unused or excessive permissions, right-size to least privilege, set guardrails to prevent regression, then continuously monitor and periodically review. It operationalizes NIST 800-53 AC-6 least privilege in the cloud.

---

## Quiz (drafted — 12 questions; AWS gets 4, others 2 each)

> Authoring constraint: `<Quiz question={{ id: "07-cloud-iam/<slug>/qN", prompt: "...", options: [...4...], correctIndex: N, explanation: "..." }} />`. Prompt is a single double-quoted string with no inner double-quotes.

### `01-aws-iam` (4 questions)

**Q1 — the policy-evaluation trap.**
- prompt: An IAM role has an identity-based policy that explicitly Allows s3:DeleteObject on a bucket. The bucket's resource-based policy says nothing about this principal. An SCP attached to the account's OU explicitly Denies all s3:Delete* actions. What is the result when the role tries to delete an object?
- options:
  1. Allowed — the identity-based policy explicitly allows the action.
  2. Allowed — resource-based policy silence defaults to permitting the identity policy.
  3. Denied — the SCP contains an explicit Deny, and an explicit deny in any applicable policy overrides all Allows.
  4. Denied — because the resource-based policy did not also allow the action.
- correctIndex: 2
- explanation: Explicit Deny always wins in AWS policy evaluation. Even though the identity-based policy allows s3:DeleteObject, the SCP's explicit Deny on s3:Delete* overrides it. SCPs filter the permissions available to member-account principals; an explicit Deny there is final.

**Q2 — boundaries never grant.**
- prompt: A developer attaches a permission boundary to an IAM user that allows ec2:* and s3:*. The user has no identity-based policy attached. The developer expects the user to be able to launch EC2 instances. What actually happens?
- options:
  1. The user can launch EC2 instances because the boundary allows ec2:*.
  2. The user can do nothing — a permission boundary sets a maximum but grants nothing; an identity-based or resource-based policy must provide the actual Allow.
  3. The user gets full administrator access by default.
  4. The boundary is ignored because no identity policy exists.
- correctIndex: 1
- explanation: A permission boundary only caps the maximum permissions; it never grants them. Effective permissions are the intersection of the boundary and the identity-based policy. With no identity-based policy, the intersection is empty and the user can do nothing.

**Q3 — cross-account.**
- prompt: A principal in account A needs to read an S3 bucket in account B. Account A's identity-based policy allows s3:GetObject. Account B's bucket policy does not mention account A. What is the result?
- options:
  1. Allowed — account A's identity policy is sufficient.
  2. Allowed — same-account union rules apply across accounts.
  3. Denied — cross-account access requires BOTH the identity-based policy in account A AND the resource-based policy in account B to allow it.
  4. Denied — S3 never permits cross-account reads.
- correctIndex: 2
- explanation: For cross-account access, the same-account union shortcut does not apply. Both the caller's identity-based policy and the resource's resource-based policy must independently allow the action. Account B's bucket policy is silent, so the request is denied.

**Q4 — Identity Center vs IAM users.**
- prompt: An organization with 40 AWS accounts wants employees to log in once with their Entra ID credentials and get appropriately scoped, short-lived access to specific accounts. Which AWS service is the recommended fit?
- options:
  1. Create matching IAM users with access keys in each of the 40 accounts.
  2. AWS IAM Identity Center, federating Entra ID via SAML and SCIM and assigning permission sets per account.
  3. Attach a permission boundary in each account.
  4. Use an SCP to grant the employees access.
- correctIndex: 1
- explanation: IAM Identity Center is built for multi-account workforce access: federate an external IdP (Entra ID) via SAML and SCIM, then assign permission sets to users/groups for specific accounts, issuing short-lived credentials. IAM users with access keys are per-account and long-lived (discouraged); SCPs and boundaries only restrict, never grant.

### `02-azure-rbac` (2 questions)

**Q5 — scope inheritance.**
- prompt: A user is assigned the Reader role at the subscription scope and the Contributor role at a specific resource group within that subscription. What are the user's effective permissions on a virtual machine inside that resource group?
- options:
  1. Reader only — the higher (subscription) assignment takes precedence.
  2. Contributor — effective permissions are the union of all assignments at and above the resource scope, and Contributor is the broader grant.
  3. No access — conflicting assignments cancel out.
  4. Owner — combining two roles escalates to Owner.
- correctIndex: 1
- explanation: Azure RBAC is additive: the effective permission set is the union of all role assignments at and above the resource's scope. Reader (subscription) plus Contributor (resource group) yields Contributor on resources in that group. Assignments do not cancel, and unioning two roles never creates a third role like Owner.

**Q6 — RBAC vs Policy.**
- prompt: A governance requirement states that no one may create storage accounts that allow public blob access, regardless of their role. Which Azure mechanism enforces this?
- options:
  1. Assign everyone the Reader role on storage accounts.
  2. An Azure Policy with a Deny effect on the public-access configuration; Azure RBAC controls who can act, while Azure Policy controls which configurations are allowed.
  3. A custom RBAC role with NotActions for storage.
  4. Azure Lighthouse delegation.
- correctIndex: 1
- explanation: Azure RBAC governs who can perform actions; it cannot express what a resource's configuration must look like. Azure Policy does exactly that — a Deny-effect policy blocks creating or updating a storage account with public blob access even for an Owner. The two systems are complementary.

### `03-gcp-iam` (2 questions)

**Q7 — service account keys.**
- prompt: A team needs a workload running on an on-prem server to call Google Cloud APIs. A junior engineer proposes downloading a service account JSON key and storing it on the server. What is the better practice and why?
- options:
  1. Downloading the JSON key is fine; it is the standard approach.
  2. Use Workload Identity Federation so the external workload exchanges its existing identity token for short-lived GCP credentials, avoiding a long-lived key that can be exfiltrated.
  3. Grant the server the basic Owner role to simplify access.
  4. Embed the key in the application source code for portability.
- correctIndex: 1
- explanation: Downloaded service account keys are long-lived static secrets and a top exfiltration risk. Workload Identity Federation lets the external workload exchange its own OIDC/SAML token for short-lived GCP credentials with no stored key. Granting Owner violates least privilege; embedding keys in code is worse.

**Q8 — hierarchy + deny.**
- prompt: In GCP, a principal is granted roles/storage.admin at the organization node. A separate IAM deny policy denies storage.buckets.delete for that principal at a specific project. Can the principal delete a bucket in that project?
- options:
  1. Yes — the org-level admin role is inherited and wins.
  2. Yes — deny policies do not apply to inherited roles.
  3. No — IAM deny policies are evaluated before allow policies, so an applicable deny blocks the action despite the inherited admin role.
  4. No — org-level roles are never inherited by projects.
- correctIndex: 2
- explanation: GCP allow policies are additive and inherited down the hierarchy, so the org-level storage.admin would normally permit deletion. But IAM deny policies are evaluated first; an applicable deny rule blocks the action regardless of any allow, so the deletion is denied in that project.

### `04-multi-cloud-strategy` (2 questions)

**Q9 — federation pattern.**
- prompt: An enterprise runs workloads in AWS, Azure, and GCP and wants employees to authenticate once and reach all three. What is the recommended identity strategy?
- options:
  1. Maintain a separate set of local users and passwords in each cloud.
  2. Use one workforce IdP (such as Entra ID) as the source of truth and federate it into each cloud via SAML/OIDC and SCIM (AWS IAM Identity Center permission sets, native Azure, GCP SSO or Workforce Identity Federation).
  3. Share a single root/admin credential across all three clouds.
  4. Require employees to memorize three separate credential sets.
- correctIndex: 1
- explanation: The dominant multi-cloud pattern is a single workforce IdP federated into every cloud's access layer, giving one identity source, consistent SSO, and centralized lifecycle via SCIM. Separate local accounts or shared root credentials defeat governance and least privilege.

**Q10 — landing zones.**
- prompt: Which set correctly pairs each cloud with its landing-zone framework?
- options:
  1. AWS Lighthouse, Azure Control Tower, GCP Foundations.
  2. AWS Control Tower, Azure Cloud Adoption Framework enterprise-scale landing zones, GCP enterprise foundations blueprint.
  3. AWS Organizations only, Azure Policy only, GCP Projects only.
  4. They all use the same AWS Control Tower service.
- correctIndex: 1
- explanation: AWS uses Control Tower (Landing Zone), Azure uses the Cloud Adoption Framework enterprise-scale landing zones, and GCP uses the enterprise foundations blueprint. Each establishes a governed multi-account/project baseline with policy guardrails and centralized identity and logging before workloads land.

### `05-ciem` (2 questions)

**Q11 — what CIEM is for.**
- prompt: A security team finds that thousands of cloud machine identities have far more permissions than they ever use across AWS and Azure. Which tool category is purpose-built to discover and right-size these entitlements?
- options:
  1. CSPM (Cloud Security Posture Management).
  2. CIEM (Cloud Infrastructure Entitlement Management) — for example, Microsoft Entra Permissions Management.
  3. PAM (Privileged Access Management).
  4. SIEM (Security Information and Event Management).
- correctIndex: 1
- explanation: CIEM is built to discover, visualize, and right-size cloud entitlements, especially for the machine identities that dominate cloud and accumulate excess permissions. CSPM finds resource misconfigurations, PAM vaults privileged credentials, and SIEM aggregates logs — none of which right-size entitlements.

**Q12 — CIEM vs PAM/IGA.**
- prompt: How is CIEM best distinguished from PAM and IGA?
- options:
  1. CIEM, PAM, and IGA are interchangeable terms for the same product.
  2. CIEM right-sizes standing cloud entitlements (especially machine identities); PAM vaults and brokers privileged credentials and sessions; IGA manages human identity lifecycle and access certification.
  3. CIEM only manages human passwords.
  4. PAM is the cloud version of CIEM.
- correctIndex: 1
- explanation: The three solve different problems: CIEM focuses on how much access cloud identities have and trimming it to least privilege; PAM controls privileged credential and session use; IGA manages joiner-mover-leaver lifecycle and periodic access certification. They are complementary layers, not synonyms.

---

## Wiring tasks (exact edits)

### 1. `content/modules.json` — fill the `07-cloud-iam` sections array
Change the `07-cloud-iam` object's `sections: []` to:
```json
"sections": ["01-aws-iam", "02-azure-rbac", "03-gcp-iam", "04-multi-cloud-strategy", "05-ciem"]
```
Optionally update the `summary` to drop the "(Phase 3 — Coming)" suffix once authored, e.g. `"Identity across AWS, Azure, and GCP."`

### 2. `lib/sections.ts` — add titles + the one SC-300 slug
Add to `SECTION_TITLES`:
```ts
'07-cloud-iam/01-aws-iam': 'AWS IAM: Policy Evaluation & Identity Center',
'07-cloud-iam/02-azure-rbac': 'Azure RBAC: The Resource Authorization Layer',
'07-cloud-iam/03-gcp-iam': 'Google Cloud IAM',
'07-cloud-iam/04-multi-cloud-strategy': 'Multi-Cloud Identity Strategy',
'07-cloud-iam/05-ciem': 'CIEM: Cloud Infrastructure Entitlement Management',
```
Add to `SC300_SECTIONS` (only the Azure section, per alignment notes):
```ts
'07-cloud-iam/02-azure-rbac',
```

### 3. `lib/content-loader.ts` — register all 5 sections
Add the 5 keys to **`AUTHORED_SECTIONS`** and to **`ALL_KNOWN_SECTIONS`**:
```
'07-cloud-iam/01-aws-iam',
'07-cloud-iam/02-azure-rbac',
'07-cloud-iam/03-gcp-iam',
'07-cloud-iam/04-multi-cloud-strategy',
'07-cloud-iam/05-ciem',
```
Add 5 `case` arms in `loadAuthoredComponent` (one per slug), e.g.:
```ts
case '07-cloud-iam/01-aws-iam':
  return (await import('@/content/modules/07-cloud-iam/01-aws-iam.mdx')).default
// ...repeat for 02-azure-rbac, 03-gcp-iam, 04-multi-cloud-strategy, 05-ciem
```

### 4. `mdx-components.tsx` — register the new diagram
```ts
import { AWSIAMEvalDiagram } from '@/components/diagrams/AWSIAMEvalDiagram'
// ...add `AWSIAMEvalDiagram` to the returned components object
```

### 5. Update the drift/count tests (they hard-code the old totals)
- `lib/sections.test.ts`: the comment and assertion `expect(ordered).toHaveLength(17)` → `22`. The `EXPECTED` array derives from `modules.json` automatically, so once `modules.json` is updated the only manual change is the length number (and the "17 authored sections" comment).
- `lib/content-index.test.ts`: check for any hard-coded counts/section assumptions and update (`[VERIFY]` whether it asserts a fixed total — read it before editing).
- Run `pnpm test` to confirm the sync guard passes; run `pnpm build` to confirm all 5 MDX files import.

---

## Diagram: `<AWSIAMEvalDiagram />`

**Why:** Section 01's policy-evaluation order is the module's hardest, most exam-critical concept. A static prose list is not enough; an animated decision flow makes the "explicit deny wins, then each guardrail must allow" logic concrete.

**What it animates (spec):** A decision-flow walkthrough of an authorization request, built on the generic `components/diagrams/FlowDiagram.tsx` primitive (same as the 5 Phase-1 diagrams), composing `FlowNode[]` + `FlowStep[]`. Suggested nodes/steps modeling the AWS IAM User Guide "Policy evaluation logic" flow chart:
- **Nodes:** `request` (REQUEST), `deny-check` (EXPLICIT DENY?), `scp` (ORG SCP), `resource` (RESOURCE POLICY), `boundary` (PERMISSION BOUNDARY), `session` (SESSION POLICY), `identity` (IDENTITY POLICY), `allow` (ALLOW, intent default/cyan), `denied` (DENY, intent `'threat'`/red).
- **Steps (each with a `detail` for the click-to-inspect HoloPanel):**
  1. request → deny-check: "Start at implicit deny. Collect all applicable policies."
  2. deny-check → denied (intent `'threat'`): "Any explicit Deny in any policy? If yes -> DENY. Explicit deny always wins."
  3. deny-check → scp: "No explicit deny -> each applicable guardrail must allow."
  4. scp → resource: "If Organizations SCPs apply, the action must be allowed by an SCP (SCPs filter, never grant)."
  5. resource → boundary: "Resource-based policy: same-account an Allow here OR in the identity policy suffices (union); cross-account both sides must allow."
  6. boundary → session: "Permission boundary, if attached, must allow (boundary caps; never grants)."
  7. session → identity: "Session policy, if present, must allow."
  8. identity → allow: "Identity-based policy must allow (unless a resource policy already allowed in-account). All gates passed -> ALLOW."
  9. identity → denied (intent `'threat'`, optional dashed): "If nothing explicitly allows -> implicit deny -> DENY."
- Use the `intent: 'threat'` tint on the deny edges and `'warn'` on the SCP/boundary "filter only" edges to visually reinforce that those only restrict.

**Build approach (TDD):** Mirror the Phase-1 diagram pattern exactly — a `'use client'` component that returns `<FlowDiagram title="AWS IAM // POLICY EVALUATION" width={...} height={...} nodes={NODES} steps={STEPS} caption="..." />`, co-located `AWSIAMEvalDiagram.test.tsx` modeled on `KerberosFlowDiagram.test.tsx` (assert the key step labels render, assert the actor/decision nodes render, assert clicking a step with a `detail` reveals its HoloPanel text). Register in `mdx-components.tsx` (wiring task 4) so the MDX can use `<AWSIAMEvalDiagram />` with no import. **The full test-first build plan for this component lives in the diagrams plan doc** (per the roadmap §4, the 3 net-new diagrams are tracked as component engineering alongside their module's authoring). This authoring plan only specifies the spec above; do not inline the component build steps here.

---

## Commit plan

Branch: `module-07-cloud-iam`

Recommended order (matches roadmap Strategy guidance; diagram lands before/with section 01 so it can render):
1. `feat(diagrams): add AWSIAMEvalDiagram (FlowDiagram composition) + tests + register` — the diagram component, its test, and `mdx-components.tsx` registration.
2. `feat(content): author 07-cloud-iam/01-aws-iam + wire section` — MDX file + `modules.json` (add the full sections array now), `lib/sections.ts` titles for all 5 (or add incrementally), `content-loader.ts` registration for 01, update `lib/sections.test.ts` count. (If wiring all 5 slugs into `modules.json` at once, the other 4 must be authored before the next `pnpm build`/test passes — alternatively add slugs to `modules.json` per-section to keep each commit green. Prefer per-section slug addition so every commit builds.)
3. `feat(content): author 07-cloud-iam/02-azure-rbac + wire` — MDX + slug + title + SC300_SECTIONS entry + loader case.
4. `feat(content): author 07-cloud-iam/03-gcp-iam + wire`.
5. `feat(content): author 07-cloud-iam/04-multi-cloud-strategy + wire`.
6. `feat(content): author 07-cloud-iam/05-ciem + wire` — also flip the `modules.json` summary to drop "(Phase 3 — Coming)".
7. `test: update section/index counts for module 07` — if not folded into per-section commits, a final commit reconciling `lib/sections.test.ts` / `lib/content-index.test.ts` totals; run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green before opening the PR.

Each content commit: verify the section renders at `/modules/07-cloud-iam/<slug>`, flashcards appear in `/flashcards/07-cloud-iam`, and the quiz prompts surface in search. Keep every commit green (typecheck/lint/test/build).

---

## `[VERIFY]` register (facts the author must confirm before publishing)
- AWS **Resource Control Policies (RCPs)** availability and exact behavior (2024 feature) — confirm against current AWS Organizations docs.
- AWS **role chaining** max session duration (1 hour cap on chained `AssumeRole`) — confirm in STS docs.
- Azure **deny assignment** current creation path (Blueprints deprecation / managed apps) — confirm.
- Azure **custom role / role assignment limits** (5,000 figures) — confirm current numbers in MS Learn.
- GCP **Workload Identity for GKE** current product naming ("Workload Identity Federation for GKE") — confirm.
- Gartner **CIEM** definition exact wording / coinage year (~2020) — confirm or soften to "popularized around 2020."
- Microsoft Entra Permissions Management **Permissions Creep Index** exact definition wording — confirm.
- **Machine-vs-human identity ratio** in cloud (the "10:1+" claim in the CIEM ProTip) — cite a specific report (e.g. a recent CIEM/identity-security report) or soften the claim.
- Wiz precise CIEM feature naming — confirm against current Wiz docs.
