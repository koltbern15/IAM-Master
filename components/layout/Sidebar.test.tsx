import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the IAM Mastery wordmark', () => {
    render(<Sidebar />)
    expect(screen.getByText('IAM Mastery')).toBeInTheDocument()
  })

  it('renders all 12 module titles', () => {
    render(<Sidebar />)
    expect(screen.getByText('IAM Foundations')).toBeInTheDocument()
    expect(screen.getByText('Protocols Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Identity Platform')).toBeInTheDocument()
    expect(screen.getByText('Privileged Access Management')).toBeInTheDocument()
    expect(screen.getByText('Hands-On Labs')).toBeInTheDocument()
  })

  it('renders a Phase 2 badge on Module 4', () => {
    render(<Sidebar />)
    const module4 = screen.getByText('Privileged Access Management').closest('a, button, div')!
    expect(module4.textContent).toMatch(/Phase 2/)
  })

  it('renders a Phase 3 badge on Module 7', () => {
    render(<Sidebar />)
    const m7 = screen.getByText('Cloud IAM').closest('a, button, div')!
    expect(m7.textContent).toMatch(/Phase 3/)
  })

  it('does not render a Phase badge on Phase 1 modules', () => {
    render(<Sidebar />)
    const m1 = screen.getByText('IAM Foundations').closest('a, button, div')!
    expect(m1.textContent).not.toMatch(/Phase 2|Phase 3/)
  })

  it('renders footer links (Flashcards, Search, Progress)', () => {
    render(<Sidebar />)
    expect(screen.getByText('Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
})
