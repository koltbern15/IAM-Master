'use client'

import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onMove(e: MouseEvent) {
      el!.style.setProperty('--mx', `${e.clientX}px`)
      el!.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage:
          'radial-gradient(circle 800px at var(--mx, 50%) var(--my, 50%), oklch(0.32 0.08 260 / 0.25), transparent 60%), radial-gradient(circle at 1px 1px, oklch(0.32 0.02 250 / 0.15) 1px, transparent 0)',
        backgroundSize: 'auto, 24px 24px'
      }}
    />
  )
}
