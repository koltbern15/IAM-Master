import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'client', x: 80, y: 240, label: 'CLIENT' },
  { id: 'kdc', x: 460, y: 240, label: 'KDC' }
]

const STEPS: FlowStep[] = [
  { id: 's1', from: 'client', to: 'kdc', label: 'AS-REQ', detail: 'Pre-auth payload.' },
  { id: 's2', from: 'kdc', to: 'client', label: 'AS-REP', detail: 'TGT issued.' }
]

describe('FlowDiagram', () => {
  it('renders an svg with each node and step label', () => {
    const { container } = render(<FlowDiagram title="TEST FLOW" width={600} height={480} nodes={NODES} steps={STEPS} />)
    // role="img" was removed (Issue 3) — look up by aria-label attribute instead
    expect(container.querySelector('svg[aria-label="TEST FLOW"]')).not.toBeNull()
    expect(screen.getByText('CLIENT')).toBeInTheDocument()
    expect(screen.getByText('KDC')).toBeInTheDocument()
    expect(screen.getByText('AS-REQ')).toBeInTheDocument()
    expect(screen.getByText('AS-REP')).toBeInTheDocument()
  })

  it('renders one motion-token <circle data-jarvis-token> per step', () => {
    const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(2)
  })

  it('opens a detail panel when a step is clicked', () => {
    render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(screen.queryByText('Pre-auth payload.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /AS-REQ/i }))
    expect(screen.getByText('Pre-auth payload.')).toBeInTheDocument()
  })

  it('exposes the blur filter stack on the <defs>', () => {
    const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(container.querySelector('filter[id^="jarvis-blur-depth-"]')).not.toBeNull()
  })

  it('does not make steps without detail keyboard-focusable or clickable', () => {
    const noDetailSteps: FlowStep[] = [
      { id: 's1', from: 'client', to: 'kdc', label: 'INFO-ONLY' }
    ]
    render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={noDetailSteps} />)
    expect(screen.queryByRole('button', { name: /INFO-ONLY/i })).not.toBeInTheDocument()
  })

  it('widens the step label rect for long labels so the color band covers full text', () => {
    const longSteps: FlowStep[] = [
      { id: 's1', from: 'client', to: 'kdc', label: 'Pass-Through Validate', detail: 'd' }
    ]
    const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={longSteps} />)
    const rect = container.querySelector('g[role="button"] rect') as SVGRectElement
    expect(rect).not.toBeNull()
    expect(parseFloat(rect.getAttribute('width')!)).toBeGreaterThan(72)
  })

  describe('under prefers-reduced-motion: reduce', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', (q: string) => ({
        matches: q.includes('reduce'),
        addEventListener: () => {},
        removeEventListener: () => {}
      }))
    })
    afterEach(() => vi.unstubAllGlobals())

    it('still renders nodes + steps but emits no motion tokens', () => {
      const { container } = render(<FlowDiagram title="t" width={600} height={480} nodes={NODES} steps={STEPS} />)
      expect(screen.getByText('CLIENT')).toBeInTheDocument()
      expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(0)
    })
  })
})
