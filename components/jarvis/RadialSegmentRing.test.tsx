import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RadialSegmentRing } from './RadialSegmentRing'

describe('RadialSegmentRing', () => {
  it('renders one path per segment for the supplied segments array', () => {
    const { container } = render(
      <RadialSegmentRing
        segments={[
          { id: 'a', value: 1, color: '#00f0ff' },
          { id: 'b', value: 0.5, color: '#ffb800' },
          { id: 'c', value: 0, color: '#ff2040' }
        ]}
      />
    )
    // 3 segments × (track arc + fill arc) = 6 path elements
    expect(container.querySelectorAll('path')).toHaveLength(6)
  })

  it('renders 12 segments when given a 12-element array', () => {
    const segments = Array.from({ length: 12 }, (_, i) => ({
      id: `m${i}`,
      value: i / 11,
      color: '#00f0ff'
    }))
    const { container } = render(<RadialSegmentRing segments={segments} />)
    expect(container.querySelectorAll('path')).toHaveLength(24)
  })

  it('honors size prop on the svg', () => {
    const { container } = render(
      <RadialSegmentRing
        size={240}
        segments={[{ id: 'a', value: 0.3, color: '#00f0ff' }]}
      />
    )
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('240')
  })
})
