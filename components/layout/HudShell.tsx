import { StatusStrip } from '@/components/jarvis/StatusStrip'
import { TickerStrip } from '@/components/jarvis/TickerStrip'
import { ParticleField } from '@/components/jarvis/ParticleField'

interface HudShellProps {
  children: React.ReactNode
  events: string[]
}

export function HudShell({ children, events }: HudShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ParticleField />
      <StatusStrip />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-6 py-8 focus:outline-none"
      >
        {children}
      </main>
      <TickerStrip events={events} />
    </div>
  )
}
