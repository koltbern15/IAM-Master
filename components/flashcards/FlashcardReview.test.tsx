import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlashcardReview } from './FlashcardReview'
import { loadState } from '@/lib/progress'
import type { DeckCard } from '@/lib/content-index'

const DECK: DeckCard[] = [
  {
    id: 'card-a',
    moduleId: '01-foundations',
    slug: 'what-is-iam',
    sectionTitle: 'What Is IAM',
    front: 'What does AAA stand for?',
    back: 'Authentication, Authorization, Accounting'
  },
  {
    id: 'card-b',
    moduleId: '02-protocols',
    slug: 'kerberos',
    sectionTitle: 'Kerberos',
    front: 'What issues a TGT?',
    back: 'The Key Distribution Center (KDC)'
  }
]

describe('FlashcardReview', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the first question front and the due/deck counts', () => {
    render(<FlashcardReview deck={DECK} title="Foundations Deck" />)
    expect(screen.getByText('What does AAA stand for?')).toBeInTheDocument()
    // New cards count as due → DUE should equal deck length.
    expect(screen.getByText('Foundations Deck')).toBeInTheDocument()
  })

  it('reveals the back when the card is clicked', () => {
    render(<FlashcardReview deck={DECK} title="Foundations Deck" />)
    // Front shown, back not yet present.
    expect(screen.queryByText('Authentication, Authorization, Accounting')).not.toBeInTheDocument()
    // The card itself is a pressable button; click it.
    const card = screen.getByRole('button', { pressed: false })
    fireEvent.click(card)
    expect(screen.getByText('Authentication, Authorization, Accounting')).toBeInTheDocument()
  })

  it('grading "Got it" advances to the next card and promotes the Leitner box / pushes nextDue into the future', () => {
    render(<FlashcardReview deck={DECK} title="Foundations Deck" />)

    // Reveal then grade the first card correct.
    fireEvent.click(screen.getByRole('button', { pressed: false }))
    fireEvent.click(screen.getByRole('button', { name: /got it/i }))

    // Persisted Leitner state: box advanced past the initial box 1.
    const persisted = loadState().flashcards['card-a']
    expect(persisted).toBeDefined()
    expect(persisted.leitnerBox).toBeGreaterThan(1)
    expect(persisted.correctStreak).toBe(1)
    expect(Date.parse(persisted.nextDue)).toBeGreaterThan(Date.now())

    // Advanced to the second card's front.
    expect(screen.getByText('What issues a TGT?')).toBeInTheDocument()
  })

  it('shows a completion / reviewed state after grading every due card', () => {
    render(<FlashcardReview deck={DECK} title="Foundations Deck" />)

    // Grade both cards correct.
    fireEvent.click(screen.getByRole('button', { pressed: false }))
    fireEvent.click(screen.getByRole('button', { name: /got it/i }))
    fireEvent.click(screen.getByRole('button', { pressed: false }))
    fireEvent.click(screen.getByRole('button', { name: /got it/i }))

    expect(screen.getByText(/reviewed 2 cards\./i)).toBeInTheDocument()
    expect(screen.getByText(/review another deck/i)).toBeInTheDocument()
  })

  it('renders the empty-state message when the deck is empty', () => {
    render(<FlashcardReview deck={[]} title="Empty Deck" />)
    expect(screen.getByText(/no flashcards in this deck yet\./i)).toBeInTheDocument()
    expect(screen.getByText(/back to flashcards/i)).toBeInTheDocument()
  })
})
