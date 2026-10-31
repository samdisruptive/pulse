# Google Ads

Official docs: https://developers.google.com/google-ads/api/docs/start

| | |
| --- | --- |
| Provider id | `google-ads` |
| Auth | Google integration OAuth, scope adwords; developer token; manager account |
| Library | REST (`googleads.googleapis.com`) or the community `google-ads-api` Node package |
| Tier | platform |
| Source | One customer account (10-digit id) under the agency manager account |

## Prerequisites (start early)

1. Developer token from the agency manager account (API Center). New tokens start with test access; apply for Basic access to use production accounts. Approval can take days.
2. The connected Google account must have access to the manager account.
3. Every request sends headers `developer-token` and `login-customer-id` (manager id, digits only).
4. The API is versioned and each version is retired roughly a year after release. Pin the version in one constant and review quarterly.

## Discovery

`customers:listAccessibleCustomers`, then a GAQL query against the manager account:

```sql
SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code,
       customer_client.time_zone, customer_client.manager, customer_client.status
FROM customer_client
WHERE customer_client.level <= 2
```

Offer non-manager, enabled accounts for mapping.

## Daily campaign performance

`GoogleAdsService.SearchStream`:

```sql
SELECT segments.date, campaign.id, campaign.name, campaign.status,
       campaign.advertising_channel_type,
       metrics.cost_micros, metrics.impressions, metrics.clicks,
       metrics.conversions, metrics.conversions_value
FROM campaign
WHERE segments.date BETWEEN '2026-09-22' AND '2026-10-19'
```

| Field | Fact |
| --- | --- |
| cost_micros ÷ 1,000,000 | adSpend (account currency) |
| impressions, clicks | adImpressions, adClicks |
| conversions | platformConversions (decimal, data-driven attribution can produce fractions) |
| conversions_value | platformConversionValue |

Write account totals (dimensionType none) from a separate customer-level query, and campaign rows with dimensionType campaign. Store campaign metadata in `EntityMeta`.

## Attribution labelling

Query `conversion_action` (name, category, primary_for_goal, attribution_model_settings, click_through_lookback_window_days) and store a summary on the source, so the UI can show "Data-driven, 30-day click" next to Google Ads conversions.

## Late data

Conversions are attributed back to the click date and keep arriving for days. Re-sync the last 7 days nightly (30 days weekly for long-cycle clients).

## Limits

Daily operation limits depend on developer token access level. Use SearchStream (one request per query) and avoid per-campaign requests.

## Errors

| Error | Class |
| --- | --- |
| AuthenticationError, invalid_grant | AUTH |
| AuthorizationError.USER_PERMISSION_DENIED on one customer | PERMANENT (source) |
| DEVELOPER_TOKEN_NOT_APPROVED | PERMANENT (connection), admin message |
| QuotaError.RESOURCE_EXHAUSTED, RESOURCE_TEMPORARILY_EXHAUSTED | RATE_LIMIT |
| INTERNAL_ERROR, TRANSIENT_ERROR | TRANSIENT |

## Verification

In the Google Ads interface for the same account and dates: cost, clicks, conversions and conversion value at account level, plus one campaign.
