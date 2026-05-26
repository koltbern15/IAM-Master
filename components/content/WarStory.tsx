import { HoloPanel } from '@/components/jarvis/HoloPanel'

interface WarStoryProps {
  title?: string
  children: React.ReactNode
}

export function WarStory({ title, children }: WarStoryProps) {
  return (
    <HoloPanel intent="threat" className="my-6" label={`⚠ WAR STORY${title ? ` // ${title}` : ''}`}>
      <div className="text-foreground">{children}</div>
    </HoloPanel>
  )
}
