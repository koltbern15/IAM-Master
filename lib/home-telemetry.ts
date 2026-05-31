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
