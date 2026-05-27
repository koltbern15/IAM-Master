import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskProfessorRail } from './AskProfessorRail'

describe('AskProfessorRail', () => {
  it('renders a fixed right-edge launcher button', () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="" />)
    expect(screen.getByRole('button', { name: /ASK PROFESSOR/i })).toBeInTheDocument()
  })

  it('opens the tutor panel when clicked', () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="ctx" />)
    expect(screen.queryByPlaceholderText(/ask the professor/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ASK PROFESSOR/i }))
    expect(screen.getByPlaceholderText(/ask the professor/i)).toBeInTheDocument()
  })
})
