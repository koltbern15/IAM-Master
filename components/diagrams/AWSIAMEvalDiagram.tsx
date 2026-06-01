import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'req', x: 80, y: 140, label: 'REQUEST', sublabel: 'Principal+Action' },
  { id: 'deny', x: 80, y: 380, label: 'DENY', sublabel: 'Result', intent: 'threat' },
  { id: 'xdeny', x: 300, y: 140, label: 'EXPLICIT', sublabel: 'Deny?', intent: 'threat' },
  { id: 'scp', x: 500, y: 140, label: 'SCP', sublabel: 'Org Guardrail', intent: 'warn' },
  { id: 'pb', x: 700, y: 140, label: 'BOUNDARY', sublabel: 'Perm Boundary', intent: 'warn' },
  { id: 'allowpol', x: 900, y: 140, label: 'ALLOW?', sublabel: 'Identity/Resource' },
  { id: 'allow', x: 900, y: 380, label: 'ALLOW', sublabel: 'Result' }
]

const STEPS: FlowStep[] = [
  {
    id: 'e0', from: 'req', to: 'xdeny', label: 'Default: Deny',
    detail: 'Every request starts as an implicit DENY. Authorization must be affirmatively granted by policy; nothing is allowed by default.'
  },
  {
    id: 'e1', from: 'xdeny', to: 'deny', label: 'Explicit Deny → DENY', intent: 'threat',
    detail: 'AWS evaluates ALL applicable policies. If ANY policy (SCP, boundary, identity, resource, session) contains an explicit Deny that matches, the final decision is DENY. An explicit Deny ALWAYS wins and cannot be overridden by any Allow.'
  },
  {
    id: 'e2', from: 'xdeny', to: 'scp', label: 'No explicit Deny',
    detail: 'With no explicit Deny, the request must be ALLOWED by every policy type that applies. Evaluation continues through the guardrails.'
  },
  {
    id: 'e3', from: 'scp', to: 'pb', label: 'SCP allows?', intent: 'warn',
    detail: 'Organizations Service Control Policies (SCPs) set the maximum available permissions for accounts in the org. An SCP grants no access by itself -- if the SCP does not allow the action, it is denied regardless of identity policy. (Resource-control policies, RCPs, apply a similar org-wide cap to resources.)'
  },
  {
    id: 'e4', from: 'pb', to: 'allowpol', label: 'Boundary allows?', intent: 'warn',
    detail: 'A permissions boundary is an advanced feature that caps the maximum permissions an identity-based policy can grant to a principal. The effective permission is the INTERSECTION of the boundary and the identity policy. (For assumed roles, session policies further cap this.)'
  },
  {
    id: 'e5', from: 'allowpol', to: 'allow', label: 'Allow present → ALLOW',
    detail: 'Finally there must be an explicit Allow in an identity-based policy (or a matching resource-based policy / RCP allowance). Within one account an identity-based and a resource-based Allow are a union; across accounts both the identity policy and the resource policy must allow. If every gate passes and an Allow exists, the result is ALLOW.'
  },
  {
    id: 'e6', from: 'allowpol', to: 'deny', label: 'No Allow → implicit DENY', intent: 'threat',
    detail: 'If no policy provides a matching Allow, the request falls back to the starting implicit DENY. Not explicitly allowed = denied.'
  }
]

export function AWSIAMEvalDiagram() {
  return (
    <FlowDiagram
      title="AWS IAM // POLICY EVALUATION ORDER"
      width={1020} height={460} nodes={NODES} steps={STEPS}
      caption="Implicit deny → explicit Deny wins → SCP → permissions boundary → identity/resource Allow → else implicit deny. Click a gate."
    />
  )
}
