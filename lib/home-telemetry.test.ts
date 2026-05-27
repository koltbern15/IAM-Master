import { describe, it, expect } from 'vitest'
import { computeHomeTelemetry } from './home-telemetry'
import { getAllModules } from './content'
import type { StoredState } from './progress'

function baseState(): StoredState {
  return {
    version: 1,
    progress: { sections: {}, modules: {} },
    quizzes: {},
    flashcards: {},
    streak: { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: new Date().toISOString() },
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
}

describe('computeHomeTelemetry', () => {
  const modules = getAllModules()

  it('returns zero/start-fallback for empty state', () => {
    const t = computeHomeTelemetry(baseState(), modules)
    expect(t.streakDays).toBe(0)
    expect(t.cardsDue).toBe(0)
    expect(t.resume.href).toBe('/modules/01-foundations/01-identity-crisis')
    expect(t.resume.title).toMatch(/start|01-identity-crisis/i)
    expect(t.resume.crumb).toBe('01-foundations')
  })

  it('passes through streak.currentDays directly', () => {
    const s = baseState()
    s.streak.currentDays = 7
    expect(computeHomeTelemetry(s, modules).streakDays).toBe(7)
  })

  it('returns the most-recently-visited section as resume', () => {
    const s = baseState()
    s.progress.sections['02-protocols/01-kerberos'] = {
      visitedAt: '2026-05-20T10:00:00.000Z',
      timeSpentSeconds: 60
    }
    s.progress.sections['03-microsoft-identity/02-entra-id'] = {
      visitedAt: '2026-05-26T22:00:00.000Z',
      timeSpentSeconds: 120
    }
    s.progress.sections['01-foundations/02-lexicon'] = {
      visitedAt: '2026-05-15T08:00:00.000Z',
      timeSpentSeconds: 30
    }
    const t = computeHomeTelemetry(s, modules)
    expect(t.resume.href).toBe('/modules/03-microsoft-identity/02-entra-id')
    expect(t.resume.crumb).toBe('03-microsoft-identity')
  })

  it('counts only flashcards whose nextDue is at or before now', () => {
    const s = baseState()
    const past = new Date(Date.now() - 60_000).toISOString()
    const future = new Date(Date.now() + 60 * 60_000).toISOString()
    s.flashcards = {
      a: { leitnerBox: 1, lastReviewed: past, nextDue: past, correctStreak: 0 },
      b: { leitnerBox: 2, lastReviewed: past, nextDue: past, correctStreak: 1 },
      c: { leitnerBox: 3, lastReviewed: past, nextDue: future, correctStreak: 2 }
    }
    expect(computeHomeTelemetry(s, modules).cardsDue).toBe(2)
  })

  it('falls back to first-section href when the visited section key cannot be resolved to a known module', () => {
    const s = baseState()
    s.progress.sections['99-unknown/01-ghost'] = {
      visitedAt: new Date().toISOString(),
      timeSpentSeconds: 5
    }
    const t = computeHomeTelemetry(s, modules)
    expect(t.resume.href).toBe('/modules/01-foundations/01-identity-crisis')
  })
})
