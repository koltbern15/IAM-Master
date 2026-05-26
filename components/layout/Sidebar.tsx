import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const modules = getAllModules()

  return (
    <nav
      aria-label="Modules"
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/30 md:flex"
    >
      <div className="px-5 py-5">
        <Link href="/" className="block text-lg font-bold tracking-tight">
          IAM Mastery
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-1">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={`/modules/${m.id}`}
                className={cn(
                  'group flex items-start justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-muted/60',
                  m.phase === 1 ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <span className="truncate font-medium">
                  <span className="text-muted-foreground/60 mr-1">{m.order}.</span>
                  <span>{m.title}</span>
                </span>
                {m.phase !== 1 && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Phase {m.phase}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-3 py-4">
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            <Link
              href="/flashcards"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Flashcards
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Search
            </Link>
          </li>
          <li>
            <Link
              href="/progress"
              className="block rounded-md px-3 py-1.5 hover:bg-muted/60 hover:text-foreground"
            >
              Progress
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
