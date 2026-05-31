import type { ReactElement } from 'react'
import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { EcosystemMap } from '@/components/diagrams/EcosystemMap'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import { AskProfessorRail } from '@/components/jarvis/AskProfessorRail'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import SettingsPage from '@/app/settings/page'

expect.extend(toHaveNoViolations)

// Several of these surfaces render Next <Link> (useOptimistic), which schedules a
// passive mount effect that resolves on a macrotask, after render returns. Render
// inside act, then flush a macrotask inside act so that deferred update commits
// within act scope and no "not wrapped in act" warning escapes. This does NOT
// weaken the axe assertions below.
async function renderFlushed(ui: ReactElement): Promise<HTMLElement> {
  let container!: HTMLElement
  await act(async () => {
    ;({ container } = render(ui))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  return container
}

describe('a11y -- Plan 2C surfaces', () => {
  it('KerberosFlowDiagram has no axe violations', async () => {
    const container = await renderFlushed(<KerberosFlowDiagram />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('EcosystemMap has no axe violations', async () => {
    const container = await renderFlushed(<EcosystemMap />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TutorPanel (open) has no axe violations', async () => {
    const container = await renderFlushed(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('AskProfessorRail (closed) has no axe violations', async () => {
    const container = await renderFlushed(<AskProfessorRail sectionId="m/s" sectionContent="" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('SettingsPage has no axe violations', async () => {
    const container = await renderFlushed(<SettingsPage />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('HudMiniPanels has no axe violations', async () => {
    const container = await renderFlushed(<HudMiniPanels />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
