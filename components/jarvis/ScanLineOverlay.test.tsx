import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ScanLineOverlay } from './ScanLineOverlay'

describe('ScanLineOverlay', () => {
  it('renders a fixed pointer-events:none overlay', () => {
    const { container } = render(<ScanLineOverlay />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('pointer-events-none')
    expect(el.className).toContain('fixed')
  })

  it('sets aria-hidden so screen readers skip it', () => {
    const { container } = render(<ScanLineOverlay />)
    expect((container.firstChild as HTMLElement).getAttribute('aria-hidden')).toBe('true')
  })

  it('honors a custom z-index via className', () => {
    const { container } = render(<ScanLineOverlay className="z-10" />)
    expect((container.firstChild as HTMLElement).className).toContain('z-10')
  })
})
