import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReadShell } from './ReadShell'

describe('ReadShell', () => {
  it('renders the Sidebar + Topbar + children', () => {
    render(
      <ReadShell>
        <div>section-body</div>
      </ReadShell>
    )
    expect(screen.getByText('IAM MASTERY')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    expect(screen.getByText('section-body')).toBeInTheDocument()
  })

  it('wraps the main content in a max-width container', () => {
    const { container } = render(<ReadShell>x</ReadShell>)
    const main = container.querySelector('main')
    expect(main?.className).toMatch(/max-w-/)
  })
})
