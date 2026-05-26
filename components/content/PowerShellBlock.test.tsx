import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PowerShellBlock } from './PowerShellBlock'

describe('PowerShellBlock', () => {
  it('renders the code content', () => {
    render(<PowerShellBlock>{`Get-ADUser -Filter *`}</PowerShellBlock>)
    expect(screen.getByText(/Get-ADUser/)).toBeInTheDocument()
  })

  it('renders the optional title', () => {
    render(<PowerShellBlock title="User Audit">Get-ADUser</PowerShellBlock>)
    expect(screen.getByText(/USER AUDIT/i)).toBeInTheDocument()
  })

  it('triggers clipboard copy on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<PowerShellBlock>{`echo hi`}</PowerShellBlock>)
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith('echo hi')
  })
})
