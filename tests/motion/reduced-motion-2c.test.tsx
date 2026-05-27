import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, renderHook } from '@testing-library/react'
import { FlowDiagram, type FlowNode, type FlowStep } from '@/components/diagrams/FlowDiagram'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const NODES: FlowNode[] = [
  { id: 'a', x: 80, y: 100, label: 'A' },
  { id: 'b', x: 480, y: 100, label: 'B' }
]
const STEPS: FlowStep[] = [{ id: 's', from: 'a', to: 'b', label: 'STEP', detail: 'd' }]

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('reduced-motion -- Plan 2C surfaces', () => {
  it('FlowDiagram emits no motion tokens under reduced-motion', () => {
    const { container } = render(
      <FlowDiagram title="t" width={600} height={300} nodes={NODES} steps={STEPS} />
    )
    expect(container.querySelectorAll('[data-jarvis-token]')).toHaveLength(0)
  })

  it('TutorPanel renders without the slide-in animation class under reduced-motion', () => {
    const { container } = render(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    const outer = container.firstChild as HTMLElement
    expect(outer.className).not.toMatch(/jarvis-slide-in-right/)
  })

  it('usePanelGlitch is a no-op under reduced-motion', () => {
    vi.useFakeTimers()
    const root = document.createElement('div')
    root.innerHTML = `<div data-jarvis-panel="1"></div>`
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 50, maxMs: 50 }))
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
    vi.useRealTimers()
  })
})
