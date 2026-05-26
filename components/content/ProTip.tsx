interface ProTipProps {
  children: React.ReactNode
}

export function ProTip({ children }: ProTipProps) {
  return (
    <div className="my-4 border-l-2 border-warn bg-warn/5 px-4 py-3 text-foreground">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-warn">⚡ PRO TIP</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}
