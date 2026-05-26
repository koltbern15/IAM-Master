import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ModuleConstellation wrapper', () => {
  it('renders the SVG fallback when prefers-reduced-motion is set', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    // SVG fallback has 12 anchor nodes
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    // 3D path mounts a <canvas>; fallback path should NOT
    expect(container.querySelector('canvas')).toBeNull()
  })
})
