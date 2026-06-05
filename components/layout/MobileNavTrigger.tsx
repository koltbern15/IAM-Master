'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { MobileNavDrawer } from './MobileNavDrawer'

/**
 * Phone-only hamburger button + the {@link MobileNavDrawer} it toggles. Lives
 * inside {@link ReadShell} (the only shell whose desktop {@link Sidebar} is
 * hidden below `md`), giving read/search/flashcards/progress pages navigation
 * on a phone. Hidden at `md` and up where the Sidebar takes over.
 */
export function MobileNavTrigger() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-2.5 z-40 flex min-h-11 min-w-11 items-center justify-center rounded-[2px] p-2.5 text-text-muted backdrop-blur-md transition-colors hover:bg-cyan/10 hover:text-cyan md:hidden"
      >
        <Menu className="size-5" />
      </button>
      <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
