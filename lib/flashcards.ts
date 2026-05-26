import type { FlashcardProgress } from './progress'

const LEITNER_DAYS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
}

export function intervalDaysForBox(box: 1 | 2 | 3 | 4 | 5): number {
  return LEITNER_DAYS[box]
}

export function initialCardState(now: string): FlashcardProgress {
  return {
    leitnerBox: 1,
    lastReviewed: now,
    nextDue: computeNextDue(1, now),
    correctStreak: 0
  }
}

export function computeNextDue(box: 1 | 2 | 3 | 4 | 5, now: string): string {
  const ms = Date.parse(now)
  const days = LEITNER_DAYS[box]
  return new Date(ms + days * 24 * 60 * 60 * 1000).toISOString()
}

export function promoteCard(card: FlashcardProgress, now: string): FlashcardProgress {
  const nextBox = (Math.min(card.leitnerBox + 1, 5) as 1 | 2 | 3 | 4 | 5)
  return {
    leitnerBox: nextBox,
    lastReviewed: now,
    nextDue: computeNextDue(nextBox, now),
    correctStreak: card.correctStreak + 1
  }
}

export function demoteCard(_card: FlashcardProgress, now: string): FlashcardProgress {
  return {
    leitnerBox: 1,
    lastReviewed: now,
    nextDue: computeNextDue(1, now),
    correctStreak: 0
  }
}

export function isDue(card: FlashcardProgress, now: string): boolean {
  return Date.parse(card.nextDue) <= Date.parse(now)
}

export function reviewQueue(cards: Record<string, FlashcardProgress>, now: string): string[] {
  const due = Object.entries(cards).filter(([, c]) => isDue(c, now))
  due.sort(([, a], [, b]) => Date.parse(a.nextDue) - Date.parse(b.nextDue))
  return due.map(([id]) => id)
}
