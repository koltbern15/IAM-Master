'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

/**
 * On-page table of contents. Reads the rendered article's `h2[id]`/`h3[id]`
 * (ids come from rehype-slug, wired in next.config.mjs) from `contentRef` after
 * mount, lists them as smooth-scroll in-page links, and scroll-spies the active
 * heading. Renders nothing for a flat section (< 2 headings).
 */
export function SectionToc({ contentRef }: { contentRef: React.RefObject<HTMLElement | null> }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'))
    setHeadings(
      els.map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: el.tagName === 'H3' ? 3 : 2
      }))
    )

    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId((e.target as HTMLElement).id)
        }
      },
      { rootMargin: '0px 0px -70% 0px' }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [contentRef])

  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="font-mono text-[10px] uppercase tracking-[0.1em]">
      <div className="mb-2 text-cyan/60">
        <span aria-hidden="true">▸ </span>ON THIS PAGE
      </div>
      <ul className="space-y-1 border-l border-panel-border">
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && 'pl-3')}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block -ml-px border-l-2 py-0.5 pl-3 transition-colors hover:text-cyan',
                activeId === h.id
                  ? 'border-cyan text-cyan'
                  : 'border-transparent text-text-muted'
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
