import { notFound } from 'next/navigation'
import { ReadShell } from '@/components/layout/ReadShell'
import { SectionMountTracker } from '@/components/jarvis/SectionMountTracker'
import { loadSection } from '@/lib/content-loader'
import { getModule } from '@/lib/content'
import type { ModuleId } from '@/lib/types'

type Params = Promise<{ moduleId: string; sectionId: string }>

export default async function SectionPage({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  const mod = getModule(moduleId as ModuleId)
  if (!mod) notFound()

  const tutorSectionId = `${moduleId}/${sectionId}`
  const section = await loadSection(moduleId, sectionId)

  if (!section) {
    // Section is in the module schema but the MDX file hasn't been authored yet.
    const tutorSectionContent = `Section "${sectionId}" of module "${mod.title}" (Phase ${mod.phase}). ${mod.summary}\n\n[Section body not yet authored. Answer general IAM questions about this topic; the curriculum text will replace this context when content is seeded.]`
    return (
      <ReadShell tutorSectionId={tutorSectionId} tutorSectionContent={tutorSectionContent}>
        <SectionMountTracker sectionKey={tutorSectionId} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold uppercase tracking-[0.04em] text-cyan glow-cyan">
            {sectionId.toUpperCase()}
          </h1>
          <p className="text-text-muted">Section content not yet authored. Coming soon.</p>
        </div>
      </ReadShell>
    )
  }

  const { Component, plainText } = section

  return (
    <ReadShell tutorSectionId={tutorSectionId} tutorSectionContent={plainText}>
      <SectionMountTracker sectionKey={tutorSectionId} />
      <article className="prose prose-invert max-w-none">
        <Component />
      </article>
    </ReadShell>
  )
}
