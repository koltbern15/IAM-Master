'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  usePanelGlitch()
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
      <div className="flex flex-col items-center">
        <ModuleConstellationSVG totalMasteryPercent={mastery.totalPercent} />
        <HudMiniPanels />
      </div>
    </HudShell>
  )
}
