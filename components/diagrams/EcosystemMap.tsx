'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { HoloPanel } from '@/components/jarvis/HoloPanel'

interface EcoNode {
  id: string
  x: number
  y: number
  label: string
  category: 'idp' | 'iga' | 'pam' | 'cloud' | 'directory' | 'mdm'
  detail: string
}

interface EcoEdge { a: string; b: string }

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const NODES: EcoNode[] = [
  {
    id: 'entra', x: 480, y: 240, label: 'Entra ID', category: 'idp',
    detail: "Microsoft's cloud identity provider — the SaaS-era successor to on-prem AD DS. Hosts user identities, conditional access policies, MFA, app registrations for OAuth/OIDC/SAML, and SCIM provisioning to thousands of SaaS apps. Free tier ships with Microsoft 365 — Entra ID P1/P2 add risk-based CA, PIM, and Identity Protection. The de-facto IdP hub in Microsoft-centric environments."
  },
  {
    id: 'okta', x: 260, y: 180, label: 'Okta', category: 'idp',
    detail: "Best-of-breed IdP with the strongest SAML/OIDC app catalog in the industry. Often deployed in front of Entra ID via federation in multi-cloud or Microsoft-skeptical orgs. Okta's Lifecycle Management handles joiner/mover/leaver provisioning; Okta Verify is their MFA authenticator. Workforce Identity Cloud and Customer Identity Cloud are sold as separate product lines."
  },
  {
    id: 'ping', x: 700, y: 180, label: 'Ping Identity', category: 'idp',
    detail: "Enterprise IdP with deep roots in on-prem federation — PingFederate has been a heavyweight SAML/WS-Fed broker since before the cloud era. PingOne is their SaaS offering. Strong in regulated industries (financial services, healthcare) that need hybrid on-prem + cloud identity. Acquired by Thales in 2023; often seen in large bank and insurance environments."
  },
  {
    id: 'sailpoint', x: 200, y: 380, label: 'SailPoint', category: 'iga',
    detail: "Market-leading Identity Governance and Administration (IGA) platform. IdentityNow (SaaS) and IdentityIQ (on-prem) handle access request workflows, access certification campaigns, role mining, and SOD policy enforcement. Deep connector library for provisioning to AD, Entra ID, Okta, and enterprise apps. The reference IGA platform for enterprise compliance programs (SOX, HIPAA, PCI)."
  },
  {
    id: 'saviynt', x: 360, y: 440, label: 'Saviynt', category: 'iga',
    detail: "Cloud-native IGA and Cloud Privileged Access Management platform — a strong challenger to SailPoint in greenfield cloud-first deployments. Combines IGA (access requests, certifications, SOD) with CPAM in a single SaaS platform, reducing the need for a separate PAM tool. Known for fast deployment cycles and strong AWS/Azure/GCP connector depth."
  },
  {
    id: 'cyberark', x: 600, y: 420, label: 'CyberArk', category: 'pam',
    detail: "The PAM market leader. CyberArk Privileged Access Manager (formerly EPV) vaults privileged credentials, brokers RDP/SSH sessions through a secure proxy, records sessions, and detects anomalies. Integrates with AD DS and Entra ID to manage service accounts, local admin passwords (via LAPS-style rotation), and cloud workload credentials. Strong in financial and critical infrastructure verticals."
  },
  {
    id: 'beyondtrust', x: 760, y: 360, label: 'BeyondTrust', category: 'pam',
    detail: "PAM platform combining Privileged Password Management, Privileged Remote Access, and Endpoint Privilege Management (EPM/least-privilege) in a unified suite. EPM is particularly strong — it can elevate specific processes on Windows/macOS without giving users full local admin, which differentiates BeyondTrust from pure-play vault vendors. Well-positioned in endpoint security + PAM convergence deals."
  },
  {
    id: 'aws', x: 880, y: 240, label: 'AWS IAM', category: 'cloud',
    detail: "AWS's native identity and access management service. Manages IAM users, roles, and policies that control access to AWS resources. IAM roles with OIDC federation allow workloads (and humans) to authenticate via an external IdP (Entra ID, Okta) rather than long-lived keys. AWS IAM Identity Center (formerly SSO) provides workforce SSO and permission sets across multi-account Organizations."
  },
  {
    id: 'gcp', x: 900, y: 360, label: 'GCP IAM', category: 'cloud',
    detail: "Google Cloud's IAM service uses a resource hierarchy model (Org > Folder > Project > Resource) with inherited bindings. Cloud Identity and Google Workspace act as the upstream IdP; Workload Identity Federation replaces service account keys with short-lived OIDC tokens from external IdPs. IAM Recommender uses ML to suggest least-privilege policy cleanup — a differentiator vs. AWS."
  },
  {
    id: 'addc', x: 120, y: 280, label: 'AD DS', category: 'directory',
    detail: "Active Directory Domain Services — Microsoft's on-prem LDAP/Kerberos directory. Still the backbone of enterprise identity in most mid-to-large organizations. Entra Connect (formerly AAD Connect) syncs AD objects to Entra ID, making AD DS the authoritative source of truth for hybrid environments. Group Policy Objects (GPOs), fine-grained password policies, and trusts are native AD capabilities."
  },
  {
    id: 'intune', x: 480, y: 80, label: 'Intune', category: 'mdm',
    detail: "Microsoft's cloud-native MDM and MAM platform. Manages Windows, macOS, iOS, and Android devices — enrolls them, enforces compliance policies (disk encryption, OS patch level), and integrates with Entra ID for device-based Conditional Access. Co-management with Configuration Manager (SCCM) is the standard hybrid path for organizations mid-migration from on-prem management."
  },
  {
    id: 'jamf', x: 660, y: 80, label: 'Jamf', category: 'mdm',
    detail: "The MDM standard for Apple-first and Apple-heavy environments. Jamf Pro manages macOS and iOS at scale — zero-touch deployment via Apple Business Manager, configuration profiles, patch management, and compliance reporting. Integrates with Entra ID and Okta for device trust signals that feed into Conditional Access policies. Essential in education and media/creative industries where Mac fleets dominate."
  }
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [motionEnabled, setMotionEnabled] = useState(false)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const rawId = useId()
  const uid = rawId.replace(/:/g, '')
  const blurDepthId = `eco-blur-depth-${uid}`
  const softGlowId = `eco-soft-glow-${uid}`

  useEffect(() => { setMotionEnabled(!prefersReducedMotion()) }, [])

  useEffect(() => {
    if (!motionEnabled) return
    function onMove(e: MouseEvent) {
      const el = stageRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / rect.width
      const ny = (e.clientY - cy) / rect.height
      setParallax({ x: Math.max(-6, Math.min(6, nx * 12)), y: Math.max(-6, Math.min(6, ny * 12)) })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [motionEnabled])

  const nodeById = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), [])
  const neighborsOf = useMemo(() => {
    const m: Record<string, Set<string>> = {}
    for (const n of NODES) m[n.id] = new Set()
    for (const e of EDGES) { m[e.a].add(e.b); m[e.b].add(e.a) }
    return m
  }, [])

  const activeNode = activeId ? nodeById[activeId] ?? null : null

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
      <div ref={stageRef}
        className="relative h-[520px] cursor-grab overflow-hidden rounded-[2px] border border-cyan/15 bg-void/70 active:cursor-grabbing"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <div data-jarvis-ecosystem-stage className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '50% 50%',
            transition: 'transform 120ms ease-out'
          }}>
          <svg viewBox="0 0 1000 520" className="block h-full w-full">
            <defs>
              <filter id={blurDepthId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b2" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="6.0" result="b3" />
                <feMerge><feMergeNode in="b3" /><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id={softGlowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Layered blur background halos — one per node, 18% opacity */}
            <g opacity={0.18} filter={`url(#${blurDepthId})`}>
              {NODES.map((n) => (
                <circle key={`bg-${n.id}`} cx={n.x} cy={n.y} r={42}
                  fill={CATEGORY_COLOR[n.category]} opacity={0.12} />
              ))}
            </g>

            {/* Parallax group — wraps edges + tokens + nodes */}
            <g transform={`translate(${parallax.x} ${parallax.y})`} style={{ transition: 'transform 120ms ease-out' }}>
              {/* Edges */}
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

              {/* Animated tokens traveling along each edge */}
              {motionEnabled && EDGES.map((e, i) => {
                const a = nodeById[e.a]; const b = nodeById[e.b]
                return (
                  <motion.circle key={`tok-${e.a}-${e.b}`} data-jarvis-token r={2.5}
                    fill="#00f0ff" filter={`url(#${softGlowId})`}
                    initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 4.5, delay: (i % 4) * 0.4, repeat: Infinity, ease: 'linear' }}
                    style={{ offsetPath: `path("M ${a.x} ${a.y} L ${b.x} ${b.y}")`, offsetRotate: '0deg' }} />
                )
              })}

              {/* Nodes */}
              {NODES.map((n) => {
                const color = CATEGORY_COLOR[n.category]
                const isActive = activeId === n.id
                const isNeighbor = !!activeId && neighborsOf[activeId].has(n.id)
                const dim = !!activeId && !isActive && !isNeighbor
                return (
                  <g key={n.id}
                    onMouseEnter={() => setHoveredNodeId(n.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => { e.stopPropagation(); setActiveId((c) => c === n.id ? null : n.id) }}
                    style={{
                      transform: `translate(${n.x}px, ${n.y}px) scale(${hoveredNodeId === n.id ? 1.08 : 1})`,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transition: 'transform 160ms ease-out, opacity 160ms',
                      cursor: 'pointer',
                      opacity: dim ? 0.3 : 1
                    }}>
                    <circle r={22} fill="rgba(10,10,15,0.9)" stroke={color} strokeWidth={isActive ? 2.2 : 1.4}
                      filter={hoveredNodeId === n.id ? `url(#${softGlowId})` : undefined} />
                    <text x={0} y={38} textAnchor="middle" fill={color}
                      fontFamily="JetBrains Mono, monospace" fontSize={10} letterSpacing="0.08em">{n.label}</text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Click-to-expand detail panel */}
      {activeNode && (
        <HoloPanel label={activeNode.label} className="mt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/60">
            ▸ {activeNode.category.toUpperCase()}
          </div>
          <div className="whitespace-pre-wrap text-sm text-foreground">{activeNode.detail}</div>
          <button type="button" onClick={() => setActiveId(null)}
            className="mt-3 rounded-[2px] border border-cyan/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan/70 hover:bg-cyan/10 hover:text-cyan">
            Close
          </button>
        </HoloPanel>
      )}

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
