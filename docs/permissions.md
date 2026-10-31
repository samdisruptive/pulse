# Permissions

## Roles

| Role | Default client access | Typical person |
| --- | --- | --- |
| ADMIN | All clients | Agency leads, the platform owner |
| ACCOUNT_MANAGER | Own clients (where they are owner) | Account managers |
| SPECIALIST | Selected clients | Developers, SEO and paid specialists |
| VIEWER | Own clients | Read-only staff |

Admins can override any user's client access (all, own, selected).

## Capabilities

| Capability | Admin | Account manager | Specialist | Viewer |
| --- | --- | --- | --- | --- |
| viewAgency | Yes | Yes | Yes | Yes |
| viewClient | Yes | Accessible | Accessible | Accessible |
| editClient | Yes | Accessible | No | No |
| manageUsers | Yes | No | No | No |
| manageIntegrations | Yes | No | No | No |
| viewIntegrations | Yes | Yes | Yes | No |
| viewLeads | Yes | Accessible | Accessible | No |
| exportLeads | Yes | Accessible | No | No |
| manageIssues | Yes | Accessible | Accessible | No |
| createReports | Yes | Accessible | Accessible | No |
| approveAiReports | Yes | Accessible | No | No |
| useAi (client mode) | Yes | Accessible | Accessible | Yes, accessible |
| useAgencyAi | Yes | Yes (accessible clients only) | No | No |
| manageAiSettings | Yes | No | No | No |
| manageMcp | Yes | No | No | No |
| useMcp | Yes | Yes | Yes | No |

"Accessible" means the client is within the user's client access. AI and MCP role permissions can be narrowed further in AI & MCP settings, never widened beyond this table.

## MCP information categories

Per person, in Team access: reporting data, issues, client knowledge, revenue and spend, save notes. A tool that would return a category the person lacks returns a denied result and logs it.

## Enforcement

- Every Server Component that reads client data calls `requireCapability`.
- Every server action and route handler calls `requireUser` and `requireCapability` before anything else.
- An automated test enumerates route handlers and server actions and fails if one lacks a guard.
- The UI hides controls the user cannot use, but the server is the only real check.
