'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { HoloPanel } from './HoloPanel'
import { useTutorChat } from '@/hooks/use-tutor-chat'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { loadState } from '@/lib/progress'

interface TutorPanelProps {
  open: boolean
  onClose: () => void
  sectionId: string
  sectionContent: string
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function TutorPanel({ open, onClose, sectionId, sectionContent }: TutorPanelProps) {
  const { messages, streaming, error, sendMessage } = useTutorChat(sectionId)
  const [draft, setDraft] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [announced, setAnnounced] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingId = useId()

  useFocusTrap(open, panelRef)

  useEffect(() => {
    setHasKey(!!loadState().settings.anthropicApiKey)
    setReduceMotion(prefersReducedMotion())
    function onChange() { setHasKey(!!loadState().settings.anthropicApiKey) }
    window.addEventListener('iam-mastery:state-change', onChange)
    return () => window.removeEventListener('iam-mastery:state-change', onChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  // Announce a completion cue to screen readers once the reply has settled
  // (streaming finished) — a polite cue rather than echoing the full streamed
  // answer into the DOM (which floods the live region and is verbose to hear).
  // The settled reply itself lives in the navigable conversation list below.
  useEffect(() => {
    if (streaming) return
    const last = messages[messages.length - 1]
    if (last && last.role === 'assistant' && last.content.trim()) {
      setAnnounced('Professor replied. The answer is in the conversation.')
    }
  }, [streaming, messages])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || streaming) return
    setDraft('')
    void sendMessage(text, sectionContent)
  }

  return (
    <div
      ref={panelRef}
      id="tutor-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className={cn(
        'fixed inset-y-0 right-0 z-[80] flex w-full max-w-[40vw] flex-col bg-void/85 backdrop-blur-md max-md:max-w-full',
        !reduceMotion && 'animate-[jarvis-slide-in-right_220ms_ease-out_both]'
      )}
    >
      <HoloPanel ambientBorder cornersAll label="ASK PROFESSOR" className="flex h-full flex-col">
        <h2 id={headingId} className="sr-only">Tutor dialog for section {sectionId}</h2>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announced}</div>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/60">
            ▸ SECTION {sectionId}
          </div>
          <button type="button" onClick={onClose} aria-label="Close tutor"
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 hover:bg-cyan/10 hover:text-cyan">
            x ESC
          </button>
        </div>

        {!hasKey && (
          <div className="mb-3 flex items-start gap-2 border-l-2 border-warn bg-warn/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warn">
            <span>● STORED IN BROWSER</span>
            <span className="normal-case tracking-normal">-- add an Anthropic API key in /settings to enable the tutor.</span>
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto pr-1">
          {messages.length === 0 && !streaming && (
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
              ▸ Ask anything about this section. The professor will use the current section as context.
            </div>
          )}
          <ul aria-label="Conversation" className="space-y-3">
            {messages.map((m, i) => (
              <li key={i}
                className={cn(
                  'rounded-[2px] border px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'border-cyan/30 bg-cyan/4 text-foreground'
                    : 'border-nominal/30 bg-nominal/4 text-foreground'
                )}>
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/60">
                  ▸ {m.role === 'user' ? 'YOU' : 'PROFESSOR'}
                </div>
                <div className={cn(
                  'whitespace-pre-wrap',
                  m.role === 'assistant' && streaming && i === messages.length - 1 && 'text-cyan after:ml-0.5 after:inline-block after:h-3 after:w-2 after:align-middle after:bg-cyan after:animate-pulse'
                )}>
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
          {error && (
            <div className="mt-2 border-l-2 border-threat bg-threat/8 px-3 py-2 font-mono text-xs text-threat">
              ▸ {error}
            </div>
          )}
        </div>

        <form data-testid="tutor-form" onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            aria-label="Ask the professor"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Ask the professor... (Enter to send, Shift+Enter for newline)"
            rows={2} disabled={streaming}
            className="min-h-[44px] flex-1 resize-none rounded-[2px] border border-panel-border bg-void-elevated px-3 py-2 font-mono text-sm text-foreground placeholder:text-text-dim placeholder:font-sans focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan disabled:opacity-50" />
          <button type="submit" disabled={streaming || !draft.trim()}
            className="rounded-[2px] border border-cyan/60 bg-cyan/12 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-cyan hover:bg-cyan/20 disabled:opacity-40">
            {streaming ? '▸ ...' : '▸ SEND'}
          </button>
        </form>
      </HoloPanel>
    </div>
  )
}
