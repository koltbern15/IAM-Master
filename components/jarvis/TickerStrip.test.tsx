import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TickerStrip } from './TickerStrip'

describe('TickerStrip', () => {
  it('renders each event prefixed with the marker', () => {
    render(<TickerStrip events={['PHS SYNC NOMINAL', 'TUTOR READY']} />)
    expect(screen.getAllByText(/PHS SYNC NOMINAL/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/TUTOR READY/).length).toBeGreaterThan(0)
  })

  it('renders a fallback message when events array is empty', () => {
    render(<TickerStrip events={[]} />)
    expect(screen.getAllByText(/AWAITING TELEMETRY/).length).toBeGreaterThan(0)
  })

  it('duplicates content for the infinite-loop marquee', () => {
    const { container } = render(<TickerStrip events={['EVENT_A']} />)
    expect(container.querySelectorAll('[data-jarvis-ticker-track]').length).toBe(2)
  })
})
