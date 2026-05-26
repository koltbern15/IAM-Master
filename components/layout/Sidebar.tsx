import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const modules = getAllModules()

  return (
    <nav
      aria-label="Modules"
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-panel-border bg-void-elevated/60 backdrop-blur-sm md:flex"
    >
      <div className="border-b border-panel-border px-5 py-4">
        <Link
          href="/"
          className="block font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
        >
          IAM MASTERY
        </Link>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/50">
          ▸ CURRICULUM // 12 MODULES
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-[2px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors',
                  'hover:bg-cyan/10 hover:text-cyan',
                  m.phase === 1
                    ? 'text-text'
                    : m.phase === 2
                    ? 'text-warn/70'
                    : 'text-text-dim'
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {String(m.order).padStart(2, '0')} {m.title}
                  </span>
                </div>
                {m.phase !== 1 && (
                  <Badge variant={m.phase === 2 ? 'warning' : 'outline'} className="shrink-0">
                    P{m.phase}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-panel-border px-2 py-3">
        <ul className="space-y-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-muted">
          <li>
            <Link
              href="/flashcards"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ FLASHCARDS
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ SEARCH
            </Link>
          </li>
          <li>
            <Link
              href="/progress"
              className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
            >
              ▸ PROGRESS
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
