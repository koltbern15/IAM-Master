import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { SearchResults } from './SearchResults'
import type { SearchEntry } from '@/lib/content-index'

const ENTRIES: SearchEntry[] = [
  {
    id: 's1',
    type: 'section',
    title: 'What Is IAM',
    body: 'Identity and access management fundamentals.',
    keywords: ['identity', 'access', 'fundamentals'],
    href: '/modules/01-foundations/what-is-iam',
    module: '01-foundations',
    sc300: false
  },
  {
    id: 'g1',
    type: 'glossary',
    title: 'Kerberos',
    body: 'A network authentication protocol using tickets.',
    keywords: ['kerberos', 'tickets', 'kdc'],
    href: '/glossary/kerberos',
    module: '02-protocols',
    sc300: false
  },
  {
    id: 'w1',
    type: 'warstory',
    title: 'The Golden Ticket Incident',
    body: 'A war story about a forged Kerberos ticket.',
    keywords: ['golden ticket', 'attack', 'kerberos'],
    href: '/war-stories/golden-ticket',
    module: '02-protocols',
    sc300: true
  }
]

describe('SearchResults', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows all entries when the initial query is empty', () => {
    render(<SearchResults entries={ENTRIES} initialQuery="" />)
    expect(screen.getByText('What Is IAM')).toBeInTheDocument()
    expect(screen.getByText('Kerberos')).toBeInTheDocument()
    expect(screen.getByText('The Golden Ticket Incident')).toBeInTheDocument()
    expect(screen.getByText(/^3 results$/i)).toBeInTheDocument()
  })

  it('narrows results as the user types a query (Fuse)', () => {
    render(<SearchResults entries={ENTRIES} initialQuery="" />)
    const input = screen.getByLabelText(/search the curriculum/i)
    fireEvent.change(input, { target: { value: 'kerberos' } })

    // Kerberos-relevant entries surface; the IAM section drops out.
    expect(screen.getByText('Kerberos')).toBeInTheDocument()
    expect(screen.getByText('The Golden Ticket Incident')).toBeInTheDocument()
    expect(screen.queryByText('What Is IAM')).not.toBeInTheDocument()
  })

  it('restricts results to a single type when a type filter chip is clicked', () => {
    render(<SearchResults entries={ENTRIES} initialQuery="" />)
    // Type chip carries a count, e.g. "WAR STORY · 1".
    fireEvent.click(screen.getByRole('button', { name: /war story/i }))

    expect(screen.getByText('The Golden Ticket Incident')).toBeInTheDocument()
    expect(screen.queryByText('What Is IAM')).not.toBeInTheDocument()
    expect(screen.queryByText('Kerberos')).not.toBeInTheDocument()
  })

  it('links each result to its entry href', () => {
    render(<SearchResults entries={ENTRIES} initialQuery="" />)
    const link = screen.getByText('What Is IAM').closest('a')
    expect(link).toHaveAttribute('href', '/modules/01-foundations/what-is-iam')
  })

  it('restricts results to a single module when a module chip is clicked', () => {
    render(<SearchResults entries={ENTRIES} initialQuery="" />)
    // "Protocols Deep Dive" is the title for module 02-protocols (from modules.json).
    fireEvent.click(screen.getByRole('button', { name: /protocols deep dive/i }))

    const list = screen.getByRole('list')
    expect(within(list).getByText('Kerberos')).toBeInTheDocument()
    expect(within(list).getByText('The Golden Ticket Incident')).toBeInTheDocument()
    expect(within(list).queryByText('What Is IAM')).not.toBeInTheDocument()
  })
})
