import { readFile } from 'fs/promises'
import path from 'path'
import { getOrderedSections, type SectionRef } from './sections'
import { IAM_RECIPES } from './recipes'

/**
 * Server-only content index. Walks the authored MDX once and extracts the
 * structured artifacts the UI needs but the raw files keep inline:
 *  - flashcards (for the spaced-repetition review deck)
 *  - search entries (sections, glossary terms, war stories, quizzes, recipes)
 *  - per-section reading time
 *
 * Section pages render MDX directly via the webpack import map in
 * content-loader.ts; this module is the complementary *data* view of the same
 * files for features (search, flashcards) that need the content as values.
 */

export interface DeckCard {
  /** Stable id derived from section + front text (survives reordering). */
  id: string
  moduleId: string
  slug: string
  sectionTitle: string
  front: string
  back: string
}

export type SearchEntryType = 'section' | 'glossary' | 'warstory' | 'quiz' | 'flashcard' | 'recipe'

export interface SearchEntry {
  id: string
  type: SearchEntryType
  title: string
  body: string
  keywords: string[]
  href: string
  module: string
  sc300: boolean
}

// ---- low-level helpers -----------------------------------------------------

function stripMdx(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\/\*[^]*?\*\/\}/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/[#*`>_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Deterministic FNV-1a hash → short hex. No Date/Math.random (resume-safe). */
function hashId(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .trim()
}

async function readSection(ref: SectionRef): Promise<string | null> {
  const filePath = path.join(
    process.cwd(),
    'content',
    'modules',
    ref.moduleId,
    `${ref.slug}.mdx`
  )
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

// ---- extractors ------------------------------------------------------------

function extractFlashcards(raw: string, ref: SectionRef): DeckCard[] {
  const cards: DeckCard[] = []
  const tagRe = /<Flashcard\b([^>]*?)\/>/g
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(raw)) !== null) {
    const attrs = m[1]
    const front = /front="([^"]*)"/.exec(attrs)?.[1]
    const back = /back="([^"]*)"/.exec(attrs)?.[1]
    if (!front || !back) continue
    const f = decodeEntities(front)
    const b = decodeEntities(back)
    cards.push({
      id: hashId(`${ref.moduleId}/${ref.slug}|${f}`),
      moduleId: ref.moduleId,
      slug: ref.slug,
      sectionTitle: ref.title,
      front: f,
      back: b,
    })
  }
  return cards
}

function extractDefinitions(raw: string): { term: string; body: string }[] {
  const out: { term: string; body: string }[] = []
  const re = /<Definition\s+term="([^"]*)"\s*>([\s\S]*?)<\/Definition>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    out.push({ term: decodeEntities(m[1]), body: stripMdx(m[2]) })
  }
  return out
}

function extractWarStories(raw: string): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = []
  const re = /<WarStory\s+title="([^"]*)"\s*>([\s\S]*?)<\/WarStory>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    out.push({ title: decodeEntities(m[1]), body: stripMdx(m[2]).slice(0, 500) })
  }
  return out
}

/** Convert JS string escapes (\" \\ \n \t \r \/ ...) in a captured literal to their characters. */
function unescapeJsString(s: string): string {
  return s.replace(/\\(["\\/bfnrt])/g, (_, c) =>
    c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c === 'b' ? '\b' : c === 'f' ? '\f' : c,
  )
}

function extractQuizPrompts(raw: string): string[] {
  const out: string[] = []
  // Quiz prompts are JS string literals inside `question={{ prompt: "..." }}`.
  // Allow escaped chars (e.g. \") so a quoted PowerShell -Filter inside the
  // prompt is captured in full instead of truncating at the first inner quote.
  const re = /prompt:\s*"((?:\\.|[^"\\])*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) out.push(decodeEntities(unescapeJsString(m[1])))
  return out
}

// ---- public API (memoized) -------------------------------------------------

interface BuiltIndex {
  cards: DeckCard[]
  entries: SearchEntry[]
  readingMinutes: Record<string, number>
}

let cached: Promise<BuiltIndex> | null = null

async function build(): Promise<BuiltIndex> {
  const cards: DeckCard[] = []
  const entries: SearchEntry[] = []
  const readingMinutes: Record<string, number> = {}

  for (const ref of getOrderedSections()) {
    const raw = await readSection(ref)
    if (!raw) continue
    const href = `/modules/${ref.moduleId}/${ref.slug}`
    const prose = stripMdx(raw)
    const words = prose ? prose.split(' ').length : 0
    readingMinutes[`${ref.moduleId}/${ref.slug}`] = Math.max(1, Math.round(words / 200))

    // Section entry
    entries.push({
      id: `section:${ref.moduleId}/${ref.slug}`,
      type: 'section',
      title: ref.title,
      body: prose.slice(0, 500),
      keywords: [ref.moduleId, ref.slug],
      href,
      module: ref.moduleId,
      sc300: ref.sc300,
    })

    // Flashcards
    const sectionCards = extractFlashcards(raw, ref)
    cards.push(...sectionCards)
    for (const c of sectionCards) {
      entries.push({
        id: `flashcard:${c.id}`,
        type: 'flashcard',
        title: c.front,
        body: c.back,
        keywords: [ref.moduleId],
        href,
        module: ref.moduleId,
        sc300: ref.sc300,
      })
    }

    // Glossary terms
    for (const d of extractDefinitions(raw)) {
      entries.push({
        id: `glossary:${ref.moduleId}/${ref.slug}:${hashId(d.term)}`,
        type: 'glossary',
        title: d.term,
        body: d.body.slice(0, 400),
        keywords: ['definition', 'glossary'],
        href,
        module: ref.moduleId,
        sc300: ref.sc300,
      })
    }

    // War stories
    for (const w of extractWarStories(raw)) {
      entries.push({
        id: `warstory:${ref.moduleId}/${ref.slug}:${hashId(w.title)}`,
        type: 'warstory',
        title: w.title,
        body: w.body,
        keywords: ['war story', 'incident'],
        href,
        module: ref.moduleId,
        sc300: ref.sc300,
      })
    }

    // Quiz prompts
    for (const p of extractQuizPrompts(raw)) {
      entries.push({
        id: `quiz:${ref.moduleId}/${ref.slug}:${hashId(p)}`,
        type: 'quiz',
        title: p,
        body: '',
        keywords: ['quiz', 'practice question'],
        href,
        module: ref.moduleId,
        sc300: ref.sc300,
      })
    }
  }

  // PowerShell recipes (bundled, not in MDX)
  for (const r of IAM_RECIPES) {
    entries.push({
      id: `recipe:${r.id}`,
      type: 'recipe',
      title: r.title,
      body: `${r.command} ${r.description ?? ''}`.trim(),
      keywords: ['powershell', 'recipe', r.category.toLowerCase()],
      href: '/modules/06-powershell/02-cookbook',
      module: '06-powershell',
      sc300: false,
    })
  }

  return { cards, entries, readingMinutes }
}

function index(): Promise<BuiltIndex> {
  if (!cached) cached = build()
  return cached
}

/** Every flashcard across the curriculum, in curriculum order. */
export async function getAllFlashcards(): Promise<DeckCard[]> {
  return (await index()).cards
}

/** Flashcards scoped to a single module. */
export async function getModuleFlashcards(moduleId: string): Promise<DeckCard[]> {
  return (await index()).cards.filter((c) => c.moduleId === moduleId)
}

/** Full search index for the Fuse.js client. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  return (await index()).entries
}

/** Estimated reading time in minutes for a section (≥1). */
export async function getReadingMinutes(moduleId: string, slug: string): Promise<number> {
  return (await index()).readingMinutes[`${moduleId}/${slug}`] ?? 1
}
