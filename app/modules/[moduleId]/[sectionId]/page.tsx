import { ReadShell } from '@/components/layout/ReadShell'
import { getModule } from '@/lib/content'
import type { ModuleId } from '@/lib/types'

type Params = Promise<{ moduleId: string; sectionId: string }>

export default async function SectionPage({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  const mod = getModule(moduleId as ModuleId)
  const tutorSectionId = `${moduleId}/${sectionId}`

  // Until real MDX content lands in Plan 3, hand the tutor a brief
  // placeholder so it knows what section it's anchored to. Real section
  // body replaces this string when curriculum authoring lands.
  const tutorSectionContent = mod
    ? `Section "${sectionId}" of module "${mod.title}" (Phase ${mod.phase}). ${mod.summary}\n\n[Section body not yet authored. Answer general IAM questions about this topic; the curriculum text will replace this context when content is seeded.]`
    : `Section "${sectionId}" of unknown module "${moduleId}".`

  return (
    <ReadShell tutorSectionId={tutorSectionId} tutorSectionContent={tutorSectionContent}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          {moduleId} / {sectionId}
        </h1>
        <p className="text-text-muted">Section content placeholder.</p>
      </div>
    </ReadShell>
  )
}
