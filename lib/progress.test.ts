import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  markSectionVisited,
  markSectionCompleted,
  recordQuizAttempt,
  resetState,
  STORAGE_KEY,
  CURRENT_VERSION
} from './progress'

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
})
