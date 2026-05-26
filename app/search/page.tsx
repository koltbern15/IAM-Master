import { ReadShell } from '@/components/layout/ReadShell'

type SearchParams = Promise<{ q?: string }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams
  return (
    <ReadShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-text-muted">
          {q ? `Results for "${q}" placeholder.` : 'Enter a query.'}
        </p>
      </div>
    </ReadShell>
  )
}
