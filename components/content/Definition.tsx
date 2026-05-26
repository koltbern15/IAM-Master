'use client'

import { useState } from 'react'

interface DefinitionProps {
  term: string
  children: React.ReactNode
}

export function Definition({ term, children }: DefinitionProps) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="cursor-help border-b border-dashed border-cyan/60 font-medium text-cyan hover:text-cyan/90"
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 rounded-[2px] border border-cyan/40 bg-void-elevated/95 p-3 text-left text-xs font-normal text-foreground shadow-[0_0_18px_rgb(0_240_255/0.3)] backdrop-blur-md"
        >
          <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70">
            ▸ DEFINITION
          </span>
          {children}
        </span>
      )}
    </span>
  )
}
