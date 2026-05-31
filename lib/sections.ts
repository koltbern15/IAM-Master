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
}

/** Sections whose material is SC-300 exam-aligned (surfaces an SC-300 badge). */
const SC300_SECTIONS = new Set<string>([
  '03-microsoft-identity/01-active-directory',
  '03-microsoft-identity/02-entra-id',
  '03-microsoft-identity/03-hybrid-identity',
  '11-cert-roadmap/01-sc300-roadmap',
  '11-cert-roadmap/02-study-strategy',
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
