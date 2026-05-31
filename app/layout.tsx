import type { Metadata } from 'next'
import './globals.css'
import { AppChrome } from '@/components/layout/AppChrome'
import { inter, rajdhani, jetbrainsMono } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
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
