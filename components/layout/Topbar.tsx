'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

export function Topbar() {
  const seconds = useSessionTimer()
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-4 border-b border-panel-border bg-void/85 px-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div
          aria-label="Overall mastery"
          className="flex h-7 items-center gap-2 rounded-full border border-cyan/40 bg-cyan/8 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 shadow-[0_0_8px_rgb(0_240_255/0.2)]"
        >
          <span className="size-1.5 rounded-full bg-nominal shadow-[0_0_6px_#00ff88] animate-pulse" />
          0% MASTERED
        </div>
      </div>

      <form action="/search" className="hidden max-w-md flex-1 md:block">
        <Input
          type="search"
          name="q"
          placeholder="Search modules, terms, recipes…"
          className="h-8"
        />
      </form>

      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-cyan/70">
          SESSION {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-[2px] p-1.5 text-text-muted transition-colors hover:bg-cyan/10 hover:text-cyan"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
