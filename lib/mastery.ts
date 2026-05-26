import { getAllModules } from './content'
import type { StoredState } from './progress'

export interface MasterySummary {
  totalPercent: number
  completedSections: number
  totalSections: number
  phaseTotals: Record<1 | 2 | 3, number>
  phaseCompleted: Record<1 | 2 | 3, number>
}

export function computeMastery(state: StoredState): MasterySummary {
  const modules = getAllModules()
  let completedSections = 0
  let totalSections = 0
  const phaseTotals: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }
  const phaseCompleted: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 }

  for (const m of modules) {
    const phase = m.phase as 1 | 2 | 3
    phaseTotals[phase] += m.sections.length
    for (const sectionId of m.sections) {
      totalSections += 1
      if (state.progress.sections[`${m.id}/${sectionId}`]?.completedAt) {
        completedSections += 1
        phaseCompleted[phase] += 1
      }
    }
  }

  const totalPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
  return { totalPercent, completedSections, totalSections, phaseTotals, phaseCompleted }
}
