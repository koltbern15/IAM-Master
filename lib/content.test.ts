import { describe, it, expect } from 'vitest'
import { getAllModules, getModule, isPhaseOneModule } from './content'

describe('lib/content', () => {
  it('returns all 12 modules in order', () => {
    const modules = getAllModules()
    expect(modules).toHaveLength(12)
    expect(modules[0].id).toBe('01-foundations')
    expect(modules[11].id).toBe('12-labs')
  })

  it('returns module by id', () => {
    const mod = getModule('03-microsoft-identity')
    expect(mod).toBeDefined()
    expect(mod!.title).toBe('Microsoft Identity Platform')
    expect(mod!.phase).toBe(1)
    expect(mod!.sections).toHaveLength(3)
  })

  it('returns undefined for unknown module id', () => {
    // @ts-expect-error invalid id for negative test
    expect(getModule('99-bogus')).toBeUndefined()
  })

  it('identifies Phase 1 modules correctly', () => {
    expect(isPhaseOneModule('01-foundations')).toBe(true)
    expect(isPhaseOneModule('04-pam')).toBe(false)
    expect(isPhaseOneModule('11-cert-roadmap')).toBe(true)
  })

  it('Phase 1 module ids are exactly: 01, 02, 03, 06, 11', () => {
    const phase1 = getAllModules().filter((m) => m.phase === 1).map((m) => m.id)
    expect(phase1).toEqual([
      '01-foundations',
      '02-protocols',
      '03-microsoft-identity',
      '06-powershell',
      '11-cert-roadmap'
    ])
  })
})
