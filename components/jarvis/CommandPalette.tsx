'use client'

import { useMemo, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Command } from 'cmdk'
import { getAllModules } from '@/lib/content'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { buildSectionActions, buildSystemActions, type CommandAction } from '@/lib/command-actions'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  // A section page is /modules/<moduleId>/<sectionId>: exactly 3 non-empty
  // path segments where the first is 'modules'.
  const isSection = useMemo(() => {
    const segments = (pathname ?? '').split('/').filter(Boolean)
    return segments.length === 3 && segments[0] === 'modules'
  }, [pathname])

  const actions = useMemo<CommandAction[]>(() => {
    const base = [...buildSectionActions(getAllModules()), ...buildSystemActions()]
    if (isSection) {
      const askProfessor: CommandAction = {
        id: 'ask-professor',
        label: 'Ask the Professor about this section',
        hint: 'TUTOR',
        run: () => {
          window.dispatchEvent(new CustomEvent('iam-mastery:open-tutor'))
        }
      }
      return [askProfessor, ...base]
    }
    return base
  }, [isSection])

  useFocusTrap(open, containerRef)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  function handleSelect(action: CommandAction) {
    onOpenChange(false)
    if (action.href) router.push(action.href)
    else action.run?.()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-void/70 pt-[20vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <Command
        ref={containerRef}
        label="Command palette"
        className="w-full max-w-xl rounded-[3px] border border-cyan/40 bg-void-elevated/90 shadow-[0_0_24px_rgb(0_240_255/0.35)] backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-cyan/25 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/60">
          ▸ COMMAND
        </div>
        <Command.Input
          placeholder="Type a command or search…"
          className="w-full bg-transparent px-4 py-3 font-mono text-sm uppercase tracking-[0.05em] text-foreground outline-none placeholder:text-text-dim placeholder:normal-case placeholder:tracking-normal"
          autoFocus
        />
        <Command.List className="max-h-[50vh] overflow-y-auto px-2 pb-2">
          <Command.Empty className="px-3 py-4 font-mono text-xs uppercase tracking-[0.1em] text-text-muted">
            No results.
          </Command.Empty>
          {actions.map((a) => (
            <Command.Item
              key={a.id}
              value={`${a.label} ${a.keywords ?? ''}`}
              onSelect={() => handleSelect(a)}
              className="flex items-center justify-between gap-2 rounded-[2px] px-3 py-2 text-sm text-foreground aria-selected:bg-cyan/12 aria-selected:text-cyan"
            >
              <span>{a.label}</span>
              {a.hint && (
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70">{a.hint}</span>
              )}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
