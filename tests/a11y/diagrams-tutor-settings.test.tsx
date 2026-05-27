import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { EcosystemMap } from '@/components/diagrams/EcosystemMap'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import { AskProfessorRail } from '@/components/jarvis/AskProfessorRail'
import { HudMiniPanels } from '@/components/jarvis/HudMiniPanels'
import SettingsPage from '@/app/settings/page'

expect.extend(toHaveNoViolations)

describe('a11y -- Plan 2C surfaces', () => {
  it('KerberosFlowDiagram has no axe violations', async () => {
    const { container } = render(<KerberosFlowDiagram />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('EcosystemMap has no axe violations', async () => {
    const { container } = render(<EcosystemMap />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TutorPanel (open) has no axe violations', async () => {
    const { container } = render(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('AskProfessorRail (closed) has no axe violations', async () => {
    const { container } = render(<AskProfessorRail sectionId="m/s" sectionContent="" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('SettingsPage has no axe violations', async () => {
    const { container } = render(<SettingsPage />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('HudMiniPanels has no axe violations', async () => {
    const { container } = render(<HudMiniPanels />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
