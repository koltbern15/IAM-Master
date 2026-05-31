'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

/**
 * Traps keyboard focus inside `containerRef` while `active` is true.
 *
 * On activate: remembers the currently-focused element, then moves focus into
 * the container (its first focusable child, or the container itself via a
 * fallback tabIndex). Tab / Shift+Tab cycle within the focusable children.
 * On deactivate (or unmount): restores focus to the element that was focused
 * before the trap engaged.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  containerRef: RefObject<T | null>
) {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    // Move focus into the container if it isn't already there. Respect an
    // element that already holds focus inside the container (e.g. an
    // autofocused input) so we don't yank it away.
    if (!container.contains(document.activeElement)) {
      const focusable = getFocusable(container)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1')
        }
        container.focus()
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const el = containerRef.current
      if (!el) return
      const focusable = getFocusable(el)
      if (focusable.length === 0) {
        // Nothing focusable inside — keep focus pinned to the container.
        e.preventDefault()
        el.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeEl = document.activeElement

      if (e.shiftKey) {
        if (activeEl === first || !el.contains(activeEl)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (activeEl === last || !el.contains(activeEl)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [active, containerRef])
}
