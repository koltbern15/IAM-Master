'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavList } from './NavList'
import { useFocusTrap } from '@/hooks/use-focus-trap'

/**
 * Phone-only (`md:hidden`) slide-in navigation drawer. Renders the same
 * {@link NavList} as the desktop {@link Sidebar} so read pages keep full
 * navigation on a phone (the desktop Sidebar is `hidden md:flex`). Backdrop
 * click + Escape close it, focus is trapped while open, and it auto-closes on
 * route change. Slides in via a transform transition (no keyframe dependency).
 */
export function MobileNavDrawer({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useFocusTrap(open, ref)

  // Auto-close on navigation. Intentionally keyed on `pathname` only so a route
  // change closes the drawer; `open`/`onClose` are read fresh inside.
  useEffect(() => {
    if (open) onClose()
  }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[88] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      <div
        data-testid="drawer-backdrop"
        className="absolute inset-0 bg-void/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col border-r border-panel-border bg-void-elevated/95 shadow-[0_0_30px_rgb(0_240_255/0.25)]"
      >
        <div className="flex items-center justify-between border-b border-panel-border px-5 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
          >
            IAM MASTERY
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-[2px] p-1.5 text-text-muted hover:bg-cyan/10 hover:text-cyan"
          >
            ✕
          </button>
        </div>
        <NavList onNavigate={onClose} />
      </div>
    </div>
  )
}
