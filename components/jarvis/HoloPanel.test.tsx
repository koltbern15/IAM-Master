import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloPanel } from './HoloPanel'

describe('HoloPanel', () => {
  it('renders children inside a positioned container', () => {
    render(<HoloPanel>Inside</HoloPanel>)
    expect(screen.getByText('Inside')).toBeInTheDocument()
  })

  it('renders 2 corner brackets by default (diag)', () => {
    const { container } = render(<HoloPanel>x</HoloPanel>)
    expect(container.querySelectorAll('[data-jarvis-corner]')).toHaveLength(2)
  })

  it('renders 4 corners when cornersAll is set', () => {
    const { container } = render(<HoloPanel cornersAll>x</HoloPanel>)
    expect(container.querySelectorAll('[data-jarvis-corner]')).toHaveLength(4)
  })

  it('renders a top-left label tag when label prop is provided', () => {
    render(<HoloPanel label="STATUS">x</HoloPanel>)
    expect(screen.getByText(/STATUS/)).toBeInTheDocument()
  })

  it('applies warning intent class', () => {
    const { container } = render(<HoloPanel intent="warn">x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('border-warn')
  })

  it('applies threat intent class', () => {
    const { container } = render(<HoloPanel intent="threat">x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('border-threat')
  })

  it('applies glow shadow when glow=true', () => {
    const { container } = render(<HoloPanel glow>x</HoloPanel>)
    const panel = container.firstChild as HTMLElement
    expect(panel.className).toContain('ring-glow-cyan')
  })
})
