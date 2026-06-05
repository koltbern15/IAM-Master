'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionTimer, formatSessionTime } from '@/hooks/use-session-timer'

function formatNow(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} // ${hh}:${mi}:${ss}`
}

interface StatusStripProps {
  className?: string
}

export function StatusStrip({ className }: StatusStripProps) {
  const seconds = useSessionTimer()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-10 items-center justify-between border-b border-panel-border bg-void/85 px-5 backdrop-blur-md',
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
      >
        <span className="size-1.5 rounded-full bg-nominal shadow-[0_0_8px_#00ff88] animate-pulse" />
        IAM MASTERY // ONLINE
      </Link>

      <div className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70 md:block">
        {now ? formatNow(now) : '----'}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-cyan/70">
          SESSION {formatSessionTime(seconds)}
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-[2px] p-2.5 text-text-muted transition-colors hover:bg-cyan/10 hover:text-cyan md:min-h-0 md:min-w-0 md:p-1.5"
        >
          <Settings className="size-3.5" />
        </Link>
      </div>
    </header>
  )
}
