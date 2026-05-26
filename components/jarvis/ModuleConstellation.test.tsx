import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModuleConstellation } from './ModuleConstellation'

// Stub matchMedia → prefers-reduced-motion = true so TelemetryValue renders
// its final value immediately and these assertions don't race the rAF loop.
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

describe('ModuleConstellation (SVG fallback)', () => {
  it('renders 12 module nodes', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={14} />)
    const nodes = container.querySelectorAll('[data-jarvis-module-node]')
    expect(nodes).toHaveLength(12)
  })

  it('renders a central mastery percent', () => {
    render(<ModuleConstellation totalMasteryPercent={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('renders a hidden screen-reader-friendly nav with one link per module', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    const a11yNav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(a11yNav).not.toBeNull()
    expect(a11yNav!.querySelectorAll('a').length).toBe(12)
  })

  it('node 04 (PAM) gets the phase-2 color class', () => {
    const { container } = render(<ModuleConstellation totalMasteryPercent={0} />)
    const pamNode = container.querySelector('[data-jarvis-module-node="04-pam"]')
    expect(pamNode?.getAttribute('data-phase')).toBe('2')
  })
})
