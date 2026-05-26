import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface ReadShellProps {
  children: React.ReactNode
}

export function ReadShell({ children }: ReadShellProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
