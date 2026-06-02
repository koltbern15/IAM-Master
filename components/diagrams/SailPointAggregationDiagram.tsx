import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'sources', x: 90, y: 240, label: 'SOURCES', sublabel: 'AD/HR/Apps' },
  { id: 'agg', x: 330, y: 240, label: 'AGGREGATE', sublabel: 'Connectors' },
  { id: 'corr', x: 560, y: 240, label: 'CORRELATE', sublabel: 'Match' },
  { id: 'cube', x: 790, y: 240, label: 'IDENTITY', sublabel: 'Identity Cube' },
  { id: 'request', x: 960, y: 120, label: 'REQUEST', sublabel: 'Access Req' },
  { id: 'cert', x: 960, y: 360, label: 'CERTIFY', sublabel: 'Access Review', intent: 'warn' }
]

const STEPS: FlowStep[] = [
  {
    id: 'a1', from: 'sources', to: 'agg', label: 'Read Accounts',
    detail: 'Connectors read accounts + entitlements from each source system (AD, the HR system of record, business apps). Aggregation pulls this raw account data into SailPoint on a schedule.'
  },
  {
    id: 'a2', from: 'agg', to: 'corr', label: 'Aggregate',
    detail: 'Aggregated account data is staged for processing. An authoritative source (usually HR) defines who the people are; application sources contribute the accounts and entitlements they hold.'
  },
  {
    id: 'a3', from: 'corr', to: 'cube', label: 'Correlate',
    detail: 'Correlation logic matches each discovered account to the right identity (e.g., by employee ID or email). Unmatched accounts are flagged as uncorrelated/orphan for review.'
  },
  {
    id: 'a4', from: 'cube', to: 'request', label: 'Access Request',
    detail: 'The Identity Cube is the unified view of one person -- all their accounts, entitlements, roles and risk. Users (or managers) request access against this model; policy (SoD, approvals) gates fulfillment back to the source.'
  },
  {
    id: 'a5', from: 'cube', to: 'cert', label: 'Certification', intent: 'warn',
    detail: 'Certification (access review) campaigns ask reviewers to attest that each identity should keep its access. Revocations flow back out to the source systems, closing the loop. This is the core audit/recertification control.'
  }
]

export function SailPointAggregationDiagram() {
  return (
    <FlowDiagram
      title="SAILPOINT IGA // AGGREGATION → CERTIFICATION"
      width={1060} height={460} nodes={NODES} steps={STEPS}
      caption="Sources aggregate → correlate to the Identity Cube → access request + certification. (Identity Security Cloud calls the cube an 'identity'.)"
    />
  )
}
