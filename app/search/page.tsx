import { ReadShell } from '@/components/layout/ReadShell'
import { SearchResults } from '@/components/search/SearchResults'
import { getSearchIndex } from '@/lib/content-index'

type SearchParams = Promise<{ q?: string }>

export const metadata = { title: 'Search' }

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams
  const entries = await getSearchIndex()
  return (
    <ReadShell>
      <SearchResults entries={entries} initialQuery={q ?? ''} />
    </ReadShell>
  )
}
