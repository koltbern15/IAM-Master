import type { StoredState } from './progress'
import type { ModuleMeta } from './types'
import { getSectionTitle } from './sections'

export interface HomeTelemetry {
  streakDays: number
  cardsDue: number
  resume: {
    href: string
    title: string
    crumb: string
  }
}

function firstSectionFallback(modules: ModuleMeta[]): HomeTelemetry['resume'] {
  const seeded = modules.find((m) => m.sections.length > 0)
  if (!seeded) {
    return { href: '/modules/01-foundations', title: 'START MODULE 01', crumb: '01-foundations' }
  }
  const sectionId = seeded.sections[0]
  return {
    href: `/modules/${seeded.id}/${sectionId}`,
    title: `START ${getSectionTitle(seeded.id, sectionId)}`,
    crumb: seeded.id
  }
}

function resolveResumeTarget(
  sectionKey: string,
  modules: ModuleMeta[]
): HomeTelemetry['resume'] | null {
  const [moduleId, sectionId] = sectionKey.split('/')
  if (!moduleId || !sectionId) return null
  const mod = modules.find((m) => m.id === moduleId)
  if (!mod) return null
  if (!mod.sections.includes(sectionId)) return null
  return {
    href: `/modules/${moduleId}/${sectionId}`,
    title: getSectionTitle(moduleId, sectionId),
    crumb: moduleId
  }
}

/**
 * Returns per-day study-touch counts for the last `days` calendar days,
 * oldest → newest. Missing days are 0. Day keys are derived from the current
 * UTC date, walking back one day at a time.
 */
export function getActivitySeries(state: StoredState, days = 14): number[] {
  const activity = state.activity ?? {}
  const todayMs = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
  const series: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(todayMs - i * 86_400_000).toISOString().slice(0, 10)
    series.push(activity[key] ?? 0)
  }
  return series
}

export function computeHomeTelemetry(state: StoredState, modules: ModuleMeta[]): HomeTelemetry {
  const streakDays = state.streak.currentDays

  const nowMs = Date.now()
  const cardsDue = Object.values(state.flashcards).filter((f) => {
    const due = Date.parse(f.nextDue)
    return Number.isFinite(due) && due <= nowMs
  }).length

  const visited = Object.entries(state.progress.sections)
    .map(([key, s]) => ({ key, visitedAt: s.visitedAt }))
    .filter((e) => typeof e.visitedAt === 'string' && e.visitedAt.length > 0)
    .sort((a, b) => (a.visitedAt < b.visitedAt ? 1 : -1))

  let resume: HomeTelemetry['resume'] | null = null
  for (const v of visited) {
    const candidate = resolveResumeTarget(v.key, modules)
    if (candidate) {
      resume = candidate
      break
    }
  }
  if (!resume) resume = firstSectionFallback(modules)

  return { streakDays, cardsDue, resume }
}
