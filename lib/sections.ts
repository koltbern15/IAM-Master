import { getAllModules } from './content'
import type { ModuleId } from './types'

/**
 * Display metadata for an authored section.
 *
 * `content/modules.json` remains the single source of truth for which sections
 * exist and their order (a flat `string[]` of slugs per module). This module is
 * the companion source of truth for human-facing display data — titles, SC-300
 * alignment — keyed by `${moduleId}/${slug}`. Keeping it separate avoids
 * reshaping `modules.json` (and rippling through mastery/telemetry/progress and
 * their tests) while still giving every surface a real title instead of a slug.
 *
 * A unit test asserts every slug in `modules.json` has an entry here, so the two
 * sources can never silently drift.
 */
export interface SectionRef {
  moduleId: ModuleId
  slug: string
  /** Human-readable title (matches the section's H1). */
  title: string
  /** True when the section maps to SC-300 exam objectives. */
  sc300: boolean
}

/** Canonical titles, harvested from each section's MDX H1. */
const SECTION_TITLES: Record<string, string> = {
  '01-foundations/01-identity-crisis': 'The Identity Crisis',
  '01-foundations/02-lexicon': 'The IAM Lexicon',
  '01-foundations/03-ecosystem-map': 'The IAM Ecosystem',
  '02-protocols/01-kerberos': 'Kerberos: The Ticket That Built Enterprise SSO',
  '02-protocols/02-saml': 'SAML 2.0: The XML Protocol That Refused to Die',
  '02-protocols/03-oauth-oidc': 'OAuth 2.0 + OpenID Connect',
  '02-protocols/04-ldap': 'LDAP: The Directory Protocol Behind Everything',
  '02-protocols/05-fido2': 'FIDO2 / WebAuthn: Passwordless That Works',
  '02-protocols/06-scim': 'SCIM: The Provisioning Protocol',
  '03-microsoft-identity/01-active-directory': 'Active Directory Domain Services',
  '03-microsoft-identity/02-entra-id': 'Entra ID',
  '03-microsoft-identity/03-hybrid-identity': 'Hybrid Identity',
  '06-powershell/01-fundamentals': 'PowerShell Fundamentals for IAM',
  '06-powershell/02-cookbook': 'The PowerShell IAM Cookbook',
  '06-powershell/03-tips-tricks': 'PowerShell Tips, Tricks & Anti-Patterns',
  '11-cert-roadmap/01-sc300-roadmap': 'The SC-300 Path',
  '11-cert-roadmap/02-study-strategy': 'Study Strategy',
  '04-pam/01-pam-fundamentals': 'Privileged Access Management: The Keys to the Kingdom',
  '04-pam/02-cyberark': 'CyberArk: The PAM Market Leader',
  '04-pam/03-beyondtrust-delinea': 'BeyondTrust & Delinea: The Challengers',
  '04-pam/04-hashicorp-vault': 'HashiCorp Vault: Secrets as Code',
  '04-pam/05-cloud-native-pam': 'Cloud-Native PAM: PIM, Session Manager & OS Login',
  '04-pam/06-pam-program-design': 'Designing a PAM Program',
  '05-iga/01-iga-fundamentals': 'IGA Fundamentals: The Access Lifecycle',
  '05-iga/02-sailpoint': 'SailPoint: The IGA Market Leader',
  '05-iga/03-okta': 'Okta: Identity Cloud Governance',
  '05-iga/04-saviynt-oneidentity-omada': 'Challenger Platforms: Saviynt, One Identity, Omada',
  '05-iga/05-entra-id-governance': 'Microsoft Entra ID Governance',
  '05-iga/06-sod-and-rbac-design': 'SoD Modeling & RBAC Design',
  '08-security-detection/01-identity-attack-techniques': 'Identity Attack Techniques',
  '08-security-detection/02-defender-for-identity': 'Microsoft Defender for Identity',
  '08-security-detection/03-crowdstrike-semperis': 'CrowdStrike Falcon Identity & Semperis',
  '08-security-detection/04-kql-identity-hunting': 'KQL Identity Hunting',
  '08-security-detection/05-identity-incident-response': 'Identity Incident Response',
  '12-labs/01-build-an-ad-lab': 'Build an Active Directory Lab From Scratch',
  '12-labs/02-entra-connect-setup': 'Sync On-Prem AD to Entra ID with Entra Connect / Cloud Sync',
  '12-labs/03-conditional-access-lab': 'Build, Test, and Deploy Conditional Access Policies',
  '12-labs/04-saml-scim-integration': 'Integrate a SaaS App: SAML SSO + SCIM Provisioning',
  '12-labs/05-laps-and-jml-automation': 'LAPS + Joiner/Mover/Leaver Automation',
  '12-labs/06-pim-and-access-reviews': 'Privileged Identity Management + Access Reviews',
  '12-labs/07-cyberark-onboarding': 'Onboard an Account into CyberArk PAM',
  '12-labs/08-okta-sso-lifecycle': 'Okta SSO + Universal Directory Lifecycle',
  '12-labs/09-sailpoint-cert-campaign': 'Run a SailPoint Certification Campaign',
  '12-labs/10-kerberoasting-hunt': 'Hunt a Kerberoasting Attack',
  '12-labs/11-stale-account-cleanup': 'Automated Stale Account Cleanup',
  '12-labs/12-fido2-deployment': 'Enterprise FIDO2 / Passkey Deployment',
  '12-labs/13-powerbi-identity-dashboard': 'Build a Power BI Identity Dashboard',
}

/** Sections whose material is SC-300 exam-aligned (surfaces an SC-300 badge). */
const SC300_SECTIONS = new Set<string>([
  '03-microsoft-identity/01-active-directory',
  '03-microsoft-identity/02-entra-id',
  '03-microsoft-identity/03-hybrid-identity',
  '11-cert-roadmap/01-sc300-roadmap',
  '11-cert-roadmap/02-study-strategy',
  '04-pam/05-cloud-native-pam',
  '05-iga/05-entra-id-governance',
  '08-security-detection/02-defender-for-identity',
  '08-security-detection/05-identity-incident-response',
  '12-labs/02-entra-connect-setup',
  '12-labs/03-conditional-access-lab',
  '12-labs/04-saml-scim-integration',
  '12-labs/06-pim-and-access-reviews',
])

/**
 * Prettifies a slug into a title as a last-resort fallback.
 * `01-identity-crisis` -> `Identity Crisis`.
 */
export function slugToTitle(slug: string): string {
  return slug
    .replace(/^\d+[-_]/, '')
    .split(/[-_]/)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Returns the human title for a section, falling back to a prettified slug. */
export function getSectionTitle(moduleId: string, slug: string): string {
  return SECTION_TITLES[`${moduleId}/${slug}`] ?? slugToTitle(slug)
}

/** Returns full display metadata for a section, or undefined if unknown. */
export function getSectionMeta(moduleId: ModuleId, slug: string): SectionRef | undefined {
  const mod = getAllModules().find((m) => m.id === moduleId)
  if (!mod || !mod.sections.includes(slug)) return undefined
  const key = `${moduleId}/${slug}`
  return {
    moduleId,
    slug,
    title: SECTION_TITLES[key] ?? slugToTitle(slug),
    sc300: SC300_SECTIONS.has(key),
  }
}

/**
 * All authored sections flattened in curriculum order (module order, then
 * section order within the module). Used for prev/next navigation and the
 * search/flashcard indexes.
 */
export function getOrderedSections(): SectionRef[] {
  const refs: SectionRef[] = []
  for (const m of getAllModules()) {
    for (const slug of m.sections) {
      const key = `${m.id}/${slug}`
      refs.push({
        moduleId: m.id,
        slug,
        title: SECTION_TITLES[key] ?? slugToTitle(slug),
        sc300: SC300_SECTIONS.has(key),
      })
    }
  }
  return refs
}

/** Previous/next sections around a given one in curriculum order. */
export function getPrevNext(
  moduleId: string,
  slug: string
): { prev: SectionRef | null; next: SectionRef | null } {
  const ordered = getOrderedSections()
  const idx = ordered.findIndex((s) => s.moduleId === moduleId && s.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  }
}
