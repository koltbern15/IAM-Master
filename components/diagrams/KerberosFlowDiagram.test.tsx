import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KerberosFlowDiagram } from './KerberosFlowDiagram'

describe('KerberosFlowDiagram', () => {
  it('renders the five canonical Kerberos steps', () => {
    render(<KerberosFlowDiagram />)
    expect(screen.getByText('AS-REQ')).toBeInTheDocument()
    expect(screen.getByText('AS-REP')).toBeInTheDocument()
    expect(screen.getByText('TGS-REQ')).toBeInTheDocument()
    expect(screen.getByText('TGS-REP')).toBeInTheDocument()
    expect(screen.getByText('AP-REQ')).toBeInTheDocument()
  })

  it('renders CLIENT, KDC, and SERVICE actor nodes', () => {
    render(<KerberosFlowDiagram />)
    expect(screen.getByText('CLIENT')).toBeInTheDocument()
    expect(screen.getByText('KDC')).toBeInTheDocument()
    expect(screen.getByText('SERVICE')).toBeInTheDocument()
  })

  it('reveals TGT contents when AS-REP is clicked', () => {
    render(<KerberosFlowDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /AS-REP/i }))
    expect(screen.getByText(/TGT/)).toBeInTheDocument()
    expect(screen.getByText(/session key/i)).toBeInTheDocument()
  })
})
