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
          // Mouse-tracking radial — 3x stronger than Plan 1 (0.25 → 0.75)
          'radial-gradient(circle 900px at var(--mx, 50%) var(--my, 50%), rgb(0 240 255 / 0.18), transparent 55%), ' +
          // Dot grid — switched from slate to cyan, denser (24px → 18px)
          'radial-gradient(circle at 1px 1px, rgb(0 240 255 / 0.08) 1px, transparent 0)',
        backgroundSize: 'auto, 18px 18px'
      }}
    />
  )
}
