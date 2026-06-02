import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNavDrawer } from './MobileNavDrawer'

vi.mock('next/navigation', () => ({
  usePathname: () => '/modules/02-protocols/01-kerberos'
}))

describe('MobileNavDrawer', () => {
  it('is not in the document when closed', () => {
    render(<MobileNavDrawer open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('renders nav links when open', () => {
    render(<MobileNavDrawer open onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /flashcards/i })).toBeInTheDocument()
  })
  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<MobileNavDrawer open onClose={onClose} />)
    fireEvent.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
