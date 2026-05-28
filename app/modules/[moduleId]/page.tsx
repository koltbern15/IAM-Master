'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { ReadShell } from '@/components/layout/ReadShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { getModule } from '@/lib/content'
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
    return { id: s, key, status }
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
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/modules/${moduleId}/${s.id}`}
                  className="block rounded-[2px] border border-panel-border bg-panel-bg px-4 py-3 transition hover:border-cyan/50 hover:bg-cyan/5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <StatusGlyph status={s.status} />
                      <span className="font-mono text-sm uppercase tracking-[0.06em] text-foreground">
                        {s.id}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
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
