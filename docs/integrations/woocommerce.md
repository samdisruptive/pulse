# WooCommerce

Official docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

| | |
| --- | --- |
| Provider id | `woocommerce` |
| Auth | REST API consumer key and secret (Read permission) per store, created in WooCommerce > Settings > Advanced > REST API, sent with HTTP Basic auth over HTTPS |
| API | `https://<store>/wp-json/wc/v3/` |
| Tier | actual |

## Sync

- Orders: `GET /orders?after=<ISO>&before=<ISO>&status=processing,completed&per_page=100&page=N` (use `modified_after` for incremental sync where available on the store's version). Read `date_paid` or `date_completed` per the client's revenue setting, `total`, `total_tax`, `shipping_total`, `discount_total`, `currency`, `line_items`, `refunds`.
- Refunds: included on orders as summaries; `GET /orders/{id}/refunds` for dates and amounts.
- Store time zone: `GET /settings/general` (`woocommerce_timezone` or WordPress timezone setting).
- Pagination headers: `X-WP-Total`, `X-WP-TotalPages`.

## Common problems

- Security plugins, firewalls (Wordfence, Cloudflare WAF) or hosting rules blocking the API: ask for Pulse's server IP to be allow-listed. Classify repeated 403 HTML responses as PERMANENT with that explanation.
- Sites on plain HTTP or with broken Basic auth headers (some hosts strip the Authorization header): document the `?consumer_key=&consumer_secret=` query fallback for HTTPS only.
- Very large stores: sync by day ranges and keep concurrency to 1 per store.

## Verification

WooCommerce > Analytics > Revenue for the same dates and status settings.
