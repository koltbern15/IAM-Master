import { cn } from '@/lib/utils'

interface CornerBracketsProps {
  /** Which corners to render. "diag" = top-left + bottom-right (default). "all" = all four. */
  corners?: 'diag' | 'all'
  /** Bracket arm length in px (default 6). */
  size?: number
  /** Border thickness in px (default 1.5). */
  thickness?: number
  /** Extra classes — typically a border-color utility like "border-cyan" or "border-warn". */
  className?: string
}

export function CornerBrackets({
  corners = 'diag',
  size = 6,
  thickness = 1.5,
  className
}: CornerBracketsProps) {
  const base = cn(
    'pointer-events-none absolute block border-cyan',
    className
  )
  const style = { width: size, height: size, borderWidth: 0 } as React.CSSProperties

  return (
    <>
      <span
        data-jarvis-corner="tl"
        className={base}
        style={{ ...style, top: -1, left: -1, borderTopWidth: thickness, borderLeftWidth: thickness }}
      />
      <span
        data-jarvis-corner="br"
        className={base}
        style={{ ...style, bottom: -1, right: -1, borderBottomWidth: thickness, borderRightWidth: thickness }}
      />
      {corners === 'all' && (
        <>
          <span
            data-jarvis-corner="tr"
            className={base}
            style={{ ...style, top: -1, right: -1, borderTopWidth: thickness, borderRightWidth: thickness }}
          />
          <span
            data-jarvis-corner="bl"
            className={base}
            style={{ ...style, bottom: -1, left: -1, borderBottomWidth: thickness, borderLeftWidth: thickness }}
          />
        </>
      )}
    </>
  )
}
