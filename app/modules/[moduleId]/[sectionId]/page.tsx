type Params = Promise<{ moduleId: string; sectionId: string }>

export default async function SectionPage({ params }: { params: Params }) {
  const { moduleId, sectionId } = await params
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        {moduleId} / {sectionId}
      </h1>
      <p className="text-muted-foreground">Section content placeholder.</p>
    </div>
  )
}
