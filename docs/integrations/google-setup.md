# Google Cloud setup (sign-in, GA4, Search Console, Google Ads)

## One project, two OAuth clients

Create one Google Cloud project owned by the agency Workspace, with:

1. **APIs enabled:** Google Analytics Data API, Google Analytics Admin API, Google Search Console API, Google Ads API, Chrome UX Report API, PageSpeed Insights API (optional).
2. **OAuth consent screen:** user type Internal if the agency uses Google Workspace (no Google verification needed, only agency accounts can consent). App name "Pulse by Disruptive".
3. **OAuth client for sign-in** (Web application): redirect URI `https://<pulse-domain>/api/auth/callback/google` plus localhost for development. Scopes: openid, email, profile only.
4. **OAuth client for integrations** (Web application): redirect URI `https://<pulse-domain>/api/integrations/google/callback`. Requested scopes:

| Scope | For |
| --- | --- |
| `https://www.googleapis.com/auth/analytics.readonly` | GA4 Data API and Admin API (read) |
| `https://www.googleapis.com/auth/webmasters.readonly` | Search Console performance, sitemaps and URL Inspection |
| `https://www.googleapis.com/auth/adwords` | Google Ads API (added in Phase 5; existing connections reconnect to grant it) |

Request offline access (`access_type=offline`, `prompt=consent` on first connect) to receive a refresh token. Use PKCE and a signed `state` that includes the initiating user and a nonce.

5. **API key for CrUX:** restricted to the Chrome UX Report API, server use only.

## Which Google account to connect

Use a dedicated agency account (for example analytics@digitallydisruptive.co.uk) that has Viewer or higher on every client's GA4 property, Full or Restricted user on Search Console properties, and access to client Google Ads accounts through the agency manager account. Connections should not depend on an individual's personal account.

Alternative for GA4 only: a service account added as Viewer on each property. It avoids token expiry but must be added property by property, so OAuth is the default.

## Refresh tokens

Refresh tokens can be revoked by the user, by password changes on some account types, or by admin policy. With an Internal consent screen they do not expire after 7 days (that limit applies to External apps in Testing status). Pulse treats `invalid_grant` as AUTH and asks for Reconnect.
