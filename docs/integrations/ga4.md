# Google Analytics 4

Official docs: https://developers.google.com/analytics/devguides/reporting/data/v1 and https://developers.google.com/analytics/devguides/config/admin/v1

| | |
| --- | --- |
| Provider id | `ga4` |
| Auth | Google integration OAuth (see `google-setup.md`), scope analytics.readonly |
| Libraries | `@google-analytics/data` and `@google-analytics/admin`, or REST with fetch |
| Tier | measured |
| Source | One GA4 property (`properties/123456789`) |

## Discovery

`accountSummaries.list` (Admin API) returns accounts and their properties. For each property call `properties.get` (currency, time zone) and `properties.dataStreams.list` (web stream default URIs) to suggest which client and sites it belongs to.

## Reports to run per day window

Use `runReport` (or `batchRunReports`, up to 5 reports per call). Date ranges in the property's time zone.

| Report | Dimensions | Metrics | Facts written |
| --- | --- | --- | --- |
| Totals | date (+ hostName when the source covers several sites) | sessions, engagedSessions, keyEvents, purchaseRevenue, transactions, totalUsers | sessions, engagedSessions, keyEvents, ga4Revenue, ga4Transactions |
| Lead events | date, eventName (+ hostName) with a filter on the client's lead events | eventCount (or keyEvents per event, confirm) | leads |
| Channels | date, sessionDefaultChannelGroup | sessions, engagedSessions, keyEvents, purchaseRevenue | same, dimensionType channel |
| Source / medium | date, sessionSourceMedium | sessions, keyEvents, purchaseRevenue | dimensionType sourceMedium |
| Landing pages | date, landingPagePlusQueryString (strip query strings in mapping, keep path) | sessions, engagedSessions, keyEvents | dimensionType landingPage, top 500 per day |
| Countries | date, country | sessions | dimensionType country |
| Devices | date, deviceCategory | sessions, engagedSessions | dimensionType device |

Notes:

- `keyEvents` is the current name for what GA4 used to call conversions. Confirm metric names against the API's metadata endpoint (`properties/{id}/metadata`) at implementation time and fail loudly if a metric is missing.
- Revenue: default `purchaseRevenue`; per-client setting can choose `totalRevenue`.
- Use `limit` and `offset` to paginate (default 10,000 rows; higher limits allowed, confirm current maximum). Request `returnPropertyQuota: true`.
- Use `keepEmptyRows: false` and treat missing dates as missing.

## Multi-site properties

When a property is mapped to several sites, include `hostName` and assign each row to the site whose domain matches. Unmatched hostnames (staging sites, payment pages) are reported in `warnings` and stored with siteId null so totals stay complete.

## Data completeness

- Today is always incomplete; yesterday may still be processing. Set `dataThrough` to two days ago unless the API's metadata indicates otherwise, and re-sync the last 3 days nightly.
- High-cardinality reports can return an "(other)" row. Totals come from the totals report only.
- Thresholding (Google signals) can hide small rows; mention this in the UI note on breakdowns.

## Quotas

GA4 uses token-based quotas per property (daily and hourly core tokens, concurrent requests, and per-project limits). Read `propertyQuota` in each response; if tokens remaining fall below 10% of the hourly allowance, reschedule the remaining jobs for that property after the hour.

## Errors

| Response | Class |
| --- | --- |
| 401, invalid_grant | AUTH |
| 403 PERMISSION_DENIED on one property | PERMANENT (source), message "Pulse's Google account no longer has access to this property" |
| 429, RESOURCE_EXHAUSTED | RATE_LIMIT |
| 500, 503, DEADLINE_EXCEEDED | TRANSIENT |
| 400 INVALID_ARGUMENT (unknown metric) | PERMANENT, alert developers |

## Verification

For one property and the last 28 complete days, compare in the GA4 interface (Reports > Acquisition > Traffic acquisition): sessions total, engaged sessions, key events, purchase revenue, top channel sessions.
