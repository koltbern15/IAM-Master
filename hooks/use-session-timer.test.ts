import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimer } from './use-session-timer'

describe('useSessionTimer', () => {
  it('starts at 0 and increments each second', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSessionTimer())
    expect(result.current).toBe(0)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current).toBe(3)
    vi.useRealTimers()
  })
})
