'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Invisible client component (renders null, like {@link SectionMountTracker})
 * that wires the spec's J/K section navigation (design spec line 298):
 * J = next (down the curriculum), K = prev (up) — vim down/up. Modifier-held
 * presses and keystrokes inside form fields are ignored so it never hijacks
 * browser shortcuts or typing. Edge sections pass a null href and no-op.
 */
export function SectionKeyboardNav({
  prevHref,
  nextHref
}: {
  prevHref?: string | null
  nextHref?: string | null
}) {
  const router = useRouter()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (
        t instanceof HTMLElement &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)
      ) {
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'j' && nextHref) {
        e.preventDefault()
        router.push(nextHref)
      } else if (k === 'k' && prevHref) {
        e.preventDefault()
        router.push(prevHref)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, prevHref, nextHref])
  return null
}
