'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * On client-side navigation, moves keyboard/screen-reader focus to the
 * <main id="main-content"> region so users land in the page content rather
 * than being stranded at the top of the document. Mount once inside each shell.
 *
 * Skips the very first render so the initial page load isn't hijacked.
 */
export function RouteFocus() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const main = document.getElementById('main-content')
    if (main instanceof HTMLElement) {
      main.focus()
    }
  }, [pathname])

  return null
}
