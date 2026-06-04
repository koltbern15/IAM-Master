'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadState, saveState } from '@/lib/progress'
import { cn } from '@/lib/utils'

/**
 * Client chrome for the desktop {@link Sidebar}: owns the collapse toggle and
 * persists it to `settings.sidebarCollapsed`. The module list is rendered on
 * the server and passed in as `children`, so this stays a thin client wrapper
 * (no filesystem/content access here). Collapsed renders a slim chevron rail
 * that hands the reading column back its width.
 */
export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCollapsed(loadState().settings.sidebarCollapsed)
    setMounted(true)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    const s = loadState()
    s.settings = { ...s.settings, sidebarCollapsed: next }
    saveState(s)
  }

  return (
    <nav
      aria-label="Modules"
      className={cn(
        'relative hidden h-screen shrink-0 flex-col border-r border-panel-border bg-void-elevated/60 backdrop-blur-sm md:flex',
        mounted && 'transition-[width] duration-200 ease-out',
        collapsed ? 'w-12' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-panel-border px-3 py-4">
        {!collapsed && (
          <div className="min-w-0">
            <Link
              href="/"
              className="block font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
            >
              IAM MASTERY
            </Link>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/70">
              <span aria-hidden="true">▸ </span>CURRICULUM // 12 MODULES
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="shrink-0 rounded-[2px] px-2 py-1 font-mono text-sm text-cyan/70 transition-colors hover:bg-cyan/10 hover:text-cyan"
        >
          {collapsed ? '▸' : '◂'}
        </button>
      </div>

      {!collapsed && children}
    </nav>
  )
}
