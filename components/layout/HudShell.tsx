import { StatusStrip } from '@/components/jarvis/StatusStrip'
import { TickerStrip } from '@/components/jarvis/TickerStrip'

interface HudShellProps {
  children: React.ReactNode
  events: string[]
}

export function HudShell({ children, events }: HudShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <StatusStrip />
      <main className="flex flex-1 items-center justify-center px-6 py-8">{children}</main>
      <TickerStrip events={events} />
    </div>
  )
}
