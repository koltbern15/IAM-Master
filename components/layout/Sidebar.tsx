import Link from 'next/link'
import { NavList } from './NavList'

export function Sidebar() {
  return (
    <nav
      aria-label="Modules"
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-panel-border bg-void-elevated/60 backdrop-blur-sm md:flex"
    >
      <div className="border-b border-panel-border px-5 py-4">
        <Link
          href="/"
          className="block font-display text-base font-bold uppercase tracking-[0.1em] text-cyan glow-cyan"
        >
          IAM MASTERY
        </Link>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan/70">
          <span aria-hidden="true">▸ </span>CURRICULUM // 12 MODULES
        </div>
      </div>

      <NavList />
    </nav>
  )
}
