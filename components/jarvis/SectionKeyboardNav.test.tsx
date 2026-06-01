import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SectionKeyboardNav } from './SectionKeyboardNav'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

describe('SectionKeyboardNav', () => {
  it('pushes nextHref on "j"', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref="/b" />)
    fireEvent.keyDown(window, { key: 'j' })
    expect(push).toHaveBeenCalledWith('/b')
  })
  it('pushes prevHref on "k"', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref="/b" />)
    fireEvent.keyDown(window, { key: 'k' })
    expect(push).toHaveBeenCalledWith('/a')
  })
  it('does nothing on "j" at the last section', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref={null} />)
    fireEvent.keyDown(window, { key: 'j' })
    expect(push).not.toHaveBeenCalled()
  })
  it('ignores J/K while typing in a field', () => {
    push.mockClear()
    render(
      <div>
        <input data-testid="field" />
        <SectionKeyboardNav prevHref="/a" nextHref="/b" />
      </div>
    )
    const field = screen.getByTestId('field')
    field.focus()
    fireEvent.keyDown(field, { key: 'j' })
    expect(push).not.toHaveBeenCalled()
  })
  it('ignores J/K when a modifier is held (no hijacking browser shortcuts)', () => {
    push.mockClear()
    render(<SectionKeyboardNav prevHref="/a" nextHref="/b" />)
    fireEvent.keyDown(window, { key: 'j', metaKey: true })
    expect(push).not.toHaveBeenCalled()
  })
})
