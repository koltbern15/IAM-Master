import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { TutorPanel } from '@/components/jarvis/TutorPanel'
import SettingsPage from '@/app/settings/page'

expect.extend(toHaveNoViolations)

describe('a11y -- Plan 2C surfaces', () => {
  it('KerberosFlowDiagram has no axe violations', async () => {
    const { container } = render(<KerberosFlowDiagram />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('TutorPanel (open) has no axe violations', async () => {
    const { container } = render(
      <TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('SettingsPage has no axe violations', async () => {
    const { container } = render(<SettingsPage />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
