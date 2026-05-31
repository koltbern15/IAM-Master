'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { useSound } from '@/hooks/use-sound'
import { recordQuizAttempt } from '@/lib/progress'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
}

interface QuizProps {
  question: QuizQuestion
}

export function Quiz({ question }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const tick = useSound('tick')
  const chime = useSound('chime')
  const toneDown = useSound('tone-down')

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    const correct = i === question.correctIndex
    if (correct) chime.play()
    else toneDown.play()
    tick.play()
    recordQuizAttempt(question.id, {
      at: new Date().toISOString(),
      score: correct ? 1 : 0,
      answers: [i]
    })
  }

  const answered = selected !== null
  const answeredCorrectly = answered && selected === question.correctIndex

  return (
    <HoloPanel label="QUIZ" className="my-6">
      <p className="mb-4 text-foreground">{question.prompt}</p>
      <div className="grid gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === question.correctIndex
          const showAsRight = selected !== null && isCorrect
          const showAsWrong = isSelected && !isCorrect
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={cn(
                'w-full rounded-[2px] border px-4 py-2 text-left font-mono text-sm uppercase tracking-[0.05em] transition-all',
                selected === null && 'border-panel-border bg-panel-bg hover:bg-cyan/10 hover:border-cyan/50',
                showAsRight && 'border-nominal/70 bg-nominal/12 text-nominal shadow-[0_0_12px_rgb(0_255_136/0.3)]',
                showAsWrong && 'border-threat/70 bg-threat/12 text-threat shadow-[0_0_12px_rgb(255_32_64/0.3)] animate-[jarvis-glitch_400ms_steps(4,end)_1]',
                selected !== null && !isSelected && !isCorrect && 'opacity-50'
              )}
            >
              <span className="mr-3 text-cyan/60" aria-hidden="true">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
              {showAsRight && <span className="sr-only"> (correct answer)</span>}
              {showAsWrong && <span className="sr-only"> (your answer — incorrect)</span>}
              {answered && isSelected && isCorrect && (
                <span className="sr-only"> (your answer)</span>
              )}
            </button>
          )
        })}
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {answered ? (answeredCorrectly ? 'Correct' : 'Incorrect') : ''}
      </div>
      {selected !== null && question.explanation && (
        <div className="mt-4 border-l-2 border-cyan/50 bg-cyan/5 px-4 py-3 font-mono text-xs text-text-muted">
          <span aria-hidden="true">▸ </span>
          {question.explanation}
        </div>
      )}
    </HoloPanel>
  )
}
