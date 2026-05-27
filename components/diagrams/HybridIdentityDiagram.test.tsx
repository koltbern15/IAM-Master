import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HybridIdentityDiagram } from './HybridIdentityDiagram'

describe('HybridIdentityDiagram', () => {
  it('defaults to PHS mode', () => {
    render(<HybridIdentityDiagram />)
    expect(screen.getByText(/Password Hash Sync/i)).toBeInTheDocument()
  })

  it('switches to PTA and shows the PTA Agent node', () => {
    render(<HybridIdentityDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /^PTA$/i }))
    expect(screen.getByText(/Pass-Through/i)).toBeInTheDocument()
    expect(screen.getByText(/PTA AGENT/i)).toBeInTheDocument()
  })

  it('switches to Federation and shows ADFS — both as actor node and as redirect step', () => {
    render(<HybridIdentityDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Federation/i }))
    // ADFS appears as both the actor node label and the "Redirect to ADFS"
    // step label — getAllByText so the test tolerates both legitimate matches.
    expect(screen.getAllByText(/ADFS/i).length).toBeGreaterThanOrEqual(2)
  })
})
