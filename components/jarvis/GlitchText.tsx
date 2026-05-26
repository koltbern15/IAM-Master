import { cn } from '@/lib/utils'

interface GlitchTextProps {
  children: React.ReactNode
  /** Run the brief glitch animation once on mount when true. */
  glitch?: boolean
  className?: string
}

export function GlitchText({ children, glitch = false, className }: GlitchTextProps) {
  return (
    <span
      className={cn(
        'inline-block',
        glitch && 'animate-[jarvis-glitch_700ms_steps(4,end)_1] motion-reduce:animate-none',
        className
      )}
    >
      {children}
    </span>
  )
}
