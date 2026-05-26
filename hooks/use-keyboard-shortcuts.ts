'use client'

import { useEffect } from 'react'

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
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) {
        // Allow Escape and Cmd+K to fire even in inputs
        const k = normalizeEventKey(e)
        if (k !== 'escape' && k !== 'cmd+k') return
      }
      const k = normalizeEventKey(e)
      // Try the full chord first, then bare key
      const cb = shortcuts[k] ?? shortcuts[e.key.toLowerCase()]
      if (cb) {
        e.preventDefault()
        cb()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcuts])
}
