'use client'

import { useState } from 'react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

type Mode = 'phs' | 'pta' | 'fed'

const BASE_NODES: FlowNode[] = [
  { id: 'user', x: 80, y: 100, label: 'USER' },
  { id: 'aad', x: 720, y: 100, label: 'ENTRA ID', sublabel: 'Azure AD' },
  { id: 'connect', x: 400, y: 260, label: 'AAD CONNECT', sublabel: 'Sync Engine' },
  { id: 'adds', x: 80, y: 420, label: 'AD DS', sublabel: 'On-prem' }
]

const PHS_STEPS: FlowStep[] = [
  { id: 'p1', from: 'adds', to: 'connect', label: 'Hash of Hash', detail: 'AAD Connect extracts the unicodePwd hash, re-hashes it (PBKDF2-HMAC-SHA256, 1000 iterations) and ships the resulting double-hashed value to Entra ID every ~2 minutes.' },
  { id: 'p2', from: 'connect', to: 'aad', label: 'Password Hash Sync', detail: 'The double-hashed password lives in Entra ID. Authentication happens entirely in the cloud -- on-prem AD outage does NOT break sign-in.' },
  { id: 'p3', from: 'user', to: 'aad', label: 'Sign-in', detail: 'User sends credentials directly to Entra ID; Entra validates against the synced hash.' }
]

const PTA_NODES: FlowNode[] = [
  ...BASE_NODES,
  { id: 'pta', x: 720, y: 420, label: 'PTA AGENT', sublabel: 'on-prem' }
]

const PTA_STEPS: FlowStep[] = [
  { id: 't1', from: 'user', to: 'aad', label: 'Sign-in', detail: 'User submits credentials to Entra ID.' },
  { id: 't2', from: 'aad', to: 'pta', label: 'Pass-Through Validate', detail: 'Entra encrypts the credentials with a public key and queues them on a service bus. The on-prem PTA Agent pulls the request, decrypts with its private key, and validates against on-prem AD DS via standard Windows auth.' },
  { id: 't3', from: 'pta', to: 'adds', label: 'AD Validate', detail: 'PTA Agent performs LogonUser() against the local DC. Pass/fail is returned through the service bus back to Entra ID.' }
]

const FED_NODES: FlowNode[] = [
  ...BASE_NODES,
  { id: 'fed', x: 720, y: 420, label: 'ADFS', sublabel: 'Federation Server', intent: 'warn' }
]

const FED_STEPS: FlowStep[] = [
  { id: 'f1', from: 'user', to: 'aad', label: 'Sign-in (HRD)', detail: 'Entra ID performs Home Realm Discovery on the user upn-suffix and finds it is federated.' },
  { id: 'f2', from: 'aad', to: 'fed', label: 'Redirect to ADFS', detail: 'Browser is redirected to the on-prem ADFS WS-Federation or SAML endpoint.' },
  { id: 'f3', from: 'fed', to: 'adds', label: 'AD Validate', detail: 'ADFS performs Windows auth against AD DS, mints a SAML token with the user claims.' },
  { id: 'f4', from: 'fed', to: 'aad', label: 'SAML Assertion', detail: 'ADFS posts the signed SAML token back to Entra ID. Entra trusts the signature (configured via Convert-MsolDomainToFederated trust) and issues its own tokens to the user.', intent: 'warn' }
]

export function HybridIdentityDiagram() {
  const [mode, setMode] = useState<Mode>('phs')
  const data = mode === 'phs'
    ? { nodes: BASE_NODES, steps: PHS_STEPS, caption: 'Cloud-authoritative -- AAD Connect ships double-hashed credentials every ~2 minutes; outage-resilient.' }
    : mode === 'pta'
    ? { nodes: PTA_NODES, steps: PTA_STEPS, caption: 'On-prem validates each sign-in over an encrypted service-bus channel -- no password hashes leave the network.' }
    : { nodes: FED_NODES, steps: FED_STEPS, caption: 'Entra ID delegates authentication to an on-prem identity provider trusted via SAML.' }

  return (
    <FlowDiagram
      title="HYBRID IDENTITY // SIGN-IN METHOD"
      width={840} height={520}
      nodes={data.nodes} steps={data.steps}
      caption={data.caption}
      toolbar={
        <div className="flex gap-1">
          {(['phs','pta','fed'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={[
                'rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                mode === m ? 'border-cyan/60 bg-cyan/12 text-cyan' : 'border-panel-border text-text-muted hover:border-cyan/30'
              ].join(' ')}>
              {m === 'phs' ? 'PHS' : m === 'pta' ? 'PTA' : 'Federation'}
            </button>
          ))}
        </div>
      }
    />
  )
}
