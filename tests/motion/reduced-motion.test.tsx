import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleField } from '@/components/jarvis/ParticleField'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

describe('reduced-motion fallbacks', () => {
  it('<ParticleField> renders nothing when reduced-motion is set', () => {
    const { container } = render(<ParticleField />)
    expect(container.querySelector('canvas')).toBeNull()
  })
})
