import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EcosystemMap } from './EcosystemMap'

describe('EcosystemMap', () => {
  it('renders core ecosystem nodes', () => {
    render(<EcosystemMap />)
    expect(screen.getByText(/Entra ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Okta/i)).toBeInTheDocument()
    expect(screen.getByText(/SailPoint/i)).toBeInTheDocument()
    expect(screen.getByText(/CyberArk/i)).toBeInTheDocument()
  })

  it('highlights node connections when clicked', () => {
    const { container } = render(<EcosystemMap />)
    fireEvent.click(screen.getByText(/Entra ID/i))
    expect(container.querySelectorAll('[data-jarvis-edge-active="true"]').length).toBeGreaterThan(0)
  })

  it('zoom-in button changes the stage transform', () => {
    const { container } = render(<EcosystemMap />)
    const stage = container.querySelector('[data-jarvis-ecosystem-stage]') as HTMLElement
    const before = stage.style.transform
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }))
    expect(stage.style.transform).not.toBe(before)
  })
})
