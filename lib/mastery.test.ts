import { describe, it, expect, beforeEach } from 'vitest'
import { computeMastery } from './mastery'
import { loadState, markSectionCompleted } from './progress'

beforeEach(() => window.localStorage.clear())

describe('computeMastery', () => {
  it('returns 0% when no sections completed', () => {
    const m = computeMastery(loadState())
    expect(m.totalPercent).toBe(0)
  })

  it('reflects completed sections', () => {
    markSectionCompleted('01-foundations/01-identity-crisis')
    const m = computeMastery(loadState())
    expect(m.totalPercent).toBeGreaterThan(0)
    expect(m.completedSections).toBe(1)
  })

  it('returns phase counts', () => {
    const m = computeMastery(loadState())
    expect(m.phaseTotals[1]).toBeGreaterThan(0)
    expect(m.phaseTotals[2]).toBeGreaterThanOrEqual(0)
    expect(m.phaseTotals[3]).toBeGreaterThanOrEqual(0)
  })
})
