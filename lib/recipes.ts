export interface CommandRecipe {
  id: string
  category: string
  title: string
  command: string
  description?: string
}

/**
 * Curated, accurate IAM PowerShell recipes surfaced by <CommandReference />.
 * All cmdlets are current Microsoft.Graph / ActiveDirectory module commands
 * (no retired AzureAD / MSOnline). Categories drive the filter chips.
 */
export const IAM_RECIPES: CommandRecipe[] = [
  {
    id: 'connect-graph',
    category: 'Fundamentals',
    title: 'Connect to Microsoft Graph with least-privilege scopes',
    command:
      'Connect-MgGraph -Scopes "User.Read.All","Group.Read.All","AuditLog.Read.All" -NoWelcome',
    description:
      'Request only the scopes the script needs. Use -UseDeviceCode on headless hosts; a certificate-based app registration for unattended automation.',
  },
  {
    id: 'whoami-graph',
    category: 'Fundamentals',
    title: 'Confirm the connected context and active scopes',
    command: '(Get-MgContext) | Select-Object Account, TenantId, Scopes',
    description: 'Verify who you authenticated as and which permissions are live before running changes.',
  },
  {
    id: 'new-user',
    category: 'Lifecycle',
    title: 'Create a cloud user with a forced password change',
    command:
      '$pp = @{ Password = (New-Guid).Guid; ForceChangePasswordNextSignIn = $true }\nNew-MgUser -DisplayName "Ada Lovelace" -UserPrincipalName "ada@contoso.com" -MailNickname "ada" -AccountEnabled -PasswordProfile $pp',
    description: 'Generate a random temp password; never hard-code a static default.',
  },
  {
    id: 'set-manager',
    category: 'Lifecycle',
    title: "Set a user's manager (directory relationship)",
    command:
      '$mgr = @{ "@odata.id" = "https://graph.microsoft.com/v1.0/users/manager@contoso.com" }\nSet-MgUserManagerByRef -UserId "ada@contoso.com" -BodyParameter $mgr',
    description: 'Manager is a navigation property set by reference, not a plain attribute.',
  },
  {
    id: 'disable-user',
    category: 'Lifecycle',
    title: 'Disable an account during offboarding',
    command: 'Update-MgUser -UserId "ada@contoso.com" -AccountEnabled:$false',
    description: 'Disable first, revoke sessions, then delete after the retention window — never delete blind.',
  },
  {
    id: 'filter-users',
    category: 'Lifecycle',
    title: 'Server-side filter for a department (advanced query)',
    command:
      'Get-MgUser -Filter "department eq \'Finance\'" -ConsistencyLevel eventual -CountVariable c -All',
    description:
      "Advanced filters need -ConsistencyLevel eventual and -CountVariable. Filtering server-side avoids pulling the whole tenant.",
  },
  {
    id: 'new-group',
    category: 'Groups',
    title: 'Create a security group',
    command:
      'New-MgGroup -DisplayName "App-Finance-Readers" -MailEnabled:$false -SecurityEnabled -MailNickname "app-finance-readers"',
    description: 'Security groups are MailEnabled:$false + SecurityEnabled. M365 groups flip those flags.',
  },
  {
    id: 'add-group-member',
    category: 'Groups',
    title: 'Add a member to a group by reference',
    command:
      'New-MgGroupMemberByRef -GroupId $groupId -BodyParameter @{ "@odata.id" = "https://graph.microsoft.com/v1.0/directoryObjects/$userId" }',
    description: 'Members are added by directoryObject reference.',
  },
  {
    id: 'transitive-membership',
    category: 'Groups',
    title: 'Resolve all groups a user belongs to (incl. nested)',
    command: 'Get-MgUserTransitiveMemberOf -UserId "ada@contoso.com" -All',
    description: 'Transitive membership follows nested group chains; MemberOf returns only direct groups.',
  },
  {
    id: 'signin-logs',
    category: 'Auditing',
    title: 'Pull failed sign-ins for a user (last 24h)',
    command:
      'Get-MgAuditLogSignIn -Filter "userPrincipalName eq \'ada@contoso.com\' and status/errorCode ne 0" -Top 50',
    description: 'Requires AuditLog.Read.All. Sign-in logs are P1/P2 licensed for full retention.',
  },
  {
    id: 'directory-audit',
    category: 'Auditing',
    title: 'Review recent directory changes (who changed what)',
    command:
      'Get-MgAuditLogDirectoryAudit -Filter "activityDateTime ge $((Get-Date).AddDays(-7).ToString(\'o\'))" -Top 100',
    description: 'Directory audit logs capture role grants, group edits, app consent, and policy changes.',
  },
  {
    id: 'stale-accounts',
    category: 'Auditing',
    title: 'Find stale accounts by last interactive sign-in',
    command:
      'Get-MgUser -All -Property "displayName,signInActivity,accountEnabled" |\n  Where-Object { $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-90) }',
    description: 'signInActivity requires Microsoft Entra ID P1/P2 and AuditLog.Read.All.',
  },
  {
    id: 'revoke-sessions',
    category: 'Security',
    title: 'Revoke all refresh tokens after a compromise',
    command: 'Revoke-MgUserSignInSession -UserId "ada@contoso.com"',
    description: 'Invalidates issued refresh tokens, forcing reauthentication everywhere. Pair with a password reset.',
  },
  {
    id: 'role-assignments',
    category: 'Security',
    title: 'List active directory role assignments',
    command:
      'Get-MgRoleManagementDirectoryRoleAssignment -ExpandProperty Principal,RoleDefinition -All |\n  Select-Object @{n=\'Role\';e={$_.RoleDefinition.DisplayName}}, @{n=\'Principal\';e={$_.Principal.AdditionalProperties.displayName}}',
    description: 'Surfaces standing (always-on) privileged access — the first thing an auditor asks for.',
  },
  {
    id: 'pim-eligible',
    category: 'Security',
    title: 'List PIM-eligible (just-in-time) role assignments',
    command: 'Get-MgRoleManagementDirectoryRoleEligibilitySchedule -ExpandProperty RoleDefinition -All',
    description: 'Eligible ≠ active. PIM elevation is the difference between standing and just-in-time admin.',
  },
  {
    id: 'ca-policies',
    category: 'Security',
    title: 'Export Conditional Access policies for review',
    command: 'Get-MgIdentityConditionalAccessPolicy -All | Select-Object DisplayName, State',
    description: 'Flag policies in "enabledForReportingButNotEnforced" and any with no grant controls.',
  },
  {
    id: 'ad-inactive',
    category: 'Automation',
    title: 'On-prem AD: find inactive accounts',
    command: 'Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly | Where-Object Enabled',
    description: 'Uses LastLogonTimeStamp (replicated, ~14-day latency) — not LastLogon, which is per-DC.',
  },
  {
    id: 'whatif-bulk',
    category: 'Automation',
    title: 'Dry-run a destructive bulk change before committing',
    command: 'Import-Csv .\\offboard.csv | ForEach-Object { Update-MgUser -UserId $_.UPN -AccountEnabled:$false -WhatIf }',
    description: 'Run with -WhatIf first to preview every change; remove it only once the output looks right.',
  },
  {
    id: 'global-admins',
    category: 'Access Auditing',
    title: 'List every member of the Global Administrator role',
    command:
      '$role = Get-MgDirectoryRole -Filter "displayName eq \'Global Administrator\'"\nGet-MgDirectoryRoleMember -DirectoryRoleId $role.Id -All',
    description: 'The single most over-provisioned role in most tenants. Aim for fewer than five standing Global Admins.',
  },
  {
    id: 'stale-guests',
    category: 'Access Auditing',
    title: 'Find guest (external) accounts that have gone stale',
    command:
      'Get-MgUser -Filter "userType eq \'Guest\'" -Property "displayName,mail,signInActivity,createdDateTime" -ConsistencyLevel eventual -CountVariable c -All |\n  Where-Object { $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-90) }',
    description: 'Guests linger long after a project ends. signInActivity needs Entra ID P1/P2 and AuditLog.Read.All.',
  },
  {
    id: 'app-role-assignments',
    category: 'Access Auditing',
    title: 'Audit app role assignments granted to a service principal',
    command:
      'Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $spId -All |\n  Select-Object PrincipalDisplayName, ResourceDisplayName, AppRoleId',
    description: 'Shows which users, groups, or apps were assigned roles on an enterprise app — the answer to "who has access to this app?"',
  },
  {
    id: 'risky-users',
    category: 'Access Auditing',
    title: 'Review users flagged by Identity Protection risk',
    command:
      'Get-MgRiskyUser -Filter "riskLevel eq \'high\' and riskState eq \'atRisk\'" -All |\n  Select-Object UserPrincipalName, RiskLevel, RiskState, RiskLastUpdatedDateTime',
    description: 'Surfaces accounts Entra ID Protection considers high-risk. Requires IdentityRiskyUser.Read.All and an Entra ID P2 license.',
  },
  {
    id: 'users-without-mfa',
    category: 'Security Hygiene',
    title: 'Find users with no strong authentication method registered',
    command:
      'Get-MgUser -All -Property "id,userPrincipalName" | ForEach-Object {\n  $m = Get-MgUserAuthenticationMethod -UserId $_.Id\n  $strong = $m | Where-Object { $_.AdditionalProperties[\'@odata.type\'] -match \'microsoftAuthenticator|fido2|phone|softwareOath\' }\n  if (-not $strong) { $_.UserPrincipalName }\n}',
    description: 'Inspects each user\'s registered authentication methods; anyone with only a password is an MFA gap. Needs UserAuthenticationMethod.Read.All.',
  },
  {
    id: 'disabled-but-licensed',
    category: 'Security Hygiene',
    title: 'Find disabled accounts that still hold paid licenses',
    command:
      'Get-MgUser -Filter "accountEnabled eq false" -Property "displayName,userPrincipalName,assignedLicenses" -ConsistencyLevel eventual -CountVariable c -All |\n  Where-Object { $_.AssignedLicenses.Count -gt 0 }',
    description: 'Disabled users with active SKUs waste licensing spend. Reclaim the licenses during offboarding cleanup.',
  },
  {
    id: 'password-never-expires',
    category: 'Security Hygiene',
    title: 'On-prem AD: find accounts set to never expire passwords',
    command:
      'Search-ADAccount -PasswordNeverExpires -UsersOnly | Where-Object Enabled |\n  Select-Object Name, SamAccountName, LastLogonDate',
    description: 'PasswordNeverExpires is a common audit finding on service and admin accounts. Confirm each one is intentional.',
  },
  {
    id: 'risky-oauth-grants',
    category: 'Security Hygiene',
    title: 'Review OAuth2 permission grants (delegated consent)',
    command:
      'Get-MgOauth2PermissionGrant -All |\n  Where-Object { $_.ConsentType -eq \'AllPrincipals\' } |\n  Select-Object ClientId, ResourceId, Scope',
    description: 'Tenant-wide (AllPrincipals) delegated grants are a frequent consent-phishing foothold; verify every broad Scope.',
  },
  {
    id: 'page-all-results',
    category: 'Automation Patterns',
    title: 'Page through every result instead of the default first page',
    command:
      'Get-MgUser -All -PageSize 999 -Property "id,userPrincipalName,accountEnabled"',
    description: 'Without -All you only get the first 100 objects. -PageSize 999 cuts round-trips on large tenants.',
  },
  {
    id: 'count-with-eventual',
    category: 'Automation Patterns',
    title: 'Get an accurate count with advanced query options',
    command:
      'Get-MgUser -Filter "accountEnabled eq true" -ConsistencyLevel eventual -CountVariable total -Top 1\n"Enabled users: $total"',
    description: 'Counts and $count/$search/not/endsWith filters require -ConsistencyLevel eventual and a -CountVariable.',
  },
  {
    id: 'cert-app-auth',
    category: 'Automation Patterns',
    title: 'Unattended sign-in with a certificate (scheduled jobs)',
    command:
      'Connect-MgGraph -ClientId $appId -TenantId $tenantId -CertificateThumbprint $thumbprint -NoWelcome',
    description: 'Use app-only certificate auth for scheduled tasks — no interactive prompt, no stored secret in the script.',
  },
]

/** Recipes filtered to a category (case-insensitive); all recipes when omitted. */
export function getRecipes(category?: string): CommandRecipe[] {
  if (!category) return IAM_RECIPES
  const c = category.toLowerCase()
  return IAM_RECIPES.filter((r) => r.category.toLowerCase() === c)
}
