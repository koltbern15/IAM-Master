import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ModuleConstellation wrapper', () => {
  describe('under prefers-reduced-motion: reduce', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: q.includes('reduce'),
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
    })

    it('renders the SVG fallback (12 nodes, no <canvas>)', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
      expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
      expect(container.querySelector('canvas')).toBeNull()
    })

    it('hidden a11y nav with 12 module links is present in the SVG path', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={42} />)
      const nav = container.querySelector('nav[aria-label="Module navigation"]')
      expect(nav).not.toBeNull()
      expect(nav!.querySelectorAll('a').length).toBe(12)
    })
  })

  describe('when WebGL is unavailable', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null as never)
    })

    it('renders the SVG fallback (no canvas)', () => {
      const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
      expect(container.querySelector('canvas')).toBeNull()
      expect(container.querySelectorAll('[data-jarvis-module-node]')).toHaveLength(12)
    })
  })
})
