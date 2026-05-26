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
})
