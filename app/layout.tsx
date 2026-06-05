import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppChrome } from '@/components/layout/AppChrome'
import { inter, rajdhani, jetbrainsMono } from '@/lib/fonts'

const description = 'Complete IAM mastery — foundations to expert, every protocol, every tool.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'IAM Mastery',
    template: '%s · IAM Mastery'
  },
  description,
  openGraph: {
    title: 'IAM Mastery',
    description,
    type: 'website',
    siteName: 'IAM Mastery'
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-[2px] border border-cyan/60 bg-void-elevated px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-cyan shadow-[0_0_18px_rgb(0_240_255/0.4)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-cyan"
        >
          Skip to content
        </a>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
