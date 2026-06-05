import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { ReadShell } from '@/components/layout/ReadShell'
import { SectionArticle } from '@/components/layout/SectionArticle'
import { SectionMountTracker } from '@/components/jarvis/SectionMountTracker'
import { SectionKeyboardNav } from '@/components/jarvis/SectionKeyboardNav'
import { SectionComplete } from '@/components/jarvis/SectionComplete'
import { SC300Badge } from '@/components/content/SC300Badge'
import { loadSection } from '@/lib/content-loader'
import { getModule } from '@/lib/content'
import { getSectionMeta, getPrevNext, getSectionTitle } from '@/lib/sections'
import { getReadingMinutes } from '@/lib/content-index'
import type { ModuleId } from '@/lib/types'

type Params = Promise<{ moduleId: string; sectionId: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  return { title: getSectionTitle(moduleId, sectionId) }
}

export default async function SectionPage({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  const mod = getModule(moduleId as ModuleId)
  if (!mod) notFound()

  const tutorSectionId = `${moduleId}/${sectionId}`
  const meta = getSectionMeta(moduleId as ModuleId, sectionId)
  const title = meta?.title ?? getSectionTitle(moduleId, sectionId)
  const sectionIndex = mod.sections.indexOf(sectionId)
  const section = await loadSection(moduleId, sectionId)

  const breadcrumbs = (
    <nav aria-label="Breadcrumb" className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan/60">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="transition-colors hover:text-cyan">
            HOME
          </Link>
        </li>
        <li aria-hidden="true" className="text-cyan/30">
          ›
        </li>
        <li>
          <Link href={`/modules/${moduleId}`} className="transition-colors hover:text-cyan">
            {String(mod.order).padStart(2, '0')} {mod.title}
          </Link>
        </li>
        <li aria-hidden="true" className="text-cyan/30">
          ›
        </li>
        <li className="text-text-muted">{title}</li>
      </ol>
    </nav>
  )

  if (!section) {
    const tutorSectionContent = `Section "${sectionId}" of module "${mod.title}" (Phase ${mod.phase}). ${mod.summary}\n\n[Section body not yet authored. Answer general IAM questions about this topic; the curriculum text will replace this context when content is seeded.]`
    return (
      <ReadShell tutorSectionId={tutorSectionId} tutorSectionContent={tutorSectionContent}>
        <SectionMountTracker sectionKey={tutorSectionId} />
        <div className="space-y-4">
          {breadcrumbs}
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-cyan glow-cyan">
            {title}
          </h1>
          <p className="text-text-muted">Section content not yet authored. Coming soon.</p>
        </div>
      </ReadShell>
    )
  }

  const { Component, plainText } = section
  const readingMinutes = await getReadingMinutes(moduleId, sectionId)
  const { prev, next } = getPrevNext(moduleId, sectionId)
  const prevHref = prev ? `/modules/${prev.moduleId}/${prev.slug}` : null
  const nextHref = next ? `/modules/${next.moduleId}/${next.slug}` : null

  return (
    <ReadShell tutorSectionId={tutorSectionId} tutorSectionContent={plainText}>
      <SectionMountTracker sectionKey={tutorSectionId} />
      <SectionKeyboardNav prevHref={prevHref} nextHref={nextHref} />

      <header className="mb-8 border-b border-panel-border pb-6">
        {breadcrumbs}
        <div className="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">
          <span>
            ▸ SECTION {String(sectionIndex + 1).padStart(2, '0')} / {String(mod.sections.length).padStart(2, '0')}
          </span>
          <span className="text-cyan/30">//</span>
          <span className="flex items-center gap-1 text-text-muted">
            <Clock className="size-3" aria-hidden="true" />
            {readingMinutes} MIN READ
          </span>
          {meta?.sc300 && <SC300Badge />}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-[0.01em] text-cyan glow-cyan md:text-4xl">
          {title}
        </h1>
      </header>

      <SectionArticle>
        <Component />
      </SectionArticle>

      <footer className="mt-12 space-y-6 border-t border-panel-border pt-8">
        <SectionComplete sectionKey={tutorSectionId} />
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/modules/${prev.moduleId}/${prev.slug}`}
              className="group flex flex-col rounded-[3px] border border-panel-border bg-panel-bg px-4 py-3 transition-all hover:border-cyan/50 hover:bg-cyan/5"
            >
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan/50">
                <ChevronLeft className="size-3" aria-hidden="true" /> PREVIOUS
              </span>
              <span className="mt-1 truncate text-sm text-foreground group-hover:text-cyan">{prev.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next ? (
            <Link
              href={`/modules/${next.moduleId}/${next.slug}`}
              className="group flex flex-col items-end rounded-[3px] border border-panel-border bg-panel-bg px-4 py-3 text-right transition-all hover:border-cyan/50 hover:bg-cyan/5"
            >
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan/50">
                NEXT <ChevronRight className="size-3" aria-hidden="true" />
              </span>
              <span className="mt-1 truncate text-sm text-foreground group-hover:text-cyan">{next.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      </footer>
    </ReadShell>
  )
}
