import { ReadShell } from '@/components/layout/ReadShell'

type Params = Promise<{ moduleId: string }>

export default async function ModuleFlashcardsPage({ params }: { params: Params }) {
  const { moduleId } = await params
  return (
    <ReadShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Flashcards: {moduleId}</h1>
        <p className="text-text-muted">Module-scoped review placeholder.</p>
      </div>
    </ReadShell>
  )
}
