import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { ScanLineOverlay } from '@/components/jarvis/ScanLineOverlay'
import { BootSequence } from '@/components/jarvis/BootSequence'
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
        <AmbientBackground />
        <ScanLineOverlay />
        <BootSequence>{children}</BootSequence>
      </body>
    </html>
  )
}
