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
    render(<FlowDiagram title="TEST FLOW" width={600} height={480} nodes={NODES} steps={STEPS} />)
    expect(screen.getByRole('img', { name: /TEST FLOW/i })).toBeInTheDocument()
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
    expect(container.querySelector('filter#jarvis-blur-depth')).not.toBeNull()
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
