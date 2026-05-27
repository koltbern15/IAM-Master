import { FlowDiagram, type FlowNode, type FlowStep } from './FlowDiagram'

const NODES: FlowNode[] = [
  { id: 'user', x: 80, y: 120, label: 'USER AGENT' },
  { id: 'client', x: 80, y: 360, label: 'CLIENT', sublabel: 'SPA / native' },
  { id: 'authz', x: 520, y: 120, label: 'AUTHZ', sublabel: 'Authorization Server' },
  { id: 'token', x: 520, y: 360, label: 'TOKEN', sublabel: 'Token Endpoint' },
  { id: 'api', x: 880, y: 240, label: 'RESOURCE API' }
]

const STEPS: FlowStep[] = [
  {
    id: '1', from: 'client', to: 'user', label: 'PKCE Setup',
    detail: 'Client generates a high-entropy code_verifier (43-128 chars), derives code_challenge = BASE64URL(SHA256(code_verifier)).'
  },
  {
    id: '2', from: 'user', to: 'authz', label: 'Authorize',
    detail: 'GET /authorize?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...&code_challenge=...&code_challenge_method=S256'
  },
  {
    id: '3', from: 'authz', to: 'user', label: 'Code',
    detail: 'After user consent, the AS redirects back with ?code=AUTHORIZATION_CODE&state=...\n\nThe code is single-use, short-lived (~60s), and bound to the redirect_uri + client_id.'
  },
  {
    id: '4', from: 'client', to: 'token', label: 'Token Exchange',
    detail: 'POST /token\n  grant_type=authorization_code\n  code=AUTHORIZATION_CODE\n  redirect_uri=...\n  client_id=...\n  code_verifier=ORIGINAL_VERIFIER\n\nThe token endpoint hashes code_verifier and compares to the stored code_challenge. Mismatch = reject. This is what stops authorization-code interception.'
  },
  {
    id: '5', from: 'token', to: 'client', label: 'Tokens',
    detail: 'Returns: access_token (JWT or opaque), id_token (OIDC), refresh_token (if offline_access scope granted), expires_in, token_type=Bearer.'
  },
  {
    id: '6', from: 'client', to: 'api', label: 'API Call',
    detail: 'Authorization: Bearer ACCESS_TOKEN header.'
  },
  {
    id: '7', from: 'client', to: 'token', label: 'Refresh',
    detail: 'POST /token\n  grant_type=refresh_token\n  refresh_token=...\n  client_id=...\n\nMany authorization servers rotate the refresh_token on each use; the previous token is invalidated and reuse triggers session revocation.'
  },
  {
    id: 'implicit', from: 'user', to: 'authz', label: 'Implicit Grant',
    intent: 'warn', deprecated: true,
    detail: 'response_type=token returns the access_token directly in the URL fragment.\n\nDeprecated by OAuth 2.1 + RFC 9700 BCP. Replaced by Authorization Code + PKCE for all client types including SPAs and native apps.'
  }
]

export function OAuthFlowDiagram() {
  return (
    <FlowDiagram
      title="OAUTH 2.1 // AUTHORIZATION CODE + PKCE"
      width={980} height={500} nodes={NODES} steps={STEPS}
      caption="Authorization Code + PKCE with token rotation. Deprecated grant type rendered struck-through per OAuth 2.1 / RFC 9700 BCP."
    />
  )
}
