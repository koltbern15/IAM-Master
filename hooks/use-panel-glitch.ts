'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/media-query'

interface PanelGlitchOptions {
  minMs?: number
  maxMs?: number
  /** How long the data-jarvis-glitch attribute stays on the picked panel before clearing. */
  glitchDurationMs?: number
}

export function usePanelGlitch({
  minMs = 15_000,
  maxMs = 30_000,
  glitchDurationMs = 450
}: PanelGlitchOptions = {}) {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let scheduled = 0
    let clearTimer = 0

    function scheduleNext() {
      const wait = Math.floor(minMs + Math.random() * Math.max(0, maxMs - minMs))
      scheduled = window.setTimeout(tick, wait)
    }

    function tick() {
      const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-jarvis-panel]'))
      if (panels.length > 0) {
        const pick = panels[Math.floor(Math.random() * panels.length)]
        pick.setAttribute('data-jarvis-glitch', 'true')
        clearTimer = window.setTimeout(() => {
          pick.removeAttribute('data-jarvis-glitch')
          scheduleNext()
        }, glitchDurationMs)
      } else {
        scheduleNext()
      }
    }

    scheduleNext()
    return () => {
      window.clearTimeout(scheduled)
      window.clearTimeout(clearTimer)
      document
        .querySelectorAll<HTMLElement>('[data-jarvis-glitch="true"]')
        .forEach((el) => el.removeAttribute('data-jarvis-glitch'))
    }
  }, [minMs, maxMs, glitchDurationMs])
}
