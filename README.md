# IAM Mastery

A personal, single-author learning platform for Identity & Access Management — foundations to expert — wrapped in a cinematic JARVIS HUD. The curriculum is authored as MDX, rendered as interactive sections (quizzes, flashcards, war stories, protocol diagrams), and backed by an in-browser AI tutor grounded in the section you're reading.

## Tech stack

- **Next.js 16** (App Router, RSC) with the **Webpack** builder (`next dev --webpack` / `next build --webpack`)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** (design tokens + keyframes in `app/globals.css`) — JARVIS HUD theme: cyan `#00f0ff` on void `#0a0a0f`
- **MDX** (`@next/mdx`, `@mdx-js/react`) for all curriculum content
- **framer-motion** for animation, **three / @react-three/fiber / drei** for 3D accents, **howler** for sound, **fuse.js** for search, **cmdk** for the command palette, **radix-ui** + **lucide-react** for primitives/icons
- **@anthropic-ai/sdk** for the in-browser tutor (runs client-side; see Deploying)
- **Vitest** + Testing Library + jest-axe for unit/a11y tests, **Playwright** for visual tests
- **pnpm** (`pnpm@9.14.0`) as the package manager

## Getting started

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server (http://localhost:3000)
pnpm build        # production build
pnpm start        # serve the production build
pnpm test         # run the unit/a11y test suite once (vitest run)
pnpm test:watch   # vitest in watch mode
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint .
```

Visual regression (optional, requires Playwright browsers):

```bash
pnpm test:visual          # run Playwright visual tests
pnpm test:visual:update   # update visual snapshots
```

To use the AI tutor, open **Settings** in the app and paste an Anthropic API key. It is stored in the browser only and sent directly to Anthropic — never to any server of this app.

## Project structure

```
app/                         # App Router routes (RSC)
  page.tsx                   # home / module constellation
  modules/[moduleId]/[sectionId]/page.tsx   # a rendered section
  flashcards/  progress/  search/  settings/
  globals.css                # design tokens + keyframes (JARVIS theme)
components/
  content/                   # MDX building blocks (Quiz, Flashcard, WarStory, ProTip, ...)
  diagrams/                  # protocol diagrams (Kerberos, SAML, OAuth, Hybrid, Ecosystem)
  jarvis/                    # HUD chrome (HoloPanel, tutor panel, mini panels)
  layout/                    # ReadShell and page shells
content/
  modules.json               # module + section registry (source of truth for what exists & order)
  modules/<moduleId>/<sectionId>.mdx   # the curriculum itself
lib/
  content-loader.ts          # maps a section key -> its MDX component + plain text for the tutor
  content.ts                 # reads modules.json
  sections.ts                # section titles + SC-300 alignment
  recipes.ts                 # IAM_RECIPES — PowerShell recipes for <CommandReference/>
  anthropic-client.ts        # streams the tutor reply (client-side)
hooks/                       # use-tutor-chat, use-sound, ...
mdx-components.tsx           # registers components available inside every MDX file
```

`content/modules.json` and `lib/sections.ts` are kept as twin sources of truth on purpose — a unit test asserts every slug in `modules.json` has a title entry in `sections.ts`, so the two can never silently drift.

## How to add a section

A section is one `.mdx` file under `content/modules/<moduleId>/`. Adding one touches **four** places — miss any and the section won't render (or the title/registry test will fail).

1. **Create the MDX file.** Write `content/modules/<moduleId>/<sectionId>.mdx`. Use the components listed under [Available MDX components](#available-mdx-components). Start with an H1 that matches the title you'll register in step 4. (Example to crib from: `content/modules/02-protocols/01-kerberos.mdx`.)

2. **Register the key in `lib/content-loader.ts`** — two edits, both required:
   - Add `'<moduleId>/<sectionId>'` to the **`AUTHORED_SECTIONS`** set.
   - Add a matching **`case` to the import switch** in `loadAuthoredComponent`, e.g.
     ```ts
     case '02-protocols/07-radius':
       return (await import('@/content/modules/02-protocols/07-radius.mdx')).default
     ```
   The switch is what Webpack statically resolves at build time, so every `AUTHORED_SECTIONS` entry must have both a real `.mdx` file and a `case`. (`ALL_KNOWN_SECTIONS` in the same file already mirrors `AUTHORED_SECTIONS`; keep it in sync if you add a known-but-not-yet-authored placeholder.)

3. **Add the slug to the module's `sections` array in `content/modules.json`.** Order in this array is the curriculum order used for prev/next navigation and the search/flashcard indexes.

4. **Add a title to `SECTION_TITLES` in `lib/sections.ts`,** keyed by `'<moduleId>/<slug>'`. If the section is SC-300 exam-aligned, also add the key to `SC300_SECTIONS` so it surfaces the SC-300 badge.

Run `pnpm typecheck` and `pnpm test` to confirm the loader compiles and the title/registry test passes.

## How to add a PowerShell recipe

PowerShell recipes power the `<CommandReference/>` reference panel. Add an entry to the **`IAM_RECIPES`** array in `lib/recipes.ts`:

```ts
{
  id: 'unique-id',
  category: 'Lifecycle',   // category drives the filter chips
  title: 'Short, action-oriented description',
  command: 'Update-MgUser -UserId "ada@contoso.com" -AccountEnabled:$false',
  description: 'Optional note on gotchas, required scopes, or when to use it.',
}
```

Keep cmdlets current — the existing recipes use `Microsoft.Graph` / `ActiveDirectory` modules only (no retired `AzureAD` / `MSOnline`). Reuse an existing `category` to land under an existing filter chip, or introduce a new one. Drop `<CommandReference />` into any section MDX to render the (optionally category-filtered) list.

## How to add a war story

War stories are field anecdotes that make a concept stick. Inside any section's `.mdx`, wrap the narrative in a `<WarStory>` with a `title`:

```mdx
## War story

<WarStory title="The 2008 krbtgt and the 9-Month Remediation">
A regional community bank had never rotated its krbtgt since the domain was
provisioned in 2008. A red team forged a Golden Ticket in two days...
</WarStory>
```

No registration needed — `WarStory` is already wired up in `mdx-components.tsx`, so it's available in every section.

## Available MDX components

These are registered in `mdx-components.tsx` and can be used in any section MDX without an import:

- `<WarStory title="...">` — field-anecdote callout
- `<ProTip>` — highlighted practitioner tip
- `<Definition term="...">…</Definition>` — inline term definition
- `<Flashcard front="..." back="..." />` — spaced-repetition card
- `<Quiz question={{ ... }} />` — interactive quiz
- `<CommandReference />` — PowerShell recipe reference (from `IAM_RECIPES`)
- `<PowerShellBlock>` — styled PowerShell code block
- `<SC300Badge />` — SC-300 alignment badge
- `<HoloPanel label="...">` — JARVIS holographic panel wrapper
- Diagrams: `<KerberosFlowDiagram />`, `<SAMLFlowDiagram />`, `<OAuthFlowDiagram />`, `<HybridIdentityDiagram />`, `<EcosystemMap />`

## Deploying

Deploy to **Vercel**:

1. Push the repo to GitHub (or another git provider).
2. In Vercel, **Add New… → Project** and import the repo. The framework is auto-detected as **Next.js** — no special build config needed (`pnpm build` / `pnpm install` are inferred).
3. Deploy.

**Environment variables:** none are required today. The AI tutor runs entirely client-side — the Anthropic API key is entered in **Settings**, stored in the browser, and sent directly to Anthropic (`lib/anthropic-client.ts` uses `dangerouslyAllowBrowser: true`). If the tutor route is ever moved server-side, set **`ANTHROPIC_API_KEY`** in the Vercel project's environment variables instead of relying on the client-side key.
