import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Presentation-only navigation body shared by the desktop {@link Sidebar} and
 * the {@link MobileNavDrawer}. Renders the module list + the
 * Flashcards/Search/Progress footer links from a single source so the two
 * navigation surfaces never drift. Server-safe (no hooks); `onNavigate` is just
 * attached to each link so the drawer can close itself on tap.
 */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const modules = getAllModules()
  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                onClick={onNavigate}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-[2px] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors',
                  'hover:bg-cyan/10 hover:text-cyan',
                  m.phase === 1
                    ? 'text-text'
                    : m.phase === 2
                    ? 'text-warn/90'
                    : 'text-text-muted'
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
          {[
            { href: '/flashcards', label: 'FLASHCARDS' },
            { href: '/search', label: 'SEARCH' },
            { href: '/progress', label: 'PROGRESS' }
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className="block rounded-[2px] px-3 py-1.5 transition-colors hover:bg-cyan/10 hover:text-cyan"
              >
                ▸ {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
