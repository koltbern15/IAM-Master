import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RadialRing } from './RadialRing'

describe('RadialRing', () => {
  it('renders an SVG circle with the supplied size', () => {
    const { container } = render(<RadialRing value={0.5} size={200} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
    expect(svg?.getAttribute('height')).toBe('200')
  })

  it('renders two circles — track + progress', () => {
    const { container } = render(<RadialRing value={0.5} />)
    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('progress circle stroke-dashoffset reflects the value', () => {
    const { container } = render(<RadialRing value={0.25} size={100} />)
    const progress = container.querySelectorAll('circle')[1]
    const r = Number(progress.getAttribute('r'))
    const circumference = 2 * Math.PI * r
    const expectedOffset = circumference * (1 - 0.25)
    expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(expectedOffset, 1)
  })

  it('clamps value to [0,1]', () => {
    const { container } = render(<RadialRing value={1.5} />)
    const progress = container.querySelectorAll('circle')[1]
    expect(progress.getAttribute('stroke-dashoffset')).toBe('0')
  })
})
