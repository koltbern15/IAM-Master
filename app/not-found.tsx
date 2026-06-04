import Link from 'next/link'
import { HoloPanel } from '@/components/jarvis/HoloPanel'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <HoloPanel intent="warn" cornersAll ambientBorder label="SIGNAL LOST // 404" className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.05em] text-warn glow-cyan-strong">
          Signal Lost
        </h1>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-warn/70">
          ▸ ROUTE NOT FOUND // 404
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-text-muted">
          The coordinates you requested aren&apos;t mapped to any module on this deck.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-[2px] border border-cyan/60 bg-void-elevated px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-cyan glow-cyan transition-colors hover:border-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
        >
          ▸ RETURN TO COMMAND DECK
        </Link>
      </HoloPanel>
    </main>
  )
}
