'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  const [mastery, setMastery] = useState(() => computeMastery(loadState()))

  useEffect(() => {
    function onChange() {
      setMastery(computeMastery(loadState()))
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <HudShell events={SAMPLE_TICKER}>
      <ModuleConstellationSVG totalMasteryPercent={mastery.totalPercent} />
    </HudShell>
  )
}
