import modulesJson from '@/content/modules.json'
import type { ModuleId, ModuleMeta } from './types'

const MODULES: ModuleMeta[] = (modulesJson as ModuleMeta[]).slice().sort((a, b) => a.order - b.order)

export function getAllModules(): ModuleMeta[] {
  return MODULES.slice()
}

export function getModule(id: ModuleId): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id)
}

export function isPhaseOneModule(id: ModuleId): boolean {
  const m = getModule(id)
  return m?.phase === 1
}

export function getPhaseModules(phase: 1 | 2 | 3): ModuleMeta[] {
  return MODULES.filter((m) => m.phase === phase)
}
