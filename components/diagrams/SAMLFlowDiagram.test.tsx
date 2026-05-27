import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SAMLFlowDiagram } from './SAMLFlowDiagram'

describe('SAMLFlowDiagram', () => {
  it('defaults to SP-initiated and shows AuthnRequest step', () => {
    render(<SAMLFlowDiagram />)
    expect(screen.getByText(/AuthnRequest/i)).toBeInTheDocument()
  })

  it('switches to IdP-initiated when the toggle is clicked', () => {
    render(<SAMLFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /IdP-initiated/i }))
    // "Unsolicited Response" appears as both the step label and in the caption
    // (the canonical SAML term for this flow's distinguishing behavior).
    expect(screen.getAllByText(/Unsolicited Response/i).length).toBeGreaterThanOrEqual(1)
  })

  it('reveals SAML Assertion XML when the SAML Response step is clicked', () => {
    render(<SAMLFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /SAML Response/i }))
    expect(screen.getByText(/saml:Assertion/i)).toBeInTheDocument()
  })
})
