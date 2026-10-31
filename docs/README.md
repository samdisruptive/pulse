# Pulse documentation

Reference documents for building Pulse. The build sequence lives in `handoff.md`; these files are what each prompt points to for detail.

| File | What it covers |
| --- | --- |
| `handoff.md` | The 31 Cursor prompts in build order |
| `architecture.md` | System overview, processes, request and sync flows, folder layout |
| `data-model.md` | Every table, its purpose, key fields and relationships |
| `metrics.md` | Metric registry: definitions, tiers, formulas, comparison rules |
| `permissions.md` | Roles, capabilities and client access |
| `environment.md` | Every environment variable and how to generate secrets |
| `decisions/` | Accepted architecture decision records |
| `specification-conflicts.md` | Open conflicts that must be resolved before affected milestones |
| `integrations/README.md` | Provider interface, normalisation, sync schedule, error handling, adding providers |
| `integrations/google-setup.md` | Google Cloud project, OAuth consent and scopes shared by GA4, Search Console and Google Ads |
| `integrations/ga4.md` | Google Analytics 4 |
| `integrations/search-console.md` | Google Search Console, URL Inspection and sitemaps |
| `integrations/google-ads.md` | Google Ads |
| `integrations/meta.md` | Meta Ads and Meta lead forms |
| `integrations/linkedin.md` | LinkedIn Ads and Lead Gen Forms |
| `integrations/shopify.md` | Shopify |
| `integrations/woocommerce.md` | WooCommerce |
| `integrations/magento.md` | Magento / Adobe Commerce |
| `integrations/crux.md` | Core Web Vitals field data (Chrome UX Report) |
| `integrations/cloudflare.md` | Cloudflare analytics |
| `integrations/uptime.md` | Pulse's own uptime checks |
| `ai.md` | OpenAI usage, context packs, response schema, guardrails, budgets |
| `mcp.md` | MCP server, authorisation, tools and client setup |
| `reference/pulse-prototype.html` | Interactive prototype (visual and functional reference) |
| `reference/pulse-design-tokens.json` | Design tokens |

## A note on API versions

Every provider here versions its API and retires old versions on a schedule. These documents describe endpoints, fields and behaviour as understood in October 2026. At implementation time:

1. Check the official documentation linked in each file.
2. Pin the current stable version in config (one constant per provider) rather than scattering version strings through code.
3. Add a quarterly reminder to review versions and deprecation notices.

Where a field name or quota could have changed, the docs say "confirm". Treat those as things to check, not facts.
