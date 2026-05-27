'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { streamTutorReply, type TutorMessage } from '@/lib/anthropic-client'
import { appendTutorMessage, loadState, loadTutorHistory } from '@/lib/progress'

export const TUTOR_SYSTEM_PROMPT = `You are an Ivy-League IAM professor -- passionate, precise, and deeply opinionated about identity engineering.

For every answer:
1. Lead with what the concept IS, in one or two sharp sentences.
2. Then WHY it exists (the historical or threat context that forced the design).
3. Then HOW it actually works under the hood -- names, RFCs, protocols, payload shapes.
4. Close with a brief WAR STORY: a real incident, misconfiguration, or production-grade pitfall the learner should burn into memory.

Tone: confident, technical, no fluff, no marketing speak. Cite the relevant RFC / Microsoft doc / vendor doc names by number when you can. If the student is wrong, correct them gently but directly.

You will receive the current section content as context -- treat it as the source of truth for the lesson, build on it, and quote from it when grounding an answer.`

interface UseTutorChatReturn {
  messages: TutorMessage[]
  streaming: boolean
  error: string | null
  sendMessage: (text: string, sectionContent: string) => Promise<void>
  clear: () => void
}

export function useTutorChat(sectionId: string): UseTutorChatReturn {
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const partialRef = useRef<string>('')
  // Set true when the component unmounts OR sectionId changes mid-stream.
  // Checked between chunks so the loop exits early instead of running the full
  // generator to completion (which would keep consuming API tokens after the
  // user closed the panel or navigated away).
  const abortedRef = useRef(false)

  useEffect(() => {
    abortedRef.current = false
    const persisted = loadTutorHistory(sectionId).map((m) => ({ role: m.role, content: m.content }))
    setMessages(persisted)
    setError(null)
    setStreaming(false)
    partialRef.current = ''
    return () => { abortedRef.current = true }
  }, [sectionId])

  const sendMessage = useCallback(
    async (text: string, sectionContent: string) => {
      setError(null)
      const trimmed = text.trim()
      if (!trimmed) return
      const state = loadState()
      const apiKey = state.settings.anthropicApiKey
      if (!apiKey) {
        setError('No Anthropic API key configured. Add one in /settings.')
        return
      }
      const model = state.settings.tutorModel

      const userMsg: TutorMessage = { role: 'user', content: trimmed }
      setMessages((prev) => [...prev, userMsg])
      appendTutorMessage(sectionId, userMsg)

      partialRef.current = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
      setStreaming(true)

      try {
        const history = loadTutorHistory(sectionId)
          .slice(0, -1) // drop the just-appended user message (already passed as userMessage)
          .map((m) => ({ role: m.role, content: m.content }))
        const iter = streamTutorReply({
          apiKey,
          model,
          systemPrompt: TUTOR_SYSTEM_PROMPT,
          history,
          userMessage: trimmed,
          sectionContent
        })
        for await (const chunk of iter) {
          if (abortedRef.current) break
          partialRef.current += chunk
          const snapshot = partialRef.current
          setMessages((prev) => {
            const next = prev.slice()
            next[next.length - 1] = { role: 'assistant', content: snapshot }
            return next
          })
        }
        if (!abortedRef.current && partialRef.current.length > 0) {
          appendTutorMessage(sectionId, { role: 'assistant', content: partialRef.current })
        }
      } catch (e) {
        if (abortedRef.current) return
        const msg = e instanceof Error ? e.message : 'Stream failed.'
        setError(msg)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.content === '') return prev.slice(0, -1)
          return prev
        })
      } finally {
        if (!abortedRef.current) {
          setStreaming(false)
        }
        partialRef.current = ''
      }
    },
    [sectionId]
  )

  const clear = useCallback(() => { setMessages([]); setError(null) }, [])

  return { messages, streaming, error, sendMessage, clear }
}
