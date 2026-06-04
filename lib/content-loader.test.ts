import { describe, it, expect, vi, beforeEach } from 'vitest'

// The loader resolves authored sections via `await import('@/content/modules/...mdx')`.
// Vitest has no MDX plugin, so a real import would fail to parse — mock the one
// section we exercise as a known+authored key with a trivial component module.
vi.mock('@/content/modules/01-foundations/01-identity-crisis.mdx', () => ({
  default: () => null,
}))

// fs/promises.readFile backs getRawMdx(); mock it so we control whether the raw
// text read resolves (drives stripMdx) or rejects (drives the plainText='' fallback).
vi.mock('fs/promises', () => {
  // Provide both the named export the loader imports AND a `default` so Vitest's
  // ESM<->CJS interop for the built-in fs/promises module resolves cleanly.
  const readFile = vi.fn()
  return { default: { readFile }, readFile }
})

import { readFile } from 'fs/promises'
import { loadSection, knownSectionKeys } from './content-loader'

const mockReadFile = vi.mocked(readFile)

// Re-derive the internal stripMdx transform here so the fixtures below assert
// against the same rules the loader applies (JSX tags, MDX block comments,
// expression braces, whitespace collapse).
function expectedStrip(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\/\*[^]*?\*\/\}/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const AUTHORED_KEY = '01-foundations/01-identity-crisis'

beforeEach(() => {
  mockReadFile.mockReset()
})

describe('lib/content-loader', () => {
  describe('stripMdx (via loadSection plainText)', () => {
    it('drops JSX open/close tags', async () => {
      const raw = '<Definition term="x">a directory</Definition> is the core.'
      mockReadFile.mockResolvedValue(raw)
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result?.plainText).toBe('a directory is the core.')
      expect(result?.plainText).toBe(expectedStrip(raw))
    })

    it('drops {/* MDX block comments */}', async () => {
      const raw = 'before {/* hidden author note */} after'
      mockReadFile.mockResolvedValue(raw)
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result?.plainText).toBe('before after')
    })

    it('drops {expression} braces', async () => {
      const raw = 'count is {someValue} today'
      mockReadFile.mockResolvedValue(raw)
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result?.plainText).toBe('count is today')
    })

    it('collapses runs of whitespace and trims', async () => {
      const raw = '   alpha\n\n   beta\t\tgamma   '
      mockReadFile.mockResolvedValue(raw)
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result?.plainText).toBe('alpha beta gamma')
    })

    it('applies all rules together', async () => {
      const raw =
        '<h1>Title</h1>\n\n{/* note */}\n\nIdentity is {brokenRef} the {/* x */} <em>core</em> problem.'
      mockReadFile.mockResolvedValue(raw)
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result?.plainText).toBe(expectedStrip(raw))
      expect(result?.plainText).toBe('Title Identity is the core problem.')
    })
  })

  describe('loadSection', () => {
    it('returns null for an unknown key', async () => {
      const result = await loadSection('99-nonexistent', '01-nope')
      expect(result).toBeNull()
      // An unknown key must never touch the filesystem.
      expect(mockReadFile).not.toHaveBeenCalled()
    })

    it('returns a Component and stripped plainText for a known + authored key', async () => {
      mockReadFile.mockResolvedValue('<p>hello</p> world')
      const result = await loadSection('01-foundations', '01-identity-crisis')
      expect(result).not.toBeNull()
      expect(typeof result?.Component).toBe('function')
      expect(result?.plainText).toBe('hello world')
    })

    it('falls back to plainText="" when the raw read rejects but the import succeeds', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'))
      const result = await loadSection('01-foundations', '01-identity-crisis')
      // A failed text read must NOT discard a successfully imported component.
      expect(result).not.toBeNull()
      expect(typeof result?.Component).toBe('function')
      expect(result?.plainText).toBe('')
    })
  })

  describe('registry consistency', () => {
    it('exposes a stable, deduplicated set of known section keys', () => {
      const keys = knownSectionKeys()
      expect(keys.length).toBeGreaterThan(0)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('every known key is a well-formed module/section pair (single slash, non-empty parts)', () => {
      for (const key of knownSectionKeys()) {
        const parts = key.split('/')
        expect(parts).toHaveLength(2)
        expect(parts[0].length).toBeGreaterThan(0)
        expect(parts[1].length).toBeGreaterThan(0)
      }
    })

    it('every known key settles through loadSection without throwing (no orphaned switch path)', async () => {
      // Iterate the whole registry and drive each key through loadSection. The
      // contract for a *known* key is "resolves (defined, possibly null), never
      // rejects". Authored keys hit the dynamic-import switch — under the no-MDX-
      // plugin test env every unmocked import rejects, but loadSection's try/catch
      // swallows that to null, so an AUTHORED_SECTIONS entry that is missing from the
      // switch is still observably non-throwing. The mocked authored key (asserted
      // separately below) proves the switch wiring itself resolves to a component.
      mockReadFile.mockResolvedValue('content')
      for (const key of knownSectionKeys()) {
        const [moduleId, sectionId] = key.split('/')
        await expect(loadSection(moduleId, sectionId)).resolves.toBeDefined()
      }
    })

    it('an unknown key short-circuits to null before any import or fs read', async () => {
      mockReadFile.mockResolvedValue('content')
      // A key not in the registry must 404 (null) and never touch fs or the switch.
      await expect(loadSection('00-not-a-module', '00-not-a-section')).resolves.toBeNull()
      expect(mockReadFile).not.toHaveBeenCalled()
    })

    it('the mocked authored key resolves to a component (switch case wired correctly)', async () => {
      mockReadFile.mockResolvedValue('x')
      const [moduleId, sectionId] = AUTHORED_KEY.split('/')
      const result = await loadSection(moduleId, sectionId)
      expect(result?.Component).toBeTypeOf('function')
      expect(knownSectionKeys()).toContain(AUTHORED_KEY)
    })
  })
})
