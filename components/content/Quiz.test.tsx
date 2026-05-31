import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'

const QUESTION = {
  id: 'q1',
  prompt: 'Which protocol uses tickets?',
  options: ['Kerberos', 'SAML', 'OAuth', 'LDAP'],
  correctIndex: 0,
  explanation: 'Kerberos issues TGTs from a KDC.'
}

describe('Quiz', () => {
  it('renders the prompt and option buttons', () => {
    render(<Quiz question={QUESTION} />)
    expect(screen.getByText(/which protocol/i)).toBeInTheDocument()
    expect(screen.getByText('Kerberos')).toBeInTheDocument()
    expect(screen.getByText('SAML')).toBeInTheDocument()
  })

  it('reveals the explanation after answering', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.click(screen.getByText('SAML'))
    expect(screen.getByText(/Kerberos issues TGTs/)).toBeInTheDocument()
  })

  it('announces a correct answer via the status region and reveals the explanation', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.click(screen.getByText('Kerberos'))
    // Behavioral/semantic outcomes rather than brittle CSS class fragments:
    // the a11y live region announces exactly "Correct" (not "Incorrect")...
    expect(screen.getByRole('status')).toHaveTextContent(/^Correct$/)
    // ...the per-option sr-only state text marks the chosen option as the correct answer...
    const correctButton = screen.getByText('Kerberos').closest('button')!
    expect(correctButton).toHaveTextContent(/correct answer/i)
    // ...and the explanation becomes visible.
    expect(screen.getByText(/Kerberos issues TGTs/)).toBeInTheDocument()
  })
})
