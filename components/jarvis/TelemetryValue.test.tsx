import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TelemetryValue } from './TelemetryValue'

describe('TelemetryValue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the final integer value after the count-up duration', () => {
    render(<TelemetryValue value={42} durationMs={1000} />)
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders 0 initially before any timer advance', () => {
    render(<TelemetryValue value={42} durationMs={1000} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders the suffix when provided', () => {
    render(<TelemetryValue value={75} suffix="%" durationMs={500} />)
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('skips animation under prefers-reduced-motion (renders final immediately)', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    render(<TelemetryValue value={99} durationMs={1000} />)
    expect(screen.getByText('99')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
