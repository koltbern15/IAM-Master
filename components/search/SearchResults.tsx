'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { cn } from '@/lib/utils'
import { getAllModules } from '@/lib/content'
import type { SearchEntry, SearchEntryType } from '@/lib/content-index'

interface SearchResultsProps {
  entries: SearchEntry[]
  initialQuery: string
}

const TYPE_LABEL: Record<SearchEntryType, string> = {
  section: 'SECTION',
  glossary: 'TERM',
  warstory: 'WAR STORY',
  quiz: 'QUIZ',
  flashcard: 'CARD',
  recipe: 'RECIPE',
}

const TYPE_ORDER: SearchEntryType[] = ['section', 'glossary', 'warstory', 'quiz', 'flashcard', 'recipe']

export function SearchResults({ entries, initialQuery }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [typeFilter, setTypeFilter] = useState<SearchEntryType | null>(null)
  const [moduleFilter, setModuleFilter] = useState<string | null>(null)

  const moduleTitles = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of getAllModules()) map[m.id] = m.title
    return map
  }, [])

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'keywords', weight: 2 },
          { name: 'body', weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [entries]
  )

  const results = useMemo(() => {
    const base = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : entries
    return base.filter(
      (e) => (!typeFilter || e.type === typeFilter) && (!moduleFilter || e.module === moduleFilter)
    )
  }, [query, fuse, entries, typeFilter, moduleFilter])

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<SearchEntryType, number>> = {}
    const base = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : entries
    for (const e of base) counts[e.type] = (counts[e.type] ?? 0) + 1
    return counts
  }, [query, fuse, entries])

  const modulesPresent = useMemo(
    () => Array.from(new Set(entries.map((e) => e.module))).sort(),
    [entries]
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">▸ GLOBAL SEARCH</div>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sections, terms, war stories, quizzes, recipes…"
          aria-label="Search the curriculum"
          className="mt-2 w-full rounded-[3px] border border-panel-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-text-dim focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
        />
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={typeFilter === null} onClick={() => setTypeFilter(null)}>
          ALL · {Object.values(typeCounts).reduce((a, b) => a + (b ?? 0), 0)}
        </FilterChip>
        {TYPE_ORDER.filter((t) => typeCounts[t]).map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {TYPE_LABEL[t]} · {typeCounts[t]}
          </FilterChip>
        ))}
      </div>

      {/* Module filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip active={moduleFilter === null} onClick={() => setModuleFilter(null)} tone="muted">
          ALL MODULES
        </FilterChip>
        {modulesPresent.map((mid) => (
          <FilterChip
            key={mid}
            active={moduleFilter === mid}
            onClick={() => setModuleFilter(mid)}
            tone="muted"
          >
            {moduleTitles[mid] ?? mid}
          </FilterChip>
        ))}
      </div>

      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim">
        {results.length} RESULT{results.length === 1 ? '' : 'S'}
        {query.trim() ? ` FOR "${query.trim()}"` : ''}
      </div>

      <ul className="space-y-2">
        {results.slice(0, 60).map((e) => (
          <li key={e.id}>
            <Link
              href={e.href}
              className="group block rounded-[3px] border border-panel-border bg-panel-bg px-4 py-3 transition-all hover:border-cyan/50 hover:bg-cyan/5 hover:shadow-[0_0_14px_rgb(0_240_255/0.15)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-display text-sm font-medium text-foreground group-hover:text-cyan">
                  {e.title}
                </span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan/60">
                  {TYPE_LABEL[e.type]}
                </span>
              </div>
              {e.body && <p className="mt-1 line-clamp-2 text-xs text-text-muted">{e.body}</p>}
              <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
                {moduleTitles[e.module] ?? e.module}
                {e.sc300 ? ' · SC-300' : ''}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {query.trim() && results.length === 0 && (
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-dim">
          ▸ NO MATCHES. TRY A BROADER TERM.
        </p>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
  tone = 'cyan',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  tone?: 'cyan' | 'muted'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
        active
          ? 'border-cyan/60 bg-cyan/12 text-cyan'
          : tone === 'muted'
          ? 'border-panel-border text-text-muted hover:border-cyan/30 hover:text-cyan/80'
          : 'border-panel-border text-text-muted hover:border-cyan/30 hover:text-cyan/80'
      )}
    >
      {children}
    </button>
  )
}
