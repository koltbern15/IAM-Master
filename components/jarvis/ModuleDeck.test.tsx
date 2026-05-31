import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ModuleDeck, type ModuleDeckItem } from './ModuleDeck'

const ITEMS: ModuleDeckItem[] = [
  { id: '01-foundations', order: 1, title: 'IAM Foundations', summary: 'Why identity.', phase: 1, completed: 2, total: 3, pct: 67 },
  { id: '06-powershell', order: 6, title: 'PowerShell for IAM', summary: 'Force multiplier.', phase: 1, completed: 0, total: 3, pct: 0 },
  { id: '04-pam', order: 4, title: 'Privileged Access', summary: 'Keys to the kingdom.', phase: 2, completed: 0, total: 0, pct: 0 },
]

describe('ModuleDeck', () => {
  it('renders one card per item with its title', () => {
    render(<ModuleDeck items={ITEMS} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('IAM Foundations')).toBeInTheDocument()
    expect(screen.getByText('PowerShell for IAM')).toBeInTheDocument()
  })

  it('shows section progress for active (Phase 1) modules', () => {
    render(<ModuleDeck items={ITEMS} />)
    const card = screen.getByText('IAM Foundations').closest('li') as HTMLElement
    expect(within(card).getByText('2/3 SECTIONS')).toBeInTheDocument()
    expect(within(card).getByText('67%')).toBeInTheDocument()
  })

  it('marks Phase 2/3 modules as coming instead of showing progress', () => {
    render(<ModuleDeck items={ITEMS} />)
    const card = screen.getByText('Privileged Access').closest('li') as HTMLElement
    expect(within(card).getByText(/COMING \/\/ PHASE 2/)).toBeInTheDocument()
    expect(within(card).queryByText(/SECTIONS/)).not.toBeInTheDocument()
  })

  it('links each card to its module route', () => {
    render(<ModuleDeck items={ITEMS} />)
    const card = screen.getByText('IAM Foundations').closest('li') as HTMLElement
    expect(within(card).getByRole('link')).toHaveAttribute('href', '/modules/01-foundations')
  })
})
