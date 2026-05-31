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

const PHASE = {
  1: {
    accent: 'before:bg-cyan',
    border: 'border-cyan/30 hover:border-cyan/70',
    glow: 'hover:shadow-[0_0_22px_rgb(0_240_255/0.25)]',
    num: 'text-cyan',
    bar: 'bg-cyan shadow-[0_0_8px_rgb(0_240_255/0.6)]',
    badge: 'border-cyan/40 bg-cyan/10 text-cyan/80',
    corner: 'border-cyan',
    title: 'group-hover:text-cyan',
    active: true,
  },
  2: {
    accent: 'before:bg-warn/70',
    border: 'border-warn/20 hover:border-warn/50',
    glow: 'hover:shadow-[0_0_18px_rgb(255_184_0/0.18)]',
    num: 'text-warn/80',
    bar: 'bg-warn/70',
    badge: 'border-warn/40 bg-warn/10 text-warn/80',
    corner: 'border-warn/70',
    title: 'group-hover:text-warn',
    active: false,
  },
  3: {
    accent: 'before:bg-text-dim/50',
    border: 'border-panel-border hover:border-text-dim/40',
    glow: '',
    num: 'text-text-dim',
    bar: 'bg-text-dim/50',
    badge: 'border-text-dim/30 bg-white/4 text-text-dim',
    corner: 'border-text-dim/50',
    title: 'group-hover:text-text-muted',
    active: false,
  },
} as const

export function ModuleDeck({ items }: ModuleDeckProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((m) => {
        const c = PHASE[m.phase]
        const done = m.total > 0 && m.completed === m.total
        return (
          <li key={m.id}>
            <Link
              href={`/modules/${m.id}`}
              aria-label={`Module ${m.order}: ${m.title}. ${
                c.active ? `${m.completed} of ${m.total} sections complete.` : `Phase ${m.phase}, coming soon.`
              }`}
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[3px] border bg-panel-bg/80 p-3.5 backdrop-blur-sm transition-all',
                'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:content-[""]',
                'hover:-translate-y-0.5',
                c.border,
                c.glow,
                c.accent,
                done && 'border-nominal/40'
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className={cn('font-display text-2xl font-bold leading-none tabular-nums', done ? 'text-nominal' : c.num)}>
                  {String(m.order).padStart(2, '0')}
                </span>
                <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em]', c.badge)}>
                  P{m.phase}
                </span>
              </div>

              <h3 className={cn('font-display text-sm font-semibold uppercase leading-tight tracking-[0.02em] text-foreground transition-colors', c.title)}>
                {m.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-text-muted">{m.summary}</p>

              <div className="mt-auto pt-3">
                {c.active ? (
                  <>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                      <div className={cn('h-full rounded-full transition-all', done ? 'bg-nominal shadow-[0_0_8px_#00ff88]' : c.bar)} style={{ width: `${m.pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/60">
                      <span className="flex items-center gap-1">
                        {done && <Check className="size-2.5 text-nominal" aria-hidden="true" />}
                        {m.completed}/{m.total} SECTIONS
                      </span>
                      <span className="tabular-nums">{m.pct}%</span>
                    </div>
                  </>
                ) : (
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
                    ▸ COMING // PHASE {m.phase}
                  </div>
                )}
              </div>

              <CornerBrackets corners="diag" className={c.corner} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
