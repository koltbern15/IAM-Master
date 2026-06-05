import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskProfessorRail } from './AskProfessorRail'

describe('AskProfessorRail', () => {
  it('renders both launchers (mobile FAB + desktop edge tab)', () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="" />)
    // Two labelled launchers: a bottom-right FAB (md:hidden) and a right-edge
    // tab (md:block). CSS shows one per breakpoint; both exist in the DOM.
    expect(screen.getAllByRole('button', { name: /ask professor/i })).toHaveLength(2)
  })

  it('opens the tutor panel when a launcher is clicked', async () => {
    render(<AskProfessorRail sectionId="m/s" sectionContent="ctx" />)
    const launchers = screen.getAllByRole('button', { name: /ask professor/i })
    expect(launchers[0]).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByPlaceholderText(/ask the professor/i)).not.toBeInTheDocument()
    fireEvent.click(launchers[0])
    // aria-expanded flips synchronously; the panel itself is lazily imported.
    expect(screen.getAllByRole('button', { name: /ask professor/i })[0]).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(await screen.findByPlaceholderText(/ask the professor/i)).toBeInTheDocument()
  })
})
