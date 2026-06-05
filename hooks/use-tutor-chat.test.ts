import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('@/lib/anthropic-client', () => ({
  streamTutorReply: vi.fn()
}))

import { useTutorChat } from './use-tutor-chat'
import { streamTutorReply } from '@/lib/anthropic-client'
import { loadTutorHistory, appendTutorMessage, loadState, saveState } from '@/lib/progress'

const streamMock = streamTutorReply as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  window.localStorage.clear()
  streamMock.mockReset()
})

function setKey(key = 'sk-test') {
  const s = loadState()
  s.settings.anthropicApiKey = key
  saveState(s)
}

describe('useTutorChat', () => {
  it('loads persisted history for the given sectionId on mount', () => {
    appendTutorMessage('mod/sect', { role: 'user', content: 'first' })
    appendTutorMessage('mod/sect', { role: 'assistant', content: 'reply' })
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    expect(result.current.messages.map((m) => m.content)).toEqual(['first', 'reply'])
  })

  it('appends user message + streamed assistant reply, persisting both', async () => {
    setKey()
    async function* fake() { yield 'Hel'; yield 'lo!' }
    streamMock.mockReturnValue(fake())
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'section body') })
    await waitFor(() => expect(result.current.streaming).toBe(false))
    expect(result.current.messages.map((m) => m.content)).toEqual(['hi', 'Hello!'])
    expect(loadTutorHistory('mod/sect').map((m) => m.content)).toEqual(['hi', 'Hello!'])
  })

  it('surfaces an error when no API key is configured', async () => {
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'body') })
    expect(result.current.error).toMatch(/API key/i)
    expect(streamMock).not.toHaveBeenCalled()
  })

  it('surfaces an error when the stream throws', async () => {
    setKey()
    streamMock.mockImplementation(async function* () {
      throw new Error('boom')
      yield '' // unreachable, satisfies require-yield
    })
    const { result } = renderHook(() => useTutorChat('mod/sect'))
    await act(async () => { await result.current.sendMessage('hi', 'body') })
    // The hook maps raw SDK/throw errors to friendly copy; a generic throw hits the fallback.
    expect(result.current.error).toMatch(/something went wrong/i)
    expect(result.current.streaming).toBe(false)
  })
})
