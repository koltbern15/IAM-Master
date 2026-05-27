import { describe, it, expect, vi } from 'vitest'

const streamMock = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation((opts: { apiKey: string; dangerouslyAllowBrowser?: boolean }) => ({
      __ctorOpts: opts,
      messages: { stream: streamMock }
    }))
  }
})

import Anthropic from '@anthropic-ai/sdk'
import { streamTutorReply } from './anthropic-client'

describe('streamTutorReply', () => {
  it('instantiates the SDK with apiKey + dangerouslyAllowBrowser=true per call', async () => {
    streamMock.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } }
      }
    })
    const chunks: string[] = []
    for await (const c of streamTutorReply({
      apiKey: 'sk-test-123',
      model: 'claude-sonnet-4-6',
      systemPrompt: 'You are a professor.',
      history: [],
      userMessage: 'Hello',
      sectionContent: 'Kerberos uses tickets.'
    })) { chunks.push(c) }
    expect(Anthropic).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'sk-test-123', dangerouslyAllowBrowser: true })
    )
    expect(chunks.join('')).toBe('hi')
  })

  it('passes section content embedded in the final user message', async () => {
    streamMock.mockReturnValue({ async *[Symbol.asyncIterator]() { /* empty */ } })
    const iter = streamTutorReply({
      apiKey: 'sk-x',
      model: 'claude-sonnet-4-6',
      systemPrompt: 'sys',
      history: [{ role: 'user', content: 'older' }, { role: 'assistant', content: 'reply' }],
      userMessage: 'follow up',
      sectionContent: 'Section MDX body...'
    })
    for await (const _chunk of iter) { /* drain */ void _chunk }
    const args = streamMock.mock.calls.at(-1)![0]
    expect(args.model).toBe('claude-sonnet-4-6')
    expect(args.system).toBe('sys')
    const lastUser = args.messages.at(-1)
    expect(lastUser.role).toBe('user')
    expect(String(lastUser.content)).toContain('follow up')
    expect(String(lastUser.content)).toContain('Section MDX body...')
  })

  it('yields nothing when the stream is empty', async () => {
    streamMock.mockReturnValue({ async *[Symbol.asyncIterator]() { /* empty */ } })
    const chunks: string[] = []
    for await (const c of streamTutorReply({
      apiKey: 'sk-x', model: 'claude-sonnet-4-6', systemPrompt: '',
      history: [], userMessage: 'q', sectionContent: ''
    })) { chunks.push(c) }
    expect(chunks).toEqual([])
  })
})
