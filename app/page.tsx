import { HudShell } from '@/components/layout/HudShell'
import { ModuleConstellation } from '@/components/jarvis/ModuleConstellation'

const SAMPLE_TICKER = [
  'SYSTEM ONLINE',
  'PHASE 1 CURRICULUM SEEDED',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'FLASHCARDS REPLENISHED',
  'STATUS NOMINAL'
]

export default function HomePage() {
  // Placeholder mastery value — Plan 2B wires this to real progress.ts
  const totalMastery = 0
  return (
    <HudShell events={SAMPLE_TICKER}>
      <ModuleConstellation totalMasteryPercent={totalMastery} />
    </HudShell>
  )
}
