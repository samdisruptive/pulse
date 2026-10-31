# Integrations: framework

Every data source is a provider module behind one interface. Adding a provider never changes the shell, the facts storage, the jobs framework or existing pages.

## Provider interface

```ts
// src/server/providers/types.ts (shape, not final code)
export interface Provider {
  id: string;                          // "ga4", "gsc", "google-ads", "meta", "meta-leads", ...
  displayName: string;
  category: "analytics" | "search" | "ads" | "ecommerce" | "leads" | "uptime" | "performance" | "other";
  authType: "OAUTH" | "TOKEN" | "API_KEY" | "NONE";
  scopes?: string[];
  expectedLagDays: number;             // normal delay before data is complete
  maxBackfillDays: number;             // how far back the API allows
  syncEveryHours: number;
  capabilities: {
    metrics: { key: string; tier: Tier; dimensions: DimensionType[] }[];
  };
  listAvailableSources(ctx: ConnectionContext): Promise<AvailableSource[]>;
  sync(input: SyncInput): Promise<SyncOutput>;   // idempotent for any window
  classifyError(err: unknown): ProviderError;     // AUTH | RATE_LIMIT | TRANSIENT | PERMANENT
  refreshCredentials?(ctx: ConnectionContext): Promise<Credentials>;
  // optional capabilities
  webhooks?: WebhookHandler;
  leads?: LeadRetrieval;
  inspection?: UrlInspection;
}

export interface SyncOutput {
  facts: Fact[];               // zod-validated, see below
  entities?: EntityMeta[];     // campaigns, forms, products
  dataThrough: string;         // last complete date (YYYY-MM-DD) in the source's time zone
  warnings: string[];          // for example unmatched hostnames
}
```

## Normalised fact

| Field | Rule |
| --- | --- |
| date | Calendar date in the source's reporting time zone (the property, account or store time zone) |
| metricKey | A key from the metric registry |
| dimensionType, dimensionValue | `none` and `""` for totals |
| value | Decimal. Money in major units (convert micros and cents). |
| currency | ISO code for money, null otherwise |
| tier | From the provider's capability list |
| siteId | Set when the source maps to several sites and the provider can split by host or store |

Write totals as their own rows (dimensionType `none`). Never rebuild totals by adding dimension rows: APIs drop small rows ("(other)", thresholding), so the sum is not the total.

## Time zones

Use the source's own time zone for dates (GA4 property, ad account, store). Do not convert to UTC. Show a note when a client's sources use different time zones.

## Error handling

| Class | Typical causes | Behaviour |
| --- | --- | --- |
| AUTH | invalid_grant, revoked consent, expired token, missing scope | Mark connection NEEDS_REAUTH, pause its sources, raise a CRITICAL agency issue listing affected clients, stop retrying |
| RATE_LIMIT | 429, quota exhausted, usage headers over threshold | Retry with exponential backoff and jitter, respect Retry-After, lower concurrency for that provider |
| TRANSIENT | 5xx, timeouts, network errors | Retry up to 5 times with backoff |
| PERMANENT | Property deleted, permission removed for one source, invalid request | Fail the run, mark the source failing with a plain-English message, raise a WARNING issue |

Never put tokens, full URLs with query strings containing tokens, or personal data into error messages, logs or `SyncRun.error`.

## Default schedule

| Provider | Incremental | Late-data re-sync | Backfill limit |
| --- | --- | --- | --- |
| GA4 | Every 6 hours | Last 3 days nightly | About 14 months on standard properties (confirm per property retention) |
| Search Console | Daily | Last 4 days nightly | 16 months |
| Google Ads | Every 4 hours | Last 7 days nightly (conversions arrive late) | Full account history; default 25 months |
| Meta Ads | Every 4 hours | Last 7 days nightly | 37 months (confirm) |
| LinkedIn Ads | Every 6 hours | Last 7 days nightly | Confirm current limit |
| Meta and LinkedIn leads | Every 15 minutes, plus Meta webhook | n/a | Meta only exposes recent leads (90 days at time of writing, confirm) |
| Shopify | Hourly | Last 3 days nightly (refunds, edits) | Full history with read_all_orders |
| WooCommerce, Magento | Hourly | Last 3 days nightly | Full history |
| CrUX | Weekly | n/a | History API: about 6 months of weekly data |
| Cloudflare | Daily | n/a | Depends on plan |
| Uptime | Every minute (internal) | n/a | n/a |

## Testing providers

- Record real responses once, sanitise them (remove names, emails, tokens, account ids), save under `src/server/providers/<id>/__fixtures__/`.
- Unit-test the mapping from fixtures to facts, pagination, multi-site splitting and each error class.
- CI never calls live APIs.
- At each provider prompt, compare five figures with the platform's own interface for the same dates and time zone and record them in `docs/data-checks.md`.

## Adding a provider

1. Create `src/server/providers/<id>/` with `index.ts`, `client.ts` (HTTP calls), `map.ts` (response to facts), `errors.ts`, fixtures and tests.
2. Register it in `src/server/providers/index.ts`.
3. Add new metric keys to the registry.
4. Add its setup steps to a new file in this folder.
5. If it needs a screen, add a section that appears only when the source is connected.
