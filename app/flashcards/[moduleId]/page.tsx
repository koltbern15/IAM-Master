type Params = Promise<{ moduleId: string }>

export default async function ModuleFlashcardsPage({ params }: { params: Params }) {
  const { moduleId } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Flashcards: {moduleId}</h1>
      <p className="text-muted-foreground">Module-scoped review placeholder.</p>
    </div>
  )
}
