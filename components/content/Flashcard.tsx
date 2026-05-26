'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSound } from '@/hooks/use-sound'

interface FlashcardProps {
  front: string
  back: string
}

export function Flashcard({ front, back }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)
  const tick = useSound('tick')

  function toggle() {
    setFlipped((f) => !f)
    tick.play()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
      aria-pressed={flipped}
      className={cn(
        'group my-4 w-full rounded-[3px] border border-cyan/40 bg-cyan/4 px-6 py-5 text-left transition-all backdrop-blur-md',
        'hover:border-cyan/70 hover:shadow-[0_0_18px_rgb(0_240_255/0.4)]',
        flipped ? 'border-nominal/50' : ''
      )}
    >
      <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/60">
        ▸ FLASHCARD {flipped ? '// ANSWER' : '// QUESTION'}
      </div>
      <div className="font-display text-lg text-foreground">{flipped ? back : front}</div>
      <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-text-dim group-hover:text-cyan/70">
        ▸ {flipped ? 'CLICK TO RETURN' : 'CLICK OR SPACE TO REVEAL'}
      </div>
    </button>
  )
}
