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
