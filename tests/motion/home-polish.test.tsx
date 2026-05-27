import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('reduced-motion -- home polish wave', () => {
  it('ModuleConstellation wrapper picks the SVG fallback (no <canvas>)', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={50} />)
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
  })

  it('SVG fallback exposes the hidden a11y nav with 12 links', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={50} />)
    const nav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(nav).not.toBeNull()
    expect(nav!.querySelectorAll('a').length).toBe(12)
  })
})
