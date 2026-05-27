'use client'

import { useState } from 'react'
import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

type Mode = 'sp' | 'idp'

const NODES: FlowNode[] = [
  { id: 'browser', x: 80, y: 100, label: 'BROWSER' },
  { id: 'sp', x: 80, y: 340, label: 'SP', sublabel: 'Service Provider' },
  { id: 'idp', x: 720, y: 220, label: 'IDP', sublabel: 'Identity Provider' }
]

const SP_STEPS: FlowStep[] = [
  { id: '1', from: 'browser', to: 'sp', label: 'GET resource', detail: 'User requests a protected resource at the SP with no SAML session.' },
  { id: '2', from: 'sp', to: 'browser', label: 'AuthnRequest', detail: 'samlp:AuthnRequest with Destination=IDP_SSO_URL and AssertionConsumerServiceURL=SP_ACS_URL. Redirected (HTTP-Redirect) or POSTed to the IdP via the browser.' },
  { id: '3', from: 'browser', to: 'idp', label: 'Forward to IdP', detail: 'Browser follows the redirect and POSTs/GETs the AuthnRequest to the IdP SSO endpoint.' },
  { id: '4', from: 'idp', to: 'browser', label: 'SAML Response', detail: 'samlp:Response wrapping a saml:Assertion that contains:\n  - saml:Issuer (the IdP entity ID)\n  - saml:Subject (NameID + SubjectConfirmation)\n  - saml:Conditions with NotBefore + NotOnOrAfter window\n  - saml:AuthnStatement with AuthnInstant\n  - saml:AttributeStatement (the claims)\n  - ds:Signature over the Assertion or the Response.' },
  { id: '5', from: 'browser', to: 'sp', label: 'POST to ACS', detail: 'Browser POSTs the signed SAML Response to the SP Assertion Consumer Service. SP validates the signature, applies AttributeStatement, issues a local session.' }
]

const IDP_STEPS: FlowStep[] = [
  { id: 'i1', from: 'browser', to: 'idp', label: 'Login at IdP', detail: 'User starts at the IdP portal (e.g., MyApps tile, Okta dashboard).' },
  { id: 'i2', from: 'idp', to: 'browser', label: 'Unsolicited Response', detail: 'IdP mints an unsolicited samlp:Response with no InResponseTo attribute and POSTs it to the SP via the browser.\n\nMust be explicitly allowed at the SP -- accepting unsolicited assertions is a frequent misconfiguration vector.' },
  { id: 'i3', from: 'browser', to: 'sp', label: 'POST to ACS', detail: 'SP validates signature, applies AttributeStatement, creates a local session, redirects to the configured RelayState target URL.' }
]

export function SAMLFlowDiagram() {
  const [mode, setMode] = useState<Mode>('sp')
  const steps = mode === 'sp' ? SP_STEPS : IDP_STEPS
  return (
    <FlowDiagram
      title="SAML 2.0 // WEB BROWSER SSO"
      width={840} height={460} nodes={NODES} steps={steps}
      caption={mode === 'sp'
        ? 'SP-initiated flow -- user starts at the SP, gets bounced through the IdP.'
        : 'IdP-initiated flow -- user starts at the IdP portal and lands at the SP via an Unsolicited Response.'}
      toolbar={
        <div className="flex gap-1">
          {(['sp','idp'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={[
                'rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]',
                mode === m ? 'border-cyan/60 bg-cyan/12 text-cyan' : 'border-panel-border text-text-muted hover:border-cyan/30'
              ].join(' ')}>
              {m === 'sp' ? 'SP-initiated' : 'IdP-initiated'}
            </button>
          ))}
        </div>
      }
    />
  )
}
