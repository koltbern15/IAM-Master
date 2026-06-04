'use client'

import { useState, useEffect, useRef, Children } from 'react'

interface PowerShellBlockProps {
  title?: string
  children: React.ReactNode
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node !== null && 'props' in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

export function PowerShellBlock({ title, children }: PowerShellBlockProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef(0)
  const text = Children.toArray(children).map(extractText).join('')

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      window.clearTimeout(resetTimer.current)
      setCopied(true)
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // swallow
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-[3px] border border-cyan/30 bg-void-elevated/70 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-cyan/20 bg-cyan/4 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan/70">
          ▸ PS{title ? ` // ${title.toUpperCase()}` : ''}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
          aria-live="polite"
          className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70 hover:bg-cyan/10 hover:text-cyan"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-cyan">
        <code>{children}</code>
      </pre>
    </div>
  )
}
