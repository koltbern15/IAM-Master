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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}
