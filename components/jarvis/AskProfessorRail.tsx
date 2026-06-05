'use client'

import { useEffect, useState } from 'react'
import { default as dynamic } from 'next/dynamic'

// Lazily mount the tutor panel: it pulls in the Anthropic SDK, which we keep
// out of the section route's first-load JS until the user actually opens it.
const TutorPanel = dynamic(() => import('./TutorPanel').then(m => m.TutorPanel), { ssr: false })

interface AskProfessorRailProps {
  sectionId: string
  sectionContent: string
}

export function AskProfessorRail({ sectionId, sectionContent }: AskProfessorRailProps) {
  const [open, setOpen] = useState(false)

  // Bridge: the global command palette (Cmd+K) dispatches this window event
  // when the user picks "Ask the Professor about this section".
  useEffect(() => {
    function onOpenTutor() {
      setOpen(true)
    }
    window.addEventListener('iam-mastery:open-tutor', onOpenTutor)
    return () => window.removeEventListener('iam-mastery:open-tutor', onOpenTutor)
  }, [])

  return (
    <>
      {/* Mobile: bottom-right FAB so the launcher never overlaps the reading
          column on phones (the edge tab below sits at top-1/2 on the right). */}
      <button type="button" onClick={() => setOpen(true)} aria-label="Ask Professor"
        aria-expanded={open} aria-controls="tutor-panel"
        className="fixed bottom-4 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-cyan/50 bg-cyan/10 font-mono text-base text-cyan shadow-[0_0_12px_rgb(0_240_255/0.35)] hover:bg-cyan/20 hover:text-cyan motion-reduce:transition-none md:hidden">
        ▸
      </button>
      {/* Desktop: vertical edge tab anchored to the right rail. */}
      <button type="button" onClick={() => setOpen(true)} aria-label="Ask Professor"
        aria-expanded={open} aria-controls="tutor-panel"
        className="fixed right-0 top-1/2 z-[70] hidden -translate-y-1/2 rounded-l-[3px] border border-r-0 border-cyan/50 bg-cyan/10 px-2 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan shadow-[0_0_12px_rgb(0_240_255/0.35)] hover:bg-cyan/20 hover:text-cyan motion-reduce:transition-none md:block">
        ▸ ASK<br />PROFESSOR
      </button>
      {open && (
        <TutorPanel
          open={open} onClose={() => setOpen(false)}
          sectionId={sectionId} sectionContent={sectionContent}
        />
      )}
    </>
  )
}
