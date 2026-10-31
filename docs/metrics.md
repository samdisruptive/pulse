# Metric registry

The registry (`src/lib/metrics/registry.ts`) is the single source of truth for what each metric means. Screens, reports, the AI and MCP all read it.

## Fields

| Field | Meaning |
| --- | --- |
| `key` | Stable identifier used in facts and URLs |
| `label` | Default label. Clients can override some (for example `leads` becomes "Qualified leads") |
| `description` | Plain-English definition shown in the "i" panel |
| `kind` | `sum` (adds across days and sites), `rate` (ratio of sums), `percent` (ratio shown as %, changes in pts), `position` (weighted average) |
| `unit` | money, count, ratio, percent, position |
| `betterWhen` | `up`, `down` or `neither` (judgement colouring) |
| `tier` | actual, measured, platform, google, crawler, derived |
| `icon` | Lucide icon name |
| `sources` | Provider ids that can supply it |
| `inputs` / `compute` | Derived metrics only |

## Base metrics (stored as facts)

| Key | Label | Tier | Kind | Better | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `storeRevenue` | Store revenue | actual | sum | up | shopify, woocommerce, magento | Definition in `integrations/shopify.md`. Per-client setting for tax and shipping. |
| `orders` | Orders | actual | sum | up | stores | Paid, not cancelled, not test. |
| `refunds` | Refunds | actual | sum | down | stores | By refund date. |
| `sessions` | Sessions | measured | sum | up | ga4 | |
| `engagedSessions` | Engaged sessions | measured | sum | up | ga4 | |
| `keyEvents` | Key events | measured | sum | up | ga4 | |
| `leads` | Leads (website) | measured | sum | up | ga4 | Count of the client's configured lead events. |
| `ga4Revenue` | GA4 revenue | measured | sum | up | ga4 | purchaseRevenue. |
| `gscClicks` | Clicks | google | sum | up | gsc | |
| `gscImpressions` | Impressions | google | sum | up | gsc | |
| `gscPositionWeighted` | (internal) | google | sum | | gsc | position x impressions, used to compute `avgPosition`. Not shown. |
| `adSpend` | Ad spend | platform | sum | neither | google-ads, meta, linkedin | Summable across platforms (spend is counted the same way everywhere). |
| `adImpressions`, `adClicks` | | platform | sum | up | ads | Summable across platforms. |
| `platformConversions` | Conversions | platform | sum | up | ads | Never summed across platforms. |
| `platformConversionValue` | Conversion value | platform | sum | up | ads | Never summed across platforms. |
| `formLeads` | Form leads | actual | sum | up | meta-leads, linkedin-leads | From stored Lead rows, excluding test and repeat. |
| `uptimePct` | Uptime | actual | rate | up | uptime | |
| `responseMs` | Response time | actual | rate | down | uptime | Median. |

## Derived metrics (computed at query time)

| Key | Label | Formula | Tier | Kind | Better |
| --- | --- | --- | --- | --- | --- |
| `aov` | Average order value | storeRevenue ÷ orders | derived | rate | up |
| `engagementRate` | Engagement rate | engagedSessions ÷ sessions | measured | percent | up |
| `conversionRate` | Conversion rate | orders ÷ sessions | derived | percent | up |
| `ctr` | CTR | gscClicks ÷ gscImpressions | google | percent | up |
| `avgPosition` | Avg position | gscPositionWeighted ÷ gscImpressions | google | position | down |
| `mer` | MER | storeRevenue ÷ adSpend (same currency, same period) | derived | rate | up |
| `cpl` | Cost per lead | adSpend ÷ leads | derived | rate | down |
| `formCpl` | Cost per form lead | lead form campaign spend ÷ paid formLeads | derived | rate | down |
| `roas` | ROAS (per platform) | platformConversionValue ÷ adSpend, one platform at a time | platform | rate | up |
| `refundRate` | Refund rate | refunds ÷ storeRevenue | derived | percent | down |

Rules:

1. Sum inputs over the whole period and scope first, then divide. Never average daily ratios.
2. If any input is unavailable, the derived metric is unavailable with a reason that names the input.
3. Money-derived metrics need one currency. In local-currency mode with mixed currencies they are unavailable.

## Comparison and judgement

| Kind | Change shown | Flat band (default) |
| --- | --- | --- |
| sum, rate | Percentage: "▲ 8.2%" | ±2% (client setting: 1, 2 or 5) |
| percent | Points: "▼ 0.12 pts" | ±0.05 pts |
| position | From and to: "13.1 → 14.2" | ±0.2 positions |

Judgement: within the flat band is neutral; otherwise `better` when the change goes in the `betterWhen` direction, `worse` when it goes against it; `betterWhen: neither` is always neutral.

Comparison windows:

- **Previous period:** the same number of days immediately before.
- **Same period last year:** shifted back 364 days so weekdays line up.
- **Unavailable:** if the comparison window starts before the source's `dataStart`, say so ("No comparison: lead forms were connected on 1 Apr 2026").

## Freshness

| Status | Meaning | UI |
| --- | --- | --- |
| ok | Synced within the provider's normal interval | Solid green dot, "Synced 08:05" |
| lagging | Behind, but within the provider's normal lag | No warning, "Data to 17 Oct, normal lag" |
| delayed | Past the normal interval, still retrying | Orange ring, "Delayed" |
| failing | Authentication or permanent error | Solid red dot, "Not synced since 17 Oct 04:10" |

Expected lag: GA4 1 to 2 days for complete data, Search Console 2 to 3 days, ad platforms same day with later restatements, stores near real time.
