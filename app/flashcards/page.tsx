import Link from 'next/link'
import { ReadShell } from '@/components/layout/ReadShell'
import { FlashcardReview } from '@/components/flashcards/FlashcardReview'
import { getAllFlashcards } from '@/lib/content-index'
import { getModule } from '@/lib/content'
import type { ModuleId } from '@/lib/types'

export const metadata = { title: 'Flashcards' }

export default async function FlashcardsPage() {
  const deck = await getAllFlashcards()

  // Per-module card counts for the "browse by module" index.
  const counts = new Map<string, number>()
  for (const c of deck) counts.set(c.moduleId, (counts.get(c.moduleId) ?? 0) + 1)
  const moduleDecks = Array.from(counts.entries())
    .map(([id, count]) => ({ id, count, title: getModule(id as ModuleId)?.title ?? id }))
    .sort((a, b) => a.id.localeCompare(b.id))

  return (
    <ReadShell>
      <FlashcardReview deck={deck} title="ALL MODULES" />

      {moduleDecks.length > 0 && (
        <section className="mt-10 border-t border-panel-border pt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">▸ BROWSE BY MODULE</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {moduleDecks.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/flashcards/${m.id}`}
                  className="group flex items-center justify-between rounded-[3px] border border-panel-border bg-panel-bg px-4 py-2.5 transition-all hover:border-cyan/50 hover:bg-cyan/5"
                >
                  <span className="truncate font-display text-sm text-foreground group-hover:text-cyan">{m.title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-cyan/60">
                    {m.count} CARDS
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ReadShell>
  )
}
