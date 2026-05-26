import type { Metadata } from 'next'
import './globals.css'
import { AmbientBackground } from '@/components/layout/AmbientBackground'

export const metadata: Metadata = {
  title: 'IAM Mastery',
  description: 'Complete IAM mastery — foundations to expert, every protocol, every tool.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <AmbientBackground />
        <div className="relative flex min-h-screen">
          <aside
            id="sidebar-slot"
            className="hidden w-64 shrink-0 border-r border-border md:block"
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <header id="topbar-slot" className="h-14 border-b border-border" />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
