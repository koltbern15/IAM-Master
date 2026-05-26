export const STORAGE_KEY = 'iam-mastery:v1'
export const CURRENT_VERSION = 1 as const

export interface QuizAttempt {
  at: string
  score: number
  answers: number[]
}

export interface SectionProgress {
  visitedAt: string
  completedAt?: string
  timeSpentSeconds: number
  status?: 'drafted' | 'personalized' | 'mastered'
}

export interface FlashcardProgress {
  leitnerBox: 1 | 2 | 3 | 4 | 5
  lastReviewed: string
  nextDue: string
  correctStreak: number
}

export interface StoredState {
  version: typeof CURRENT_VERSION
  progress: {
    sections: Record<string, SectionProgress>
    modules: Record<string, { completionPercent: number }>
  }
  quizzes: Record<string, { attempts: QuizAttempt[]; bestScore: number }>
  flashcards: Record<string, FlashcardProgress>
  streak: {
    currentDays: number
    lastStudyDate: string
    longestDays: number
  }
  session: { startedAt: string }
  settings: {
    soundEnabled: boolean
    anthropicApiKey?: string
    tutorModel: string
    sidebarCollapsed: boolean
    moduleExpanded: Record<string, boolean>
  }
  tutorHistory: Record<string, {
    sectionId: string
    messages: { role: 'user' | 'assistant'; content: string; at: string }[]
  }>
}

function defaultState(): StoredState {
  return {
    version: CURRENT_VERSION,
    progress: { sections: {}, modules: {} },
    quizzes: {},
    flashcards: {},
    streak: { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: new Date().toISOString() },
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
}

export function loadState(): StoredState {
  if (typeof window === 'undefined') return defaultState()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultState()
  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>
    if (parsed.version !== CURRENT_VERSION) return defaultState()
    return { ...defaultState(), ...(parsed as StoredState) }
  } catch {
    return defaultState()
  }
}

export function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
}

export function resetState(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('iam-mastery:state-change'))
}

export function markSectionVisited(sectionKey: string): void {
  const s = loadState()
  const existing = s.progress.sections[sectionKey]
  s.progress.sections[sectionKey] = {
    visitedAt: new Date().toISOString(),
    timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    completedAt: existing?.completedAt,
    status: existing?.status
  }
  saveState(s)
}

export function markSectionCompleted(sectionKey: string): void {
  const s = loadState()
  const existing = s.progress.sections[sectionKey]
  s.progress.sections[sectionKey] = {
    visitedAt: existing?.visitedAt ?? new Date().toISOString(),
    timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    completedAt: new Date().toISOString(),
    status: existing?.status
  }
  saveState(s)
}

export function recordQuizAttempt(quizId: string, attempt: QuizAttempt): void {
  const s = loadState()
  const existing = s.quizzes[quizId] ?? { attempts: [], bestScore: 0 }
  existing.attempts.push(attempt)
  existing.bestScore = Math.max(existing.bestScore, attempt.score)
  s.quizzes[quizId] = existing
  saveState(s)
}
