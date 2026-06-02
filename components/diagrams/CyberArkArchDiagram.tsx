import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'user', x: 90, y: 120, label: 'USER', sublabel: 'Admin' },
  { id: 'pvwa', x: 360, y: 120, label: 'PVWA', sublabel: 'Web Access' },
  { id: 'vault', x: 360, y: 360, label: 'VAULT', sublabel: 'Digital Vault' },
  { id: 'cpm', x: 90, y: 360, label: 'CPM', sublabel: 'Policy Mgr' },
  { id: 'psm', x: 640, y: 120, label: 'PSM', sublabel: 'Session Mgr', intent: 'warn' },
  { id: 'target', x: 900, y: 240, label: 'TARGET', sublabel: 'Server/DB' }
]

const STEPS: FlowStep[] = [
  {
    id: 's1', from: 'user', to: 'pvwa', label: 'Authenticate',
    detail: 'Admin authenticates to PVWA (LDAP/SAML/RADIUS/PKI). PVWA is the web front-end + REST API; it holds no secrets itself -- it brokers requests to the Vault.'
  },
  {
    id: 's2', from: 'pvwa', to: 'vault', label: 'Retrieve Secret',
    detail: 'On an approved request, PVWA pulls the credential from the Digital Vault. The Vault is the FIPS-validated, firewall-isolated encrypted store; every object is sealed and access is policy-controlled and fully audited.'
  },
  {
    id: 's3', from: 'cpm', to: 'vault', label: 'Rotate / Verify', intent: 'default',
    detail: 'The Central Policy Manager (CPM) enforces credential policy against the Vault: it changes (rotates), verifies, and reconciles managed account passwords on target systems on a schedule or on demand, then writes the new value back to the Vault.'
  },
  {
    id: 's4', from: 'cpm', to: 'target', label: 'Change on Target',
    detail: 'CPM connects to the managed target (server, DB, network device, cloud) using a plug-in to actually change the password there, keeping the Vault and the live account in sync.'
  },
  {
    id: 's5', from: 'user', to: 'psm', label: 'Launch Session', intent: 'warn',
    detail: 'For privileged session access the user connects through the Privileged Session Manager (PSM) -- a secure jump/proxy. The user never sees or handles the actual credential.'
  },
  {
    id: 's6', from: 'psm', to: 'target', label: 'Proxied + Recorded', intent: 'warn',
    detail: 'PSM injects the credential and opens an isolated, fully recorded session to the target. Sessions can be monitored live and terminated; recordings are stored for audit/forensics.'
  }
]

export function CyberArkArchDiagram() {
  return (
    <FlowDiagram
      title="CYBERARK PAS // VAULT ARCHITECTURE"
      width={1000} height={460} nodes={NODES} steps={STEPS}
      caption="Self-Hosted PAS: PVWA brokers, the Vault stores, CPM rotates, PSM isolates & records -- click any step."
    />
  )
}
