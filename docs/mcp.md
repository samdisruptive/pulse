# MCP server

Official docs: https://modelcontextprotocol.io (specification, TypeScript SDK, authorisation)

Pulse exposes read access (and approval-gated note saving) to team members' own AI apps: Cursor, Claude and ChatGPT, plus any MCP-compatible client.

## Transport

- Official TypeScript SDK (`@modelcontextprotocol/sdk`), Streamable HTTP transport at `https://<pulse-domain>/mcp`.
- Stateless request handling where possible; if sessions are used, store session ids in Redis with a short expiry.

## Authorisation

Follow the current MCP authorisation specification (OAuth 2.1 based). At the time of writing that means:

1. The MCP endpoint is an OAuth protected resource and publishes protected resource metadata (`/.well-known/oauth-protected-resource`) naming Pulse's authorisation server.
2. Pulse acts as the authorisation server for its own users and publishes authorisation server metadata (`/.well-known/oauth-authorization-server`).
3. Clients register (dynamic client registration is commonly used by Claude and ChatGPT; Cursor may use it too), then send the user through the authorisation code flow with PKCE.
4. The user signs in with their Pulse (Google) session and sees a consent screen listing the app and the information categories it will be able to read.
5. Pulse issues short-lived access tokens (for example 1 hour) and refresh tokens bound to user and client; only hashes are stored (`McpToken`).
6. Every request validates the token, audience and expiry, loads the user's current permissions, and logs to `McpActivity`.

Check the specification version and client requirements (Claude, ChatGPT and Cursor each document their supported auth flows) at implementation time; this area changes quickly.

## Tools

| Tool | Type | Input | Returns | Category needed |
| --- | --- | --- | --- | --- |
| list_clients | read | optional search | Accessible clients with type and owner | reporting |
| get_client_summary | read | client, period, compare | KPI results with tiers and freshness, open issue count, data status | reporting (money values only with money) |
| get_metrics | read | client, metric keys, period, compare, scope, optional dimension | Metric results or breakdown rows | reporting (+ money for money metrics) |
| list_issues | read | client or all, status | Issues with severity and key facts | issues |
| list_insights | read | client, period | Insights with labels | reporting |
| search_knowledge | read | client, query | Approved entries | knowledge |
| list_decisions | read | client | Approved decision entries | knowledge |
| add_knowledge_note | write (approval) | client, title, body, category | Pending entry id | write |
| save_conversation_summary | write (approval) | client, summary with Confirmed / Hypothesis / Recommendation labels | Pending entry id | write |
| draft_report_commentary | planned | | | |
| create_issue | planned | | | |

Rules for every tool:

- Run as the signed-in user with the same permission checks as the app (`permissions.md`).
- Include tier, period and freshness with every figure so external assistants keep Pulse's honesty rules.
- Never return lead personal data, credentials or other clients' data.
- Tools can be switched off in Capabilities; a disabled tool returns a clear message.

## Connecting clients (for the setup steps in Settings)

Menus change between app versions, so keep the in-app steps short and illustrative:

- **Claude:** add a custom connector with the server URL, then sign in to Pulse when prompted.
- **ChatGPT:** add a connector (MCP server) with the URL where the workspace allows it, then sign in.
- **Cursor:** add the server URL to Cursor's MCP settings (`mcp.json` with a `url` entry), then complete sign-in in the browser.

## Testing

- Unit tests per tool for each role and information category.
- The MCP Inspector against a local instance.
- End to end with at least two real clients before rollout; revoke and confirm calls stop.
