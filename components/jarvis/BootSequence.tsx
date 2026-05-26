'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GlitchText } from './GlitchText'

const BOOT_KEY = 'iam-mastery:boot-played'
const BOOT_DURATION_MS = 2200

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface BootSequenceProps {
  children: React.ReactNode
}

export function BootSequence({ children }: BootSequenceProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(BOOT_KEY) === '1') return
    setPlaying(true)
    const id = window.setTimeout(() => {
      sessionStorage.setItem(BOOT_KEY, '1')
      setPlaying(false)
    }, BOOT_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      {children}
      {playing && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-void',
            'animate-[jarvis-boot-fade_2200ms_ease-in-out_forwards]'
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-cyan/80 shadow-[0_0_12px_#00f0ff] animate-[jarvis-boot-sweep_400ms_ease-in_forwards]" />
          <div className="text-center">
            <div className="mb-3 font-display text-2xl font-bold uppercase tracking-[0.15em] text-cyan glow-cyan-strong">
              <GlitchText glitch>IAM MASTERY</GlitchText>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan/60 animate-[jarvis-boot-type_1800ms_steps(20,end)_500ms_forwards] overflow-hidden whitespace-nowrap">
              INITIALIZING SYSTEM...
            </div>
          </div>
        </div>
      )}
    </>
  )
}
