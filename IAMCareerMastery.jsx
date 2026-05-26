import React, { useEffect, useMemo, useState } from "react";

// =============================================================================
// IAM Career Mastery Platform
// Single-file React artifact. Assumes Tailwind CSS is configured in the host.
// =============================================================================

// ---- Glossary ---------------------------------------------------------------
const GLOSSARY = [
  { term: "Authentication (AuthN)", def: "Proving you are who you claim to be.", why: "The first gate in every access decision. Weak AuthN means everything downstream is untrustworthy.", example: "Entering a username + password + TOTP code at sign-in." },
  { term: "Authorization (AuthZ)", def: "Determining what an authenticated identity is permitted to do.", why: "AuthN without AuthZ is a doorman with no rulebook.", example: "An RBAC check that lets HR read salary data but not engineering source code." },
  { term: "Accounting (AAA)", def: "Logging and auditing identity actions.", why: "You cannot prove compliance or run incident response without it.", example: "Entra Sign-In logs feeding Sentinel for 4769 anomaly hunts." },
  { term: "Identity Provider (IdP)", def: "The system that authenticates users and issues identity assertions.", why: "Consolidating to one IdP collapses your attack surface and licensing sprawl.", example: "Entra ID, Okta, Ping, ADFS." },
  { term: "Service Provider (SP)", def: "The application that trusts an IdP's assertion to grant access.", why: "SPs offload identity to focus on business logic.", example: "Salesforce, ServiceNow, Workday consuming SAML from Okta." },
  { term: "Directory Service", def: "A hierarchical store of identity objects queryable over LDAP or Graph.", why: "Your directory is your source of truth — and your largest single risk concentration.", example: "Active Directory, Entra ID, OpenLDAP." },
  { term: "Federation", def: "A trust relationship that lets identities from one domain access resources in another.", why: "Federation eliminates duplicate accounts and the offboarding gaps they create.", example: "SAML federation from your Entra tenant to a partner's AWS account." },
  { term: "Single Sign-On (SSO)", def: "One authentication event grants access to many applications.", why: "Reduces password reuse, phishing surface, and help-desk volume.", example: "Signing into Outlook unlocks Teams, SharePoint, and Salesforce without re-auth." },
  { term: "Multi-Factor Authentication (MFA)", def: "Combining two or more independent authentication factors.", why: "Stops 99%+ of credential-stuffing and password-spray attacks.", example: "Password + FIDO2 key, or password + Authenticator number-matching." },
  { term: "Passwordless", def: "Authentication without a shared secret — phishing-resistant by design.", why: "Eliminates the entire class of credential theft attacks.", example: "Windows Hello for Business, FIDO2 security keys, passkeys." },
  { term: "RBAC", def: "Role-Based Access Control — access granted via role assignments.", why: "Scales better than per-user ACLs; ties access to job function.", example: "Assigning the 'Loan Officer' role to a user grants 17 underlying entitlements." },
  { term: "ABAC", def: "Attribute-Based Access Control — decisions based on subject, resource, and environment attributes.", why: "Expresses policies RBAC cannot, like 'managers can approve only in their cost center during business hours.'", example: "AWS IAM condition: aws:RequestTag/Owner = ${aws:username}." },
  { term: "PBAC", def: "Policy-Based Access Control — centralized policy engines evaluate fine-grained rules.", why: "Decouples policy from code; supports Zero Trust at scale.", example: "OPA/Rego policies evaluated by an API gateway." },
  { term: "ReBAC", def: "Relationship-Based Access Control — access derived from graph relationships.", why: "Native fit for collaboration apps where 'editor of folder X inherits view on its children' is the norm.", example: "Google Zanzibar, SpiceDB." },
  { term: "Least Privilege", def: "Granting only the minimum access required to perform a job.", why: "Limits blast radius when (not if) credentials are compromised.", example: "A developer with read-only on prod and write on dev, never both." },
  { term: "Separation of Duties (SoD)", def: "Splitting sensitive operations across multiple identities.", why: "Prevents unilateral fraud and is required by SOX, PCI, FFIEC.", example: "The person who creates a vendor record cannot also approve their payment." },
  { term: "Joiner-Mover-Leaver (JML)", def: "The identity lifecycle: provision on hire, adjust on transfer, deprovision on exit.", why: "Mover and Leaver gaps are the #1 source of orphaned accounts and SoD violations.", example: "HRIS event triggers automated access changes through IGA." },
  { term: "Orphaned Account", def: "An account whose owner no longer exists or is no longer entitled to it.", why: "Auditor catnip. Every orphaned admin account is a finding waiting to happen.", example: "A contractor's AD account still active 14 months after their contract ended." },
  { term: "Privileged Access Management (PAM)", def: "Controls and tooling that govern elevated, sensitive credentials.", why: "Privileged accounts are the express lane to domain dominance — they need their own program.", example: "CyberArk vaulting Domain Admin credentials with session recording." },
  { term: "Identity Governance & Administration (IGA)", def: "The discipline of managing identity lifecycle, entitlements, certifications, and policy.", why: "Without IGA you have access without accountability.", example: "SailPoint running quarterly access certifications on financial systems." },
  { term: "Entitlement", def: "A specific permission grantable to an identity — a group, role, or fine-grained right.", why: "Entitlements are the atoms IGA reasons about.", example: "Membership in 'GBL-Finance-GL-RW' AD group." },
  { term: "Role Mining", def: "Analyzing existing entitlement assignments to discover candidate roles.", why: "Bottom-up modeling reflects what people actually use, not org-chart fantasies.", example: "SailPoint clustering 1,400 users into 38 candidate business roles." },
  { term: "Role Explosion", def: "Pathological proliferation of roles that defeats the purpose of RBAC.", why: "If every user needs a unique role you have ABAC pretending to be RBAC.", example: "12,000 'roles' in an IGA tool for a 4,000-person company." },
  { term: "Access Certification", def: "A formal review where managers/owners confirm or revoke standing access.", why: "Mandated by SOX and FFIEC; only effective if reviewers actually look.", example: "Quarterly micro-certs of admin group membership instead of an annual bulk review." },
  { term: "SCIM", def: "System for Cross-domain Identity Management — REST/JSON standard for identity provisioning.", why: "Replaces brittle file drops and custom scripts with a real API contract.", example: "Entra pushing user CRUD to a SaaS app over /Users and /Groups endpoints." },
  { term: "SAML 2.0", def: "XML-based federation protocol — assertions signed by an IdP, consumed by an SP.", why: "Still dominant in enterprise SaaS even as OIDC eats new development.", example: "ServiceNow accepting a SAML POST binding from Okta." },
  { term: "OAuth 2.0", def: "Delegated authorization framework — issues access tokens, not identities.", why: "OAuth is about API access, not who you are. Conflating it with AuthN is a security smell.", example: "A web app gets an access token to call Microsoft Graph on the user's behalf." },
  { term: "OpenID Connect (OIDC)", def: "Identity layer on top of OAuth 2.0; adds the ID Token (a JWT).", why: "OIDC gives you authentication semantics OAuth alone lacks.", example: "'Sign in with Google' returning an id_token with sub, email, aud, exp." },
  { term: "FIDO2 / WebAuthn", def: "Public-key, origin-bound authentication standard. Phishing-resistant by construction.", why: "The credential cannot be phished because it is cryptographically bound to the relying party origin.", example: "A YubiKey 5C NFC registered with Entra as a FIDO2 method." },
  { term: "Kerberos", def: "Ticket-based mutual authentication protocol used by Active Directory.", why: "Every AD logon is a Kerberos ceremony. If you don't understand it, you can't defend it.", example: "TGT issued at logon, used to request service tickets for file shares." },
  { term: "NTLM", def: "Legacy Microsoft challenge-response authentication. Should be retired wherever possible.", why: "NTLM relay and Pass-the-Hash are still working in 2026 because NTLM still exists.", example: "Event 4624 with Authentication Package = NTLM on a server that should be Kerberos-only." },
  { term: "JWT", def: "JSON Web Token — compact, signed, base64url-encoded claims.", why: "JWT structure (header.payload.signature) is the lingua franca of modern auth. Learn to decode them by sight.", example: "An OIDC id_token with 'aud', 'iss', 'sub', 'exp', 'nonce' claims." },
  { term: "Claim", def: "A statement about a subject inside a token or assertion.", why: "Claims drive authorization decisions downstream. Garbage claims, garbage decisions.", example: "groups: ['Finance-Admins', 'AllEmployees'] in an ID token." },
  { term: "Conditional Access", def: "Policy engine that evaluates signals (user, device, location, risk) and applies controls.", why: "It is how Zero Trust gets enforced in Entra. Skipping it is malpractice.", example: "Require compliant device + phishing-resistant MFA for users in 'PIM Admins' role." },
  { term: "Risk-Based Authentication", def: "Step-up or block based on a risk score derived from behavior and signals.", why: "Lets you be strict where it matters and frictionless where it doesn't.", example: "Entra Identity Protection flagging 'atypical travel' and forcing a password reset." },
  { term: "Identity Fabric", def: "A layered architecture (Gartner) integrating IdPs, governance, PAM, and analytics.", why: "Reframes IAM from point tools to a connected control plane.", example: "Entra + SailPoint + CyberArk + Defender for Identity wired into a single fabric." },
  { term: "Decentralized Identity (DID)", def: "Identity model where users hold cryptographic credentials in a wallet.", why: "Pushes identity off central honeypots; emerging in government and high-assurance ecosystems.", example: "W3C DID + Verifiable Credentials issued by a state DMV to a mobile wallet." },
  { term: "Verifiable Credential (VC)", def: "Tamper-evident, cryptographically signed claim issued to a subject.", why: "The 'paper credential' of the decentralized identity world.", example: "An employer-issued VC asserting 'employed since 2021'." },
  { term: "Token (Access)", def: "Short-lived bearer credential used to call APIs.", why: "Treat access tokens like cash. Anyone holding it can spend it.", example: "An OAuth access_token with lifetime 3600s and scope 'Mail.Read'." },
  { term: "Token (Refresh)", def: "Long-lived token used to obtain new access tokens without user interaction.", why: "Refresh token theft is silent privilege persistence. Bind them to device when possible.", example: "An OIDC refresh_token with a 90-day sliding window." },
];

// ---- Modules ---------------------------------------------------------------
const MODULES = []; // populated in subsequent commits

// ---- Component (WIP scaffold) ----------------------------------------------
// This is an early scaffold. The full 12-module platform, quizzes, labs,
// PowerShell cookbook, and certification roadmap will be added in follow-up
// commits on this branch.
export default function IAMCareerMastery() {
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = GLOSSARY[index];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-blue-400">
          IAM Career Mastery <span className="text-slate-500 text-sm">(work in progress)</span>
        </h1>
        <button
          onClick={() => { setFlashcardMode(!flashcardMode); setRevealed(false); }}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"
        >
          {flashcardMode ? "Glossary list" : "Flashcard mode"}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-slate-400 mb-6 text-sm">
          Module 1 glossary seeded ({GLOSSARY.length} terms). Modules 1&ndash;12,
          quizzes, the PowerShell cookbook, hands-on labs, and the certification
          roadmap will land in follow-up commits.
        </p>

        {flashcardMode ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Term {index + 1} of {GLOSSARY.length}
            </div>
            <h2 className="text-2xl font-semibold text-emerald-400 mb-4">{card.term}</h2>
            {revealed ? (
              <div className="space-y-3 text-slate-200">
                <p><span className="text-slate-500 text-sm">Definition: </span>{card.def}</p>
                <p><span className="text-slate-500 text-sm">Why it matters: </span>{card.why}</p>
                <p><span className="text-slate-500 text-sm">Example: </span>{card.example}</p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
              >
                Reveal
              </button>
            )}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => { setIndex((index - 1 + GLOSSARY.length) % GLOSSARY.length); setRevealed(false); }}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => { setIndex((index + 1) % GLOSSARY.length); setRevealed(false); }}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {GLOSSARY.map((g) => (
              <li key={g.term} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-emerald-400 font-semibold">{g.term}</div>
                <div className="text-slate-200 mt-1">{g.def}</div>
                <div className="text-slate-400 text-sm mt-2"><span className="text-slate-500">Why: </span>{g.why}</div>
                <div className="text-slate-400 text-sm mt-1"><span className="text-slate-500">Example: </span>{g.example}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// Suppress unused-import warning while MODULES list is being populated.
void useEffect; void useMemo; void MODULES;

