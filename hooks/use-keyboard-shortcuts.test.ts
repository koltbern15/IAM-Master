import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  it('fires the callback when the registered key is pressed', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ '/': cb }))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('respects modifier keys (cmd+k matches metaKey+k)', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ 'cmd+k': cb }))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('ignores keys when typing in an input', () => {
    const cb = vi.fn()
    renderHook(() => useKeyboardShortcuts({ k: cb }))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true })
      input.dispatchEvent(event)
    })
    expect(cb).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })
})
