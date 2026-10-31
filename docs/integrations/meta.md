# Meta Ads and Meta lead forms

Official docs: https://developers.facebook.com/docs/marketing-api and https://developers.facebook.com/docs/marketing-api/guides/lead-ads

Two providers share one connection: `meta` (ads performance) and `meta-leads` (Instant Form leads).

| | |
| --- | --- |
| Auth | System user access token from the agency Business Manager (TOKEN connection), or OAuth through the Meta app |
| API | Graph API / Marketing API, versioned (`v<NN>.0`); pin the version, review quarterly |
| Tier | platform (ads), actual (leads) |
| Sources | Ad accounts (`act_<id>`); for leads, Facebook Pages and their forms |

## Setup (start early)

1. Create a Meta app (type Business) owned by the agency Business Manager.
2. Add products: Marketing API, Webhooks.
3. Create a system user in Business Settings, assign it the client ad accounts (and the Pages that run lead ads), and generate a token for the app with permissions: `ads_read`, `business_management`, and for leads `leads_retrieval`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata` (to subscribe the Page to webhooks). Confirm the exact list in Meta's current lead ads guide.
4. `leads_retrieval` and some Page permissions need Advanced Access through App Review. Plan for the review time.
5. Clients must grant the agency Business Manager access to their ad account and Page, and for lead retrieval the Page's lead access settings must allow the agency's system user or app (Page settings > Leads access, confirm current location).

## Discovery

`GET /me/adaccounts?fields=id,name,currency,timezone_name,account_status` with the system user token. For leads: `GET /me/accounts` (Pages) then `GET /{page-id}/leadgen_forms?fields=id,name,status,questions,created_time`.

## Ads performance

```
GET /act_{id}/insights
  ?level=campaign
  &time_increment=1
  &time_range={"since":"2026-09-22","until":"2026-10-19"}
  &fields=campaign_id,campaign_name,objective,spend,impressions,clicks,frequency,actions,action_values
  &action_attribution_windows=["7d_click","1d_view"]
```

- Use the account's own attribution setting by default and store the windows used on the source settings; label figures "Meta: 7-day click, 1-day view" in the UI.
- From `actions` / `action_values`, read `purchase` (or `offsite_conversion.fb_pixel_purchase`) for ecommerce and `lead` / `onsite_conversion.lead_grouped` for lead generation. Confirm action type names against real responses and store which type was used.
- For long backfills use asynchronous insights jobs (`POST /act_{id}/insights` returns a report run id; poll `GET /{report_run_id}` then fetch results).
- Spend is in the account currency.

## Rate limits

Read the `X-Business-Use-Case-Usage` and `X-Ad-Account-Usage` response headers. When usage passes 75%, slow down; when an error code for rate limiting is returned (for example 17, 80004, or 613), back off using `estimated_time_to_regain_access` from the header.

## Lead forms (`meta-leads`)

Two retrieval paths, both used:

1. **Webhook (fast):** subscribe the app to the Page's `leadgen` field (`POST /{page-id}/subscribed_apps?subscribed_fields=leadgen`). Meta sends `entry[].changes[].value.leadgen_id`. Verify `X-Hub-Signature-256` (HMAC SHA-256 of the raw body with the app secret) before processing, respond 200 quickly, then enqueue a fetch job.
2. **Polling (safety net):** every 15 minutes `GET /{form-id}/leads?fields=id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data,is_organic,platform&filtering=[{"field":"time_created","operator":"GREATER_THAN","value":<unix>}]`.

Mapping to `Lead`:

| Meta field | Pulse field |
| --- | --- |
| id | platformLeadId |
| created_time | submittedAt |
| field_data (name/value pairs) | encAnswers; standard fields (full_name, email, phone_number) also go to encName, encEmail, encPhone |
| campaign_id, adset_name, ad_name | campaignExternalId, groupName, adName |
| is_organic | isOrganic |

Test leads from the Lead Ads Testing Tool: mark `isTest` (detect from the testing tool's flag in the response if present, otherwise from a configurable test email or name pattern; confirm current behaviour).

Retention: Meta only returns leads for a limited period (90 days at time of writing). Never rely on backfilling older leads: a client's history in Pulse starts when the form is connected.

## Errors

| Error | Class |
| --- | --- |
| OAuthException code 190 (invalid or expired token) | AUTH |
| Code 10 or 200 permissions errors on one account or Page | PERMANENT (source) |
| Codes 4, 17, 32, 613, 80000 series | RATE_LIMIT |
| Code 1 or 2, 5xx | TRANSIENT |

## Verification

Ads Manager, same account and dates, same attribution setting: spend, impressions, clicks and results. Leads: submit a test lead with the Lead Ads Testing Tool and confirm it arrives within minutes, flagged as a test.
