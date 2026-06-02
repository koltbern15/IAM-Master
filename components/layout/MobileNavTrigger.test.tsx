import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNavTrigger } from './MobileNavTrigger'

vi.mock('next/navigation', () => ({
  usePathname: () => '/modules/02-protocols/01-kerberos'
}))

describe('MobileNavTrigger', () => {
  it('renders a hamburger button', () => {
    render(<MobileNavTrigger />)
    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument()
  })
  it('opens the drawer when the hamburger is clicked', () => {
    render(<MobileNavTrigger />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
