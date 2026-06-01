import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyboardHelpOverlay } from './KeyboardHelpOverlay'

describe('KeyboardHelpOverlay', () => {
  it('does not render when closed', () => {
    render(<KeyboardHelpOverlay open={false} onClose={() => {}} />)
    expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument()
  })

  it('renders shortcut entries when open', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument()
    expect(screen.getByText(/cmd\+k/i)).toBeInTheDocument()
    expect(screen.getByText(/open command palette/i)).toBeInTheDocument()
  })

  it('documents the real flashcard grades (Missed / Got it, not 3 grades)', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/flashcard.*missed.*got it/i)).toBeInTheDocument()
  })

  it('documents J / K section navigation', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/previous \/ next section/i)).toBeInTheDocument()
  })

  it('documents 1-4 quiz answers', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.getByText(/answer quiz/i)).toBeInTheDocument()
  })

  it('does not advertise a non-existent third flashcard grade', () => {
    render(<KeyboardHelpOverlay open onClose={() => {}} />)
    expect(screen.queryByText(/demote \/ repeat \/ promote/i)).not.toBeInTheDocument()
  })
})
