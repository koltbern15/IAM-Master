'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HudShell } from '@/components/layout/HudShell'
import { ModuleDeck, type ModuleDeckItem } from '@/components/jarvis/ModuleDeck'
import { RadialRing } from '@/components/jarvis/RadialRing'
import { TelemetryValue } from '@/components/jarvis/TelemetryValue'
import { ActivitySparkline } from '@/components/jarvis/ActivitySparkline'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { getAllModules } from '@/lib/content'
import { getSectionTitle } from '@/lib/sections'
import { computeMastery } from '@/lib/mastery'
import { computeHomeTelemetry, getActivitySeries, type HomeTelemetry } from '@/lib/home-telemetry'
import { loadState } from '@/lib/progress'
import { usePanelGlitch } from '@/hooks/use-panel-glitch'

const TICKER = [
  'SYSTEM ONLINE',
  'COMMAND DECK ACTIVE',
  '12 MODULES LOADED',
  'TUTOR STANDING BY',
  'STATUS NOMINAL',
]

interface HomeData {
  masteryPercent: number
  streakDays: number
  cardsDue: number
  resume: HomeTelemetry['resume']
  activity: number[]
  deck: ModuleDeckItem[]
}

/** Deterministic, localStorage-free initial state so SSR and the client's first
 *  render match (no hydration mismatch). Real data loads in an effect on mount. */
function emptyHome(): HomeData {
  const modules = getAllModules()
  const deck: ModuleDeckItem[] = modules.map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    summary: m.summary,
    phase: m.phase,
    completed: 0,
    total: m.sections.length,
    pct: 0,
  }))
  const seeded = modules.find((m) => m.sections.length > 0)
  const resume = seeded
    ? {
        href: `/modules/${seeded.id}/${seeded.sections[0]}`,
        title: `START ${getSectionTitle(seeded.id, seeded.sections[0])}`,
        crumb: seeded.id,
      }
    : { href: '/modules/01-foundations', title: 'START MODULE 01', crumb: '01-foundations' }
  return { masteryPercent: 0, streakDays: 0, cardsDue: 0, resume, activity: new Array(14).fill(0), deck }
}

function readHome(): HomeData {
  const state = loadState()
  const modules = getAllModules()
  const mastery = computeMastery(state)
  const telemetry = computeHomeTelemetry(state, modules)
  const deck: ModuleDeckItem[] = modules.map((m) => {
    const total = m.sections.length
    const completed = m.sections.filter((s) => state.progress.sections[`${m.id}/${s}`]?.completedAt).length
    return {
      id: m.id,
      order: m.order,
      title: m.title,
      summary: m.summary,
      phase: m.phase,
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })
  return {
    masteryPercent: mastery.totalPercent,
    streakDays: telemetry.streakDays,
    cardsDue: telemetry.cardsDue,
    resume: telemetry.resume,
    activity: getActivitySeries(state),
    deck,
  }
}

export default function HomePage() {
  usePanelGlitch()
  const [data, setData] = useState<HomeData>(emptyHome)

  useEffect(() => {
    const onChange = () => setData(readHome())
    onChange()
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <HudShell events={TICKER}>
      <div className="w-full max-w-5xl space-y-6 py-2">
        {/* Status header */}
        <header className="flex flex-col gap-5 border-b border-panel-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-[0.05em] text-cyan glow-cyan-strong">
              IAM Mastery
            </h1>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan/60">
              ▸ CURRICULUM COMMAND DECK // 12 MODULES
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Stat label="STREAK" value={data.streakDays} suffix="d" />
            <Link
              href="/flashcards"
              className="rounded-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
              aria-label={`${data.cardsDue} flashcards due. Open flashcards.`}
            >
              <Stat label="CARDS DUE" value={data.cardsDue} warn={data.cardsDue > 0} />
            </Link>
            <RadialRing
              value={data.masteryPercent / 100}
              size={104}
              thickness={5}
              label={
                <div className="text-center leading-none">
                  <div className="font-display text-2xl font-bold text-cyan glow-cyan-strong">
                    <TelemetryValue value={data.masteryPercent} />
                    <span className="text-sm text-cyan/60">%</span>
                  </div>
                  <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.2em] text-cyan/50">MASTERY</div>
                </div>
              }
            />
          </div>
        </header>

        {/* Module deck */}
        <section aria-label="Curriculum modules">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/60">▸ MODULES</div>
          <ModuleDeck items={data.deck} />
        </section>

        {/* Telemetry strip */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <HoloPanel label="ACTIVITY // 14D" className="sm:col-span-2">
            <ActivitySparkline data={data.activity} />
          </HoloPanel>
          <Link
            href={data.resume.href}
            aria-label={`Resume: ${data.resume.title}`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          >
            <HoloPanel label="RESUME" className="h-full transition-colors hover:border-cyan/50">
              <div className="truncate font-display text-base text-cyan glow-cyan">{data.resume.title}</div>
              <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
                ▸ {data.resume.crumb}
              </div>
            </HoloPanel>
          </Link>
        </section>
      </div>
    </HudShell>
  )
}

function Stat({ label, value, suffix, warn = false }: { label: string; value: number; suffix?: string; warn?: boolean }) {
  return (
    <div className="text-right">
      <div
        className={`font-display text-3xl font-bold tabular-nums ${warn ? 'text-warn glow-cyan' : 'text-cyan glow-cyan-strong'}`}
      >
        <TelemetryValue value={value} suffix={suffix} />
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan/50">{label}</div>
    </div>
  )
}
