'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { ReadShell } from '@/components/layout/ReadShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { getModule } from '@/lib/content'
import { getSectionMeta, getSectionTitle } from '@/lib/sections'
import { loadState } from '@/lib/progress'
import type { ModuleId } from '@/lib/types'

export default function ModulePage() {
  const params = useParams<{ moduleId: string }>()
  const moduleId = params.moduleId
  const mod = getModule(moduleId as ModuleId)

  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    function onChange() {
      setState(loadState())
    }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  if (!mod) notFound()

  const sections = mod.sections.map((s) => {
    const key = `${moduleId}/${s}`
    const progress = state.progress.sections[key]
    const status: 'unvisited' | 'visited' | 'completed' = progress?.completedAt
      ? 'completed'
      : progress?.visitedAt
      ? 'visited'
      : 'unvisited'
    return {
      id: s,
      key,
      status,
      title: getSectionTitle(moduleId, s),
      sc300: getSectionMeta(moduleId as ModuleId, s)?.sc300 ?? false,
    }
  })

  return (
    <ReadShell>
      <div className="space-y-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">
            ▸ MODULE {String(mod.order).padStart(2, '0')} // PHASE {mod.phase}
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-cyan glow-cyan">
            {mod.title}
          </h1>
          <p className="mt-2 text-text-muted">{mod.summary}</p>
        </div>

        {sections.length === 0 ? (
          <HoloPanel intent="warn" label="TRANSMISSION INCOMING">
            <p>Phase {mod.phase} module. Sections coming in a future authoring wave.</p>
          </HoloPanel>
        ) : (
          <ul className="space-y-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/modules/${moduleId}/${s.id}`}
                  className="group relative block overflow-hidden rounded-[3px] border border-panel-border bg-panel-bg px-4 py-3.5 transition-all hover:border-cyan/50 hover:bg-cyan/5 hover:shadow-[0_0_18px_rgb(0_240_255/0.18)]"
                >
                  {/* left accent bar reflecting status */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-0.5 ${
                      s.status === 'completed'
                        ? 'bg-nominal shadow-[0_0_8px_#00ff88]'
                        : s.status === 'visited'
                        ? 'bg-cyan/60'
                        : 'bg-transparent group-hover:bg-cyan/30'
                    }`}
                  />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[11px] tabular-nums text-cyan/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <StatusGlyph status={s.status} />
                      <span className="truncate font-display text-sm font-medium tracking-[0.01em] text-foreground group-hover:text-cyan">
                        {s.title}
                      </span>
                      {s.sc300 && (
                        <span className="shrink-0 rounded-full border border-cyan/40 bg-cyan/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-cyan/80">
                          SC-300
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
                      {s.status === 'completed'
                        ? '✓ MASTERED'
                        : s.status === 'visited'
                        ? '◐ VISITED'
                        : '○ UNVISITED'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ReadShell>
  )
}

function StatusGlyph({ status }: { status: 'unvisited' | 'visited' | 'completed' }) {
  const map = {
    unvisited: { ch: '○', cls: 'text-text-dim' },
    visited: { ch: '◐', cls: 'text-cyan/80' },
    completed: { ch: '●', cls: 'text-nominal' },
  }
  const { ch, cls } = map[status]
  return <span className={`font-mono text-lg ${cls}`}>{ch}</span>
}
