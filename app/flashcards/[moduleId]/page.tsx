import { notFound } from 'next/navigation'
import { ReadShell } from '@/components/layout/ReadShell'
import { FlashcardReview } from '@/components/flashcards/FlashcardReview'
import { getModuleFlashcards } from '@/lib/content-index'
import { getModule } from '@/lib/content'
import type { ModuleId } from '@/lib/types'

type Params = Promise<{ moduleId: string }>

export default async function ModuleFlashcardsPage({ params }: { params: Params }) {
  const { moduleId } = await params
  const mod = getModule(moduleId as ModuleId)
  if (!mod) notFound()

  const deck = await getModuleFlashcards(moduleId)
  return (
    <ReadShell>
      <FlashcardReview deck={deck} title={mod.title} backHref="/flashcards" />
    </ReadShell>
  )
}
