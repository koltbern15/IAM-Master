'use client'

import { useRef } from 'react'
import { SectionToc } from './SectionToc'

/**
 * Client wrapper around the rendered MDX `<article>` that owns a ref so
 * {@link SectionToc} can read its headings. The MDX itself stays
 * server-rendered (passed in as `children`). On `xl` screens the TOC sits in a
 * sticky right column; below that it collapses into a `<details>` above the
 * article so it never collides with the AskProfessorRail.
 */
export function SectionArticle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  return (
    <div className="xl:flex xl:items-start xl:gap-8">
      <div className="min-w-0 flex-1">
        <details className="mb-6 rounded-[3px] border border-panel-border bg-panel-bg px-4 py-2 xl:hidden">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.1em] text-cyan/70">
            On this page
          </summary>
          <div className="mt-3">
            <SectionToc contentRef={ref} />
          </div>
        </details>
        <article
          ref={ref}
          className="prose prose-invert max-w-none [&_h2]:scroll-mt-16 [&_h3]:scroll-mt-16"
        >
          {children}
        </article>
      </div>
      <aside className="hidden w-56 shrink-0 xl:sticky xl:top-16 xl:block">
        <SectionToc contentRef={ref} />
      </aside>
    </div>
  )
}
