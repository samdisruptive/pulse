# Data model

Prisma models grouped by area. Every model has `id` (cuid), `createdAt` and `updatedAt` unless noted. Field lists show the important fields, not every column.

## People and access

| Model | Key fields | Notes |
| --- | --- | --- |
| `User` | name, email (unique), role (ADMIN, ACCOUNT_MANAGER, SPECIALIST, VIEWER), active, lastSeenAt, notificationPrefs (JSON) | Invite-only. Auth.js adapter tables (`Account`, `Session`, `VerificationToken`) attach here. |
| `ClientAccess` | userId (unique), scope (ALL, OWN, SELECTED) | Defaults by role. See `permissions.md`. |
| `ClientAccessGrant` | userId, clientId | Only used when scope is SELECTED. |
| `AuditLog` | actorId?, action, entityType, entityId, clientId?, metadata (JSON), ip | No secrets or personal data in metadata. |

## Clients

| Model | Key fields | Notes |
| --- | --- | --- |
| `Client` | name, slug, type (ECOMMERCE, LEAD_GEN, HYBRID), ownerId, reportingCurrency, status, kpiProfile (JSON array of metric keys), flatBandPercent, ga4LeadEvents (string[]), brandTerms (string[]), settings (JSON) | |
| `Brand` | clientId, name | Optional level. |
| `Site` | clientId, brandId?, domain, label, currency, timezone, active | A domain or a path section (`brookandhale.co.uk/york`). |
| `Annotation` | clientId, siteId?, date, text, createdById | Shown on charts and in reports. |
| `FxRate` | date, currency, rate (to GBP) | Unique (date, currency). Daily job. |

## Integrations and facts

| Model | Key fields | Notes |
| --- | --- | --- |
| `Connection` | provider, label, authType, accountIdentifier, encryptedCredentials, scopes[], status (OK, NEEDS_REAUTH, FAILING, DISABLED), lastSuccessfulSyncAt, lastError | Agency-level login or token. One connection can feed many clients. |
| `DataSource` | connectionId, provider, externalId, displayName, clientId?, status, dataStart, dataThrough, lastSuccessfulSyncAt, lastAttemptAt, lastError, settings (JSON), enabled | A property, site, ad account or store. Unmapped until clientId is set. |
| `DataSourceSite` | dataSourceId, siteId | Many-to-many. |
| `MetricFactDaily` | date, clientId, siteId?, dataSourceId, provider, metricKey, dimensionType, dimensionValue, value (Decimal 20,6), currency?, tier, syncedAt | Unique (dataSourceId, date, metricKey, dimensionType, dimensionValue, siteId). Indexes (clientId, metricKey, date) and (dataSourceId, date). Consider monthly partitions above ~50M rows. |
| `EntityMeta` | dataSourceId, entityType (campaign, adGroup, ad, form, product), externalId, name, status, attributes (JSON) | Names change; facts reference ids. |
| `SyncRun` | dataSourceId, kind, from, to, status, rowsWritten, attempt, startedAt, finishedAt, error | Kept 90 days. |
| `RawPayload` | dataSourceId, syncRunId, payload (JSON) | Debugging only. Kept 14 days. Never store personal data here. |
| `SystemEvent` | type, connectionId?, dataSourceId?, payload | Feeds the issue rules. |

Dimension types: `none`, `channel`, `sourceMedium`, `landingPage`, `query`, `page`, `country`, `device`, `searchAppearance`, `campaign`, `adGroup`, `ad`, `product`, `store`, `form`, `hostName`. Use an empty string for `dimensionValue` when the type is `none`.

## Technical SEO and uptime

| Model | Key fields | Notes |
| --- | --- | --- |
| `KnownUrl` | siteId, url, sources (sitemap, gsc, ga4), firstSeen, lastSeen, priority | URL inventory for inspection. |
| `UrlInspection` | knownUrlId, inspectedAt, coverageState, indexingState, lastCrawlTime, googleCanonical, userCanonical, verdict | Latest per URL, plus history if needed. |
| `IndexSnapshot` | siteId, date, counts (JSON by coverage state) | For "▲ 38 since 3 Oct". |
| `WebVitals` | siteId, date, formFactor, lcpP75, inpP75, clsP75, source (crux, psi) | Weekly. |
| `UptimeCheck` | siteId, checkedAt, ok, statusCode, responseMs, error | Kept 7 days. |
| `UptimeDaily` | siteId, date, uptimePct, p50Ms, p95Ms, checks | Long term. |
| `Incident` | siteId, startedAt, endedAt?, cause | |

## Leads

| Model | Key fields | Notes |
| --- | --- | --- |
| `LeadForm` | dataSourceId, externalId, name, platform, status, questions (JSON) | |
| `Lead` | clientId, dataSourceId, formId, platformLeadId (unique per source), submittedAt, campaignExternalId?, groupName?, adName?, isOrganic, isTest, isRepeat, encName, encEmail, encPhone, encAnswers, emailHash | Personal fields encrypted (AES-256-GCM, context `lead:<id>`). `emailHash` is a keyed HMAC blind index. |
| `LeadExport` | userId, clientId, filters (JSON), rowCount | Audit of every export. |
| `DeliveryTarget`, `LeadDelivery` | | Created empty for future lead delivery. |

## Issues, signals, insights

| Model | Key fields |
| --- | --- |
| `Issue` | clientId?, affectedClientIds[], ruleKey, severity, category, section, title, whatHappened, nextSteps (JSON), evidence (JSON), keyFact, status, snoozedUntil, ownerId, detectedAt, resolvedAt, dedupeKey |
| `IssueEvent` | issueId, actorId?, type, note |
| `Signal` | clientId, siteId?, metricKey, change, judgement, magnitude, periodStart, periodEnd, expiresAt |
| `Insight` | clientId, type, title, evidence (JSON), confirmed, hypothesis?, recommendation?, confidence, sources (JSON), sectionRoute, periodStart, periodEnd, dismissedBy (JSON) |
| `Notification` | userId, type, title, body, link, readAt |

## Reports

| Model | Key fields |
| --- | --- |
| `ReportConfig` | clientId, name, template, periodType, compare, includeYoY, sections (JSON) |
| `Report` | configId?, clientId, periodStart, periodEnd, status (DRAFT, READY, SENT), commentary (JSON by section with status), aiAssisted, approvedById?, approvedAt?, pdfPath?, createdById |
| `ReportEvent` | reportId, actorId, type, note |

## AI, knowledge and MCP

| Model | Key fields |
| --- | --- |
| `AiSettings` | singleton: analysisModel, fastModel, answerLength, monthlyBudgetGbp, alertAtPercent, onLimit (FAST, PAUSE), retentionDays, allowedSources (JSON), rolePermissions (JSON) |
| `AiUsage` | userId?, feature, clientId?, model, tokensIn, tokensOut, costGbp |
| `AiInteraction` | userId, mode, clientId?, page, question?, target?, refsUsed[], response (JSON), status |
| `KnowledgeEntry` | clientId, category, title, body, tags[], source, createdById, status, approvedById?, approvedAt?, links (JSON), searchVector (tsvector) |
| `KnowledgeRevision` | entryId, body, editedById |
| `McpApp` | key (claude, chatgpt, cursor, other), status, disconnectedAt? |
| `McpClient` | clientId (OAuth), name, redirectUris[], appKey | Registered MCP clients. |
| `McpGrant` | userId, mcpClientId, scopes[], createdAt, revokedAt? |
| `McpToken` | grantId, type (access, refresh), tokenHash, expiresAt, revokedAt? | Store hashes only. |
| `McpAccess` | userId, categories (JSON: reporting, issues, knowledge, money, write) |
| `McpCapability` | tool, enabled |
| `McpActivity` | userId, appKey, tool, clientId?, result (ALLOWED, DENIED, PENDING), detail |
