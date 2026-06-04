'use client'

import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { RadialSegmentRing } from '@/components/jarvis/RadialSegmentRing'
import { TelemetryValue } from '@/components/jarvis/TelemetryValue'
import { getAllModules } from '@/lib/content'
import { loadState, type StoredState, CURRENT_VERSION } from '@/lib/progress'
import { computeMastery } from '@/lib/mastery'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const TICKER = [
  'PROGRESS DASHBOARD',
  'TRACKING CURRICULUM MASTERY',
  'STREAK + QUIZ + FLASHCARD TELEMETRY',
  'STATUS NOMINAL'
]

const PHASE_COLOR = { 1: '#00f0ff', 2: '#ffb800', 3: '#808080' } as const

/** Deterministic, localStorage-free initial state so SSR and the client's first
 *  render match (no hydration mismatch). Real state loads in an effect on mount. */
function emptyState(): StoredState {
  return {
    version: CURRENT_VERSION,
    progress: { sections: {}, modules: {} },
    quizzes: {},
    flashcards: {},
    streak: { currentDays: 0, lastStudyDate: '', longestDays: 0 },
    session: { startedAt: '' },
    activity: {},
    settings: {
      soundEnabled: false,
      tutorModel: 'claude-sonnet-4-6',
      sidebarCollapsed: false,
      moduleExpanded: {}
    },
    tutorHistory: {}
  }
}

export default function ProgressPage() {
  usePanelGlitch()
  const modules = getAllModules()
  const [state, setState] = useState<StoredState>(emptyState)

  useEffect(() => {
    function onChange() {
      setState(loadState())
    }
    onChange()
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  // Per-module mastery as fraction (placeholder: completed sections / total sections)
  const segments = modules.map((m) => {
    const completed = m.sections.filter((s) => state.progress.sections[`${m.id}/${s}`]?.completedAt).length
    const value = m.sections.length > 0 ? completed / m.sections.length : 0
    return {
      id: m.id,
      value,
      color: PHASE_COLOR[m.phase as 1 | 2 | 3]
    }
  })

  const totalPercent = computeMastery(state).totalPercent

  return (
    <HudShell events={TICKER}>
      <div className="flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="relative">
          <RadialSegmentRing
            segments={segments}
            size={360}
            thickness={10}
            label={
              <div className="text-center">
                <div className="font-display text-5xl font-bold text-cyan glow-cyan-strong tabular-nums">
                  <TelemetryValue value={totalPercent} />
                  <span className="ml-1 text-2xl text-cyan/60">%</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
                  TOTAL MASTERY
                </div>
              </div>
            }
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const completed = m.sections.filter((s) => state.progress.sections[`${m.id}/${s}`]?.completedAt).length
            return (
              <HoloPanel key={m.id} ambientBorder label={`MOD ${String(m.order).padStart(2, '0')}`}>
                <div className="font-display text-base font-semibold uppercase tracking-[0.04em] text-foreground">
                  {m.title}
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                  <span>SECTIONS</span>
                  <span className="tabular-nums">{completed} / {m.sections.length}</span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                  <span>PHASE</span>
                  <span>{m.phase}</span>
                </div>
              </HoloPanel>
            )
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <HoloPanel ambientBorder label="STREAK">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={state.streak.currentDays} suffix="d" />
            </div>
          </HoloPanel>
          <HoloPanel ambientBorder label="LONGEST STREAK">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={state.streak.longestDays} suffix="d" />
            </div>
          </HoloPanel>
          <HoloPanel ambientBorder label="QUIZ ATTEMPTS">
            <div className="font-display text-3xl text-cyan glow-cyan tabular-nums">
              <TelemetryValue value={Object.values(state.quizzes).reduce((s, q) => s + q.attempts.length, 0)} />
            </div>
          </HoloPanel>
        </div>
      </div>
    </HudShell>
  )
}
