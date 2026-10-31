# Magento / Adobe Commerce

Official docs: https://developer.adobe.com/commerce/webapi/rest/

| | |
| --- | --- |
| Provider id | `magento` |
| Auth | Integration created in System > Extensions > Integrations with read access to Sales > Orders and Catalog. Use its access token. |
| API | `https://<store>/rest/<store_code>/V1/` |
| Tier | actual |

## Token note

Since Magento 2.4.4, integration access tokens cannot be used as standalone bearer tokens unless the store enables "Allow OAuth Access Tokens to be used as standalone Bearer tokens" (Stores > Configuration > Services > OAuth > Consumer Settings). Either ask the store's developer to enable it, or sign requests with OAuth 1.0a using the integration's consumer key, consumer secret, access token and token secret. Store all four encrypted.

## Sync

`GET /V1/orders?searchCriteria[filter_groups][0][filters][0][field]=updated_at&searchCriteria[filter_groups][0][filters][0][value]=<datetime>&searchCriteria[filter_groups][0][filters][0][condition_type]=gteq&searchCriteria[pageSize]=200&searchCriteria[currentPage]=N`

Read `created_at`, `state`, `status`, `base_grand_total`, `base_tax_amount`, `base_shipping_amount`, `base_discount_amount`, `base_currency_code`, `items`, `store_id`. Credit memos (`/V1/creditmemos`) for refunds.

Multi-store setups: map each `store_id` (or website) to a Pulse Site.

Use `base_*` amounts (base currency) consistently.

## Common problems

Slow responses on large catalogues: small page sizes and long timeouts. Firewalls blocking the API: allow-list Pulse's server IP.

## Verification

Reports > Sales > Orders for the same period and order statuses.
