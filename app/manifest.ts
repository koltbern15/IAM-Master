import type { MetadataRoute } from 'next'

/**
 * Web app manifest — makes IAM Mastery installable (add-to-home-screen) for
 * studying on mobile. The fix wave may add raster (PNG 192/512) icons here for
 * broader install support; the SVG mark covers modern browsers.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IAM Mastery',
    short_name: 'IAM Mastery',
    description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a0a0f',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' }],
  }
}
