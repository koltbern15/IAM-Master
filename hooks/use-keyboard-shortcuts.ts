'use client'

import { useEffect, useRef } from 'react'

type ShortcutMap = Record<string, () => void>

function normalizeEventKey(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push('cmd')
  if (e.shiftKey) parts.push('shift')
  if (e.altKey) parts.push('alt')
  parts.push(e.key.toLowerCase())
  return parts.join('+')
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  // Callers usually pass an inline object; stash the latest in a ref so the
  // window listener only registers once for the component's lifetime instead
  // of tearing down and re-adding on every render.
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map = shortcutsRef.current
      if (isTypingTarget(e.target)) {
        const k = normalizeEventKey(e)
        if (k !== 'escape' && k !== 'cmd+k') return
      }
      const k = normalizeEventKey(e)
      const cb = map[k] ?? map[e.key.toLowerCase()]
      if (cb) {
        e.preventDefault()
        cb()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
