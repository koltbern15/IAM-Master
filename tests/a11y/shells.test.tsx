import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ReadShell } from '@/components/layout/ReadShell'
import { HudShell } from '@/components/layout/HudShell'
import { Quiz } from '@/components/content/Quiz'
import { CommandPalette } from '@/components/jarvis/CommandPalette'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/'
}))

// jsdom doesn't implement ResizeObserver; cmdk needs it
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock

// jsdom doesn't implement Element.scrollIntoView; cmdk calls it on selection
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {}
}

expect.extend(toHaveNoViolations)

// Next <Link> (useOptimistic) schedules a passive mount effect that resolves on a
// macrotask, after render returns. Render inside act, then flush a macrotask inside
// act so that deferred update commits within act scope and no "not wrapped in act"
// warning escapes. This does NOT weaken the axe assertion below.
async function renderFlushed(ui: ReactElement): Promise<HTMLElement> {
  let container!: HTMLElement
  await act(async () => {
    ;({ container } = render(ui))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  return container
}

describe('a11y — layout shells + interactive components', () => {
  it('ReadShell has no axe violations', async () => {
    const container = await renderFlushed(<ReadShell><p>content</p></ReadShell>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('HudShell has no axe violations', async () => {
    const container = await renderFlushed(<HudShell events={['EVENT']}><p>content</p></HudShell>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Quiz has no axe violations', async () => {
    const container = await renderFlushed(
      <Quiz question={{ id: 'q', prompt: 'P?', options: ['A', 'B'], correctIndex: 0 }} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('CommandPalette (open) has no axe violations', async () => {
    const container = await renderFlushed(<CommandPalette open onOpenChange={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
