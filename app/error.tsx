'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { HoloPanel } from '@/components/jarvis/HoloPanel'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <HoloPanel intent="threat" cornersAll ambientBorder label="SYSTEM FAULT" className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.05em] text-threat glow-cyan-strong">
          System Fault
        </h1>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-threat/70">
          ▸ UNEXPECTED EXCEPTION // RECOVERY AVAILABLE
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-text-muted">
          A subsystem threw an uncaught exception. Re-initialize the module or fall back to the command deck.
        </p>
        {error.digest && (
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-threat/50">
            ▸ DIGEST {error.digest}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[2px] border border-threat/60 bg-void-elevated px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-threat transition-colors hover:border-threat focus:outline-none focus-visible:ring-2 focus-visible:ring-threat/60"
          >
            ▸ RE-INITIALIZE
          </button>
          <Link
            href="/"
            className="rounded-[2px] border border-cyan/60 bg-void-elevated px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-cyan glow-cyan transition-colors hover:border-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
          >
            ▸ COMMAND DECK
          </Link>
        </div>
      </HoloPanel>
    </main>
  )
}
