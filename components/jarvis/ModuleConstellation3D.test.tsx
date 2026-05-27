import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'

// Stub R3F + drei to no-op components — jsdom can't paint WebGL, and we
// only care here that the surrounding DOM (mastery overlay + hidden a11y
// nav) renders correctly outside the canvas.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas-stub">{children}</div>,
  useFrame: () => {}
}))
vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
  Line: () => null,
  Points: () => null,
  PointMaterial: () => null,
  Text: () => null
}))
// Stub next/navigation since useRouter throws without an App Router context.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() })
}))

import { ModuleConstellation3D } from './ModuleConstellation3D'

afterEach(() => {
  document.body.style.cursor = ''
})

describe('ModuleConstellation3D', () => {
  it('renders the mastery % overlay outside the canvas', () => {
    const { container, getByTestId } = render(<ModuleConstellation3D totalMasteryPercent={42} />)
    const overlay = container.querySelector('.pointer-events-none.absolute.inset-0')
    expect(overlay).not.toBeNull()
    // Overlay should be a SIBLING of the canvas, not a child — verifying the
    // 9cb015f hoist pattern (mastery % rendered as plain HTML, not via drei <Html>).
    const canvas = getByTestId('canvas-stub')
    expect(canvas.contains(overlay!)).toBe(false)
    expect(container.textContent).toContain('CURRICULUM MASTERY')
  })

  it('exposes the hidden a11y nav with 12 module links', () => {
    const { container } = render(<ModuleConstellation3D totalMasteryPercent={0} />)
    const nav = container.querySelector('nav[aria-label="Module navigation"]')
    expect(nav).not.toBeNull()
    expect(nav!.querySelectorAll('a').length).toBe(12)
  })
})
