import { getModule } from '@/lib/content'
import type { ModuleId } from '@/lib/types'

type Params = Promise<{ moduleId: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { moduleId } = await params
  const mod = getModule(moduleId as ModuleId)
  return { title: mod?.title ?? 'Modules' }
}

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return children
}
