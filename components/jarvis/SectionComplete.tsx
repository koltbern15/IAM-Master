'use client'

import { useEffect, useState } from 'react'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadState, markSectionCompleted, markSectionIncomplete } from '@/lib/progress'
import { useSound } from '@/hooks/use-sound'

interface SectionCompleteProps {
  sectionKey: string
}

/**
 * "MARK MASTERED" toggle rendered at the foot of a section. This is the user
 * action that actually drives completion → mastery %, streak, and the home HUD.
 */
export function SectionComplete({ sectionKey }: SectionCompleteProps) {
  const [completed, setCompleted] = useState(false)
  const chime = useSound('chime')

  useEffect(() => {
    const sync = () => setCompleted(Boolean(loadState().progress.sections[sectionKey]?.completedAt))
    sync()
    window.addEventListener('iam-mastery:state-change', sync)
    return () => window.removeEventListener('iam-mastery:state-change', sync)
  }, [sectionKey])

  function toggle() {
    if (completed) {
      markSectionIncomplete(sectionKey)
    } else {
      markSectionCompleted(sectionKey)
      chime.play()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={completed}
      className={cn(
        'group flex w-full items-center justify-center gap-2.5 rounded-[3px] border px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-all',
        completed
          ? 'border-nominal/60 bg-nominal/10 text-nominal shadow-[0_0_16px_rgb(0_255_136/0.25)]'
          : 'border-cyan/40 bg-cyan/5 text-cyan/80 hover:border-cyan/70 hover:bg-cyan/10 hover:text-cyan hover:shadow-[0_0_16px_rgb(0_240_255/0.3)]'
      )}
    >
      {completed ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Circle className="size-4" aria-hidden="true" />
      )}
      {completed ? 'Section mastered' : 'Mark section mastered'}
    </button>
  )
}
