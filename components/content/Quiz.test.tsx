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

describe('Quiz keyboard answers', () => {
  it('selects option A when "1" is pressed', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.keyDown(window, { key: '1' })
    expect(screen.getByRole('status')).toHaveTextContent(/^Correct$/)
    expect(screen.getByText(/Kerberos issues TGTs/)).toBeInTheDocument()
  })

  it('selects option B when "2" is pressed', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.keyDown(window, { key: '2' })
    expect(screen.getByRole('status')).toHaveTextContent(/^Incorrect$/)
    const chosen = screen.getByText('SAML').closest('button')!
    expect(chosen).toHaveTextContent(/incorrect/i)
  })

  it('ignores a second key press after answering', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.keyDown(window, { key: '2' }) // wrong (B)
    fireEvent.keyDown(window, { key: '1' }) // should be ignored; selection is locked
    // The first (wrong) answer stands: status stays Incorrect, A is shown as the right answer only.
    expect(screen.getByRole('status')).toHaveTextContent(/^Incorrect$/)
    const chosen = screen.getByText('SAML').closest('button')!
    expect(chosen).toHaveTextContent(/incorrect/i)
  })

  it('ignores number keys beyond the option count', () => {
    render(<Quiz question={QUESTION} />)
    fireEvent.keyDown(window, { key: '5' })
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('ignores key presses while typing in an input', () => {
    render(
      <div>
        <input data-testid="field" />
        <Quiz question={QUESTION} />
      </div>
    )
    const field = screen.getByTestId('field')
    field.focus()
    fireEvent.keyDown(field, { key: '1' })
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})
