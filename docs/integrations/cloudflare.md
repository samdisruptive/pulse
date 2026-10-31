# Cloudflare (optional)

Official docs: https://developers.cloudflare.com/analytics/graphql-api/

| | |
| --- | --- |
| Provider id | `cloudflare` |
| Auth | API token with Zone > Analytics: Read (and Zone: Read for discovery), scoped to the relevant zones |
| Tier | actual |

Discovery: `GET https://api.cloudflare.com/client/v4/zones`.

Daily data through the GraphQL Analytics API (`POST https://api.cloudflare.com/client/v4/graphql`), dataset `httpRequests1dGroups` filtered by zone tag and date: `sum { requests cachedRequests threats bytes }`. Map to facts `cfRequests`, `cfCachedRequests`, `cfThreats` per site. Dataset availability and retention depend on the zone's plan; confirm.
