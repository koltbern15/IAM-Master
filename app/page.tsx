'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellationSVG } from '@/components/jarvis/ModuleConstellationSVG'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { ActivitySparkline } from '@/components/jarvis/ActivitySparkline'
import { computeMastery } from '@/lib/mastery'
import { loadState } from '@/lib/progress'
import { getActivitySeries } from '@/lib/home-telemetry'
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
  const [activity, setActivity] = useState<number[]>(() => getActivitySeries(loadState()))

  useEffect(() => {
    function onChange() {
      const state = loadState()
      setMastery(computeMastery(state))
      setActivity(getActivitySeries(state))
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <HudShell events={SAMPLE_TICKER}>
      <div className="flex flex-col items-center">
        <ModuleConstellationSVG
          totalMasteryPercent={mastery.totalPercent}
          phaseCompleted={mastery.phaseCompleted}
          phaseTotals={mastery.phaseTotals}
        />
        <HudMiniPanels />
        <div className="mx-auto mt-4 w-full max-w-3xl">
          <HoloPanel ambientBorder label="ACTIVITY // 14D">
            <ActivitySparkline data={activity} />
          </HoloPanel>
        </div>
      </div>
    </HudShell>
  )
}
