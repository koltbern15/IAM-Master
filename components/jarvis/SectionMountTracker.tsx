'use client'

import { useEffect } from 'react'
import { markSectionVisited } from '@/lib/progress'

interface SectionMountTrackerProps {
  sectionKey: string
}

/**
 * Invisible client component that fires markSectionVisited once on mount.
 * Needed because section pages are RSCs and can't call client-only localStorage
 * functions directly.
 */
export function SectionMountTracker({ sectionKey }: SectionMountTrackerProps) {
  useEffect(() => {
    markSectionVisited(sectionKey)
  }, [sectionKey])
  return null
}
