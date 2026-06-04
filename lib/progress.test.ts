import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadState,
  saveState,
  markSectionVisited,
  markSectionCompleted,
  markSectionIncomplete,
  setFlashcardProgress,
  recordQuizAttempt,
  recordStudyActivity,
  resetState,
  STORAGE_KEY,
  CURRENT_VERSION,
  type FlashcardProgress
} from './progress'
import { getActivitySeries } from './home-telemetry'

beforeEach(() => {
  window.localStorage.clear()
})

describe('lib/progress', () => {
  it('returns default state when storage is empty', () => {
    const s = loadState()
    expect(s.version).toBe(CURRENT_VERSION)
    expect(s.progress.sections).toEqual({})
    expect(s.streak.currentDays).toBe(0)
    expect(s.settings.soundEnabled).toBe(false)
  })

  it('persists and reloads state', () => {
    const s = loadState()
    s.settings.soundEnabled = true
    saveState(s)
    const reloaded = loadState()
    expect(reloaded.settings.soundEnabled).toBe(true)
  })

  it('writes to the expected storage key', () => {
    saveState(loadState())
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('markSectionVisited stores a timestamp', () => {
    markSectionVisited('02-protocols/01-kerberos')
    const s = loadState()
    expect(s.progress.sections['02-protocols/01-kerberos'].visitedAt).toBeTruthy()
  })

  it('markSectionCompleted stores a completion timestamp', () => {
    markSectionCompleted('02-protocols/01-kerberos')
    const s = loadState()
    expect(s.progress.sections['02-protocols/01-kerberos'].completedAt).toBeTruthy()
  })

  it('recordQuizAttempt appends to attempts and updates bestScore', () => {
    recordQuizAttempt('quiz-1', { at: '2026-05-25T10:00:00Z', score: 0.7, answers: [0, 1, 2] })
    recordQuizAttempt('quiz-1', { at: '2026-05-25T11:00:00Z', score: 0.9, answers: [1, 1, 2] })
    const s = loadState()
    expect(s.quizzes['quiz-1'].attempts).toHaveLength(2)
    expect(s.quizzes['quiz-1'].bestScore).toBe(0.9)
  })

  it('resetState clears storage', () => {
    saveState(loadState())
    resetState()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('emits state-change event on save', () => {
    let called = 0
    const handler = () => { called++ }
    window.addEventListener('iam-mastery:state-change', handler)
    saveState(loadState())
    window.removeEventListener('iam-mastery:state-change', handler)
    expect(called).toBe(1)
  })

  it('migrates unknown version to current default by overwriting', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, foo: 'bar' }))
    const s = loadState()
    expect(s.version).toBe(CURRENT_VERSION)
    expect(s.progress.sections).toEqual({})
  })

  it('study streak: first visit sets currentDays=1 and lastStudyDate; same-day repeat keeps 1', () => {
    expect(loadState().streak.currentDays).toBe(0)

    markSectionVisited('02-protocols/01-kerberos')
    const after = loadState()
    expect(after.streak.currentDays).toBe(1)
    const today = new Date().toISOString().slice(0, 10)
    expect(after.streak.lastStudyDate).toBe(today)
    expect(after.streak.longestDays).toBe(1)

    // Visiting again the same calendar day must NOT advance the streak.
    markSectionVisited('02-protocols/02-saml')
    const again = loadState()
    expect(again.streak.currentDays).toBe(1)
    expect(again.streak.lastStudyDate).toBe(today)
  })

  it('setFlashcardProgress persists leitnerBox/nextDue and is reloadable', () => {
    const progress: FlashcardProgress = {
      leitnerBox: 3,
      lastReviewed: '2026-05-31T12:00:00.000Z',
      nextDue: '2026-06-04T12:00:00.000Z',
      correctStreak: 2
    }
    setFlashcardProgress('card-abc', progress)

    const reloaded = loadState()
    expect(reloaded.flashcards['card-abc']).toEqual(progress)
    expect(reloaded.flashcards['card-abc'].leitnerBox).toBe(3)
    expect(reloaded.flashcards['card-abc'].nextDue).toBe('2026-06-04T12:00:00.000Z')
  })

  it('markSectionIncomplete clears completedAt but keeps visitedAt', () => {
    const key = '03-microsoft-identity/02-entra-id'
    markSectionCompleted(key)
    const completed = loadState().progress.sections[key]
    expect(completed.completedAt).toBeTruthy()
    expect(completed.visitedAt).toBeTruthy()

    markSectionIncomplete(key)
    const reverted = loadState().progress.sections[key]
    expect(reverted.completedAt).toBeUndefined()
    // visit history is preserved.
    expect(reverted.visitedAt).toBe(completed.visitedAt)
  })

  it('a single markSectionVisited increments today\'s activity count to 1', () => {
    markSectionVisited('02-protocols/01-kerberos')
    const today = new Date().toISOString().slice(0, 10)
    const activity = loadState().activity ?? {}
    expect(activity[today]).toBe(1)
  })

  it('getActivitySeries returns length 14 whose last element reflects today\'s count', () => {
    markSectionVisited('02-protocols/01-kerberos')
    const series = getActivitySeries(loadState())
    expect(series).toHaveLength(14)
    // Last element is today (the series runs oldest → newest).
    expect(series[series.length - 1]).toBe(1)
  })
})

describe('lib/progress — multi-day streak transitions', () => {
  // Pin "today" so applyStudyActivity's today/yesterday math is deterministic.
  const TODAY = '2026-06-03'
  const YESTERDAY = '2026-06-02'
  const THREE_DAYS_AGO = '2026-05-31'

  /** Seeds a stored state whose streak claims a given lastStudyDate/counts. */
  function seedStreak(lastStudyDate: string, currentDays: number, longestDays: number) {
    const s = loadState()
    s.streak.lastStudyDate = lastStudyDate
    s.streak.currentDays = currentDays
    s.streak.longestDays = longestDays
    saveState(s)
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(`${TODAY}T08:00:00.000Z`))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('advances currentDays to 2 when the last study day was yesterday (consecutive)', () => {
    seedStreak(YESTERDAY, 1, 1)

    recordStudyActivity()

    const after = loadState().streak
    expect(after.currentDays).toBe(2)
    expect(after.lastStudyDate).toBe(TODAY)
    // longestDays follows the new high-water mark.
    expect(after.longestDays).toBe(2)
  })

  it('resets currentDays to 1 when there is a multi-day gap (3+ days ago)', () => {
    // Seed a prior streak of 5 with a 3-day gap; the gap must reset the count.
    seedStreak(THREE_DAYS_AGO, 5, 5)

    recordStudyActivity()

    const after = loadState().streak
    expect(after.currentDays).toBe(1)
    expect(after.lastStudyDate).toBe(TODAY)
    // longestDays preserves the previous max even though the current run reset.
    expect(after.longestDays).toBe(5)
  })

  it('markSectionVisited advances a yesterday streak the same way recordStudyActivity does', () => {
    seedStreak(YESTERDAY, 3, 3)

    markSectionVisited('02-protocols/01-kerberos')

    const after = loadState().streak
    expect(after.currentDays).toBe(4)
    expect(after.lastStudyDate).toBe(TODAY)
    expect(after.longestDays).toBe(4)
  })

  it('longestDays tracks the max and is not lowered by a gap-driven reset to 1', () => {
    seedStreak(THREE_DAYS_AGO, 2, 9)

    markSectionVisited('02-protocols/02-saml')

    const after = loadState().streak
    expect(after.currentDays).toBe(1)
    // A reset current run must never pull longestDays below its historical peak.
    expect(after.longestDays).toBe(9)
  })

  it('a second touch on the same calendar day does not advance the streak again', () => {
    seedStreak(YESTERDAY, 1, 1)

    recordStudyActivity() // yesterday → today: currentDays becomes 2
    expect(loadState().streak.currentDays).toBe(2)

    recordStudyActivity() // same day: no change
    const after = loadState().streak
    expect(after.currentDays).toBe(2)
    expect(after.longestDays).toBe(2)
  })
})
