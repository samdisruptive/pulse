# Shopify

Official docs: https://shopify.dev/docs/api/admin-graphql

| | |
| --- | --- |
| Provider id | `shopify` |
| Auth | Admin API access token per store (TOKEN connection, encrypted) |
| API | GraphQL Admin API, versioned quarterly (`/admin/api/<YYYY-MM>/graphql.json`); pin and review each quarter |
| Tier | actual |
| Source | One store (`<store>.myshopify.com`), mapped to one Site |

## Access

Create an app with Admin API access for each store, with read-only scopes `read_orders`, `read_all_orders` (orders older than 60 days), `read_products`. Shopify has been moving custom app creation from the store admin to the Dev Dashboard; follow the current recommended route at setup time. The client (store owner) usually needs to approve or create it. Store the access token in a TOKEN connection, one per store.

## What Pulse calls store revenue

Define it once and show it in the "i" panel:

> Store revenue: total of paid orders on the order's processed date, in the store currency, after discounts, excluding cancelled and test orders. Taxes and shipping are excluded by default (per-client setting to include them). Refunds are tracked separately on the refund date.

This will not exactly match Shopify Analytics' "Total sales" (which includes returns, taxes and shipping by its own rules). The verification step compares with an equivalent Shopify report.

## Backfill: bulk operations

```graphql
mutation {
  bulkOperationRunQuery(query: """
    {
      orders(query: "processed_at:>=2025-01-01 processed_at:<2025-02-01") {
        edges { node {
          id name processedAt cancelledAt test displayFinancialStatus
          currentSubtotalPriceSet { shopMoney { amount currencyCode } }
          totalDiscountsSet { shopMoney { amount } }
          totalTaxSet { shopMoney { amount } }
          totalShippingPriceSet { shopMoney { amount } }
          lineItems { edges { node { product { id } quantity originalTotalSet { shopMoney { amount } } } } }
          refunds { createdAt totalRefundedSet { shopMoney { amount } } }
        } }
      }
    }
  """) { bulkOperation { id status } userErrors { field message } }
}
```

Poll `currentBulkOperation` (or subscribe to the bulk operation finish webhook), download the JSONL, aggregate to daily facts. One bulk operation per store at a time; chunk by month. Confirm field names against the pinned API version.

## Incremental sync

Hourly: query orders with `updated_at:>=<last sync minus 1 hour>` (paginated, 250 per page) and recompute the affected days. Nightly: recompute the last 3 days fully to catch refunds and edits.

## Facts

| Fact | Dimension |
| --- | --- |
| storeRevenue, orders | none |
| refunds | none, by refund date |
| storeRevenue, units | product (product id; names in EntityMeta) |

Use `shopMoney` (store currency), not presentment currency.

## Rate limits

GraphQL cost-based throttling: read `extensions.cost.throttleStatus` (currentlyAvailable, restoreRate) and wait when the next query cost exceeds what is available.

## Errors

| Response | Class |
| --- | --- |
| 401, 403 invalid or uninstalled token | AUTH |
| 402 (store frozen or unpaid), 404 (store closed) | PERMANENT (source) |
| 429, THROTTLED | RATE_LIMIT |
| 5xx | TRANSIENT |

## Verification

For one week, compare orders and revenue (with matching tax and shipping settings) against a Shopify Analytics sales report in the store's time zone.
