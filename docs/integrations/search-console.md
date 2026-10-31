# Google Search Console

Official docs: https://developers.google.com/webmaster-tools

| | |
| --- | --- |
| Provider id | `gsc` |
| Auth | Google integration OAuth, scope webmasters.readonly |
| Library | `googleapis` (searchconsole v1) or REST |
| Tier | google |
| Source | One property: domain property (`sc-domain:example.co.uk`) or URL-prefix property (`https://www.example.co.uk/`) |

Prefer domain properties: they cover every subdomain and protocol.

## Discovery

`sites.list` returns properties and the permission level. Ignore `siteUnverifiedUser`.

## Performance data

`searchanalytics.query` per day window, `type: "web"`, `dataState: "final"` (also run `"all"` for the last 3 days only if fresher partial data is wanted, and mark those days incomplete).

| Request | Dimensions | Facts |
| --- | --- | --- |
| Totals | date | gscClicks, gscImpressions, gscPositionWeighted |
| Queries | date, query | dimensionType query |
| Pages | date, page | dimensionType page |
| Countries | date, country | dimensionType country |
| Devices | date, device | dimensionType device |
| Search appearance | searchAppearance (separate request, cannot combine with other dimensions; confirm) | dimensionType searchAppearance |

- Paginate with `rowLimit` (maximum 25,000) and `startRow` until fewer rows return.
- Position: the API returns an average position per row. Store `position x impressions` as `gscPositionWeighted` so any range can be averaged correctly as sum(weighted) ÷ sum(impressions).
- Totals must come from the date-only request. Query and page rows exclude anonymised queries, so they never add up to the total. Show the anonymised share in the UI.
- Data is available for 16 months and lags 2 to 3 days.

## Brand and non-brand

Store queries as returned. Split brand and non-brand at query time using the client's `brandTerms` (case-insensitive terms or regular expressions), so changing the terms re-categorises history immediately.

## Sitemaps

`sitemaps.list` for each property: path, last submitted, last downloaded, warnings, errors, and submitted URL counts. Fetch each sitemap's XML (and child sitemaps) on a schedule to build the `KnownUrl` inventory.

## URL Inspection

`urlInspection.index.inspect` with `inspectionUrl` and `siteUrl`.

- Quota per property: 2,000 inspections per day and 600 per minute (confirm current limits). Track usage in Redis per property per day.
- Priority order: URLs new to a sitemap, URLs with impressions or sessions, URLs whose sitemap `lastmod` changed, then oldest-inspected rotation.
- Store: `indexStatusResult.coverageState`, `indexingState`, `verdict`, `lastCrawlTime`, `googleCanonical`, `userCanonical`, `robotsTxtState`, `pageFetchState`.
- Daily `IndexSnapshot` with counts by coverage state for change tracking.

## Errors

| Response | Class |
| --- | --- |
| 401, invalid_grant | AUTH |
| 403 "User does not have sufficient permission for site" | PERMANENT (source) |
| 429 or quota exceeded | RATE_LIMIT (inspection quota: pause until midnight Pacific time, confirm reset time) |
| 5xx | TRANSIENT |

## Verification

In Search Console > Performance with the same final dates: total clicks, impressions, average CTR, average position, and the top query's clicks.
