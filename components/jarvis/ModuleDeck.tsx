import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CornerBrackets } from './CornerBrackets'
import type { Phase } from '@/lib/types'

export interface ModuleDeckItem {
  id: string
  order: number
  title: string
  summary: string
  phase: Phase
  completed: number
  total: number
  pct: number
}

interface ModuleDeckProps {
  items: ModuleDeckItem[]
}

// Uniform cyan treatment — every module is fully authored, so the deck no longer
// distinguishes modules by build phase.
const STYLE = {
  accent: 'before:bg-cyan',
  border: 'border-cyan/30 hover:border-cyan/70',
  glow: 'hover:shadow-[0_0_22px_rgb(0_240_255/0.25)]',
  num: 'text-cyan',
  bar: 'bg-cyan shadow-[0_0_8px_rgb(0_240_255/0.6)]',
  corner: 'border-cyan',
  title: 'group-hover:text-cyan',
} as const

export function ModuleDeck({ items }: ModuleDeckProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => {
        const done = m.total > 0 && m.completed === m.total
        return (
          <li key={m.id}>
            <Link
              href={`/modules/${m.id}`}
              aria-label={`Module ${m.order}: ${m.title}. ${m.completed} of ${m.total} sections complete.`}
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[3px] border bg-panel-bg/80 p-3.5 backdrop-blur-sm transition-all',
                'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:content-[""]',
                'hover:-translate-y-0.5',
                STYLE.border,
                STYLE.glow,
                STYLE.accent,
                done && 'border-nominal/40'
              )}
            >
              <div className="mb-2">
                <span className={cn('font-display text-2xl font-bold leading-none tabular-nums', done ? 'text-nominal' : STYLE.num)}>
                  {String(m.order).padStart(2, '0')}
                </span>
              </div>

              <h3 className={cn('font-display text-sm font-semibold uppercase leading-tight tracking-[0.02em] text-foreground transition-colors', STYLE.title)}>
                {m.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-text-muted">{m.summary}</p>

              <div className="mt-auto pt-3">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                  <div className={cn('h-full rounded-full transition-all', done ? 'bg-nominal shadow-[0_0_8px_#00ff88]' : STYLE.bar)} style={{ width: `${m.pct}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/60">
                  <span className="flex items-center gap-1">
                    {done && <Check className="size-2.5 text-nominal" aria-hidden="true" />}
                    {m.completed}/{m.total} SECTIONS
                  </span>
                  <span className="tabular-nums">{m.pct}%</span>
                </div>
              </div>

              <CornerBrackets corners="diag" className={STYLE.corner} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
