import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandReference } from './CommandReference'

const RECIPES = [
  { id: 'r1', category: 'audit', title: 'List stale users', command: 'Get-ADUser -Filter *' },
  { id: 'r2', category: 'audit', title: 'List service accounts', command: 'Get-ADServiceAccount' },
  { id: 'r3', category: 'lifecycle', title: 'Disable user', command: 'Disable-ADAccount' }
]

describe('CommandReference', () => {
  it('renders all recipes', () => {
    render(<CommandReference recipes={RECIPES} />)
    expect(screen.getByText('List stale users')).toBeInTheDocument()
    expect(screen.getByText('Disable user')).toBeInTheDocument()
  })

  it('filters by text search', () => {
    render(<CommandReference recipes={RECIPES} />)
    fireEvent.change(screen.getByPlaceholderText(/filter/i), { target: { value: 'service' } })
    expect(screen.getByText('List service accounts')).toBeInTheDocument()
    expect(screen.queryByText('Disable user')).not.toBeInTheDocument()
  })

  it('filters by category chip', () => {
    render(<CommandReference recipes={RECIPES} />)
    fireEvent.click(screen.getByRole('button', { name: /lifecycle/i }))
    expect(screen.getByText('Disable user')).toBeInTheDocument()
    expect(screen.queryByText('List stale users')).not.toBeInTheDocument()
  })
})
