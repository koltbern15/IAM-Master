import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useFocusTrap } from './use-focus-trap'

// jsdom reports offsetParent === null for every element, which would make the
// hook's getFocusable() filter (offsetParent !== null || el === activeElement)
// treat all but the focused element as invisible. Stub offsetParent to the real
// parentElement so visibility filtering behaves like a laid-out browser.
let offsetParentSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  offsetParentSpy = vi
    .spyOn(HTMLElement.prototype, 'offsetParent', 'get')
    .mockImplementation(function (this: HTMLElement) {
      return this.parentElement
    })
})

afterEach(() => {
  offsetParentSpy.mockRestore()
  document.body.innerHTML = ''
})

/** Builds a container with three buttons, mounted in the live document. */
function buildContainer(): { container: HTMLDivElement; buttons: HTMLButtonElement[] } {
  const container = document.createElement('div')
  const buttons: HTMLButtonElement[] = []
  for (let i = 0; i < 3; i++) {
    const b = document.createElement('button')
    b.textContent = `btn-${i}`
    container.appendChild(b)
    buttons.push(b)
  }
  document.body.appendChild(container)
  return { container, buttons }
}

function pressTab(shiftKey = false) {
  // The hook listens in the capture phase, so dispatch on document.
  const ev = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true })
  document.dispatchEvent(ev)
  return ev
}

describe('hooks/use-focus-trap', () => {
  it('moves focus into the container on activate (first focusable child)', () => {
    const { container, buttons } = buildContainer()
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    renderHook(() => useFocusTrap(true, ref))

    expect(document.activeElement).toBe(buttons[0])
  })

  it('Shift+Tab from the first element wraps to the last', () => {
    const { container, buttons } = buildContainer()
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    renderHook(() => useFocusTrap(true, ref))
    expect(document.activeElement).toBe(buttons[0])

    const ev = pressTab(true)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[buttons.length - 1])
  })

  it('Tab from the last element wraps to the first', () => {
    const { container, buttons } = buildContainer()
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    renderHook(() => useFocusTrap(true, ref))
    buttons[buttons.length - 1].focus()
    expect(document.activeElement).toBe(buttons[buttons.length - 1])

    const ev = pressTab(false)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[0])
  })

  it('keeps focus pinned to the container when there is nothing focusable inside', () => {
    const container = document.createElement('div')
    container.appendChild(document.createTextNode('no focusable children'))
    document.body.appendChild(container)
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    renderHook(() => useFocusTrap(true, ref))

    // Empty-container branch sets a fallback tabindex and focuses the container.
    expect(container.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(container)

    const ev = pressTab(false)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(container)
  })

  it('restores focus to the previously-active element on deactivate', () => {
    const outside = document.createElement('button')
    outside.textContent = 'outside'
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)

    const { container, buttons } = buildContainer()
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    const { rerender } = renderHook(({ active }) => useFocusTrap(active, ref), {
      initialProps: { active: true },
    })
    expect(document.activeElement).toBe(buttons[0])

    // Deactivating tears down the effect, which restores prior focus.
    rerender({ active: false })
    expect(document.activeElement).toBe(outside)
  })

  it('restores focus to the previously-active element on unmount', () => {
    const outside = document.createElement('button')
    outside.textContent = 'outside'
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)

    const { container, buttons } = buildContainer()
    const ref = createRef<HTMLDivElement>()
    ;(ref as { current: HTMLDivElement }).current = container

    const { unmount } = renderHook(() => useFocusTrap(true, ref))
    expect(document.activeElement).toBe(buttons[0])

    unmount()
    expect(document.activeElement).toBe(outside)
  })
})
