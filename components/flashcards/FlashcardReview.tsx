'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeckCard } from '@/lib/content-index'
import { loadState, setFlashcardProgress } from '@/lib/progress'
import type { FlashcardProgress } from '@/lib/progress'
import { initialCardState, promoteCard, demoteCard, isDue } from '@/lib/flashcards'
import { useSound } from '@/hooks/use-sound'

interface FlashcardReviewProps {
  deck: DeckCard[]
  title: string
  /** Back-link target for "review another deck". */
  backHref?: string
}

/**
 * Spaced-repetition review surface. Builds a due-card queue once on mount
 * (new cards count as due), then runs flip → grade → promote/demote, persisting
 * each result through the Leitner engine in lib/flashcards.ts.
 */
export function FlashcardReview({ deck, title, backHref = '/flashcards' }: FlashcardReviewProps) {
  const [queue, setQueue] = useState<DeckCard[]>([])
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const tick = useSound('tick')
  const chime = useSound('chime')
  const toneDown = useSound('tone-down')

  // Build the due queue once from persisted state on mount.
  useEffect(() => {
    const state = loadState()
    const now = new Date().toISOString()
    const due = deck.filter((c) => {
      const p = state.flashcards[c.id]
      return !p || isDue(p, now)
    })
    setQueue(due)
    setPos(0)
    setFlipped(false)
    setReviewedCount(0)
  }, [deck])

  const current = queue[pos]
  const done = queue.length > 0 && pos >= queue.length
  const total = deck.length

  function flip() {
    if (!current) return
    setFlipped((f) => !f)
    tick.play()
  }

  function grade(correct: boolean) {
    if (!current) return
    const state = loadState()
    const existing: FlashcardProgress = state.flashcards[current.id] ?? initialCardState(new Date().toISOString())
    const now = new Date().toISOString()
    const next = correct ? promoteCard(existing, now) : demoteCard(existing, now)
    setFlashcardProgress(current.id, next)
    if (correct) chime.play()
    else toneDown.play()
    setReviewedCount((n) => n + 1)
    setFlipped(false)
    setPos((p) => p + 1)
  }

  // Keyboard: space flips; 1 = missed, 2 = got it (when revealed).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === ' ') {
        e.preventDefault()
        flip()
      } else if (flipped && (e.key === '1' || e.key === '2')) {
        e.preventDefault()
        grade(e.key === '2')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, flipped])

  const header = (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">▸ FLASHCARD REVIEW</div>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.04em] text-cyan glow-cyan">
          {title}
        </h1>
      </div>
      <div className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
        <div>
          DECK <span className="tabular-nums text-cyan/80">{total}</span>
        </div>
        <div>
          DUE <span className="tabular-nums text-cyan/80">{queue.length}</span>
        </div>
      </div>
    </div>
  )

  // Empty deck (no cards authored for this scope).
  if (total === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState message="No flashcards in this deck yet." backHref={backHref} />
      </div>
    )
  }

  // Nothing due, or finished the session.
  if (queue.length === 0 || done) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-[3px] border border-nominal/40 bg-nominal/8 px-6 py-8 text-center">
          <Check className="mx-auto size-8 text-nominal" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-nominal">
            {reviewedCount > 0 ? `Reviewed ${reviewedCount} card${reviewedCount === 1 ? '' : 's'}.` : 'All caught up.'}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Nothing else due right now — spaced repetition will resurface these later.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href={backHref}
              className="rounded-[3px] border border-cyan/40 bg-cyan/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan/80 transition-colors hover:border-cyan/70 hover:text-cyan"
            >
              ▸ REVIEW ANOTHER DECK
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const progressPct = Math.round((reviewedCount / queue.length) * 100)

  return (
    <div className="space-y-6">
      {header}

      {/* progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-panel-border">
        <div
          className="h-full bg-cyan shadow-[0_0_8px_rgb(0_240_255/0.6)] transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
        CARD {Math.min(pos + 1, queue.length)} / {queue.length}
        <span className="ml-3 text-cyan/50">{current.sectionTitle}</span>
      </div>

      {/* the card */}
      <button
        type="button"
        onClick={flip}
        aria-pressed={flipped}
        className={cn(
          'flex min-h-[220px] w-full flex-col items-center justify-center rounded-[4px] border px-8 py-10 text-center transition-all backdrop-blur-md',
          flipped
            ? 'border-nominal/50 bg-nominal/5 shadow-[0_0_22px_rgb(0_255_136/0.18)]'
            : 'border-cyan/40 bg-cyan/4 shadow-[0_0_22px_rgb(0_240_255/0.16)]'
        )}
      >
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan/60">
          ▸ {flipped ? 'ANSWER' : 'QUESTION'}
        </div>
        <div className="font-display text-xl leading-relaxed text-foreground">
          {flipped ? current.back : current.front}
        </div>
        {!flipped && (
          <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-dim">
            ▸ CLICK OR SPACE TO REVEAL
          </div>
        )}
      </button>

      {/* grade controls */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => grade(false)}
            className="flex items-center justify-center gap-2 rounded-[3px] border border-threat/50 bg-threat/8 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-threat transition-all hover:border-threat/80 hover:bg-threat/15"
          >
            <X className="size-4" aria-hidden="true" /> Missed <span className="text-threat/50">[1]</span>
          </button>
          <button
            type="button"
            onClick={() => grade(true)}
            className="flex items-center justify-center gap-2 rounded-[3px] border border-nominal/50 bg-nominal/8 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-nominal transition-all hover:border-nominal/80 hover:bg-nominal/15"
          >
            <Check className="size-4" aria-hidden="true" /> Got it <span className="text-nominal/50">[2]</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={flip}
          className="flex w-full items-center justify-center gap-2 rounded-[3px] border border-cyan/40 bg-cyan/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-cyan/80 transition-all hover:border-cyan/70 hover:text-cyan"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Reveal answer
        </button>
      )}
    </div>
  )
}

function EmptyState({ message, backHref }: { message: string; backHref: string }) {
  return (
    <div className="rounded-[3px] border border-panel-border bg-panel-bg px-6 py-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">{message}</p>
      <Link
        href={backHref}
        className="mt-4 inline-block rounded-[3px] border border-cyan/40 bg-cyan/5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan/80 transition-colors hover:border-cyan/70 hover:text-cyan"
      >
        ▸ BACK TO FLASHCARDS
      </Link>
    </div>
  )
}
