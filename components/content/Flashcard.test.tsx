import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Flashcard } from './Flashcard'

describe('Flashcard', () => {
  it('shows front by default and back after click', () => {
    render(<Flashcard front="What is a TGT?" back="Ticket-Granting Ticket" />)
    expect(screen.getByText('What is a TGT?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Ticket-Granting Ticket')).toBeInTheDocument()
  })

  it('toggles back to front on second click', () => {
    render(<Flashcard front="A" back="B" />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
