import { test } from '@playwright/test'

const ROUTES: Array<{ name: string; url: string }> = [
  { name: 'home', url: '/' },
  { name: 'module-overview', url: '/modules/01-foundations' },
  { name: 'section', url: '/modules/02-protocols/01-kerberos' },
  { name: 'flashcards', url: '/flashcards' },
  { name: 'flashcards-module', url: '/flashcards/01-foundations' },
  { name: 'search', url: '/search?q=kerberos' },
  { name: 'progress', url: '/progress' },
  { name: 'settings', url: '/settings' }
]

for (const r of ROUTES) {
  test(`smoke screenshot — ${r.name}`, async ({ page }) => {
    await page.goto(r.url)
    // Wait past boot sequence + initial paint
    await page.waitForTimeout(4200)
    await page.screenshot({
      path: `tests/visual/screens/${r.name}.png`,
      fullPage: false
    })
  })
}
