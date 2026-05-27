/**
 * Shared media-query helpers. SSR-safe — every helper guards against
 * `window`/`window.matchMedia` being undefined (build-time prerender,
 * jsdom without a stub).
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
