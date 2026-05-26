import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HudShell } from './HudShell'

describe('HudShell', () => {
  it('renders the StatusStrip + TickerStrip + children', () => {
    render(
      <HudShell events={['EVENT_A']}>
        <div>centerpiece</div>
      </HudShell>
    )
    expect(screen.getByText(/IAM MASTERY/)).toBeInTheDocument()
    expect(screen.getByText('centerpiece')).toBeInTheDocument()
    expect(screen.getAllByText(/EVENT_A/).length).toBeGreaterThan(0)
  })

  it('does NOT render a sidebar', () => {
    const { container } = render(
      <HudShell events={[]}>
        <div>x</div>
      </HudShell>
    )
    expect(container.querySelector('nav[aria-label="Modules"]')).toBeNull()
  })
})
