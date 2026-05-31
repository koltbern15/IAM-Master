import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SectionComplete } from './SectionComplete'
import { loadState } from '@/lib/progress'

const KEY = '01-foundations/what-is-iam'

describe('SectionComplete', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts in the un-mastered ("Mark section mastered") state', () => {
    render(<SectionComplete sectionKey={KEY} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent(/mark section mastered/i)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks the section complete and flips the label to mastered', () => {
    render(<SectionComplete sectionKey={KEY} />)
    fireEvent.click(screen.getByRole('button'))

    // Persisted completion timestamp is set.
    expect(loadState().progress.sections[KEY]?.completedAt).toBeTruthy()

    // Label/state reflect mastery (driven by the state-change event).
    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent(/^section mastered$/i)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears completion when clicked a second time', () => {
    render(<SectionComplete sectionKey={KEY} />)
    const btn = screen.getByRole('button')

    fireEvent.click(btn) // complete
    expect(loadState().progress.sections[KEY]?.completedAt).toBeTruthy()

    fireEvent.click(btn) // un-complete
    expect(loadState().progress.sections[KEY]?.completedAt).toBeUndefined()
    expect(screen.getByRole('button')).toHaveTextContent(/mark section mastered/i)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})
