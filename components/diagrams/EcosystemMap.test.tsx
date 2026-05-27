import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EcosystemMap } from './EcosystemMap'

// Helper: mock matchMedia to control prefers-reduced-motion
function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

describe('EcosystemMap', () => {
  beforeEach(() => {
    // Default: motion enabled (no reduced-motion preference)
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders core ecosystem nodes', () => {
    render(<EcosystemMap />)
    expect(screen.getByText(/Entra ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Okta/i)).toBeInTheDocument()
    expect(screen.getByText(/SailPoint/i)).toBeInTheDocument()
    expect(screen.getByText(/CyberArk/i)).toBeInTheDocument()
  })

  it('highlights node connections when clicked', () => {
    const { container } = render(<EcosystemMap />)
    fireEvent.click(screen.getByText(/Entra ID/i))
    expect(container.querySelectorAll('[data-jarvis-edge-active="true"]').length).toBeGreaterThan(0)
  })

  it('zoom-in button changes the stage transform', () => {
    const { container } = render(<EcosystemMap />)
    const stage = container.querySelector('[data-jarvis-ecosystem-stage]') as HTMLElement
    const before = stage.style.transform
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }))
    expect(stage.style.transform).not.toBe(before)
  })

  it('renders one [data-jarvis-token] per edge when motion is enabled', async () => {
    mockMatchMedia(false)
    const { container } = render(<EcosystemMap />)
    // motionEnabled is set via useEffect — wait for it
    await vi.waitFor(() => {
      const tokens = container.querySelectorAll('[data-jarvis-token]')
      expect(tokens.length).toBe(16) // EDGES.length = 16
    })
  })

  it('emits zero tokens under prefers-reduced-motion: reduce', async () => {
    mockMatchMedia(true)
    const { container } = render(<EcosystemMap />)
    await vi.waitFor(() => {
      const tokens = container.querySelectorAll('[data-jarvis-token]')
      expect(tokens.length).toBe(0)
    })
  })

  it('click on a node opens its detail panel showing the node detail text', () => {
    render(<EcosystemMap />)
    // Before click — no panel
    expect(screen.queryByText(/cloud identity provider/i)).not.toBeInTheDocument()
    // Click the Entra ID node label (SVG text element)
    fireEvent.click(screen.getByText(/Entra ID/i))
    // Detail panel should now show the detail copy
    expect(screen.getByText(/cloud identity provider/i)).toBeInTheDocument()
    // Close button should be present
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('exposes each node as a keyboard-focusable button with an accessible name', () => {
    render(<EcosystemMap />)
    expect(screen.getByRole('button', { name: 'Entra ID' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CyberArk' })).toBeInTheDocument()
  })

  it('toggles node detail via Enter key', () => {
    render(<EcosystemMap />)
    const node = screen.getByRole('button', { name: 'Entra ID' })
    fireEvent.keyDown(node, { key: 'Enter' })
    expect(screen.getByText(/cloud identity provider/i)).toBeInTheDocument()
  })
})
