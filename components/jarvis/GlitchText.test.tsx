import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  it('renders the supplied children', () => {
    render(<GlitchText>SYSTEM ONLINE</GlitchText>)
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
  })

  it('applies the glitch animation class when glitch=true', () => {
    const { container } = render(<GlitchText glitch>x</GlitchText>)
    expect((container.firstChild as HTMLElement).className).toContain('animate-[jarvis-glitch')
  })

  it('omits the animation class by default', () => {
    const { container } = render(<GlitchText>x</GlitchText>)
    expect((container.firstChild as HTMLElement).className).not.toContain('animate-[jarvis-glitch')
  })
})
