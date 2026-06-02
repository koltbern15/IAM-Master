import type { ComponentType } from 'react'
import { readFile } from 'fs/promises'
import path from 'path'

export interface SectionContent {
  Component: ComponentType
  /** Raw section text (MDX stripped of JSX tags) for tutor context grounding. */
  plainText: string
}

/**
 * Strips JSX/MDX tags and expression braces from raw MDX text, leaving only
 * prose paragraphs and headings for use as tutor context grounding.
 */
function stripMdx(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')          // drop JSX open/close tags
    .replace(/\{\/\*[^]*?\*\/\}/g, '') // drop MDX block comments
    .replace(/\{[^}]+\}/g, '')         // drop JSX expression braces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Reads the raw MDX source from disk using the Node.js fs module.
 * Runs server-side only (RSC pages), so fs access is safe.
 * Returns null if the file doesn't exist yet.
 */
async function getRawMdx(moduleId: string, sectionId: string): Promise<string | null> {
  const filePath = path.join(
    process.cwd(),
    'content',
    'modules',
    moduleId,
    `${sectionId}.mdx`
  )
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

// The set of section keys registered in the static import map below.
// Any key NOT in this set falls through to the "not authored yet" path.
const AUTHORED_SECTIONS = new Set([
  '01-foundations/01-identity-crisis',
  '01-foundations/02-lexicon',
  '01-foundations/03-ecosystem-map',
  '02-protocols/01-kerberos',
  '02-protocols/02-saml',
  '02-protocols/03-oauth-oidc',
  '02-protocols/04-ldap',
  '02-protocols/05-fido2',
  '02-protocols/06-scim',
  '03-microsoft-identity/01-active-directory',
  '03-microsoft-identity/02-entra-id',
  '03-microsoft-identity/03-hybrid-identity',
  '06-powershell/01-fundamentals',
  '06-powershell/02-cookbook',
  '06-powershell/03-tips-tricks',
  '11-cert-roadmap/01-sc300-roadmap',
  '11-cert-roadmap/02-study-strategy',
  '04-pam/01-pam-fundamentals',
  '04-pam/02-cyberark',
  '04-pam/03-beyondtrust-delinea',
  '04-pam/04-hashicorp-vault',
  '04-pam/05-cloud-native-pam',
  '04-pam/06-pam-program-design',
  '05-iga/01-iga-fundamentals',
  '05-iga/02-sailpoint',
  '05-iga/03-okta',
  '05-iga/04-saviynt-oneidentity-omada',
  '05-iga/05-entra-id-governance',
  '05-iga/06-sod-and-rbac-design',
  '08-security-detection/01-identity-attack-techniques',
  '08-security-detection/02-defender-for-identity',
  '08-security-detection/03-crowdstrike-semperis',
  '08-security-detection/04-kql-identity-hunting',
  '08-security-detection/05-identity-incident-response',
  '12-labs/01-build-an-ad-lab',
  '12-labs/02-entra-connect-setup',
  '12-labs/03-conditional-access-lab',
  '12-labs/04-saml-scim-integration',
  '12-labs/05-laps-and-jml-automation',
  '12-labs/06-pim-and-access-reviews',
  '12-labs/07-cyberark-onboarding',
  '12-labs/08-okta-sso-lifecycle',
  '12-labs/09-sailpoint-cert-campaign',
  '12-labs/10-kerberoasting-hunt',
  '12-labs/11-stale-account-cleanup',
  '12-labs/12-fido2-deployment',
  '12-labs/13-powerbi-identity-dashboard',
  '07-cloud-iam/01-aws-iam',
  '07-cloud-iam/02-azure-rbac',
  '07-cloud-iam/03-gcp-iam',
  '07-cloud-iam/04-multi-cloud-strategy',
  '07-cloud-iam/05-ciem',
  '09-compliance/01-control-frameworks',
  '09-compliance/02-financial-and-payment',
  '09-compliance/03-privacy-and-federal',
  '09-compliance/04-iam-controls-matrix',
  '09-compliance/05-audit-prep-playbook',
  '10-program-leadership/01-maturity-and-roadmap',
  '10-program-leadership/02-stakeholders-and-budget',
  '10-program-leadership/03-metrics-and-rfp',
  '10-program-leadership/04-career-architecture',
])

// Static map for sections that have been authored. Webpack resolves these
// imports at build time, so every entry here MUST have a real .mdx file on disk.
// When a new MDX file lands, add its key to AUTHORED_SECTIONS and add the
// corresponding import case below.
async function loadAuthoredComponent(
  moduleId: string,
  sectionId: string
): Promise<ComponentType | null> {
  const key = `${moduleId}/${sectionId}`
  switch (key) {
    case '01-foundations/01-identity-crisis':
      return (await import('@/content/modules/01-foundations/01-identity-crisis.mdx')).default
    case '01-foundations/02-lexicon':
      return (await import('@/content/modules/01-foundations/02-lexicon.mdx')).default
    case '01-foundations/03-ecosystem-map':
      return (await import('@/content/modules/01-foundations/03-ecosystem-map.mdx')).default
    case '02-protocols/01-kerberos':
      return (await import('@/content/modules/02-protocols/01-kerberos.mdx')).default
    case '02-protocols/02-saml':
      return (await import('@/content/modules/02-protocols/02-saml.mdx')).default
    case '02-protocols/03-oauth-oidc':
      return (await import('@/content/modules/02-protocols/03-oauth-oidc.mdx')).default
    case '02-protocols/04-ldap':
      return (await import('@/content/modules/02-protocols/04-ldap.mdx')).default
    case '02-protocols/05-fido2':
      return (await import('@/content/modules/02-protocols/05-fido2.mdx')).default
    case '02-protocols/06-scim':
      return (await import('@/content/modules/02-protocols/06-scim.mdx')).default
    case '03-microsoft-identity/01-active-directory':
      return (await import('@/content/modules/03-microsoft-identity/01-active-directory.mdx')).default
    case '03-microsoft-identity/02-entra-id':
      return (await import('@/content/modules/03-microsoft-identity/02-entra-id.mdx')).default
    case '03-microsoft-identity/03-hybrid-identity':
      return (await import('@/content/modules/03-microsoft-identity/03-hybrid-identity.mdx')).default
    case '06-powershell/01-fundamentals':
      return (await import('@/content/modules/06-powershell/01-fundamentals.mdx')).default
    case '06-powershell/02-cookbook':
      return (await import('@/content/modules/06-powershell/02-cookbook.mdx')).default
    case '06-powershell/03-tips-tricks':
      return (await import('@/content/modules/06-powershell/03-tips-tricks.mdx')).default
    case '11-cert-roadmap/01-sc300-roadmap':
      return (await import('@/content/modules/11-cert-roadmap/01-sc300-roadmap.mdx')).default
    case '11-cert-roadmap/02-study-strategy':
      return (await import('@/content/modules/11-cert-roadmap/02-study-strategy.mdx')).default
    case '04-pam/01-pam-fundamentals':
      return (await import('@/content/modules/04-pam/01-pam-fundamentals.mdx')).default
    case '04-pam/02-cyberark':
      return (await import('@/content/modules/04-pam/02-cyberark.mdx')).default
    case '04-pam/03-beyondtrust-delinea':
      return (await import('@/content/modules/04-pam/03-beyondtrust-delinea.mdx')).default
    case '04-pam/04-hashicorp-vault':
      return (await import('@/content/modules/04-pam/04-hashicorp-vault.mdx')).default
    case '04-pam/05-cloud-native-pam':
      return (await import('@/content/modules/04-pam/05-cloud-native-pam.mdx')).default
    case '04-pam/06-pam-program-design':
      return (await import('@/content/modules/04-pam/06-pam-program-design.mdx')).default
    case '05-iga/01-iga-fundamentals':
      return (await import('@/content/modules/05-iga/01-iga-fundamentals.mdx')).default
    case '05-iga/02-sailpoint':
      return (await import('@/content/modules/05-iga/02-sailpoint.mdx')).default
    case '05-iga/03-okta':
      return (await import('@/content/modules/05-iga/03-okta.mdx')).default
    case '05-iga/04-saviynt-oneidentity-omada':
      return (await import('@/content/modules/05-iga/04-saviynt-oneidentity-omada.mdx')).default
    case '05-iga/05-entra-id-governance':
      return (await import('@/content/modules/05-iga/05-entra-id-governance.mdx')).default
    case '05-iga/06-sod-and-rbac-design':
      return (await import('@/content/modules/05-iga/06-sod-and-rbac-design.mdx')).default
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
    case '12-labs/01-build-an-ad-lab':
      return (await import('@/content/modules/12-labs/01-build-an-ad-lab.mdx')).default
    case '12-labs/02-entra-connect-setup':
      return (await import('@/content/modules/12-labs/02-entra-connect-setup.mdx')).default
    case '12-labs/03-conditional-access-lab':
      return (await import('@/content/modules/12-labs/03-conditional-access-lab.mdx')).default
    case '12-labs/04-saml-scim-integration':
      return (await import('@/content/modules/12-labs/04-saml-scim-integration.mdx')).default
    case '12-labs/05-laps-and-jml-automation':
      return (await import('@/content/modules/12-labs/05-laps-and-jml-automation.mdx')).default
    case '12-labs/06-pim-and-access-reviews':
      return (await import('@/content/modules/12-labs/06-pim-and-access-reviews.mdx')).default
    case '12-labs/07-cyberark-onboarding':
      return (await import('@/content/modules/12-labs/07-cyberark-onboarding.mdx')).default
    case '12-labs/08-okta-sso-lifecycle':
      return (await import('@/content/modules/12-labs/08-okta-sso-lifecycle.mdx')).default
    case '12-labs/09-sailpoint-cert-campaign':
      return (await import('@/content/modules/12-labs/09-sailpoint-cert-campaign.mdx')).default
    case '12-labs/10-kerberoasting-hunt':
      return (await import('@/content/modules/12-labs/10-kerberoasting-hunt.mdx')).default
    case '12-labs/11-stale-account-cleanup':
      return (await import('@/content/modules/12-labs/11-stale-account-cleanup.mdx')).default
    case '12-labs/12-fido2-deployment':
      return (await import('@/content/modules/12-labs/12-fido2-deployment.mdx')).default
    case '12-labs/13-powerbi-identity-dashboard':
      return (await import('@/content/modules/12-labs/13-powerbi-identity-dashboard.mdx')).default
    case '07-cloud-iam/01-aws-iam':
      return (await import('@/content/modules/07-cloud-iam/01-aws-iam.mdx')).default
    case '07-cloud-iam/02-azure-rbac':
      return (await import('@/content/modules/07-cloud-iam/02-azure-rbac.mdx')).default
    case '07-cloud-iam/03-gcp-iam':
      return (await import('@/content/modules/07-cloud-iam/03-gcp-iam.mdx')).default
    case '07-cloud-iam/04-multi-cloud-strategy':
      return (await import('@/content/modules/07-cloud-iam/04-multi-cloud-strategy.mdx')).default
    case '07-cloud-iam/05-ciem':
      return (await import('@/content/modules/07-cloud-iam/05-ciem.mdx')).default
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
    case '10-program-leadership/01-maturity-and-roadmap':
      return (await import('@/content/modules/10-program-leadership/01-maturity-and-roadmap.mdx')).default
    case '10-program-leadership/02-stakeholders-and-budget':
      return (await import('@/content/modules/10-program-leadership/02-stakeholders-and-budget.mdx')).default
    case '10-program-leadership/03-metrics-and-rfp':
      return (await import('@/content/modules/10-program-leadership/03-metrics-and-rfp.mdx')).default
    case '10-program-leadership/04-career-architecture':
      return (await import('@/content/modules/10-program-leadership/04-career-architecture.mdx')).default
    default:
      return null
  }
}

/**
 * All known section keys across the curriculum.
 * Used to distinguish "not authored yet" (returns null from loader)
 * from "unknown route" (returns 404).
 */
const ALL_KNOWN_SECTIONS = new Set([
  '01-foundations/01-identity-crisis',
  '01-foundations/02-lexicon',
  '01-foundations/03-ecosystem-map',
  '02-protocols/01-kerberos',
  '02-protocols/02-saml',
  '02-protocols/03-oauth-oidc',
  '02-protocols/04-ldap',
  '02-protocols/05-fido2',
  '02-protocols/06-scim',
  '03-microsoft-identity/01-active-directory',
  '03-microsoft-identity/02-entra-id',
  '03-microsoft-identity/03-hybrid-identity',
  '06-powershell/01-fundamentals',
  '06-powershell/02-cookbook',
  '06-powershell/03-tips-tricks',
  '11-cert-roadmap/01-sc300-roadmap',
  '11-cert-roadmap/02-study-strategy',
  '04-pam/01-pam-fundamentals',
  '04-pam/02-cyberark',
  '04-pam/03-beyondtrust-delinea',
  '04-pam/04-hashicorp-vault',
  '04-pam/05-cloud-native-pam',
  '04-pam/06-pam-program-design',
  '05-iga/01-iga-fundamentals',
  '05-iga/02-sailpoint',
  '05-iga/03-okta',
  '05-iga/04-saviynt-oneidentity-omada',
  '05-iga/05-entra-id-governance',
  '05-iga/06-sod-and-rbac-design',
  '08-security-detection/01-identity-attack-techniques',
  '08-security-detection/02-defender-for-identity',
  '08-security-detection/03-crowdstrike-semperis',
  '08-security-detection/04-kql-identity-hunting',
  '08-security-detection/05-identity-incident-response',
  '12-labs/01-build-an-ad-lab',
  '12-labs/02-entra-connect-setup',
  '12-labs/03-conditional-access-lab',
  '12-labs/04-saml-scim-integration',
  '12-labs/05-laps-and-jml-automation',
  '12-labs/06-pim-and-access-reviews',
  '12-labs/07-cyberark-onboarding',
  '12-labs/08-okta-sso-lifecycle',
  '12-labs/09-sailpoint-cert-campaign',
  '12-labs/10-kerberoasting-hunt',
  '12-labs/11-stale-account-cleanup',
  '12-labs/12-fido2-deployment',
  '12-labs/13-powerbi-identity-dashboard',
  '07-cloud-iam/01-aws-iam',
  '07-cloud-iam/02-azure-rbac',
  '07-cloud-iam/03-gcp-iam',
  '07-cloud-iam/04-multi-cloud-strategy',
  '07-cloud-iam/05-ciem',
  '09-compliance/01-control-frameworks',
  '09-compliance/02-financial-and-payment',
  '09-compliance/03-privacy-and-federal',
  '09-compliance/04-iam-controls-matrix',
  '09-compliance/05-audit-prep-playbook',
  '10-program-leadership/01-maturity-and-roadmap',
  '10-program-leadership/02-stakeholders-and-budget',
  '10-program-leadership/03-metrics-and-rfp',
  '10-program-leadership/04-career-architecture',
])

/**
 * Loads a section's React component and plain-text tutor context.
 *
 * Returns null if the section is known but the MDX file hasn't been authored yet.
 * Returns null if the key is unknown entirely (caller should 404).
 */
export async function loadSection(
  moduleId: string,
  sectionId: string
): Promise<SectionContent | null> {
  const key = `${moduleId}/${sectionId}`

  // Check if this is a known section at all
  if (!ALL_KNOWN_SECTIONS.has(key)) return null

  // If authored, attempt to load the component + raw text
  if (AUTHORED_SECTIONS.has(key)) {
    try {
      const [Component, rawText] = await Promise.all([
        loadAuthoredComponent(moduleId, sectionId),
        getRawMdx(moduleId, sectionId),
      ])
      // The component renders the section. The raw text only grounds the tutor,
      // so a failed text read must NOT discard a successfully imported component
      // — fall back to empty grounding instead.
      if (Component) {
        return { Component, plainText: rawText ? stripMdx(rawText) : '' }
      }
    } catch {
      // Fall through to null
    }
  }

  return null
}

/**
 * Returns all known section keys, e.g. ['01-foundations/01-identity-crisis', ...].
 */
export function knownSectionKeys(): string[] {
  return Array.from(ALL_KNOWN_SECTIONS)
}
