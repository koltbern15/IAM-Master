import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CyberArkArchDiagram } from './CyberArkArchDiagram'

describe('CyberArkArchDiagram', () => {
  it('renders the CyberArk PAS core component nodes', () => {
    render(<CyberArkArchDiagram />)
    expect(screen.getByText('USER')).toBeInTheDocument()
    expect(screen.getByText('PVWA')).toBeInTheDocument()
    expect(screen.getByText('VAULT')).toBeInTheDocument()
    expect(screen.getByText('CPM')).toBeInTheDocument()
    expect(screen.getByText('PSM')).toBeInTheDocument()
    expect(screen.getByText('TARGET')).toBeInTheDocument()
  })

  it('renders the secrets-management and session-isolation step labels', () => {
    render(<CyberArkArchDiagram />)
    expect(screen.getByText('Retrieve Secret')).toBeInTheDocument()
    expect(screen.getByText('Rotate / Verify')).toBeInTheDocument()
    expect(screen.getByText('Proxied + Recorded')).toBeInTheDocument()
  })

  it('reveals the session-isolation detail when Proxied + Recorded is clicked', () => {
    render(<CyberArkArchDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Proxied \+ Recorded/i }))
    expect(screen.getByText(/never sees|isolated, fully recorded/i)).toBeInTheDocument()
  })
})
