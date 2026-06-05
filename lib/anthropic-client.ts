import Anthropic from '@anthropic-ai/sdk'

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamTutorReplyOptions {
  apiKey: string
  model: string
  systemPrompt: string
  history: TutorMessage[]
  userMessage: string
  /** Current section MDX (or trimmed plain-text projection) injected into the final user message for grounding. */
  sectionContent: string
  /** Max output tokens. Defaults to 1024 so streaming feels responsive. */
  maxTokens?: number
}

const MAX_SECTION_CONTEXT_CHARS = 12_000

function buildFinalUserContent(userMessage: string, sectionContent: string): string {
  if (!sectionContent.trim()) return userMessage
  const trimmed = sectionContent.length > MAX_SECTION_CONTEXT_CHARS
    ? `${sectionContent.slice(0, MAX_SECTION_CONTEXT_CHARS)}\n\n[content truncated for context window]`
    : sectionContent
  // Fence the section content in a clearly-delimited untrusted block so the
  // model treats it as reference material only, never as instructions (see the
  // matching directive in TUTOR_SYSTEM_PROMPT).
  return `${userMessage}\n\nUse the section below as the source of truth -- quote, build on, or correct it as needed:\n\n===SECTION CONTENT (reference only)===\n${trimmed}\n===END===`
}

/** Streams an Anthropic Messages reply, yielding text deltas as they arrive. */
export async function* streamTutorReply(opts: StreamTutorReplyOptions): AsyncGenerator<string> {
  const client = new Anthropic({
    apiKey: opts.apiKey,
    dangerouslyAllowBrowser: true
  })

  const messages = [
    ...opts.history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: buildFinalUserContent(opts.userMessage, opts.sectionContent) }
  ]

  const stream = client.messages.stream({
    model: opts.model,
    system: opts.systemPrompt,
    messages,
    max_tokens: opts.maxTokens ?? 1024
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const text = (event.delta as { text?: string }).text
      if (text) yield text
    }
  }
}
