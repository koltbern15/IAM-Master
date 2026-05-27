'use client'

import { useMemo, useRef, useState } from 'react'

interface EcoNode {
  id: string
  x: number
  y: number
  label: string
  category: 'idp' | 'iga' | 'pam' | 'cloud' | 'directory' | 'mdm'
}

interface EcoEdge { a: string; b: string }

const NODES: EcoNode[] = [
  { id: 'entra', x: 480, y: 240, label: 'Entra ID', category: 'idp' },
  { id: 'okta', x: 260, y: 180, label: 'Okta', category: 'idp' },
  { id: 'ping', x: 700, y: 180, label: 'Ping Identity', category: 'idp' },
  { id: 'sailpoint', x: 200, y: 380, label: 'SailPoint', category: 'iga' },
  { id: 'saviynt', x: 360, y: 440, label: 'Saviynt', category: 'iga' },
  { id: 'cyberark', x: 600, y: 420, label: 'CyberArk', category: 'pam' },
  { id: 'beyondtrust', x: 760, y: 360, label: 'BeyondTrust', category: 'pam' },
  { id: 'aws', x: 880, y: 240, label: 'AWS IAM', category: 'cloud' },
  { id: 'gcp', x: 900, y: 360, label: 'GCP IAM', category: 'cloud' },
  { id: 'addc', x: 120, y: 280, label: 'AD DS', category: 'directory' },
  { id: 'intune', x: 480, y: 80, label: 'Intune', category: 'mdm' },
  { id: 'jamf', x: 660, y: 80, label: 'Jamf', category: 'mdm' }
]

const EDGES: EcoEdge[] = [
  { a: 'entra', b: 'okta' },
  { a: 'entra', b: 'ping' },
  { a: 'entra', b: 'aws' },
  { a: 'entra', b: 'gcp' },
  { a: 'entra', b: 'addc' },
  { a: 'entra', b: 'intune' },
  { a: 'entra', b: 'jamf' },
  { a: 'sailpoint', b: 'entra' },
  { a: 'sailpoint', b: 'okta' },
  { a: 'sailpoint', b: 'addc' },
  { a: 'saviynt', b: 'entra' },
  { a: 'cyberark', b: 'addc' },
  { a: 'cyberark', b: 'entra' },
  { a: 'beyondtrust', b: 'addc' },
  { a: 'okta', b: 'aws' },
  { a: 'okta', b: 'gcp' }
]

const CATEGORY_COLOR: Record<EcoNode['category'], string> = {
  idp: '#00f0ff',
  iga: '#ffb800',
  pam: '#ff2040',
  cloud: '#00ff88',
  directory: '#888888',
  mdm: '#9b8cff'
}

export function EcosystemMap() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const nodeById = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), [])
  const neighborsOf = useMemo(() => {
    const m: Record<string, Set<string>> = {}
    for (const n of NODES) m[n.id] = new Set()
    for (const e of EDGES) { m[e.a].add(e.b); m[e.b].add(e.a) }
    return m
  }, [])

  function isEdgeActive(e: EcoEdge): boolean {
    if (!activeId) return false
    return e.a === activeId || e.b === activeId
  }

  function onMouseDown(e: React.MouseEvent) {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy })
  }
  function onMouseUp() { dragRef.current = null }

  return (
    <figure className="relative my-6 rounded-[3px] border border-cyan/25 bg-void-elevated/40 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan/70">
          ▸ IAM ECOSYSTEM // INTEGRATION MAP
        </figcaption>
        <div className="flex gap-1">
          <button type="button" aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2.5, s * 1.2))}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] text-cyan/80 hover:bg-cyan/10">+</button>
          <button type="button" aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.5, s / 1.2))}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[10px] text-cyan/80 hover:bg-cyan/10">-</button>
          <button type="button" aria-label="Reset"
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); setActiveId(null) }}
            className="rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan/80 hover:bg-cyan/10">Reset</button>
        </div>
      </div>
      <div className="relative h-[520px] cursor-grab overflow-hidden rounded-[2px] border border-cyan/15 bg-void/70 active:cursor-grabbing"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <div data-jarvis-ecosystem-stage className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '50% 50%',
            transition: 'transform 120ms ease-out'
          }}>
          <svg viewBox="0 0 1000 520" className="block h-full w-full">
            {EDGES.map((e) => {
              const a = nodeById[e.a]; const b = nodeById[e.b]
              const active = isEdgeActive(e)
              return (
                <line key={`${e.a}-${e.b}`} data-jarvis-edge-active={active ? 'true' : 'false'}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={active ? '#00f0ff' : 'rgba(0, 240, 255, 0.18)'}
                  strokeWidth={active ? 2 : 1} />
              )
            })}
            {NODES.map((n) => {
              const color = CATEGORY_COLOR[n.category]
              const isActive = activeId === n.id
              const isNeighbor = !!activeId && neighborsOf[activeId].has(n.id)
              const dim = !!activeId && !isActive && !isNeighbor
              return (
                <g key={n.id} transform={`translate(${n.x} ${n.y})`}
                  style={{ cursor: 'pointer', opacity: dim ? 0.3 : 1, transition: 'opacity 160ms' }}
                  onClick={(e) => { e.stopPropagation(); setActiveId((c) => c === n.id ? null : n.id) }}>
                  <circle r={22} fill="rgba(10,10,15,0.9)" stroke={color} strokeWidth={isActive ? 2.2 : 1.4} />
                  <text x={0} y={38} textAnchor="middle" fill={color}
                    fontFamily="JetBrains Mono, monospace" fontSize={10} letterSpacing="0.08em">{n.label}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
        {(['idp', 'iga', 'pam', 'cloud', 'directory', 'mdm'] as const).map((c) => (
          <span key={c} className="inline-flex items-center gap-1">
            <span className="inline-block size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            {c}
          </span>
        ))}
      </div>
    </figure>
  )
}
