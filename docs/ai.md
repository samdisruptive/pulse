# AI analyst (OpenAI)

Official docs: https://platform.openai.com/docs

## Principles

1. Pulse decides what data the model sees. The model never fetches data and never receives credentials, lead personal data, or clients outside the user's access.
2. Every figure in a confirmed finding must exist in the context pack. The evidence check enforces this after every response.
3. Answers separate Confirmed, Hypothesis and Recommendation, and lead with data caveats (failing sources, tracking issues, lag).
4. Correlation is never stated as cause. Hypotheses say what evidence would test them.
5. Costs are tracked and capped.

## Request lifecycle

1. The UI posts to `/api/ai/ask` or `/api/ai/analyse` with mode, client, page, tab, range, compare, scope, filters and an optional target.
2. The server checks `useAi` or `useAgencyAi` and the budget.
3. `buildContext` assembles the context pack from the metrics service (same numbers as the screens).
4. The server streams progress events (`reading_context`, `checking_freshness`, `comparing_periods`, `writing_answer`) over server-sent events.
5. OpenAI is called with structured outputs (JSON schema generated from the zod `AIResponse` schema, strict mode).
6. The response is validated with zod, then evidence-checked, then stored in `AiInteraction` and sent to the client.

## Context pack (shape)

```json
{
  "scope": { "mode": "client", "client": "Kestrel Outdoor", "sites": ["all"], "currency": "GBP" },
  "period": { "current": "2026-09-22/2026-10-19", "comparison": "2026-08-25/2026-09-21", "label": "vs previous period" },
  "page": { "route": "analytics/acquisition", "filters": {} },
  "dataStatus": [
    { "ref": "s:ga4", "source": "GA4", "status": "ok", "dataThrough": "2026-10-19" },
    { "ref": "s:meta", "source": "Meta Ads", "status": "ok", "warning": "Purchase events low on kestreloutdoor.de since 16 Oct" }
  ],
  "metrics": [
    { "ref": "m:storeRevenue", "label": "Store revenue", "tier": "actual", "value": 412860, "comparison": 381571, "change": "+8.2%", "judgement": "better", "currency": "GBP" }
  ],
  "tables": [
    { "ref": "t:channels", "columns": ["channel", "sessions", "change", "purchaseRate"], "rows": [["Paid search", 48210, "+4.2%", 0.0341]] }
  ],
  "issues": [ { "ref": "i:123", "severity": "warning", "title": "Meta purchase events down 64% on kestreloutdoor.de", "since": "2026-10-16" } ],
  "annotations": [ { "date": "2026-10-03", "text": "Autumn sale starts" } ],
  "knowledge": [ { "ref": "k:45", "category": "decision", "title": "Pause DE prospecting until tracking is fixed", "date": "2026-10-18" } ]
}
```

Keep packs small: top rows only (for example 10 per table), totals always included.

## Response schema (`AIResponse`)

| Field | Content |
| --- | --- |
| status | ok, insufficient, no_data, restricted |
| title | Short answer title |
| blocks | Ordered list: `text`, `callout` (warning or info), `findings` (items with kind confirmed, hypothesis or recommendation, text, refs), `table` (columns, rows, refs), `chart` (series with labels and values, ref) |
| sources | ref, label, tier, period, freshness |
| method | Steps taken, in plain English |
| followUps | Up to 3 suggested questions |

## System prompt rules (summarised; keep the full prompt in `src/server/ai/prompts.ts`)

- You are Pulse's analyst for Digitally Disruptive staff. Use only the context provided.
- If data is missing, failing or affected by an open tracking issue, say so first.
- Use the tier labels; never add values across tiers or platform conversions across platforms; use MER for a blended paid view.
- Confirmed findings must cite refs whose values support them.
- In client mode, refuse questions about other clients (status restricted).
- No forecasts unless the context contains one (status insufficient).
- British English, plain language, no em dashes, short sentences.

## Evidence check

Extract every number from confirmed findings and table cells. Normalise formats (currency symbols, separators, %, pts, k and m suffixes). Accept a number if it matches a context value within rounding tolerance, or is a simple difference or ratio of two context values on the same refs. Otherwise downgrade the finding to a hypothesis with the note "Not directly supported by the figures above", or drop the table cell. Reject responses citing unknown refs and retry once.

## Models and cost

- `AI_MODEL_ANALYSIS` for answers and report drafting, `AI_MODEL_FAST` for short summaries and as the fallback when the budget alert threshold is reached. Model names are configuration, never hard-coded in features.
- Record `usage` tokens per call in `AiUsage` with an estimated cost from a price table in settings (update when OpenAI pricing changes).
- Budget behaviour at the limit: switch to the fast model, or pause (configurable).
- Check OpenAI's current API data usage and retention terms and record them in this document before go-live.

## Features using the service

| Feature | Endpoint | Notes |
| --- | --- | --- |
| Ask AI panel | `/api/ai/ask` | Thread history (last few turns) included as text, not as new data |
| Analyse with AI buttons | `/api/ai/analyse` | Targets: chart:<metric>, kpis, channels, queries, campaigns, stores, products, indexing, incidents, leads, movers, insight:<id> |
| Insights | worker job | Rules produce candidates; the model writes the wording; evidence check applies |
| Report drafting | `/api/ai/report` | Section by section; human approval required before PDF |
| Knowledge answers | context includes approved entries | Shown separately as team knowledge |

## Testing

- Mock the OpenAI client in unit and end-to-end tests.
- Maintain `docs/ai-eval.md`: a set of questions per client with expected facts and expected caveats. Run it after any prompt or model change and record results.
