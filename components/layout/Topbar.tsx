'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

export function Topbar() {
  const seconds = useSessionTimer()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div
          aria-label="Overall mastery"
          className="flex h-9 items-center gap-2 rounded-full border border-border bg-card/50 px-3 text-xs font-medium text-muted-foreground"
        >
          <span className="size-2 rounded-full bg-primary" />
          0% mastered
        </div>
      </div>

      <form action="/search" className="hidden flex-1 max-w-md md:block">
        <Input
          type="search"
          name="q"
          placeholder="Search modules, terms, recipes…"
          className="h-9 bg-card/40"
        />
      </form>

      <div className="flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          <Settings className="size-4" />
        </Link>
      </div>
    </header>
  )
}
