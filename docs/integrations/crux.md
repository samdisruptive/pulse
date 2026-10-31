# Core Web Vitals (Chrome UX Report)

Official docs: https://developer.chrome.com/docs/crux/api

| | |
| --- | --- |
| Provider id | `crux` |
| Auth | API key (`CRUX_API_KEY`), no OAuth |
| Tier | google |

## Requests

- Current 28-day data: `POST https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=...` with `{ "origin": "https://www.example.co.uk", "formFactor": "PHONE", "metrics": ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift"] }`. Read `percentiles.p75` for each metric.
- Trend: `records:queryHistoryRecord` returns weekly collection periods (about six months).
- Also query `formFactor: "DESKTOP"`, and `url` for key landing pages when there is enough traffic (404 means not enough data: store "no field data", not zero).

Thresholds (good / needs improvement / poor): LCP 2.5 s / 4 s; INP 200 ms / 500 ms; CLS 0.1 / 0.25.

Quota: per-project queries per minute (check the console). Weekly sync is plenty.

PageSpeed Insights API (optional) gives lab data for a URL when field data is missing. Label it as lab data.
