export type Phase = 1 | 2 | 3

export type ModuleId =
  | '01-foundations'
  | '02-protocols'
  | '03-microsoft-identity'
  | '04-pam'
  | '05-iga'
  | '06-powershell'
  | '07-cloud-iam'
  | '08-security-detection'
  | '09-compliance'
  | '10-program-leadership'
  | '11-cert-roadmap'
  | '12-labs'

export type SectionStatus = 'seeded' | 'drafted' | 'personalized' | 'mastered'

export interface ModuleMeta {
  id: ModuleId
  title: string
  phase: Phase
  order: number
  summary: string
  sections: string[]
}

export interface SectionMeta {
  title: string
  section: number
  module: ModuleId
  sc300: boolean
  estimatedMinutes: number
  keywords: string[]
  phase: Phase
  status: SectionStatus
  slug: string
}
