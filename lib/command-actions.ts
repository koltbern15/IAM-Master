import type { ModuleMeta } from './types'

export interface CommandAction {
  id: string
  label: string
  hint?: string
  /** Free-form keywords for fuzzy search */
  keywords?: string
  /** Either a route to navigate to OR a callback */
  href?: string
  run?: () => void
}

export function buildSectionActions(modules: ModuleMeta[]): CommandAction[] {
  const sectionActions: CommandAction[] = []
  for (const m of modules) {
    sectionActions.push({
      id: `module-${m.id}`,
      label: `${String(m.order).padStart(2, '0')} ${m.title}`,
      hint: 'MODULE',
      keywords: m.summary,
      href: `/modules/${m.id}`
    })
    for (const sectionId of m.sections) {
      sectionActions.push({
        id: `section-${m.id}-${sectionId}`,
        label: `${m.title} › ${sectionId}`,
        hint: 'SECTION',
        keywords: `${m.summary} ${sectionId}`,
        href: `/modules/${m.id}/${sectionId}`
      })
    }
  }
  return sectionActions
}

export function buildSystemActions(): CommandAction[] {
  return [
    { id: 'go-home', label: 'Go to home', hint: 'NAV', href: '/' },
    { id: 'go-flashcards', label: 'Review flashcards', hint: 'NAV', href: '/flashcards' },
    { id: 'go-search', label: 'Search', hint: 'NAV', href: '/search' },
    { id: 'go-progress', label: 'View progress', hint: 'NAV', href: '/progress' },
    { id: 'go-settings', label: 'Settings', hint: 'NAV', href: '/settings' }
  ]
}
