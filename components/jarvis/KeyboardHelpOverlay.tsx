'use client'

interface KeyboardHelpOverlayProps {
  open: boolean
  onClose: () => void
}

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'Cmd+K', description: 'Open command palette' },
  { keys: 'J', description: 'Next section' },
  { keys: 'K', description: 'Previous section' },
  { keys: 'Space', description: 'Flip flashcard' },
  { keys: '1 / 2 / 3', description: 'Flashcard demote / repeat / promote' },
  { keys: 'Esc', description: 'Close any overlay' },
  { keys: '?', description: 'Open this shortcut help' }
]

export function KeyboardHelpOverlay({ open, onClose }: KeyboardHelpOverlayProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-void/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-md rounded-[3px] border border-cyan/40 bg-void-elevated/90 p-6 shadow-[0_0_24px_rgb(0_240_255/0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-[0.1em] text-cyan glow-cyan">
          KEYBOARD SHORTCUTS
        </h2>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-6">
              <span className="text-sm text-foreground">{s.description}</span>
              <kbd className="rounded-[2px] border border-cyan/30 bg-cyan/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
