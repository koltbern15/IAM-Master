import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleField } from '@/components/jarvis/ParticleField'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'

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

  it('<ModuleConstellationSVG> renders 12 nodes and no canvas under reduced-motion', () => {
    const { container } = render(<ModuleConstellationSVG totalMasteryPercent={0} />)
    expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    expect(container.querySelector('canvas')).toBeNull()
  })
})
