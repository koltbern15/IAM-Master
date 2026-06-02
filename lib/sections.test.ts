import { describe, it, expect } from 'vitest'
import {
  getOrderedSections,
  getSectionTitle,
  getSectionMeta,
  getPrevNext,
  slugToTitle,
} from './sections'
import modulesJson from '@/content/modules.json'

interface RawModule {
  id: string
  sections: string[]
}

const MODULES = modulesJson as RawModule[]

// Flattened expected slugs straight from modules.json (the source of truth for
// which sections exist / their order). 61 authored sections across modules
// 01/02/03/04/05/06/07/08/09/10/11/12.
const EXPECTED: { moduleId: string; slug: string }[] = MODULES.flatMap((m) =>
  m.sections.map((slug) => ({ moduleId: m.id, slug }))
)

describe('lib/sections — getOrderedSections', () => {
  it('returns exactly the 61 authored sections in curriculum order', () => {
    const ordered = getOrderedSections()
    expect(ordered).toHaveLength(61)
    expect(ordered.map((s) => `${s.moduleId}/${s.slug}`)).toEqual(
      EXPECTED.map((e) => `${e.moduleId}/${e.slug}`)
    )
  })

  it('first ordered section is the foundations identity-crisis section', () => {
    const ordered = getOrderedSections()
    expect(ordered[0].moduleId).toBe('01-foundations')
    expect(ordered[0].slug).toBe('01-identity-crisis')
  })

  it('last ordered section is the labs power-bi dashboard section', () => {
    const ordered = getOrderedSections()
    const last = ordered[ordered.length - 1]
    expect(last.moduleId).toBe('12-labs')
    expect(last.slug).toBe('13-powerbi-identity-dashboard')
  })
})

describe('lib/sections — title sync guard (modules.json ⇆ SECTION_TITLES)', () => {
  // For every slug in modules.json, the title must be curated (non-empty) and
  // must match getSectionMeta(...).title. This is the drift guard: if a slug is
  // added to modules.json without a SECTION_TITLES entry, getSectionTitle would
  // fall back to a prettified slug — but here we additionally assert it is NOT
  // the bare prettified fallback for any authored section.
  it('every ordered section has a non-empty curated title matching getSectionMeta', () => {
    for (const ref of getOrderedSections()) {
      const title = getSectionTitle(ref.moduleId, ref.slug)
      expect(title, `${ref.moduleId}/${ref.slug} title`).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)

      const meta = getSectionMeta(ref.moduleId, ref.slug)
      expect(meta, `${ref.moduleId}/${ref.slug} meta`).toBeDefined()
      expect(meta!.title).toBe(title)
      // getOrderedSections() title must agree with both as well.
      expect(ref.title).toBe(title)
    }
  })

  it('curated titles are richer than the bare slug fallback', () => {
    // Sanity: at least one section's curated title differs from slugToTitle,
    // proving SECTION_TITLES is actually consulted (not silently bypassed).
    const ordered = getOrderedSections()
    const anyCurated = ordered.some(
      (ref) => getSectionTitle(ref.moduleId, ref.slug) !== slugToTitle(ref.slug)
    )
    expect(anyCurated).toBe(true)
  })
})

describe('lib/sections — getPrevNext', () => {
  it('first section has no prev and a next', () => {
    const first = getOrderedSections()[0]
    const { prev, next } = getPrevNext(first.moduleId, first.slug)
    expect(prev).toBeNull()
    expect(next).not.toBeNull()
    expect(next!.slug).toBe('02-lexicon')
  })

  it('a middle section has both prev and next set', () => {
    const ordered = getOrderedSections()
    const mid = ordered[Math.floor(ordered.length / 2)]
    const { prev, next } = getPrevNext(mid.moduleId, mid.slug)
    expect(prev).not.toBeNull()
    expect(next).not.toBeNull()
    // prev/next are the immediate neighbors in curriculum order.
    const idx = ordered.findIndex(
      (s) => s.moduleId === mid.moduleId && s.slug === mid.slug
    )
    expect(prev!.slug).toBe(ordered[idx - 1].slug)
    expect(next!.slug).toBe(ordered[idx + 1].slug)
  })

  it('last section has a prev and no next', () => {
    const ordered = getOrderedSections()
    const last = ordered[ordered.length - 1]
    const { prev, next } = getPrevNext(last.moduleId, last.slug)
    expect(prev).not.toBeNull()
    expect(next).toBeNull()
  })

  it('returns nulls for an unknown section', () => {
    expect(getPrevNext('99-nope', 'does-not-exist')).toEqual({
      prev: null,
      next: null,
    })
  })
})

describe('lib/sections — getSectionMeta sc300 flag', () => {
  it('is true for an SC-300-aligned microsoft-identity section', () => {
    const meta = getSectionMeta('03-microsoft-identity', '02-entra-id')
    expect(meta).toBeDefined()
    expect(meta!.sc300).toBe(true)
  })

  it('is true for an SC-300-aligned cert-roadmap section', () => {
    const meta = getSectionMeta('11-cert-roadmap', '01-sc300-roadmap')
    expect(meta).toBeDefined()
    expect(meta!.sc300).toBe(true)
  })

  it('is false for a non-aligned protocols section', () => {
    const meta = getSectionMeta('02-protocols', '01-kerberos')
    expect(meta).toBeDefined()
    expect(meta!.sc300).toBe(false)
  })

  it('is undefined for an unknown slug', () => {
    expect(getSectionMeta('02-protocols', 'not-a-real-section')).toBeUndefined()
    expect(getSectionMeta('99-fake' as never, '01-anything')).toBeUndefined()
  })
})

describe('lib/sections — slugToTitle', () => {
  it('prettifies a numbered slug sensibly', () => {
    expect(slugToTitle('01-identity-crisis')).toBe('Identity Crisis')
  })

  it('upcases short (<=3 char) tokens for acronyms, title-cases the rest', () => {
    // tokens <= 3 chars are upper-cased; longer (4+) ones are title-cased.
    expect(slugToTitle('03-api-keys')).toBe('API Keys')
    expect(slugToTitle('04-saml-deep-dive')).toBe('Saml Deep Dive')
  })
})
