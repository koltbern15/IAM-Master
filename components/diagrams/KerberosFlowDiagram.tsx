import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'client', x: 80, y: 240, label: 'CLIENT' },
  { id: 'kdc', x: 460, y: 240, label: 'KDC', sublabel: 'AS + TGS' },
  { id: 'service', x: 840, y: 240, label: 'SERVICE' }
]

const STEPS: FlowStep[] = [
  {
    id: 'as-req', from: 'client', to: 'kdc', label: 'AS-REQ',
    detail: 'Authentication Service Request.\n\nClient sends principal name + pre-auth data (encrypted timestamp using user password hash). No password ever crosses the wire.'
  },
  {
    id: 'as-rep', from: 'kdc', to: 'client', label: 'AS-REP',
    detail: 'Authentication Service Reply -- issues a TGT.\n\nTGT contents:\n  - Client principal\n  - Session key (client/KDC)\n  - Validity window\n  - Encrypted with the KDC krbtgt long-term key\n\nAlso returned: the session key encrypted with the user password hash so the client can decrypt it.'
  },
  {
    id: 'tgs-req', from: 'client', to: 'kdc', label: 'TGS-REQ',
    detail: 'Ticket-Granting Service Request.\n\nClient presents the TGT + an authenticator (timestamp encrypted with the client/KDC session key) + the target SPN.'
  },
  {
    id: 'tgs-rep', from: 'kdc', to: 'client', label: 'TGS-REP',
    detail: 'Ticket-Granting Service Reply -- issues a Service Ticket.\n\nService Ticket contents:\n  - Client principal\n  - Session key (client/service)\n  - Encrypted with the service account long-term key (this is what Kerberoasting harvests)\n  - Validity window'
  },
  {
    id: 'ap-req', from: 'client', to: 'service', label: 'AP-REQ',
    detail: 'Application Request.\n\nClient presents the Service Ticket + a fresh authenticator (timestamp encrypted with the client/service session key) directly to the target service. Mutual auth optional via AP-REP.'
  }
]

export function KerberosFlowDiagram() {
  return (
    <FlowDiagram
      title="KERBEROS // TICKET FLOW"
      width={920} height={420} nodes={NODES} steps={STEPS}
      caption="Five-message MIT Kerberos v5 exchange -- click any step to inspect ticket contents."
    />
  )
}
