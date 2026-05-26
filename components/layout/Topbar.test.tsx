import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  it('renders the search input', () => {
    render(<Topbar />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders the session timer in HH:MM:SS format', () => {
    render(<Topbar />)
    expect(screen.getByText(/^0:0[0-9]:0[0-9]$/)).toBeInTheDocument()
  })

  it('renders the settings link', () => {
    render(<Topbar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders the mastery progress indicator', () => {
    render(<Topbar />)
    expect(screen.getByLabelText(/overall mastery/i)).toBeInTheDocument()
  })
})
