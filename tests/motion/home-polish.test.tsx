import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('reduced-motion -- home polish wave', () => {
  it('home constellation renders the 12 SVG module nodes (no <canvas>)', () => {
    const { container } = render(<ModuleConstellationSVG totalMasteryPercent={50} />)
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
  })

  it('SVG constellation exposes the hidden a11y nav with 12 links', () => {
    const { container } = render(<ModuleConstellationSVG totalMasteryPercent={50} />)
    const nav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(nav).not.toBeNull()
    expect(nav!.querySelectorAll('a').length).toBe(12)
  })
})
