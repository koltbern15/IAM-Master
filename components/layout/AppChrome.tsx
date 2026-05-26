'use client'

import { useState } from 'react'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScanLineOverlay } from '@/components/jarvis/ScanLineOverlay'
import { BootSequence } from '@/components/jarvis/BootSequence'
import { CommandPalette } from '@/components/jarvis/CommandPalette'
import { KeyboardHelpOverlay } from '@/components/jarvis/KeyboardHelpOverlay'
import { PageTransition } from '@/components/jarvis/PageTransition'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function AppChrome({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useKeyboardShortcuts({
    'cmd+k': () => setPaletteOpen((o) => !o),
    '?': () => setHelpOpen((o) => !o),
    escape: () => {
      setPaletteOpen(false)
      setHelpOpen(false)
    }
  })

  return (
    <>
      <AmbientBackground />
      <ScanLineOverlay />
      <BootSequence>
        <PageTransition>{children}</PageTransition>
      </BootSequence>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <KeyboardHelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
