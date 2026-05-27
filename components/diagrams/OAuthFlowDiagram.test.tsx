import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OAuthFlowDiagram } from './OAuthFlowDiagram'

describe('OAuthFlowDiagram', () => {
  it('renders Authorization Code + PKCE + refresh steps', () => {
    render(<OAuthFlowDiagram />)
    expect(screen.getByText(/Authorize/i)).toBeInTheDocument()
    expect(screen.getByText(/Token Exchange/i)).toBeInTheDocument()
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument()
  })

  it('renders an Implicit Grant marker with deprecated treatment', () => {
    const { container } = render(<OAuthFlowDiagram />)
    expect(screen.getByText(/Implicit Grant/i)).toBeInTheDocument()
    expect(container.querySelector('path[stroke-dasharray="4 4"]')).not.toBeNull()
  })

  it('reveals PKCE code verifier detail when Token Exchange is clicked', () => {
    render(<OAuthFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Token Exchange/i }))
    expect(screen.getByText(/code_verifier/i)).toBeInTheDocument()
  })
})
