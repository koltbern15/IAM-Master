import { describe, it, expect } from 'vitest'
import {
  getAllFlashcards,
  getModuleFlashcards,
  getSearchIndex,
  getReadingMinutes,
} from './content-index'

// These tests exercise the real on-disk MDX (content/modules/**/*.mdx) via the
// fs-backed content index. Assertions use ranges, not exact counts, so they stay
// green as curriculum content is edited.

describe('lib/content-index — getAllFlashcards', () => {
  it('returns a non-trivial number of cards from the authored MDX', async () => {
    const cards = await getAllFlashcards()
    // Authored content currently yields ~24 cards; assert a resilient lower
    // bound well clear of "trivial" while leaving headroom for content edits.
    expect(cards.length).toBeGreaterThanOrEqual(20)
  })

  it('every card has non-empty id/front/back', async () => {
    const cards = await getAllFlashcards()
    for (const c of cards) {
      expect(c.id, 'id').toBeTruthy()
      expect(c.front.trim().length, `front of ${c.id}`).toBeGreaterThan(0)
      expect(c.back.trim().length, `back of ${c.id}`).toBeGreaterThan(0)
      expect(c.moduleId).toBeTruthy()
      expect(c.slug).toBeTruthy()
    }
  })

  it('card ids are unique', async () => {
    const cards = await getAllFlashcards()
    const ids = cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('lib/content-index — quiz prompt extraction', () => {
  it('captures a quiz prompt in full past an escaped double-quote', async () => {
    // 06-powershell/01-fundamentals has a quiz whose prompt embeds a quoted
    // PowerShell -Filter (escaped \") and asks about a 400 Bad Request. The old
    // [^"]+ extractor truncated at the first inner quote, dropping the question.
    const entries = await getSearchIndex()
    const quiz = entries.find(
      (e) => e.type === 'quiz' && e.module === '06-powershell' && e.title.includes('Bad Request'),
    )
    expect(quiz, 'quiz prompt should not truncate at the escaped quote').toBeTruthy()
    expect(quiz!.title).toContain('endsWith')
  })
})

describe('lib/content-index — getModuleFlashcards', () => {
  it('is a subset of all flashcards and all belong to the requested module', async () => {
    const all = await getAllFlashcards()
    const allIds = new Set(all.map((c) => c.id))
    const mod = await getModuleFlashcards('02-protocols')

    expect(mod.length).toBeGreaterThan(0)
    for (const c of mod) {
      expect(c.moduleId).toBe('02-protocols')
      // ⊆ getAllFlashcards()
      expect(allIds.has(c.id)).toBe(true)
    }
    // count for the module never exceeds the global count
    expect(mod.length).toBeLessThanOrEqual(all.length)
  })

  it('returns an empty array for a module with no authored cards', async () => {
    const mod = await getModuleFlashcards('99-nonexistent')
    expect(mod).toEqual([])
  })
})

describe('lib/content-index — getSearchIndex', () => {
  it('contains at least one section entry and one recipe entry', async () => {
    const entries = await getSearchIndex()
    const types = entries.map((e) => e.type)
    expect(types).toContain('section')
    expect(types).toContain('recipe')
  })

  it('every entry href starts with "/"', async () => {
    const entries = await getSearchIndex()
    expect(entries.length).toBeGreaterThan(0)
    for (const e of entries) {
      expect(e.href.startsWith('/'), `${e.id} href: ${e.href}`).toBe(true)
    }
  })

  it('section entries carry a real title and module', async () => {
    const entries = await getSearchIndex()
    const sections = entries.filter((e) => e.type === 'section')
    expect(sections.length).toBeGreaterThanOrEqual(17)
    for (const s of sections) {
      expect(s.title.trim().length).toBeGreaterThan(0)
      expect(s.module).toBeTruthy()
      expect(s.href.startsWith('/modules/')).toBe(true)
    }
  })

  it('each flashcard has a corresponding flashcard search entry', async () => {
    const [cards, entries] = await Promise.all([
      getAllFlashcards(),
      getSearchIndex(),
    ])
    const flashEntries = entries.filter((e) => e.type === 'flashcard')
    expect(flashEntries.length).toBe(cards.length)
  })
})

describe('lib/content-index — getReadingMinutes', () => {
  it('is >= 1 for a known authored section', async () => {
    const minutes = await getReadingMinutes('02-protocols', '01-kerberos')
    expect(minutes).toBeGreaterThanOrEqual(1)
    expect(Number.isInteger(minutes)).toBe(true)
  })

  it('falls back to 1 for an unknown section', async () => {
    const minutes = await getReadingMinutes('99-nope', 'missing')
    expect(minutes).toBe(1)
  })
})
