import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('triggers clipboard copy on button click and shows confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<PowerShellBlock>{`echo hi`}</PowerShellBlock>)
    fireEvent.click(screen.getByRole('button', { name: /copy code/i }))
    expect(writeText).toHaveBeenCalledWith('echo hi')
    // The copy handler resolves a promise then sets state; await the flush so the
    // post-await setCopied(true) update is wrapped (no "not wrapped in act" warning).
    // On success the button's accessible name flips to "Copied to clipboard" (a11y
    // fix: the state change is now announced, not masked by a static aria-label).
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toHaveTextContent(/copied/i)
    })
  })
})
