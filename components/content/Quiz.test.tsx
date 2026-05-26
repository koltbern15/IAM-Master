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

  it('marks selected correct answer with positive intent class', () => {
    const { container } = render(<Quiz question={QUESTION} />)
    fireEvent.click(screen.getByText('Kerberos'))
    const correctButton = screen.getByText('Kerberos').closest('button')!
    expect(correctButton.className).toMatch(/cyan|nominal/)
  })
})
