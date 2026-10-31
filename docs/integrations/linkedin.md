# LinkedIn Ads and Lead Gen Forms

Official docs: https://learn.microsoft.com/en-us/linkedin/marketing/

Two providers share one connection: `linkedin` (ads performance) and `linkedin-leads`.

| | |
| --- | --- |
| Auth | 3-legged OAuth 2.0 with the agency's LinkedIn member account, which must have access to client ad accounts |
| API | LinkedIn Marketing API (REST, `https://api.linkedin.com/rest/...`), versioned monthly via the `LinkedIn-Version: YYYYMM` header, plus `X-Restli-Protocol-Version: 2.0.0` |
| Tier | platform (ads), actual (leads) |
| Sources | Ad accounts (`urn:li:sponsoredAccount:<id>`) |

## Access (start early)

- Create an app in the LinkedIn Developer Portal, verified by the agency's LinkedIn Page.
- Request the Advertising API product for ads reporting. Lead retrieval requires the Lead Sync API product, which needs separate approval.
- Scopes: `r_ads`, `r_ads_reporting`, and for leads `r_marketing_leadgen_automation` (confirm current names when access is granted).
- Access tokens last about 60 days; refresh tokens are issued to approved Marketing partners. Store both encrypted and refresh before expiry; on failure raise AUTH.
- Until access is approved, register both providers as Planned so Integrations explains what is pending.

## Discovery

`GET /rest/adAccounts?q=search` (filter to accounts the user can access) returning id, name, currency, status.

## Ads performance

`GET /rest/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=DAILY&dateRange=(start:(year:2026,month:9,day:22),end:(year:2026,month:10,day:19))&accounts=List(urn%3Ali%3AsponsoredAccount%3A123)&fields=dateRange,pivotValues,costInLocalCurrency,impressions,clicks,externalWebsiteConversions,oneClickLeads,oneClickLeadFormOpens`

| Field | Fact |
| --- | --- |
| costInLocalCurrency | adSpend (account currency) |
| impressions, clicks | adImpressions, adClicks |
| externalWebsiteConversions | platformConversions |
| oneClickLeads | platformConversions for lead gen campaigns (store which one is used) |

Campaign names come from `GET /rest/adAccounts/{id}/adCampaigns` (and campaign groups). Respect daily request limits per app and member; batch accounts where the API allows.

## Lead Gen Form responses

`GET /rest/leadFormResponses?q=owner&owner=(sponsoredAccount:urn%3Ali%3AsponsoredAccount%3A123)&leadType=(leadType:SPONSORED)&submittedAtTimeRange=(start:<ms>,end:<ms>)`

Forms: `GET /rest/leadForms?q=owner&owner=(sponsoredAccount:...)`.

Map `submittedAt`, form id, campaign (from the associated creative or campaign field), answers (question id to answer, joined with the form's questions), and standard fields (first name, last name, email, company, job title) into `Lead` with encryption. Mark answers pre-filled from the member profile.

Poll every 15 minutes. LinkedIn also offers lead notification subscriptions for approved partners; add later if needed.

## Errors

| Response | Class |
| --- | --- |
| 401 | AUTH |
| 403 on one account | PERMANENT (source) |
| 429 | RATE_LIMIT |
| 5xx | TRANSIENT |
| 426 / version not supported | PERMANENT, update the pinned version |

## Verification

Campaign Manager for the same account and dates: spend, impressions, clicks, leads. Submit a test lead from the form preview and confirm it arrives.
