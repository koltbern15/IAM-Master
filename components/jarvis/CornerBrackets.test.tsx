import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CornerBrackets } from './CornerBrackets'

describe('CornerBrackets', () => {
  it('renders 2 corner span elements by default (top-left, bottom-right)', () => {
    const { container } = render(<CornerBrackets />)
    const corners = container.querySelectorAll('[data-jarvis-corner]')
    expect(corners).toHaveLength(2)
  })

  it('renders 4 corners when corners="all"', () => {
    const { container } = render(<CornerBrackets corners="all" />)
    const corners = container.querySelectorAll('[data-jarvis-corner]')
    expect(corners).toHaveLength(4)
  })

  it('accepts a custom color class', () => {
    const { container } = render(<CornerBrackets className="border-warn" />)
    const corner = container.querySelector('[data-jarvis-corner]')
    expect(corner?.className).toContain('border-warn')
  })
})
