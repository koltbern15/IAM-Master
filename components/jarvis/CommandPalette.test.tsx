import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() })
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

describe('CommandPalette', () => {
  it('does not render the dialog when closed', () => {
    render(<CommandPalette open={false} onOpenChange={() => {}} />)
    expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument()
  })

  it('renders the dialog + input when open', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument()
  })

  it('lists at least one module action when open with empty query', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    // "IAM Foundations" or any module title from the seeded modules.json
    // Module + its sections both contain the title text, so use getAllByText
    expect(screen.getAllByText(/IAM Foundations/i).length).toBeGreaterThan(0)
  })

  it('filters results as user types', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    const input = screen.getByPlaceholderText(/type a command/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'powershell' } })
    expect(screen.getAllByText(/PowerShell for IAM/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Microsoft Identity Platform/i)).not.toBeInTheDocument()
  })
})
