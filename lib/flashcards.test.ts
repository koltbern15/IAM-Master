import { describe, it, expect } from 'vitest'
import {
  promoteCard,
  demoteCard,
  intervalDaysForBox,
  computeNextDue,
  isDue,
  reviewQueue,
  initialCardState
} from './flashcards'
import type { FlashcardProgress } from './progress'

const FROZEN = '2026-05-25T12:00:00Z'

describe('lib/flashcards (Leitner)', () => {
  it('initialCardState starts in box 1', () => {
    const c = initialCardState(FROZEN)
    expect(c.leitnerBox).toBe(1)
    expect(c.correctStreak).toBe(0)
    expect(c.lastReviewed).toBe(FROZEN)
  })

  it('intervalDaysForBox returns Leitner schedule', () => {
    expect(intervalDaysForBox(1)).toBe(1)
    expect(intervalDaysForBox(2)).toBe(3)
    expect(intervalDaysForBox(3)).toBe(7)
    expect(intervalDaysForBox(4)).toBe(14)
    expect(intervalDaysForBox(5)).toBe(30)
  })

  it('promoteCard moves up one box (cap at 5) and increments streak', () => {
    const c = initialCardState(FROZEN)
    const promoted = promoteCard(c, FROZEN)
    expect(promoted.leitnerBox).toBe(2)
    expect(promoted.correctStreak).toBe(1)

    const capped = promoteCard({ ...promoted, leitnerBox: 5 }, FROZEN)
    expect(capped.leitnerBox).toBe(5)
  })

  it('demoteCard resets to box 1 and zeroes streak', () => {
    const c: FlashcardProgress = {
      leitnerBox: 4,
      lastReviewed: FROZEN,
      nextDue: FROZEN,
      correctStreak: 3
    }
    const demoted = demoteCard(c, FROZEN)
    expect(demoted.leitnerBox).toBe(1)
    expect(demoted.correctStreak).toBe(0)
  })

  it('computeNextDue uses the box interval', () => {
    const due = computeNextDue(2, '2026-05-25T12:00:00Z')
    // box 2 = 3 days
    expect(due).toBe('2026-05-28T12:00:00.000Z')
  })

  it('isDue returns true when nextDue <= now', () => {
    expect(isDue({ ...initialCardState(FROZEN), nextDue: '2026-05-25T11:00:00Z' }, FROZEN)).toBe(true)
    expect(isDue({ ...initialCardState(FROZEN), nextDue: '2026-05-26T12:00:00Z' }, FROZEN)).toBe(false)
  })

  it('reviewQueue returns only due cards, sorted by oldest first', () => {
    const cards: Record<string, FlashcardProgress> = {
      a: { leitnerBox: 1, lastReviewed: FROZEN, nextDue: '2026-05-25T08:00:00Z', correctStreak: 0 },
      b: { leitnerBox: 2, lastReviewed: FROZEN, nextDue: '2026-05-26T08:00:00Z', correctStreak: 0 },
      c: { leitnerBox: 1, lastReviewed: FROZEN, nextDue: '2026-05-24T08:00:00Z', correctStreak: 0 }
    }
    const queue = reviewQueue(cards, FROZEN)
    expect(queue).toEqual(['c', 'a'])
  })
})
