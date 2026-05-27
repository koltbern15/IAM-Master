import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { HudMiniPanels } from './HudMiniPanels'

const STORAGE_KEY = 'iam-mastery:v1'

function seedState(patch: Record<string, unknown>) {
  const base = {
    version: 1,
    progress: { sections: (patch.sections as unknown) ?? {}, modules: {} },
    quizzes: {},
    flashcards: (patch.flashcards as unknown) ?? {},
    streak: (patch.streak as unknown) ?? { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: new Date().toISOString() },
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
}

beforeEach(() => {
  window.localStorage.clear()
  // Force TelemetryValue's count-up rAF animation to skip so the displayed
  // value equals the prop value synchronously. The animation itself is
  // verified in TelemetryValue.test.tsx; here we only care about wiring +
  // nav targets + live-state reflection.
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null
  }))
})

afterEach(() => {
  window.localStorage.clear()
  vi.unstubAllGlobals()
})

describe('HudMiniPanels', () => {
  it('renders the three panel labels (STREAK / CARDS DUE / RESUME)', () => {
    render(<HudMiniPanels />)
    // HoloPanel renders the label as `▸ STREAK` etc., so match the substring.
    expect(screen.getByText(/STREAK/)).toBeInTheDocument()
    expect(screen.getByText(/CARDS DUE/)).toBeInTheDocument()
    expect(screen.getByText(/RESUME/)).toBeInTheDocument()
  })

  it('each panel is a navigable link to its natural target', () => {
    seedState({ streak: { currentDays: 4, lastStudyDate: '2026-05-27', longestDays: 4 } })
    render(<HudMiniPanels />)
    const streak = screen.getByRole('link', { name: /streak/i })
    const cards = screen.getByRole('link', { name: /cards due/i })
    const resume = screen.getByRole('link', { name: /resume/i })
    expect(streak.getAttribute('href')).toBe('/progress')
    expect(cards.getAttribute('href')).toBe('/flashcards')
    expect(resume.getAttribute('href')).toMatch(/^\/modules\//)
  })

  it('reflects iam-mastery:state-change updates without unmount', () => {
    render(<HudMiniPanels />)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    act(() => {
      seedState({ streak: { currentDays: 9, lastStudyDate: '2026-05-27', longestDays: 9 } })
      window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
    })
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
