import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OAuthFlowDiagram } from './OAuthFlowDiagram'

describe('OAuthFlowDiagram', () => {
  it('renders Authorization Code + PKCE + refresh steps', () => {
    render(<OAuthFlowDiagram />)
    expect(screen.getByText(/Authorize/i)).toBeInTheDocument()
    expect(screen.getByText(/Token Exchange/i)).toBeInTheDocument()
    // "Refresh" appears in both the step label and the caption ("refresh token rotation").
    expect(screen.getAllByText(/Refresh/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders an Implicit Grant marker with deprecated treatment', () => {
    const { container } = render(<OAuthFlowDiagram />)
    // "Implicit Grant" appears as both the step label and in the caption.
    expect(screen.getAllByText(/Implicit Grant/i).length).toBeGreaterThanOrEqual(1)
    expect(container.querySelector('path[stroke-dasharray="4 4"]')).not.toBeNull()
  })

  it('reveals PKCE code verifier detail when Token Exchange is clicked', () => {
    render(<OAuthFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Token Exchange/i }))
    expect(screen.getByText(/code_verifier/i)).toBeInTheDocument()
  })
})
