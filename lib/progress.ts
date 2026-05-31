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
    const base = defaultState()
    // Deep-merge nested objects so a partial/older payload can never drop
    // required fields (esp. settings, which the UI reads field-by-field).
    return {
      ...base,
      ...parsed,
      progress: {
        sections: parsed.progress?.sections ?? base.progress.sections,
        modules: parsed.progress?.modules ?? base.progress.modules
      },
      streak: { ...base.streak, ...parsed.streak },
      session: { ...base.session, ...parsed.session },
      settings: { ...base.settings, ...parsed.settings },
      quizzes: parsed.quizzes ?? base.quizzes,
      flashcards: parsed.flashcards ?? base.flashcards,
      tutorHistory: parsed.tutorHistory ?? base.tutorHistory
    }
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

/**
 * Advances the study streak in place for a single day of activity.
 * Same calendar day → no change; consecutive day → +1; any gap → reset to 1.
 * Mutates `s.streak`; the caller persists.
 */
function applyStudyActivity(s: StoredState, nowIso: string): void {
  const today = nowIso.slice(0, 10) // YYYY-MM-DD
  const last = s.streak.lastStudyDate
  if (last === today) return
  const yesterday = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10)
  s.streak.currentDays = last === yesterday ? s.streak.currentDays + 1 : 1
  s.streak.lastStudyDate = today
  s.streak.longestDays = Math.max(s.streak.longestDays, s.streak.currentDays)
}

/** Records a day of study activity (used by section visits/completions). */
export function recordStudyActivity(): void {
  const s = loadState()
  applyStudyActivity(s, new Date().toISOString())
  saveState(s)
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
  applyStudyActivity(s, new Date().toISOString())
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
  applyStudyActivity(s, new Date().toISOString())
  saveState(s)
}

/** Clears a section's completion (toggle off "mastered"), preserving visit history. */
export function markSectionIncomplete(sectionKey: string): void {
  const s = loadState()
  const existing = s.progress.sections[sectionKey]
  if (!existing) return
  s.progress.sections[sectionKey] = {
    visitedAt: existing.visitedAt,
    timeSpentSeconds: existing.timeSpentSeconds,
    completedAt: undefined,
    status: existing.status
  }
  saveState(s)
}

/**
 * Persists the post-review Leitner state for a flashcard and counts the review
 * as study activity (so spaced-repetition practice also advances the streak).
 */
export function setFlashcardProgress(cardId: string, progress: FlashcardProgress): void {
  const s = loadState()
  s.flashcards[cardId] = progress
  applyStudyActivity(s, new Date().toISOString())
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

/** Returns the persisted message history for a section (empty array if none). */
export function loadTutorHistory(sectionId: string): { role: 'user' | 'assistant'; content: string; at: string }[] {
  const s = loadState()
  return s.tutorHistory[sectionId]?.messages ?? []
}

/** Appends a tutor message to the section history and persists. */
export function appendTutorMessage(
  sectionId: string,
  message: { role: 'user' | 'assistant'; content: string }
): void {
  const s = loadState()
  const existing = s.tutorHistory[sectionId] ?? { sectionId, messages: [] }
  existing.messages = [...existing.messages, { ...message, at: new Date().toISOString() }]
  s.tutorHistory[sectionId] = existing
  saveState(s)
}
