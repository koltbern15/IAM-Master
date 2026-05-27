'use client'

import { useState } from 'react'
import { TutorPanel } from './TutorPanel'

interface AskProfessorRailProps {
  sectionId: string
  sectionContent: string
}

export function AskProfessorRail({ sectionId, sectionContent }: AskProfessorRailProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Ask Professor"
        className="fixed right-0 top-1/2 z-[70] -translate-y-1/2 rounded-l-[3px] border border-r-0 border-cyan/50 bg-cyan/10 px-2 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan shadow-[0_0_12px_rgb(0_240_255/0.35)] hover:bg-cyan/20 hover:text-cyan motion-reduce:transition-none">
        ▸ ASK<br />PROFESSOR
      </button>
      <TutorPanel
        open={open} onClose={() => setOpen(false)}
        sectionId={sectionId} sectionContent={sectionContent}
      />
    </>
  )
}
