import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleField } from './ParticleField'

describe('ParticleField', () => {
  it('renders a canvas element with pointer-events:none', () => {
    const { container } = render(<ParticleField />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas?.className).toContain('pointer-events-none')
  })

  it('sets aria-hidden', () => {
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not render canvas when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')).toBeNull()
    vi.unstubAllGlobals()
  })
})
