import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BootSequence } from './BootSequence'

beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal('matchMedia', (_q: string) => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
})

describe('BootSequence', () => {
  it('renders children behind the boot overlay on cold load', () => {
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.getByText('app-content')).toBeInTheDocument()
    expect(screen.getByText(/SYSTEM ONLINE/i)).toBeInTheDocument()
  })

  it('skips the boot overlay when sessionStorage flag is already set', () => {
    sessionStorage.setItem('iam-mastery:boot-played', '1')
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.queryByText(/SYSTEM ONLINE/i)).not.toBeInTheDocument()
  })

  it('skips boot under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    expect(screen.queryByText(/SYSTEM ONLINE/i)).not.toBeInTheDocument()
  })

  it('sets sessionStorage flag after boot completes', async () => {
    vi.useFakeTimers()
    render(
      <BootSequence>
        <div>app-content</div>
      </BootSequence>
    )
    act(() => { vi.advanceTimersByTime(4000) })
    expect(sessionStorage.getItem('iam-mastery:boot-played')).toBe('1')
    vi.useRealTimers()
  })
})
