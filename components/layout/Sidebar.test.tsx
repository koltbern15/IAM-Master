import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders the IAM Mastery wordmark', () => {
    render(<Sidebar />)
    expect(screen.getByText('IAM MASTERY')).toBeInTheDocument()
  })

  it('renders all 12 module titles', () => {
    render(<Sidebar />)
    expect(screen.getByText('01 IAM Foundations')).toBeInTheDocument()
    expect(screen.getByText('02 Protocols Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('03 Microsoft Identity Platform')).toBeInTheDocument()
    expect(screen.getByText('04 Privileged Access Management')).toBeInTheDocument()
    expect(screen.getByText('12 Hands-On Labs')).toBeInTheDocument()
  })

  it('renders a Phase 2 badge on Module 4', () => {
    render(<Sidebar />)
    const module4 = screen.getByText('04 Privileged Access Management').closest('a')!
    expect(module4.textContent).toMatch(/P2/)
  })

  it('renders a Phase 3 badge on Module 7', () => {
    render(<Sidebar />)
    const m7 = screen.getByText('07 Cloud IAM').closest('a')!
    expect(m7.textContent).toMatch(/P3/)
  })

  it('does not render a Phase badge on Phase 1 modules', () => {
    render(<Sidebar />)
    const m1 = screen.getByText('01 IAM Foundations').closest('a')!
    expect(m1.textContent).not.toMatch(/P2|P3/)
  })

  it('renders footer links (Flashcards, Search, Progress)', () => {
    render(<Sidebar />)
    expect(screen.getByText('FLASHCARDS')).toBeInTheDocument()
    expect(screen.getByText('SEARCH')).toBeInTheDocument()
    expect(screen.getByText('PROGRESS')).toBeInTheDocument()
  })
})
