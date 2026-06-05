import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // StrictMode on: dev double-mount surfaces effect-cleanup bugs early. Audited
  // 2026-06-01 (ParticleField rAF, SectionMountTracker, state-change listeners)
  // — see plan 2026-06-01-ux-polish-and-diagrams.md Task 1C.
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false,
    optimizePackageImports: ['lucide-react', 'radix-ui']
  }
}

// Plugins are passed as module-name STRINGS (not imported function refs): the
// @next/mdx webpack loader resolves and imports them itself (see
// node_modules/@next/mdx/mdx-js-loader.js importPlugin), and string options
// survive webpack's loader-options serialization / persistent cache so the
// transforms actually run. Passing function refs here silently no-ops under
// webpack caching.
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      // Deterministic `id` on every heading so the on-page TOC + deep links work.
      'rehype-slug',
      // Wrap each heading's text in a focusable anchor (subtle `.heading-anchor`
      // styling lives in app/globals.css).
      ['rehype-autolink-headings', { behavior: 'wrap', properties: { className: ['heading-anchor'] } }]
    ]
  }
})

export default withMDX(nextConfig)
