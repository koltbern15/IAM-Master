'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/media-query'

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Respect reduced-motion: leave the gradient parked at its default center.
    if (prefersReducedMotion()) return

    // Coalesce unthrottled mousemove into a single repaint per frame.
    let rafId = 0
    let nextX = 0
    let nextY = 0
    function flush() {
      rafId = 0
      el!.style.setProperty('--mx', `${nextX}px`)
      el!.style.setProperty('--my', `${nextY}px`)
    }
    function onMove(e: MouseEvent) {
      nextX = e.clientX
      nextY = e.clientY
      if (!rafId) rafId = requestAnimationFrame(flush)
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
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
