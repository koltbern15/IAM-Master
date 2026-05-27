'use client'

import { useEffect, useState } from 'react'
import { ReadShell } from '@/components/layout/ReadShell'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { loadState, saveState, resetState, type StoredState } from '@/lib/progress'

const MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'claude-opus-4-7', label: 'claude-opus-4-7 (maximum capability)' },
  { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6 (default)' },
  { value: 'claude-haiku-4-5-20251001', label: 'claude-haiku-4-5 (fast)' }
]

export default function SettingsPage() {
  const [state, setState] = useState(() => loadState())
  const [exportData, setExportData] = useState<string>('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    function onChange() { setState(loadState()) }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  function updateSettings(patch: Partial<typeof state.settings>) {
    const next = loadState()
    next.settings = { ...next.settings, ...patch }
    saveState(next)
  }

  function handleExport() { setExportData(JSON.stringify(loadState(), null, 2)) }

  function handleImport(text: string) {
    setImportError(null)
    setImportSuccess(false)
    try {
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        setImportError('Unrecognized payload -- expected iam-mastery v1 state.')
        return
      }
      saveState(parsed as StoredState)
      setImportSuccess(true)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON.')
    }
  }

  function handleReset() { resetState(); setResetConfirm(false) }

  return (
    <ReadShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.06em] text-cyan glow-cyan">
          ▸ SETTINGS
        </h1>

        <HoloPanel label="DISPLAY">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">Sound effects (flashcard flips, quiz feedback)</span>
              <input type="checkbox" checked={state.settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="size-4 accent-cyan" />
            </label>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dim">
              ▸ Motion intensity follows the OS prefers-reduced-motion setting.
            </div>
          </div>
        </HoloPanel>

        <HoloPanel label="TUTOR">
          <div className="space-y-4">
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ ANTHROPIC API KEY
              </div>
              <input type="password" autoComplete="off" spellCheck={false}
                placeholder="sk-ant-..." value={state.settings.anthropicApiKey ?? ''}
                onChange={(e) => updateSettings({ anthropicApiKey: e.target.value || undefined })}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground placeholder:text-text-dim focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan" />
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
                ● STORED IN BROWSER -- never transmitted to any server other than Anthropic.
              </div>
            </label>
            <label className="block">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ MODEL
              </div>
              <select value={state.settings.tutorModel}
                onChange={(e) => updateSettings({ tutorModel: e.target.value })}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan">
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
          </div>
        </HoloPanel>

        <HoloPanel label="DATA">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExport}
                className="rounded-[2px] border border-cyan/50 bg-cyan/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-cyan hover:bg-cyan/20">
                ▸ EXPORT STATE
              </button>
              <button type="button" onClick={() => setResetConfirm((c) => !c)}
                className="rounded-[2px] border border-threat/50 bg-threat/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-threat hover:bg-threat/20">
                ▸ RESET ALL
              </button>
            </div>

            {resetConfirm && (
              <div className="border-l-2 border-threat bg-threat/5 px-3 py-2">
                <div className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-threat">
                  ▸ This will erase all progress, flashcards, streak, tutor history. Sure?
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleReset}
                    className="rounded-[2px] border border-threat bg-threat/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-threat">
                    Yes, wipe
                  </button>
                  <button type="button" onClick={() => setResetConfirm(false)}
                    className="rounded-[2px] border border-panel-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {exportData && (
              <textarea readOnly rows={6} value={exportData}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-[11px] text-cyan" />
            )}

            <div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/70">
                ▸ IMPORT STATE (paste exported JSON, blur to apply)
              </div>
              <textarea rows={4} placeholder='{"version":1,...}'
                onBlur={(e) => e.target.value.trim() && handleImport(e.target.value)}
                className="w-full rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-[11px] text-foreground focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan" />
              {importError && (
                <div className="mt-1 font-mono text-[11px] text-threat">▸ {importError}</div>
              )}
              {importSuccess && (
                <div className="mt-1 font-mono text-[11px] text-nominal">▸ Imported.</div>
              )}
            </div>
          </div>
        </HoloPanel>
      </div>
    </ReadShell>
  )
}
