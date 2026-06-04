import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

/**
 * Build-time guard for a known content-index parser gotcha.
 *
 * lib/content-index.ts extracts structured artifacts from the MDX with regexes
 * that capture attribute values inside double quotes:
 *
 *   <Flashcard ... />            → /<Flashcard\b([^>]*?)\/>/g
 *                                  then front="([^"]*)"  back="([^"]*)"
 *   <Definition term="...">      → /<Definition\s+term="([^"]*)"\s*>.../
 *   <WarStory title="...">       → /<WarStory\s+title="([^"]*)"\s*>.../
 *
 * Those captures use `[^"]*` for the value and `[^>]*?`/`\s*>` for the tag span.
 * That means a RAW `"` inside a value silently truncates the capture, and a RAW
 * `>` inside the tag silently breaks the whole match — the card/term/story is
 * dropped from search and the review deck with no error. Authors must
 * entity-encode those characters (&quot; / &gt;) instead.
 *
 * This test mirrors those extractor targets and FAILS the build if any
 * Flashcard front/back, Definition term, or WarStory title contains a raw `>`
 * or raw `"`, converting the silent drop into a hard, locatable error.
 *
 * NOTE: <Quiz> blocks are intentionally NOT covered. Their fields live in a JS
 * expression (`question={{ prompt: "..." }}`), not a JSX attribute, so HTML
 * entities would render literally and do not apply. The quiz prompt extractor is
 * escape-aware (handles `\"`) and a raw `>` in a JS string is harmless, so the
 * build / JS parser catches any genuine breakage — there is nothing to guard here.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

interface Offense {
  file: string
  component: string
  attr: string
  value: string
  reason: string
}

/** Returns the repo-relative path for readable failure messages. */
function rel(file: string): string {
  return path.relative(repoRoot, file).replace(/\\/g, '/')
}

/** Recursively collects every .mdx file under `dir`. */
function collectMdx(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...collectMdx(full))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      out.push(full)
    }
  }
  return out
}

/**
 * The extractor captures an attribute value as `[^"]*` — i.e. everything up to
 * the FIRST double quote after `attr="`. So the value the index actually sees is
 * exactly src[valueStart .. firstQuote). We reproduce that here.
 */
function captureValue(src: string, valueStart: number): { value: string; closeIdx: number } {
  const closeIdx = src.indexOf('"', valueStart)
  if (closeIdx === -1) return { value: src.slice(valueStart), closeIdx: -1 }
  return { value: src.slice(valueStart, closeIdx), closeIdx }
}

/**
 * After the captured value's closing quote, a well-formed attribute is followed
 * only by: whitespace (then another attribute), `/>`, or `>`. Anything else means
 * the quote we stopped at was an EMBEDDED raw `"` mid-value — the extractor would
 * have silently truncated the value there. Returns true when the boundary is valid.
 */
function hasValidBoundary(src: string, closeIdx: number): boolean {
  if (closeIdx === -1) return false // unterminated → an embedded/raw quote opened it
  const next = src[closeIdx + 1]
  if (next === undefined) return false
  return /[\s/>]/.test(next)
}

/** Flags any value that carries a raw `>` or a raw `"` (embedded mid-value). */
function inspectAttr(
  src: string,
  attrRe: RegExp,
  component: string,
  attr: string,
  file: string,
  offenses: Offense[]
): void {
  let m: RegExpExecArray | null
  while ((m = attrRe.exec(src)) !== null) {
    const valueStart = m.index + m[0].length
    const { value, closeIdx } = captureValue(src, valueStart)
    if (value.includes('>')) {
      offenses.push({
        file: rel(file),
        component,
        attr,
        value,
        reason: "raw '>' must be entity-encoded as &gt;",
      })
    }
    if (!hasValidBoundary(src, closeIdx)) {
      // The captured value did not end on a valid attribute/tag boundary, so the
      // closing quote was actually an embedded raw `"` — exactly the truncation
      // the content-index extractor suffers silently.
      offenses.push({
        file: rel(file),
        component,
        attr,
        value,
        reason: "raw '\"' inside the value must be entity-encoded as &quot;",
      })
    }
  }
}

describe('content guard — MDX attributes the content-index extractor would drop', () => {
  const files = collectMdx(path.join(repoRoot, 'content', 'modules'))

  it('finds MDX files to scan', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('has no raw > or " in Flashcard front/back, Definition term, or WarStory title', () => {
    const offenses: Offense[] = []

    for (const file of files) {
      const src = readFileSync(file, 'utf-8')
      inspectAttr(src, /<Flashcard\b[^>]*?\bfront="/g, 'Flashcard', 'front', file, offenses)
      inspectAttr(src, /<Flashcard\b[^>]*?\bback="/g, 'Flashcard', 'back', file, offenses)
      inspectAttr(src, /<Definition\s+term="/g, 'Definition', 'term', file, offenses)
      inspectAttr(src, /<WarStory\s+title="/g, 'WarStory', 'title', file, offenses)
    }

    if (offenses.length > 0) {
      const report = offenses
        .map(
          (o) =>
            `  ${o.file}\n    <${o.component} ${o.attr}="...">: ${o.reason}\n    value: ${JSON.stringify(
              o.value.slice(0, 120)
            )}`
        )
        .join('\n')
      throw new Error(
        `Found ${offenses.length} MDX attribute(s) the content-index extractor would silently drop:\n${report}`
      )
    }

    expect(offenses).toHaveLength(0)
  })
})
