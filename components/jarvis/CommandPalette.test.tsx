import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

// Shared push spy hoisted out of the mock factory so navigation can be asserted.
const push = vi.fn()
// Module-level mutable pathname the usePathname mock reads; tests set it.
const navState = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => navState.pathname
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
  beforeEach(() => {
    push.mockClear()
    navState.pathname = '/'
  })

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

  it('navigates to a section href when its action is selected', () => {
    render(<CommandPalette open onOpenChange={() => {}} />)
    // The first seeded module action renders as "01 IAM Foundations" → /modules/01-foundations
    const item = screen.getByText('01 IAM Foundations').closest('[cmdk-item]') as HTMLElement
    expect(item).not.toBeNull()
    fireEvent.click(item)
    expect(push).toHaveBeenCalledWith('/modules/01-foundations')
  })

  it('shows "Ask the Professor" on a section page and opens the tutor when selected', () => {
    navState.pathname = '/modules/02-protocols/01-kerberos'
    const onOpenChange = vi.fn()
    const onOpenTutor = vi.fn()
    window.addEventListener('iam-mastery:open-tutor', onOpenTutor)

    render(<CommandPalette open onOpenChange={onOpenChange} />)

    const item = screen
      .getByText('Ask the Professor about this section')
      .closest('[cmdk-item]') as HTMLElement
    expect(item).not.toBeNull()

    fireEvent.click(item)

    expect(onOpenTutor).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    window.removeEventListener('iam-mastery:open-tutor', onOpenTutor)
  })

  it('does not show "Ask the Professor" on a non-section page', () => {
    navState.pathname = '/progress'
    render(<CommandPalette open onOpenChange={() => {}} />)
    expect(
      screen.queryByText('Ask the Professor about this section')
    ).not.toBeInTheDocument()
  })
})
