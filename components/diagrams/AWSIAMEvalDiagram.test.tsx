import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AWSIAMEvalDiagram } from './AWSIAMEvalDiagram'

describe('AWSIAMEvalDiagram', () => {
  it('renders the policy-evaluation pipeline nodes', () => {
    render(<AWSIAMEvalDiagram />)
    expect(screen.getByText('REQUEST')).toBeInTheDocument()
    expect(screen.getByText('EXPLICIT')).toBeInTheDocument()
    expect(screen.getByText('SCP')).toBeInTheDocument()
    expect(screen.getByText('BOUNDARY')).toBeInTheDocument()
    expect(screen.getByText('ALLOW?')).toBeInTheDocument()
    expect(screen.getByText('DENY')).toBeInTheDocument()
    expect(screen.getByText('ALLOW')).toBeInTheDocument()
  })

  it('renders the evaluation-order gate labels', () => {
    render(<AWSIAMEvalDiagram />)
    expect(screen.getByText('Explicit Deny → DENY')).toBeInTheDocument()
    expect(screen.getByText('SCP allows?')).toBeInTheDocument()
    expect(screen.getByText('Boundary allows?')).toBeInTheDocument()
    expect(screen.getByText('No Allow → implicit DENY')).toBeInTheDocument()
  })

  it('reveals the explicit-deny precedence detail when that gate is clicked', () => {
    render(<AWSIAMEvalDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Explicit Deny → DENY/i }))
    expect(screen.getByText(/explicit Deny ALWAYS wins|cannot be overridden/i)).toBeInTheDocument()
  })
})
