import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/hooks/use-tutor-chat', () => ({
  useTutorChat: vi.fn()
}))

import { TutorPanel } from './TutorPanel'
import { useTutorChat } from '@/hooks/use-tutor-chat'
import { loadState, saveState } from '@/lib/progress'

const useTutorChatMock = useTutorChat as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  window.localStorage.clear()
  useTutorChatMock.mockReset()
  useTutorChatMock.mockReturnValue({
    messages: [], streaming: false, error: null,
    sendMessage: vi.fn(), clear: vi.fn()
  })
})

describe('TutorPanel', () => {
  it('does not render when closed', () => {
    render(<TutorPanel open={false} onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.queryByPlaceholderText(/ask the professor/i)).not.toBeInTheDocument()
  })

  it('renders the panel with input + ASK PROFESSOR header when open', () => {
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByPlaceholderText(/ask the professor/i)).toBeInTheDocument()
    expect(screen.getByText(/ASK PROFESSOR/i)).toBeInTheDocument()
  })

  it('shows the amber STORED IN BROWSER notice when no API key is set', () => {
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByText(/STORED IN BROWSER/i)).toBeInTheDocument()
  })

  it('hides the no-key notice once a key is set', () => {
    const s = loadState()
    s.settings.anthropicApiKey = 'sk-x'
    saveState(s)
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.queryByText(/STORED IN BROWSER/i)).not.toBeInTheDocument()
  })

  it('renders rendered conversation messages', () => {
    useTutorChatMock.mockReturnValue({
      messages: [
        { role: 'user', content: 'What is a TGT?' },
        { role: 'assistant', content: 'A Ticket-Granting Ticket...' }
      ],
      streaming: false, error: null,
      sendMessage: vi.fn(), clear: vi.fn()
    })
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="" />)
    expect(screen.getByText(/What is a TGT/)).toBeInTheDocument()
    expect(screen.getByText(/A Ticket-Granting Ticket/)).toBeInTheDocument()
  })

  it('calls sendMessage on form submit with section content', () => {
    const sendMessage = vi.fn()
    useTutorChatMock.mockReturnValue({
      messages: [], streaming: false, error: null,
      sendMessage, clear: vi.fn()
    })
    const s = loadState()
    s.settings.anthropicApiKey = 'sk-x'
    saveState(s)
    render(<TutorPanel open onClose={() => {}} sectionId="m/s" sectionContent="SECTION-MDX" />)
    fireEvent.change(screen.getByPlaceholderText(/ask the professor/i), { target: { value: 'why?' } })
    fireEvent.submit(screen.getByTestId('tutor-form'))
    expect(sendMessage).toHaveBeenCalledWith('why?', 'SECTION-MDX')
  })
})
