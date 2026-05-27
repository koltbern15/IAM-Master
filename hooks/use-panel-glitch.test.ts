import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePanelGlitch } from './use-panel-glitch'

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('usePanelGlitch', () => {
  it('toggles data-jarvis-glitch on a random HoloPanel on its interval', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div data-jarvis-panel="1"></div>
      <div data-jarvis-panel="2"></div>
      <div data-jarvis-panel="3"></div>
    `
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 100, maxMs: 100 }))
    vi.advanceTimersByTime(120)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(1)
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
  })

  it('is a no-op under prefers-reduced-motion: reduce', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener: () => {},
      removeEventListener: () => {}
    }))
    const root = document.createElement('div')
    root.innerHTML = `<div data-jarvis-panel="1"></div>`
    document.body.appendChild(root)
    renderHook(() => usePanelGlitch({ minMs: 100, maxMs: 100 }))
    vi.advanceTimersByTime(500)
    expect(document.querySelectorAll('[data-jarvis-glitch="true"]').length).toBe(0)
  })
})
