import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('howler', () => {
  return {
    Howl: vi.fn().mockImplementation(() => ({
      play: vi.fn(),
      stop: vi.fn(),
      unload: vi.fn()
    }))
  }
})

import { useSound } from './use-sound'
import { saveState, loadState } from '@/lib/progress'

beforeEach(() => {
  window.localStorage.clear()
})

describe('useSound', () => {
  it('returns a play() function that no-ops when sound is disabled', async () => {
    const { Howl } = await import('howler')
    const HowlMock = Howl as unknown as ReturnType<typeof vi.fn>
    HowlMock.mockClear()
    // Default: settings.soundEnabled === false
    const { result } = renderHook(() => useSound('tick'))
    act(() => { result.current.play() })
    // The mock Howl is never constructed since we never trigger play under disabled
    expect(HowlMock).not.toHaveBeenCalled()
  })

  it('constructs a Howl + calls play() when sound is enabled', async () => {
    const { Howl } = await import('howler')
    const HowlMock = Howl as unknown as ReturnType<typeof vi.fn>
    HowlMock.mockClear()
    const s = loadState()
    s.settings.soundEnabled = true
    saveState(s)
    const { result } = renderHook(() => useSound('chime'))
    act(() => { result.current.play() })
    expect(HowlMock).toHaveBeenCalledTimes(1)
    expect(HowlMock.mock.calls[0][0].src[0]).toContain('chime.wav')
  })
})
