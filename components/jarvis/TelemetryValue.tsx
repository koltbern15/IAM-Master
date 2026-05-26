'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TelemetryValueProps {
  value: number
  suffix?: string
  durationMs?: number
  className?: string
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function TelemetryValue({
  value,
  suffix,
  durationMs = 1500,
  className
}: TelemetryValueProps) {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }
    startRef.current = null
    const from = display
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / durationMs)
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const current = Math.round(from + (value - from) * eased)
      setDisplay(current)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs])

  return (
    <span className={cn('tabular-nums font-display font-semibold text-cyan glow-cyan', className)}>
      {display}
      {suffix && <span className="ml-1 font-mono text-[0.5em] text-cyan/60">{suffix}</span>}
    </span>
  )
}
