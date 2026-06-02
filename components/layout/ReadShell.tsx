import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNavTrigger } from './MobileNavTrigger'
import { AskProfessorRail } from '@/components/jarvis/AskProfessorRail'

interface ReadShellProps {
  children: React.ReactNode
  /** Optional -- when set, the AskProfessorRail wires the tutor to this section. */
  tutorSectionId?: string
  /** Optional -- current section content (MDX-as-text) for grounding the tutor. */
  tutorSectionContent?: string
}

export function ReadShell({
  children,
  tutorSectionId,
  tutorSectionContent = ''
}: ReadShellProps) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <MobileNavTrigger />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 focus:outline-none"
        >
          {children}
        </main>
      </div>
      {tutorSectionId && (
        <AskProfessorRail sectionId={tutorSectionId} sectionContent={tutorSectionContent} />
      )}
    </div>
  )
}
