import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StatusStrip } from './StatusStrip'

describe('StatusStrip', () => {
  it('renders the IAM MASTERY brand', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/IAM MASTERY/i)).toBeInTheDocument()
  })

  it('renders an ONLINE status pill', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument()
  })

  it('renders a session timer in HH:MM:SS format', () => {
    render(<StatusStrip />)
    expect(screen.getByText(/^SESSION 0:0[0-9]:0[0-9]$/)).toBeInTheDocument()
  })

  it('renders the live datetime and updates each second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T14:32:07Z'))
    render(<StatusStrip />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1000) })
    vi.useRealTimers()
  })
})
