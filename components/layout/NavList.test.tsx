import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavList } from './NavList'
import { getAllModules } from '@/lib/content'

describe('NavList', () => {
  it('renders every module link', () => {
    render(<NavList />)
    for (const m of getAllModules()) {
      expect(screen.getByText(new RegExp(m.title, 'i'))).toBeInTheDocument()
    }
  })
  it('renders the utility footer links', () => {
    render(<NavList />)
    expect(screen.getByRole('link', { name: /flashcards/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /progress/i })).toBeInTheDocument()
  })
})
