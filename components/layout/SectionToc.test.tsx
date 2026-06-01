import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { SectionToc } from './SectionToc'

function Harness() {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div ref={ref}>
        <h2 id="a">Alpha</h2>
        <p>x</p>
        <h3 id="b">Bravo</h3>
      </div>
      <SectionToc contentRef={ref} />
    </div>
  )
}

function SingleHeadingHarness() {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div ref={ref}>
        <h2 id="only">Only</h2>
      </div>
      <SectionToc contentRef={ref} />
    </div>
  )
}

describe('SectionToc', () => {
  it('lists headings as in-page links', async () => {
    render(<Harness />)
    expect(await screen.findByRole('link', { name: 'Alpha' })).toHaveAttribute('href', '#a')
    expect(await screen.findByRole('link', { name: 'Bravo' })).toHaveAttribute('href', '#b')
  })

  it('renders nothing for a flat section with fewer than two headings', () => {
    const { container } = render(<SingleHeadingHarness />)
    expect(container.querySelector('nav[aria-label="On this page"]')).toBeNull()
  })
})
