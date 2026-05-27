'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HoloPanel } from './HoloPanel'
import { TelemetryValue } from './TelemetryValue'
import { computeHomeTelemetry, type HomeTelemetry } from '@/lib/home-telemetry'
import { loadState } from '@/lib/progress'
import { getAllModules } from '@/lib/content'

function read(): HomeTelemetry {
  return computeHomeTelemetry(loadState(), getAllModules())
}

export function HudMiniPanels() {
  const [telemetry, setTelemetry] = useState<HomeTelemetry>(() => read())

  useEffect(() => {
    function onChange() {
      setTelemetry(read())
    }
    onChange()
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  return (
    <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
      <Link
        href="/progress"
        aria-label={`STREAK: ${telemetry.streakDays} days. Open progress dashboard.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel ambientBorder label="STREAK">
          <div className="font-display text-3xl text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={telemetry.streakDays} suffix="d" />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ CURRENT
          </div>
        </HoloPanel>
      </Link>

      <Link
        href="/flashcards"
        aria-label={`CARDS DUE: ${telemetry.cardsDue} cards. Open flashcards.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel
          ambientBorder
          label="CARDS DUE"
          intent={telemetry.cardsDue === 0 ? 'default' : 'warn'}
        >
          <div className="font-display text-3xl text-cyan glow-cyan-strong tabular-nums">
            <TelemetryValue value={telemetry.cardsDue} />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ TODAY
          </div>
        </HoloPanel>
      </Link>

      <Link
        href={telemetry.resume.href}
        aria-label={`RESUME: ${telemetry.resume.title}. Continue in ${telemetry.resume.crumb}.`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      >
        <HoloPanel ambientBorder label="RESUME">
          <div className="truncate font-display text-base text-cyan glow-cyan">
            {telemetry.resume.title}
          </div>
          <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ {telemetry.resume.crumb}
          </div>
        </HoloPanel>
      </Link>
    </div>
  )
}
