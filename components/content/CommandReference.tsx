'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export interface CommandRecipe {
  id: string
  category: string
  title: string
  command: string
  description?: string
}

interface CommandReferenceProps {
  recipes: CommandRecipe[]
}

export function CommandReference({ recipes }: CommandReferenceProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => Array.from(new Set(recipes.map((r) => r.category))), [recipes])

  const filtered = useMemo(() => {
    let r = recipes
    if (category) r = r.filter((x) => x.category === category)
    if (query) {
      const q = query.toLowerCase()
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.command.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q)
      )
    }
    return r
  }, [recipes, category, query])

  return (
    <div className="my-6 rounded-[3px] border border-panel-border bg-panel-bg p-4 backdrop-blur-md">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Filter commands…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-xs rounded-[2px] border border-panel-border bg-input px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-text-dim placeholder:font-sans focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full border px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
              category === null
                ? 'border-cyan/60 bg-cyan/12 text-cyan'
                : 'border-panel-border text-text-muted hover:border-cyan/30'
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                category === c
                  ? 'border-cyan/60 bg-cyan/12 text-cyan'
                  : 'border-panel-border text-text-muted hover:border-cyan/30'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-panel-border">
        {filtered.map((r) => (
          <li key={r.id} className="py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-foreground">{r.title}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/60">{r.category}</span>
            </div>
            <code className="mt-1 block font-mono text-xs text-cyan/90">{r.command}</code>
            {r.description && (
              <p className="mt-1 text-xs text-text-muted">{r.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
