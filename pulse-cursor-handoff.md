# Pulse: Cursor build handoff

Pulse by Disruptive is Digitally Disruptive's internal reporting and monitoring platform. This document turns the interactive prototype and the Pulse design system into a sequence of Cursor prompts, in build order.

## How to use this document

1. Create the repository, then copy the whole `docs/` folder from the handoff pack into it before the first prompt. It contains:
   - `docs/handoff.md`: this file.
   - `docs/reference/pulse-prototype.html`: the interactive prototype. Open it in a browser. It is the visual and functional reference for every screen. Its data is simulated; do not copy its data or its single-file JavaScript structure.
   - `docs/reference/pulse-design-tokens.json`: colour, type, spacing, radius and size tokens for light and dark themes.
   - The supporting documents listed below. Each prompt's `Docs:` line names the ones Cursor must read first.
2. Run one prompt per Cursor session (Agent mode). Paste the whole prompt, including its header block.
3. Do not start a prompt until the previous prompt's acceptance criteria and verification steps pass.
4. At the end of each phase, run that phase's checkpoint before moving on.
5. When a prompt says "reference the prototype", open the named route in `pulse-prototype.html` (routes use `#/agency/...` and `#/c/<client>/...`).

Prompt 1 creates `.cursor/rules/pulse.mdc`. Those rules apply to every later prompt, so later prompts do not repeat them.

## Supporting documents

| Document                                                                                                                                                                                                                                                                       | Read with prompts           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `docs/architecture.md`: processes, request and sync flows, folder layout, design rules                                                                                                                                                                                         | 5, 11, 12, 31               |
| `docs/data-model.md`: every table and relationship                                                                                                                                                                                                                             | 6, 8, 9, 11, 16, 23, 26, 29 |
| `docs/metrics.md`: metric definitions, tiers, formulas, comparison and freshness rules                                                                                                                                                                                         | 10, 16 to 21                |
| `docs/permissions.md`: roles, capabilities, MCP categories, enforcement                                                                                                                                                                                                        | 7, 17, 30                   |
| `docs/environment.md`: every environment variable and how to generate secrets                                                                                                                                                                                                  | 5, 8, 31                    |
| `docs/integrations/README.md`: provider interface, normalised facts, schedule, error classes, testing, adding providers                                                                                                                                                        | 11 to 15                    |
| `docs/integrations/google-setup.md`: Google Cloud project, OAuth clients, scopes, which account to connect                                                                                                                                                                     | 13                          |
| `docs/integrations/ga4.md`, `search-console.md`, `google-ads.md`, `meta.md`, `linkedin.md`, `shopify.md`, `woocommerce.md`, `magento.md`, `crux.md`, `cloudflare.md`, `uptime.md`: per-provider API reference (auth, endpoints, fields to facts, limits, errors, verification) | 14, 15, 20 to 25            |
| `docs/ai.md`: context packs, response schema, prompt rules, evidence check, models and cost                                                                                                                                                                                    | 27 to 29                    |
| `docs/mcp.md`: transport, authorisation, tools, client setup, testing                                                                                                                                                                                                          | 30                          |

API versions, scopes and quotas change. The integration documents describe them as understood in October 2026 and mark anything likely to move with "confirm". Cursor should check the linked official documentation and pin each provider's API version in one constant.

## Target architecture (summary for humans)

| Layer        | Choice                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| App          | Next.js App Router, React, TypeScript (strict)                                                                     |
| UI           | Tailwind CSS, shadcn/ui, Lucide icons, Recharts                                                                    |
| Data         | PostgreSQL via Prisma                                                                                              |
| Auth         | Auth.js (Google sign-in restricted to the agency domain), database sessions, role-based access                     |
| Jobs         | Redis and BullMQ, run in a separate worker process from the same codebase                                          |
| Integrations | Provider modules behind one interface: GA4 and Search Console first, then Google Ads, Meta Ads, Shopify and others |
| AI           | OpenAI API called only from the server, structured outputs, usage and budget tracking                              |
| MCP          | Authenticated MCP server exposing Pulse data to Cursor, Claude and ChatGPT, per-user permissions                   |
| Hosting      | Existing VPS, Docker Compose: `web`, `worker`, `postgres`, `redis`                                                 |

Core ideas every prompt relies on:

- **Client > Brand (optional) > Site > Data source.** A client can have several brands, sites and storefronts. Each data source (a GA4 property, a Search Console property, an ad account, a store) maps to a client and optionally to one or more sites.
- **Connections are agency-level.** One OAuth login (for example the agency's Google account) can serve many clients. Fixing one connection fixes every client on it.
- **Facts, not screens.** Providers write normalised daily facts. Screens read through a metrics layer that knows each metric's definition, source tier and how to compare periods.
- **Source tiers.** Every metric is Actual, Measured, Platform-reported, Google-reported, Crawler-detected or Derived. Values from different tiers are never added together.
- **Freshness is first-class.** Every source has a status (ok, lagging, delayed, failing), a last successful sync and a "data through" date.

## Build order

| Phase                        | Prompts  | Outcome                                                                                    |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| 0. Foundation                | 1 to 4   | Repo, design tokens, component library, app shell                                          |
| 1. Platform                  | 5 to 8   | Docker, database, auth and permissions, secure credentials                                 |
| 2. Clients and metrics       | 9 to 10  | Client management, metric and date engine                                                  |
| 3. Integrations              | 11 to 15 | Provider framework, worker, Integrations UI, GA4, Search Console                           |
| 4. Monitoring and dashboards | 16 to 20 | Issues and signals, agency overview, client overview, Analytics, Organic and Technical SEO |
| 5. More providers            | 21 to 25 | Google Ads, Meta and LinkedIn Ads, lead forms and Leads, Shopify and ecommerce, uptime     |
| 6. Reporting                 | 26       | Report builder and PDF                                                                     |
| 7. AI                        | 27 to 29 | AI service, AI panel and insights, Client knowledge                                        |
| 8. MCP                       | 30       | MCP server and AI & MCP settings                                                           |
| 9. Production                | 31       | Deployment, backups, security review                                                       |

## Accounts and approvals to request now

Some providers need approval that takes days or weeks. Start these before Phase 3:

- **Google Cloud project** with the Google Analytics Data API, Google Analytics Admin API and Search Console API enabled, plus an OAuth consent screen (Internal user type if the agency uses Google Workspace).
- **Google Ads API developer token** from the agency's manager account. Basic access requires an application.
- **Meta app** in the agency Business Manager with Marketing API access, and Advanced Access for `leads_retrieval` if lead forms are needed. App review can take time.
- **LinkedIn Marketing Developer Platform** access for the Lead Sync API, if LinkedIn lead forms are needed. This requires LinkedIn's approval.
- **Shopify**: a custom app per store, or one agency app installed on each store, with read access to orders, products and refunds.

Check each provider's current documentation at implementation time. API versions, scopes and quotas change.

---

# Phase 0: Foundation

## Prompt 1: Repository, tooling and project rules

```text
PROMPT 1 OF 31: Repository, tooling and project rules
Depends on: nothing
Reference: docs/handoff.md (this file), docs/reference/pulse-prototype.html

Goal
Create the Pulse repository foundation and the Cursor project rules every later prompt follows. Do not build features yet.

Tasks
1. Scaffold a Next.js App Router project with TypeScript in strict mode, the src/ directory, ESLint and the "@/" import alias. Use pnpm.
2. Add Tailwind CSS and initialise shadcn/ui (use the current shadcn CLI; accept CSS variables theming). Add lucide-react, recharts, zod, date-fns, next-themes, clsx and tailwind-merge.
3. Add Prettier (with the Tailwind plugin), Vitest with React Testing Library and jsdom, and Playwright for end-to-end tests. Add scripts: dev, build, start, lint, typecheck, test, test:e2e, format.
4. Create this folder structure (empty index files are fine):
   src/app/                 routes (App Router)
   src/components/ui/       shadcn primitives (generated)
   src/components/pulse/    Pulse design-system components
   src/components/shell/    sidebar, top bar, palette, AI panel slot
   src/features/            feature modules (clients, analytics, organic, paid, leads, ecommerce, issues, reports, ai, knowledge, integrations, settings)
   src/lib/                 shared server and client utilities
   src/lib/metrics/         metric registry, formatting, comparison engine
   src/server/              server-only code (db, auth, permissions, services)
   src/server/providers/    integration providers
   src/server/jobs/         BullMQ queues and job handlers
   worker/                  worker process entry point
   prisma/                  Prisma schema, migrations, seed
   tests/e2e/               Playwright tests
   docs/                    handoff and reference files
5. Add "server-only" and "client-only" packages and use them: anything under src/server must import "server-only".
6. Create .cursor/rules/pulse.mdc with alwaysApply: true containing the PROJECT RULES block below, verbatim.
7. Add a README.md describing how to run the project locally (to be extended later).
8. Add .env.example (empty for now, extended by later prompts) and make sure .env* files except .env.example are git-ignored.

PROJECT RULES (write this into .cursor/rules/pulse.mdc)
- Product: Pulse by Disruptive, an internal reporting and monitoring platform for Digitally Disruptive staff. Not a public SaaS product.
- Visual reference: docs/reference/pulse-prototype.html. Match its layout, spacing, typography, colours and interactions. Do not copy its code or simulated data.
- Design tokens: docs/reference/pulse-design-tokens.json. Never hard-code hex values in components; use the CSS variables and Tailwind tokens defined in Prompt 2.
- Copy: British English, sentence case, no em dashes anywhere in the UI (use a full stop, comma or middle dot). Dates as "22 Sep", "17 Oct 04:10" (24-hour), ranges as "22 Sep - 19 Oct". Currency with symbol and thousands separators: "£412,860", "€38,900".
- Pink means "you can act": solid pink only on the primary button; pink text and icons for links and AI actions; never pink for data, status or severity.
- Every metric shown to users carries a source tier: Actual, Measured, Platform-reported, Google-reported, Crawler-detected or Derived. Never add values from different tiers together, and never add conversions from different ad platforms together.
- Changes are coloured by judgement (better, worse, neutral) using the metric's betterWhen setting, not by arrow direction.
- Missing data is never estimated or shown as zero. Show the gap, the reason and the freshness.
- Server-only code lives in src/server and imports "server-only". Secrets, API keys and OAuth tokens never reach the browser.
- Every server action and route handler checks authentication and permissions before touching data.
- Validate all external input (forms, query strings, provider responses) with zod.
- Prefer Server Components for data fetching; use Client Components only for interactivity.
- Keep components small and reusable. Feature code goes in src/features/<feature>.
- Write tests for logic (metrics, permissions, providers, jobs). Every prompt ends with lint, typecheck and tests passing.

Deliverables
- Running Next.js app showing a placeholder home page.
- Tooling, folder structure, .cursor/rules/pulse.mdc, README.md, .env.example.

Acceptance criteria
- pnpm lint, pnpm typecheck, pnpm test and pnpm build all succeed.
- A sample Vitest test and a sample Playwright test (home page loads) both pass.
- Importing a module from src/server in a Client Component fails the build.

Verification
- Run every script listed above and paste the results.
```

## Prompt 2: Design tokens, fonts and theming

```text
PROMPT 2 OF 31: Design tokens, fonts and theming
Depends on: Prompt 1
Reference: docs/reference/pulse-design-tokens.json, docs/reference/pulse-prototype.html (any screen, in light and dark)

Goal
Implement the Pulse design tokens as CSS variables for light and dark themes, wire them into Tailwind and shadcn/ui, and load the Pulse fonts.

Tasks
1. In src/app/globals.css define the tokens below as CSS variables on :root (light) and on .dark (dark). Use next-themes with attribute="class", defaultTheme="system", enableSystem.
2. Map every token into Tailwind (Tailwind v4 @theme inline, or tailwind.config if the project uses v3) so classes like bg-surface, bg-surface-sunken, text-ink, text-ink-muted, border-border, border-border-strong, text-accent, bg-accent-fill, text-good, bg-good-tint, rounded-panel work.
3. Map shadcn's expected variables (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1..5) onto the Pulse tokens so generated shadcn components look like Pulse without editing each one. Primary = accent-fill with on-accent text. Ring = focus-ring.
4. Load fonts with next/font/google: Plus Jakarta Sans (400, 500, 600, 700) as --font-sans and IBM Plex Mono (400, 500) as --font-mono. Body uses sans. Mono is only for URLs, IDs and server addresses. Enable tabular figures on numeric elements via a .tabular utility.
5. Radii: sm 6px (tags), md 10px (buttons, inputs, nav items), panel 12px (shaded panels), lg 16px (cards), full. Control heights: sm 30px, md 36px, lg 44px; all controls use lg on touch devices (media pointer: coarse).
6. Add a theme toggle component (system, light, dark) for later use in the sidebar footer.
7. Create a development-only page at /dev/tokens that renders every colour token as a swatch in both themes, the type scale and the radii. Exclude it from production builds (or guard it behind NODE_ENV === "development").

TOKENS (light / dark)
bg #f4f5f7 / #000d1a
surface #ffffff / #0d1e33
surface-sunken #f3f5f8 / #15293f
surface-hover #f3f5f8 / #13263c
border #e4e7ec / #1e3049
border-strong #cdd3db / #33486a
border-control #8c95a2 / #5f7391   (inputs, selects, checkboxes only)
ink #000d1a / #f3f5f8
ink-muted #5b6472 / #a3aebe
ink-subtle #7a8494 / #7d8aa0       (placeholders and 24px+ text only)
accent #c4006a / #ff4fae           (pink text, icons, outlines)
accent-hover #9e0056 / #ff7ac2
accent-fill #fe0089 / #fe0089      (primary button fill only)
accent-fill-hover #e6007c / #ff2e9a
accent-tint #ffe6f3 / #3a0a24      (active nav pill, client tiles)
on-accent #000d1a / #000d1a        (text on accent-fill; white fails AA)
focus-ring #fe0089 / #ff4fae
good #0b7a53 / #48c79a, good-tint #e2f5ec / #0e2e25
bad #b54708 / #ffa266, bad-tint #fdeee3 / #3a2010
neutral-tint #ebeef2 / #1b2f48
critical #c0241b / #ff7b70, on-critical #ffffff / #1c0503
critical-tint #fce8e6 / #3a1512, critical-ink #8f1c13 / #ffb4ac
warning-tint #fdeee3 / #3a2010, warning-ink #9a3f05 / #ffb98a
healthy-tint #e2f5ec / #0e2e25, healthy-ink #0b6a48 / #7fdcbe
info #2f5bea / #8fa8ff, info-tint #e8eefd / #1a2650
linkedin #0b6375 / #6fd0e0, linkedin-tint #dff1f4 / #0e2c33
chart-current #000d1a / #e8ecf2
chart-comparison #9aa3af / #5b6f8c
chart-grid #e9ecf0 / #1b2f48
chart-incomplete #eef1f4 / #13263c
chart-1 #2f5bea / #8fa8ff, chart-2 #e07b24 / #f59a4a, chart-3 #13896f / #3fb896
chart-4 #8a5cd0 / #b596f0, chart-5 #b8901a / #e0bc4a, chart-6 #6b7380 / #8592a6
brand-navy #000d1a, brand-pink #fe0089, tile #000d1a / #1e3049
shadow-pop: light 0 1px 2px rgba(0,13,26,.06), 0 16px 40px rgba(0,13,26,.16); dark 0 1px 2px rgba(0,0,0,.6), 0 16px 40px rgba(0,0,0,.55)

TYPE SCALE (Plus Jakarta Sans)
page-title 26/32 700, letter-spacing -0.02em
section-title 15/22 700
card-label 14/20 600
body 14/20 400
body-sm 13/18 400
label 12/16 600
caption 12/16 400
kpi-xl 26/30 700 tabular, letter-spacing -0.02em
kpi-md 20/26 700 tabular

Deliverables
- globals.css tokens, Tailwind mapping, shadcn variable mapping, fonts, ThemeProvider, ThemeToggle, /dev/tokens page.

Acceptance criteria
- /dev/tokens matches the prototype's colours in both themes (compare side by side).
- Switching theme changes every token without a page reload; system preference is respected on first load.
- A shadcn Button with variant "default" renders pink with navy text; "outline" renders white with border-strong.
- No hex values appear in any component outside globals.css.

Verification
- Text contrast spot checks: ink-muted on surface, accent on surface, on-accent on accent-fill, all at least 4.5:1 in both themes (use a contrast checker or a small unit test computing contrast ratios).
- pnpm lint, typecheck, test, build pass.
```

## Prompt 3: Pulse component library

```text
PROMPT 3 OF 31: Pulse component library
Depends on: Prompt 2
Reference: prototype screens #/c/kestrel/overview, #/c/kestrel/analytics/acquisition, #/c/bramley/leads/list, #/agency/overview

Goal
Build the reusable Pulse components every screen uses, with typed props and a development showcase. No data fetching.

Components (src/components/pulse/)
1. TierTag: tier = actual | measured | platform | google | crawler | derived. Line style carries meaning: solid ink (actual, google), solid muted (measured), dashed (platform, crawler), dotted (derived). Labels: Actual, Measured, Platform-reported, Google-reported, Crawler-detected, Derived.
2. Delta: tinted pill showing an arrow and text. Props: text, judgement (better | worse | neutral). Colours: good/good-tint, bad/bad-tint, ink-muted/neutral-tint.
3. SeverityTag: critical (solid critical fill) | warning (warning-tint). Leading dot. Always shows the word.
4. StatusBadge: info | healthy | neutral | warning | critical, square 6px radius.
5. SourceTag: meta (info colours), linkedin (linkedin colours), google and others (neutral). Round pill.
6. FreshnessDot: ok (solid good), lagging (no dot, text only), delayed (orange ring), failing (solid critical). Shape differs, not just colour.
7. Card, CardHeader (title with optional Lucide icon in ink-muted, right-side slot), CardBody.
8. ShadedPanel: surface-sunken, radius panel, padding 14px.
9. KpiCard: header (metric icon, label linking optionally to a section, TierTag); ShadedPanel containing value (kpi-xl), Delta plus "vs <previous>" text, and a Sparkline on the right; footer with a source and freshness line plus an "i" button that toggles a definition panel (definition text, inputs each with TierTag and freshness). States: default, stale (value in ink-muted, footer shows FreshnessDot), loading (skeleton at final size), unavailable (renders nothing; parent reflows). Hide the sparkline when the card is narrower than 250px (CSS container query).
10. MiniMetric: label, kpi-md value, optional Delta, inside a ShadedPanel. Used two-up in section cards.
11. SectionCard: CardHeader with icon and TierTag, a two-column grid of MiniMetrics, footer note and "Open" link.
12. Sparkline: Recharts or plain SVG line, 76x36, stroke chart-current, 2px, round joins, no axes.
13. DataTable: built on TanStack Table and shadcn Table. Text columns left, numeric columns right with tabular figures, sortable headers with aria-sort, expandable rows (child rows on surface-sunken, indented), optional totals row, horizontal scroll inside the card, empty state row with a reason and a clear-filters action, optional row click.
14. SegmentedControl: pill track on surface-sunken with a raised selected segment; aria-pressed.
15. PageTabs: underline tabs that are links (each tab is a URL).
16. Banner: neutral | info | warning | critical; optional action.
17. EmptyState: dashed border card with title, explanation and actions.
18. AttentionRow: SeverityTag, title (button opening detail), meta line "category · section · age · key fact", one action button.
19. Finding: kind = confirmed | hypothesis | recommendation | context. Labelled box: confirmed solid border, hypothesis dashed on surface-sunken, recommendation accent border, context dotted accent ("From Client knowledge").
20. SimulatedTag and AiButton (outline button with a pink Sparkles icon, label "Analyse with AI" by default).
21. Skeleton variants for KPI cards, charts and tables.

Also create src/lib/format.ts with formatters used by components: money(value, currency, {pence, compact}), number, percent (1 or 2 dp), points ("0.12 pts"), position ("13.1 → 14.2"), date ("22 Sep"), dateTime ("17 Oct 04:10"), range ("22 Sep - 19 Oct"). Locale en-GB. Unit-test every formatter.

Showcase
Create /dev/ui (development only) rendering every component and state in light and dark, using hard-coded example props copied from the prototype's Kestrel Outdoor overview.

Deliverables
- Components with typed props and JSDoc, formatters with tests, /dev/ui page.

Acceptance criteria
- /dev/ui visually matches the prototype's equivalents (KPI cards, Needs attention, section cards, tables, tags) in both themes.
- All interactive components are keyboard accessible; icon-only buttons have aria-labels.
- Formatter tests cover GBP, EUR, USD, negative values, compact values, points and positions.
- No hex values in components.

Verification
- pnpm test passes with formatter and component tests (render, states, aria attributes).
- Manual check of /dev/ui at 1440px and 390px wide.
```

## Prompt 4: Application shell

```text
PROMPT 4 OF 31: Application shell
Depends on: Prompt 3
Reference: prototype sidebar, top bar and command palette on #/agency/overview and #/c/kestrel/overview; AI panel (click "Ask AI")

Goal
Build the persistent shell: sidebar, top bar, command palette, global date state and the AI panel slot. Use placeholder data from a typed mock module; real data arrives later.

Routes (create placeholder pages that render the shell and a page title)
Agency scope: /agency (overview), /agency/issues, /agency/clients, /agency/reports, /agency/integrations, /agency/settings, /agency/settings/ai/[section]
Client scope: /clients/[clientId] (overview), /clients/[clientId]/insights, /knowledge, /analytics/[tab], /organic/[tab], /paid, /leads/[tab], /ecommerce/[tab], /technical/[tab], /uptime, /issues, /reports, /settings
Redirect / to /agency.

Sidebar (src/components/shell/Sidebar.tsx)
- Lockup at top: navy logo tile (34px, radius md, white Disruptive mark image from /public/brand/mark-white.svg or .png), "Pulse" (17px bold), "by Disruptive" (12px ink-muted).
- Scope switcher button (52px): agency shows a neutral grid tile, "Agency" and "All N clients"; client shows initials on an accent-tint tile, client name and "type · N brands". Opens the command palette. Shows a ⌘K hint.
- Client scope adds an "All clients" back link above the sections.
- Nav items 38px, radius md, ink-muted; current item uses accent-tint background, ink text, pink icon, aria-current="page". Issues shows a count badge only when issues are open.
- Client sections show only when the client has the source connected (prop: available sections). No "Not connected" list in the sidebar.
- Footer: user initials, name, role, ThemeToggle.
- Desktop: 240px fixed column. Below 980px: shadcn Sheet opened from a menu button in the top bar.

Top bar (src/components/shell/TopBar.tsx)
- Breadcrumbs (Agency / Page, or Clients / Client / Page).
- Client scope only: scope picker (All brands and sites, a brand, or a site, showing each site's currency) and, when the scope mixes currencies, a GBP / Local segmented control.
- Date range picker: presets Last 7 days, Last 28 days, Last 90 days, last calendar month, last quarter, custom range; comparison Previous period or Same period last year (weekday aligned). Stored in URL search params (?range=28d&compare=prev or ?from=...&to=...) so links are shareable and the choice persists across sections. Default Last 28 complete days vs previous period.
- Freshness button: summary such as "6 sources · 1 warning" with a FreshnessDot; opens a popover listing each source, status and last successful sync (mock data for now).
- Export icon button, Ask AI button (neutral, pink Sparkles icon, pressed state when panel open), notifications button with a dot when critical items are unacknowledged.
- Must fit on one line at 1440px with the sidebar; wraps gracefully below.

Layout behaviour
- The html, body and app root fill the viewport; only the main content column scrolls. The sidebar and AI panel never scroll with the page.
- AI panel slot on the right: docked 420px column at 1200px and wider, overlay sheet below 1200px. Collapsible; keeps its state while navigating. Contents come in Prompt 28; render a placeholder now.

Command palette
- shadcn Command dialog on ⌘K / Ctrl+K: Agency overview, every client (initials, name, type, first two domains), and pages (Issues, Clients, Reports, Integrations, Settings). Arrow keys and Enter navigate. Escape closes.

State
- Create src/lib/date-range.ts with zod-validated parsing of range params into {start, end, days, compareStart, compareEnd, label}. Ranges end on the last complete day. Same period last year aligns weekdays (364 days back). Unit-test it.

Deliverables
- Shell components, routes, date-range utility with tests, palette, AI panel slot.

Acceptance criteria
- Navigating between client sections keeps the date range, comparison and scope in the URL.
- Switching client resets scope and currency but keeps dates.
- Keyboard: ⌘K opens the palette; Escape closes the topmost layer (palette, popover, sheet, AI panel) in that order.
- Sidebar and AI panel stay fixed while the content scrolls.

Verification
- Playwright: open /agency, switch to a client through the palette, change the date range, navigate to Analytics, confirm the URL keeps range and compare params.
- Manual: 1440px, 1100px (AI panel overlays), 390px (sidebar sheet).
```

### Phase 0 checkpoint

- Compare /dev/ui and the shell against the prototype at 1440px in light and dark. Note differences and fix before Phase 1.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` all pass.
- Commit and tag `phase-0`.

---

# Phase 1: Platform

## Prompt 5: Docker Compose, environment and database connection

```text
PROMPT 5 OF 31: Docker Compose, environment and database connection
Depends on: Prompt 4
Docs: docs/architecture.md, docs/environment.md

Goal
Run Pulse locally and on the VPS with Docker Compose: web, worker, PostgreSQL and Redis. Add typed environment handling, Prisma and health checks.

Tasks
1. Dockerfile (multi-stage, Node LTS, pnpm). One image with two commands: "web" runs next start (Next.js standalone output); "worker" runs the compiled worker entry (worker/index.ts compiled with tsup or tsx in production mode).
2. docker-compose.yml with services: web, worker, postgres (PostgreSQL 16, named volume, healthcheck), redis (Redis 7, appendonly yes, named volume, healthcheck). web and worker depend on healthy postgres and redis. No database or Redis ports exposed publicly in production; expose web on an internal port for the VPS's existing reverse proxy.
3. docker-compose.override.yml for local development (ports exposed, source mounted for web dev if useful).
4. src/server/env.ts: zod-validated environment. Fail fast at startup with a clear message listing missing variables. Separate server variables from public ones (NEXT_PUBLIC_ only where truly needed). Add to .env.example:
   DATABASE_URL, REDIS_URL, AUTH_SECRET, AUTH_URL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ALLOWED_EMAIL_DOMAIN, PULSE_ENCRYPTION_KEYS, PULSE_ACTIVE_KEY_ID, OPENAI_API_KEY (later), APP_BASE_URL, NODE_ENV, LOG_LEVEL.
5. Prisma: install, configure the PostgreSQL datasource, create src/server/db.ts exporting a singleton client (safe for Next.js dev hot reload).
6. Structured logging with pino (src/server/log.ts): JSON in production, pretty in development, request id where available. Never log secrets, tokens or personal data.
7. Health endpoints: /api/health (process up) and /api/health/ready (database and Redis reachable). The worker logs a heartbeat and exposes nothing publicly.
8. Scripts: db:migrate (dev), db:deploy (production migrate deploy), db:seed, db:studio.
9. Update README with local setup: copy .env.example, docker compose up, migrate, seed, open the app.

Deliverables
- Dockerfile, compose files, env module, Prisma client, logger, health endpoints, README update.

Acceptance criteria
- docker compose up starts all four services; /api/health/ready returns 200 with database and Redis checks true.
- Stopping postgres makes /api/health/ready return 503 with a clear reason.
- Missing a required env variable stops the app at startup with a readable error.

Verification
- Run the stack from a clean clone following only the README.
```

## Prompt 6: Core data model and seed data

```text
PROMPT 6 OF 31: Core data model and seed data
Depends on: Prompt 5
Docs: docs/data-model.md
Reference: prototype client directory (#/agency/clients) and client settings (#/c/kestrel/settings)

Goal
Define the core Prisma schema for people, clients, brands, sites and access, plus realistic fictional seed data mirroring the prototype.

Models (adjust names to Prisma conventions; use cuid or uuid ids, createdAt and updatedAt everywhere)
- User: name, email (unique), image, role (enum ADMIN, ACCOUNT_MANAGER, SPECIALIST, VIEWER), active, lastSeenAt. Auth.js adapter tables (Account, Session, VerificationToken) added in Prompt 7.
- Client: name, slug (unique), type (enum ECOMMERCE, LEAD_GEN, HYBRID), ownerId (User), reportingCurrency (default GBP), status (ACTIVE, PAUSED, ARCHIVED), notes, kpiProfile (ordered list of metric keys, JSON validated by zod), flatBandPercent (default 2).
- Brand: clientId, name. Optional: a client can have zero brands (single-brand clients).
- Site: clientId, brandId (nullable), domain (or domain plus path for regional sections), label, currency (GBP, EUR, USD, extendable), timezone (default Europe/London), active.
- ClientAccess: userId, scope (ALL, OWN, SELECTED), plus ClientAccessGrant (userId, clientId) for SELECTED. Default by role: ADMIN all; ACCOUNT_MANAGER own; SPECIALIST selected; VIEWER own.
- Annotation: clientId, siteId (nullable), date, text, createdById. Shown on charts.
- AuditLog: actorId (nullable for system), action (string), entityType, entityId, clientId (nullable), metadata (JSON, no secrets or personal data), ip, createdAt.

Seed (prisma/seed.ts)
- Users: Charlie (ADMIN), Sophie M and James T (ACCOUNT_MANAGER), Priya K (SPECIALIST), Tom R (VIEWER). Use example.com emails for non-agency test users.
- The 14 fictional clients from the prototype with their types, owners, brands, sites and currencies (Kestrel Outdoor: brands Kestrel Outdoor with kestreloutdoor.co.uk GBP, .ie EUR, .de EUR, and Fellrunner with fellrunner.co.uk GBP; Aster Skincare with GBP, EUR and USD stores; and the rest). Take the list from the prototype's client directory.
- A few annotations (for example Kestrel "Autumn sale starts" on 3 Oct).
- Seed must be idempotent.

Server helpers (src/server/clients.ts)
- listClientsForUser(user, {mine, type, search}), getClientForUser(user, clientId) which throws a typed NotFound or Forbidden, clientScopeOptions(client) returning brands and sites for the scope picker.

Deliverables
- Schema, migration, seed, client query helpers with tests.

Acceptance criteria
- pnpm db:migrate and pnpm db:seed run cleanly twice in a row.
- Unit tests cover access: an account manager sees only their own clients; a specialist sees only selected clients; an admin sees all.
- No query in the codebase reads clients without going through the access helpers.

Verification
- Inspect data in Prisma Studio. Run the tests.
```

## Prompt 7: Authentication and permissions

```text
PROMPT 7 OF 31: Authentication and permissions
Depends on: Prompt 6
Docs: docs/permissions.md

Goal
Secure the whole app with Auth.js and role-based, client-scoped permissions enforced on the server.

Tasks
1. Auth.js (current major version for the App Router) with the Prisma adapter and database sessions. Provider: Google. In the signIn callback allow only verified emails on ALLOWED_EMAIL_DOMAIN that match an active User row (invite-only: admins create users first). Reject others with a friendly sign-in error page.
2. Sign-in page styled as Pulse (lockup, "Sign in with Google", short note that access is invite-only). Sign-out in the sidebar footer menu.
3. Middleware protecting every route except /api/health*, the sign-in page and Auth.js routes.
4. src/server/permissions.ts: a single place for capability checks.
   Capabilities: viewAgency, viewClient(clientId), editClient(clientId), manageUsers, manageIntegrations, viewLeads(clientId), exportLeads(clientId), manageIssues(clientId), createReports(clientId), approveAiReports(clientId), useAi(clientId), useAgencyAi, manageAiSettings, manageMcp.
   Role defaults: ADMIN everything; ACCOUNT_MANAGER everything on accessible clients except manageUsers, manageAiSettings, manageMcp; SPECIALIST view and AI on accessible clients, no exports, no approvals; VIEWER view only.
   Expose requireUser(), requireCapability(cap, clientId?) for server components, server actions and route handlers. Throw typed errors mapped to 401, 403 and 404 responses.
5. Settings > Team page (/agency/settings, General tab, admins only): list users, invite user (name, email, role), change role, set client access (all, own, selected with client checklist), deactivate. Every change writes an AuditLog entry.
6. Replace the shell's mock user with the session user; sidebar footer shows name and role.
7. Add a generic error boundary and not-found page in the Pulse style; 403 shows "You don't have access to this client" with a link back.

Deliverables
- Auth.js config, sign-in page, middleware, permissions module with tests, Team settings page, audit logging for user changes.

Acceptance criteria
- Visiting any page signed out redirects to sign-in.
- A Google account outside the allowed domain, or not invited, cannot sign in.
- Requesting another user's client by URL as an account manager returns the 403 page; server actions refuse the same.
- Unit tests cover every capability for every role, including selected-client access.

Verification
- Playwright with a test-only credentials provider enabled only when NODE_ENV=test and E2E_AUTH=true, signing in as each seeded role and checking navigation and 403s. Make sure this provider can never be enabled in production.
```

## Prompt 8: Secure credential storage

```text
PROMPT 8 OF 31: Secure credential storage
Depends on: Prompt 7
Docs: docs/environment.md (key generation), docs/data-model.md (Connection)

Goal
Store integration credentials (OAuth refresh tokens, API tokens, store tokens) encrypted at rest with key rotation, and never expose them to the browser.

Tasks
1. src/server/crypto.ts: AES-256-GCM envelope helpers encrypt(plaintext, context) and decrypt(ciphertext, context). PULSE_ENCRYPTION_KEYS holds one or more base64 32-byte keys as "keyId:key" pairs; PULSE_ACTIVE_KEY_ID picks the key for new writes. Store keyId, iv and auth tag with each ciphertext. Use the context string (for example "connection:<id>") as additional authenticated data so ciphertexts cannot be swapped between rows.
2. Blind index helper hmacIndex(value) using a separate key, for exact-match lookup of encrypted fields (needed later for lead emails).
3. Prisma model Connection: provider (string, matches provider id), label, authType (OAUTH, API_KEY, TOKEN), accountIdentifier (for example the Google account email or the store domain; not secret), encryptedCredentials (bytes or base64 text), scopes, status (OK, NEEDS_REAUTH, FAILING, DISABLED), lastSuccessfulSyncAt, lastError (sanitised message, no tokens), createdById.
4. src/server/connections.ts: createConnection, getCredentials(connectionId) (server-only, decrypts), updateCredentials (for refreshed tokens), markNeedsReauth, disable. Every read of decrypted credentials is server-only; every create, update and delete writes AuditLog.
5. A key-rotation script (pnpm keys:rotate) that re-encrypts every stored credential with the active key.
6. Tests: round trip, wrong context fails, tampered ciphertext fails, rotation keeps data readable, decrypted values never appear in logs (assert the logger redaction list includes token fields).

Deliverables
- Crypto module, Connection model and service, rotation script, tests, README section on generating keys.

Acceptance criteria
- No API route or server component returns credential fields; a test serialises every Connection-returning helper and asserts no secret fields are present.
- Losing PULSE_ENCRYPTION_KEYS makes credentials unreadable (documented); rotating keys works without downtime.

Verification
- Run tests. Manually insert a connection through a script, inspect the database and confirm only ciphertext is stored.
```

### Phase 1 checkpoint

- Fresh clone: `docker compose up`, migrate, seed, sign in as the admin, invite a test user, set their client access, sign in as them and confirm they only see their clients.
- Security review of this phase: no secrets in the client bundle (search the `.next` output for env names and token fields), middleware covers every route, permissions tested for every role.
- All test suites pass. Tag `phase-1`.

---

# Phase 2: Clients and metrics

## Prompt 9: Client directory and client settings

```text
PROMPT 9 OF 31: Client directory and client settings
Depends on: Prompt 8
Docs: docs/data-model.md
Reference: #/agency/clients (table and cards views), #/c/kestrel/settings

Goal
Build client management: the directory, adding and editing clients, brands, sites, currencies, KPI profiles and owners.

Tasks
1. /agency/clients: DataTable view (default) and card view, toggled by a SegmentedControl and kept in the URL. Search across client names, brands and domains. Filters: Mine / Everyone, type. Columns: client (name, sites and brands count), owner initials, type, primary KPI with value and Delta, trend sparkline, connected services (tags; a broken one has a bad-coloured border), health, open issues, data freshness. Until data exists (Phase 3), metric, trend, health and freshness cells show a "No data yet" placeholder, not zeros.
2. Card view groups clients into "Needs attention" and "On track" (based on open issues, wired properly in Prompt 16; for now nothing is open).
3. Add client flow (admins and account managers): a stepped dialog: name and type; brands (optional) and sites with domain and currency; owner; KPI profile (choose and order up to four metrics from the metric registry in Prompt 10, with sensible defaults by type). Connecting data sources happens later in Integrations.
4. /clients/[clientId]/settings, matching the prototype: Brands and sites table (add, edit, deactivate; per-site reporting currency), KPI profile, alert settings (flat band ±1/2/5%, list of alert rules with toggles; rule logic arrives in Prompt 16), Team (owner), and a "Not connected" list of services the client could use, each linking to Integrations.
5. All writes are server actions with zod validation, permission checks (editClient) and AuditLog entries. Optimistic UI is optional; show toasts on success and inline errors on failure.

Deliverables
- Directory (table and cards), add client dialog, client settings page, server actions with tests.

Acceptance criteria
- Creating Kestrel-like structures (two brands, four sites, mixed currencies) works and appears in the scope picker.
- Viewers cannot see edit controls, and server actions reject them.
- Empty states: no clients match the search; a new client with no sources shows "No data yet" everywhere, never zeros.

Verification
- Playwright: create a client with two brands and three sites, edit a site's currency, change the owner, confirm the audit log entries.
```

## Prompt 10: Metric registry, comparison engine and currency

```text
PROMPT 10 OF 31: Metric registry, comparison engine and currency
Depends on: Prompt 9
Docs: docs/metrics.md
Reference: KPI cards and their "i" definitions on #/c/kestrel/overview; deltas throughout the prototype

Goal
Create the pure TypeScript metrics layer every screen and the AI use: metric definitions, tiers, derived metrics, period comparison, judgement and currency conversion. No UI beyond tests.

Tasks
1. src/lib/metrics/registry.ts: a typed registry. Each metric:
   key, label (with per-client override such as "Qualified leads"), description (shown in the "i" panel), kind (sum | rate | percent | position), unit (money | count | ratio | percent | position), betterWhen (up | down | neither), tier (actual | measured | platform | google | crawler | derived), icon (Lucide name), sources (provider ids that can supply it), and for derived metrics: inputs (metric keys) and a compute function.
   Initial metrics: storeRevenue, orders, aov (derived), refunds, sessions, engagedSessions, engagementRate (derived from engagedSessions and sessions), keyEvents, leads (GA4 key events marked as leads), ga4Revenue, conversionRate (derived: orders / sessions), adSpend, platformConversions, platformConversionValue, cpl (derived: adSpend / leads), mer (derived: storeRevenue / adSpend), gscClicks, gscImpressions, ctr (derived: clicks / impressions), avgPosition (impression-weighted), formLeads, formCpl (derived).
2. Derived metrics are always computed from their inputs for the selected scope and period, never averaged across days or sites. Rates are recomputed from summed numerators and denominators. Average position is impression-weighted.
3. A derived metric is only available when all its inputs are available and fresh enough; otherwise return { status: "unavailable", reason } (for example "Needs ad spend: no ad platform connected").
4. Never combine tiers: a function that sums values must reject inputs with different tiers, and platform conversions from different platforms must not be summed (return per-platform values instead).
5. src/lib/metrics/compare.ts: given current and comparison values return change: percent change for sum and rate metrics, points for percent metrics, from-to for position; judgement better | worse | neutral using betterWhen and the client's flat band (default ±2%, ±0.05 pts, ±0.2 positions). Return the display text ("▲ 8.2%", "▼ 0.12 pts", "13.1 → 14.2").
6. Comparison windows: previous period of equal length, or same period last year shifted 364 days. If the comparison period predates the source's data start, return comparison unavailable with a reason (used for "No comparison: lead forms were connected on 1 Apr 2026").
7. Currency: Prisma model FxRate (date, base GBP, currency, rate). A worker job (Prompt 12) fetches daily reference rates from a public source such as the European Central Bank feed. convert(amount, from, to, date) uses the rate for that date or the closest earlier date. View modes: single-currency scope shows native currency; mixed scope shows the client's reporting currency (converted, with the rate date) or local mode which returns per-currency totals and marks money-derived metrics like MER as unavailable.
8. Freshness helpers: given a source's status, lastSuccessfulSyncAt, dataThrough and expected lag, return ok | lagging (normal lag, for example Search Console's 2 to 3 days) | delayed | failing, plus a human message.
9. Thorough unit tests, including the prototype's worked examples: Kestrel conversion rate 2.86% down 0.12 pts; MER 6.42 vs 6.47 neutral; CPA down being better; position 13.1 to 14.2 being worse; mixed-currency revenue in local mode.

Deliverables
- Registry, compare, currency, freshness modules; FxRate model; tests.

Acceptance criteria
- 100% branch coverage on compare.ts and the tier-mixing guard.
- KpiCard (Prompt 3) can render from a MetricResult object without extra formatting logic.

Verification
- pnpm test. Review the registry together with the product owner for labels and definitions.
```

### Phase 2 checkpoint

- Product owner review of the client directory, settings and every metric definition in the registry (labels, descriptions, betterWhen, tiers).
- All tests pass. Tag `phase-2`.

---

# Phase 3: Integrations

## Prompt 11: Integration framework and fact storage

```text
PROMPT 11 OF 31: Integration framework and fact storage
Depends on: Prompt 10
Docs: docs/integrations/README.md, docs/data-model.md, docs/architecture.md

Goal
Create the modular provider architecture and the normalised storage that every data source writes into, so new providers can be added without restructuring the app.

Data model
- DataSource: connectionId, provider, externalId (for example GA4 property id, Search Console site URL, ad account id, store domain), displayName, clientId (nullable until mapped), status, dataStart (earliest date available), dataThrough (latest complete date stored), lastSuccessfulSyncAt, lastAttemptAt, lastError, settings (JSON, provider-specific, zod validated), enabled.
- DataSourceSite: dataSourceId, siteId. A source can cover several sites (one GA4 property for three domains) and a site can have several sources.
- MetricFactDaily: date, clientId, siteId (nullable), dataSourceId, provider, metricKey, dimensionType (none | channel | sourceMedium | landingPage | query | page | country | device | campaign | adGroup | ad | product | store | form, extendable), dimensionValue (empty string when none), value (Decimal), currency (nullable), tier, syncedAt. Unique on (dataSourceId, date, metricKey, dimensionType, dimensionValue, siteId). Index on (clientId, metricKey, date) and (dataSourceId, date).
- SyncRun: dataSourceId, kind (incremental | backfill | manual), from, to, status (queued | running | succeeded | partial | failed), rowsWritten, startedAt, finishedAt, error (sanitised), attempt.
- RawPayload (optional, for debugging): dataSourceId, syncRunId, storedAt, payload JSON, retained 14 days.

Provider interface (src/server/providers/types.ts)
- id, displayName, category (analytics | search | ads | ecommerce | uptime | leads | other), authType, scopes.
- expectedLagDays and maxBackfillDays.
- capabilities: metric keys and dimension types it can supply, and which registry tier each metric has.
- listAvailableSources(connection): accounts or properties the connection can see, for mapping.
- sync({ source, connection, from, to, signal }): returns normalised facts (zod-validated) plus dataThrough and warnings. Must be idempotent for any date window.
- refreshCredentials(connection) when OAuth tokens expire; classify errors as AUTH (needs reauth), RATE_LIMIT (retry later), TRANSIENT (retry), PERMANENT (stop and report).
- Optional: webhooks, lead retrieval, url inspection, defined as optional capability interfaces.

Registry and services
- src/server/providers/index.ts registers providers by id. Adding a provider means adding one folder and one registry line.
- src/server/facts.ts: upsertFacts in batches inside a transaction per day window; queryFacts({ clientId, siteIds, metricKeys, from, to, dimensionType, dimensionValue? }) returning totals and daily series per metric, per tier, per currency, with missing days reported as missing, not zero.
- src/server/metrics-service.ts: combines queryFacts with the registry (Prompt 10) to produce MetricResult objects for screens: value, comparison, change, judgement, tier, sources used, freshness and availability.
- A fake provider (provider id "demo") that generates deterministic facts for the seeded clients, used in development and tests, enabled only when DEMO_DATA=true.

Deliverables
- Prisma models and migration, provider types, registry, facts and metrics services, demo provider, tests.

Acceptance criteria
- Running the demo provider for Kestrel produces facts that make the metrics service return the prototype-like numbers (approximately), with tiers and freshness.
- A day with no facts is reported as missing, and derived metrics for that period say which input is missing.
- Unit tests cover idempotent upserts (running the same window twice changes nothing) and multi-site sources.

Verification
- Seed demo facts and inspect queryFacts and metrics-service results in a test or a script.
```

## Prompt 12: Worker, queues and background synchronisation

```text
PROMPT 12 OF 31: Worker, queues and background synchronisation
Depends on: Prompt 11
Docs: docs/integrations/README.md (schedule, error classes), docs/architecture.md (sync flow)

Goal
Run all provider syncs, backfills and scheduled work in the BullMQ worker with retries, rate limits, freshness tracking and failure reporting.

Tasks
1. src/server/jobs/queues.ts: queues sync (per data source), backfill, schedule, fx, maintenance; shared Redis connection from REDIS_URL. Job payloads validated with zod.
2. worker/index.ts: starts workers for each queue with sensible concurrency (sync 4, backfill 1), graceful shutdown on SIGTERM, heartbeat logging.
3. Scheduling with BullMQ job schedulers (repeatable jobs): incremental sync for every enabled source every few hours (configurable per provider: GA4 every 6 hours, Search Console daily); nightly re-sync of the last N days (provider expectedLagDays plus 2) to pick up late data; daily FX rates; nightly maintenance (purge RawPayload older than 14 days, old SyncRuns older than 90 days).
4. Backfill: when a source is first mapped to a client, enqueue backfill in chunks (for example 30 days per job) back to provider maxBackfillDays (16 months for GA4 and Search Console). Show progress (chunks done of total) for the UI.
5. Locking: never run two syncs for the same source at once (job id per source and window, or a Redis lock).
6. Error handling: map provider error classes to behaviour: AUTH marks the Connection NEEDS_REAUTH and pauses its sources; RATE_LIMIT retries with exponential backoff respecting Retry-After; TRANSIENT retries up to 5 times; PERMANENT fails the run. Write SyncRun rows for every attempt with sanitised errors.
7. Freshness: after each run update DataSource.lastSuccessfulSyncAt, dataThrough and status using the Prompt 10 freshness helper. When a Connection fails or a source is delayed beyond its threshold, emit an event the issues engine will consume (Prompt 16); for now record it in a SystemEvent table.
8. Manual actions available to server code: syncNow(sourceId), retryConnection(connectionId), cancelBackfill(sourceId).
9. Admin-only page /agency/settings/jobs (or a section in Integrations) showing queue depths, recent SyncRuns and failures. Bull Board is acceptable if mounted behind admin auth.

Deliverables
- Queues, worker process, schedulers, backfill, locking, error mapping, freshness updates, jobs admin view, tests.

Acceptance criteria
- With DEMO_DATA=true, a fresh environment backfills demo facts for all seeded clients without manual steps.
- Killing the worker mid-backfill and restarting resumes without duplicate facts.
- A simulated AUTH error marks the connection NEEDS_REAUTH within one run and stops further retries.

Verification
- Integration test using a real Redis from Docker Compose: enqueue, process, retry, fail, resume.
- Check logs contain no tokens or personal data.
```

## Prompt 13: Integrations UI and Google connection

```text
PROMPT 13 OF 31: Integrations UI and Google connection
Depends on: Prompt 12
Docs: docs/integrations/google-setup.md, docs/integrations/README.md
Reference: #/agency/integrations (service list, GA4 detail with failing login, properties and mapping, sync log); freshness popover in the top bar

Goal
Let admins connect agency-level accounts, map discovered properties to clients and sites, and see sync health without developer help.

Tasks
1. /agency/integrations: summary tiles (services in use, failing, delayed, unmapped sources), a service list on the left (status badge per service: Healthy, Delayed, Failing, Planned, Not used) and the selected service's detail on the right.
2. Service detail: connected logins (account identifier, status, last sync, sanitised error with a plain-English explanation, Reconnect or Settings), "Add connection", Properties and mapping table (source name, external id, mapped client, mapped sites, last sync, status; unmapped rows offer "Map to client" with a suggested client matched by domain, or "Ignore"), and a sync log of recent runs.
3. Google OAuth connection flow (separate from sign-in): request offline access with the scopes needed for GA4 (analytics.readonly) and Search Console (webmasters.readonly). Store the refresh token encrypted via Prompt 8. Use a signed state parameter and PKCE. On success, call listAvailableSources for both providers and show the discovered properties for mapping.
4. Mapping dialog: choose client, then which of the client's sites the source covers. Saving enqueues the backfill and shows progress.
5. Reconnect: re-run OAuth for an existing Connection, keeping its sources and mappings; on success resume paused sources and enqueue a catch-up sync.
6. Top bar freshness button and popover now use real data: in client scope list the client's sources with FreshnessDot, status text and last successful sync or "data to <date>, normal lag"; in agency scope summarise per provider.
7. Client settings "Not connected" list links into Integrations with the client preselected.
8. Planned providers (Merchant Center, cPanel/WHM, Clarity, monday.com, LinkedIn if not yet approved) appear with a Planned badge and an explanation, matching the prototype.

Deliverables
- Integrations pages, Google connection flow, mapping and reconnect, live freshness popover.

Acceptance criteria
- An admin can connect a real Google account, see its GA4 properties and Search Console sites, map one of each to a client and watch the backfill progress.
- Revoking the app's access in the Google account settings leads to NEEDS_REAUTH and a Reconnect prompt within one sync cycle.
- Non-admins can view statuses but cannot connect, map or reconnect.

Verification
- Manual run with a real test property. Playwright with mocked provider responses for the mapping flow.
```

## Prompt 14: GA4 provider

```text
PROMPT 14 OF 31: GA4 provider
Depends on: Prompt 13
Docs: docs/integrations/ga4.md
Reference: Analytics pages in the prototype (#/c/kestrel/analytics/traffic, acquisition, pages, conversions, audience)

Goal
Implement the GA4 provider using the Google Analytics Data API (runReport, batchRunReports where useful) and the Admin API for property discovery.

Tasks
1. listAvailableSources: account summaries via the Admin API (property id, display name, currency, time zone, data streams with their default URIs to help match sites).
2. sync: for each day window request
   - totals by date: sessions, engagedSessions, keyEvents (plus per-event counts for the events the client marks as leads), purchaseRevenue (or totalRevenue per client setting), transactions
   - by sessionDefaultChannelGroup, by sessionSourceMedium, by landingPagePlusQueryString (top N per day, configurable), by country, by deviceCategory
   Map each to MetricFactDaily with tier "measured" and the property currency.
3. Multi-site properties: when a property serves several mapped sites, add a hostName dimension and assign facts to the matching Site; unmatched hostnames go to siteId null with a warning listing them.
4. Lead events: client settings gain a "GA4 lead events" field (event names such as form_submit, generate_lead). Store leads facts from those events.
5. Incomplete data: today and yesterday may still be processing. Mark dataThrough as the last complete day; the UI shades incomplete days. Re-sync the last 3 days nightly.
6. Quotas: use returnPropertyQuota, back off when tokens run low, and spread jobs across properties.
7. Error mapping: 401/invalid_grant to AUTH; 429 and quota errors to RATE_LIMIT; 5xx to TRANSIENT; property not found or permission denied to PERMANENT with a clear message.
8. Tests with recorded fixtures (sanitised) covering pagination, multi-host splitting, lead events and each error class.

Deliverables
- GA4 provider module, fixtures, tests, client setting for lead events.

Acceptance criteria
- Sessions totals in Pulse match the GA4 interface for the same property and dates (allowing for GA4's own thresholding and sampling notes).
- Facts are idempotent across repeated syncs.
- Hostname splitting works for a property covering two domains.

Verification
- Run against a real property for the last 28 days and compare five numbers with the GA4 UI: sessions, engaged sessions, key events, revenue, top channel.
```

## Prompt 15: Search Console provider

```text
PROMPT 15 OF 31: Search Console provider
Depends on: Prompt 14
Docs: docs/integrations/search-console.md
Reference: #/c/kestrel/organic/performance, queries, pages, countries; #/c/kestrel/technical/indexing

Goal
Implement Search Console performance data and quota-aware URL inspection.

Tasks
1. listAvailableSources: sites the connection can access (domain and URL-prefix properties) with permission level.
2. Performance sync with searchanalytics.query: totals by date; by query, by page, by country, by device; searchAppearance totals where available. Paginate with startRow up to the API row limit. Store clicks and impressions as facts (tier "google"); store position as an impression-weighted sum (position x impressions) so averages can be recomputed correctly over any range.
3. Data state: Search Console data lags about 2 to 3 days. Set dataThrough to the latest final date and expectedLagDays to 3. Comparisons in the UI end both periods on the same last available day (the prototype banner explains this).
4. Brand terms: client setting for brand query patterns (comma-separated terms or regular expressions) used to split brand and non-brand queries at query time, not at storage time.
5. URL inspection (Technical SEO): a separate low-priority queue that inspects URLs within the API's daily per-property quota. Build the known URL list from sitemaps (Search Console sitemaps API and fetching sitemap XML), GA4 landing pages and Search Console pages. Priority: new sitemap URLs, URLs with traffic or impressions, recently changed, then rotation. Store per URL: coverage state, indexing state, last crawl, Google canonical, user canonical, inspected at. Tier "google".
6. Index status history: keep a daily snapshot of counts by coverage state so the UI can show "▲ 38 since 3 Oct".
7. Tests with fixtures for pagination, weighting, brand splitting and quota exhaustion.

Deliverables
- Search Console provider, URL inspection queue and storage, sitemap discovery, client brand-terms setting, tests.

Acceptance criteria
- Clicks and impressions match the Search Console interface for the same final dates.
- Average position over 28 days equals the impression-weighted average, not the mean of daily averages.
- The inspection queue never exceeds the per-property daily quota and resumes the next day.

Verification
- Compare five numbers with the Search Console interface for a real property.
```

### Phase 3 checkpoint

- With a real Google connection: connect, map, backfill, and compare GA4 and Search Console totals with the native interfaces for one client.
- Break the connection (revoke access) and confirm NEEDS_REAUTH, the freshness popover, and recovery after Reconnect.
- Load test: backfill 16 months for three properties and confirm queue stability and database size.
- All tests pass. Tag `phase-3`.

---

# Phase 4: Monitoring and dashboards

## Prompt 16: Issues and signals engine

```text
PROMPT 16 OF 31: Issues and signals engine
Depends on: Prompt 15
Docs: docs/data-model.md (issues), docs/metrics.md (judgement)
Reference: #/agency/issues, the issue drawer (click any issue), Needs attention on #/c/kestrel/overview, Significant changes on #/agency/overview

Goal
Detect problems (issues, which need someone to act) and notable changes (signals, which need no action), with lifecycle, ownership and notifications that avoid alert fatigue.

Data model
- Issue: clientId (nullable for agency-level issues such as a failing login), affectedClientIds (for agency-level issues), ruleKey, severity (CRITICAL, WARNING), category (tracking, data source, downtime, indexing, performance, other), section, title, whatHappened, nextSteps (JSON list), evidence (JSON: metric keys, values, dates), keyFact (short text for the meta line), status (OPEN, ACKNOWLEDGED, SNOOZED, RESOLVED), snoozedUntil, ownerId, detectedAt, resolvedAt, dedupeKey (unique while open).
- IssueEvent: issueId, actorId, type (created, acknowledged, snoozed, resolved, reopened, reassigned, comment), note, createdAt.
- Signal: clientId, metricKey, siteId, change, judgement, magnitude, periodStart, periodEnd, expiresAt (7 days).

Rules (src/server/issues/rules/, one file per rule, registered in an index)
- Data source failing (connection NEEDS_REAUTH or source failing): CRITICAL, agency-level, lists affected clients, auto-resolves on recovery.
- Data source delayed beyond threshold: WARNING.
- Key event stopped: a GA4 lead or purchase event drops to near zero for 2+ days while sessions to the relevant pages hold steady: WARNING, category tracking.
- Store vs GA4 revenue gap above 10% on one store while others are normal: WARNING, tracking.
- Primary KPI down by the client's threshold (default 20%): WARNING, performance.
- Not-indexed URLs up by 25 or more since the last snapshot: WARNING, indexing.
- Site down (uptime, Prompt 25): CRITICAL.
Each rule returns zero or more issue candidates with a dedupeKey so re-running never duplicates; issues auto-resolve when the rule no longer fires (except manual ones).
Rules respect per-client toggles and thresholds from client settings.

Signals
- After each sync, compute changes for the client's metrics over the default range; keep those beyond a magnitude threshold, with judgement from the metric registry. Tag signals that coincide with an open tracking issue as "possible tracking problem, check before reporting".

Notifications
- Critical issues notify the owner immediately (email via SMTP settings in env, and an in-app notification). Warnings and signals go into a daily 08:00 digest per user. Users can mute non-critical email.
- In-app notification centre in the top bar bell.

UI
- /agency/issues and /clients/[clientId]/issues: status SegmentedControl with counts (Open, Acknowledged, Snoozed, Resolved), severity filter, Mine / All for agency scope, list of AttentionRows.
- Issue drawer: severity, status, client links, section, detected time, owner select, what happened, evidence chart or values, next steps, activity timeline, actions (Acknowledge, Snooze 7 days, Mark resolved, Reopen, Reconnect for connection issues; "Create monday task" disabled with a Planned tooltip).
- All actions are server actions with permission checks (manageIssues) and IssueEvent and AuditLog entries.

Deliverables
- Models, rule framework and rules, signals, notifications and digest jobs, issues pages and drawer, tests.

Acceptance criteria
- Each rule has unit tests with fixture facts proving it fires, dedupes and auto-resolves.
- Revoking a Google connection creates one CRITICAL agency issue listing every affected client; reconnecting resolves it.
- No rule ever states a cause as fact; whatHappened describes observations and nextSteps suggest checks.

Verification
- Run the rules against demo data and confirm the Kestrel and Northfield examples from the prototype appear.
```

## Prompt 17: Agency overview

```text
PROMPT 17 OF 31: Agency overview
Depends on: Prompt 16
Docs: docs/metrics.md, docs/permissions.md
Reference: #/agency/overview

Goal
Build the agency overview with live data, defaulting to the signed-in user's clients.

Sections
1. Greeting and one-line summary ("4 things need attention, 1 critical"), My clients / All clients toggle (persisted per user).
2. Status tiles: clients and sites, needs attention (with critical count), sites down, integrations failing (and affected clients), stale data.
3. Primary KPI movement: a horizontal bar of clients better, flat (within each client's band) and worse on their own primary KPI. Never totals across clients.
4. Managed ad spend: total converted to GBP with change, split by platform. A note that revenue and ROAS are never added across clients.
5. Needs attention: top open issues by severity then age, with actions.
6. Significant changes: top signals with judgement pills and tier, linking to the client.
7. Movers table: client, type, primary KPI, current value, change, trend, issues, data freshness (with "Tracking suspected" when a tracking issue is open). Sort biggest falls or rises first. Row click opens the client.

Rules
- Everything respects the user's client access.
- Loading: skeletons at final sizes; a date range change shows skeletons, not empty states.
- Empty: a new installation with no data shows a clear "Connect your first data source" empty state linking to Integrations.

Deliverables
- Agency overview page and its server queries, with tests for the aggregation logic (especially that no revenue or ROAS totals exist).

Acceptance criteria
- Numbers match the client overview for each client and period.
- Switching to All clients as an account manager shows only clients they can access (All means all accessible).

Verification
- Compare with the prototype layout at 1440px in light and dark.
```

## Prompt 18: Client overview

```text
PROMPT 18 OF 31: Client overview
Depends on: Prompt 17
Docs: docs/metrics.md (derived metrics, freshness)
Reference: #/c/kestrel/overview (light and dark), #/c/peak/overview (GA4 failing), #/c/northfield/overview (tracking issue)

Goal
Build the most important screen: a client's overview that adapts to whichever sources are connected.

Sections, top to bottom
1. Scope banner when a brand or site is selected ("Showing kestreloutdoor.de only, in EUR" with Show all).
2. Page header: client name, type, owner, KPI profile; actions "Summarise with AI" (wired in Prompt 28) and "Generate report" (primary).
3. Needs attention: open issues for the client as AttentionRows (severity, title, category · section · age · key fact, one action). "All clear" row when none.
4. KPI cards for the KPI profile, with tier, comparison, sparkline (7-day rolling average), and the "i" definition panel showing description, inputs with tiers and each input's freshness. Stale inputs grey the value. Derived metrics with a missing input show the reason. Mixed-currency scope in local mode marks money-derived metrics unavailable with a prompt to switch to converted.
5. AI insights card placeholder (filled in Prompt 28).
6. Main chart: metric SegmentedControl (KPI profile metrics plus sessions), current vs comparison, incomplete days shaded, annotations as dotted lines listed below with "Add annotation". Hover tooltip with both periods.
7. Section cards (only for connected sections): Traffic and acquisition (sessions, engagement, channel bars), Organic search (clicks, impressions, CTR, position, lag note), Paid media (spend and per-platform rows; platform values never totalled), Ecommerce by store (per store, converted or local), Technical SEO (indexed of inspected, not indexed with change, Core Web Vitals summary), Uptime (uptime, median response, incidents).
8. Not-connected empty states only for high-value gaps (for example Merchant Center on ecommerce clients), with Connect and Hide actions.
9. What changed (signals) and Data sources table (source, mapped, last sync, status).

Rules
- Scope (brand or site) filters every fact query. Single-currency scope shows native currency.
- Each card handles loading, stale, failing and unavailable states individually; one failing source never blanks the page.

Deliverables
- Client overview page, annotation CRUD, chart component (Recharts) reusable elsewhere, tests for scope and currency handling.

Acceptance criteria
- With demo data, the Kestrel overview matches the prototype's figures within rounding and its layout in both themes.
- Peak Physio (GA4 failing) shows the failing source in Needs attention, greyed GA4 KPIs with the reason, and no fake zeros.
- Switching to kestreloutdoor.de shows EUR values and only that site's facts.

Verification
- Playwright: open Kestrel overview, open a KPI definition, change scope to one site, change dates, add an annotation and see it on the chart.
```

## Prompt 19: Analytics pages and URL drawer

```text
PROMPT 19 OF 31: Analytics pages and URL drawer
Depends on: Prompt 18
Docs: docs/integrations/ga4.md
Reference: #/c/kestrel/analytics/acquisition (expand Organic search), traffic, pages, conversions, audience, engagement; click any landing page to open the URL drawer

Goal
Build the GA4 reporting pages and the cross-source URL drawer.

Pages (/clients/[clientId]/analytics/[tab])
- Traffic: KPI cards (sessions, engagement rate, key events or orders, GA4 revenue) and a chart with metric switch.
- Acquisition: sessions by channel chart (top four channels), channels table with expandable source / medium child rows, totals, engagement, key events and rate, GA4 revenue (Measured) with a note comparing GA4 revenue to store revenue when a store is connected.
- Landing pages, Conversions, Audience (countries and devices bars), Engagement.
- Each table has "Analyse with AI" (wired in Prompt 28) and CSV export of the current table.

URL drawer (shared component, opened from any URL in the app)
- Header: site and path; actions Open page (new tab) and Re-inspect.
- Analytics (Measured): sessions with change, engagement.
- Search (Google-reported): clicks, average position, top queries with position change.
- Index status (Google-reported): coverage state, last crawl, canonical, inspected.
- Core Web Vitals (mobile field data, site-level fallback note).
- Links and redirects (Crawler-detected): Planned placeholder.

Deliverables
- Analytics routes and tables, URL drawer, CSV export utility (server-generated, permission-checked, logged).

Acceptance criteria
- Expand/collapse state and sort order persist in the URL.
- The URL drawer opens from Analytics, Organic and Technical SEO tables with the same component.

Verification
- Compare the acquisition table totals with the overview's sessions figure for the same period and scope.
```

## Prompt 20: Organic search and Technical SEO pages

```text
PROMPT 20 OF 31: Organic search and Technical SEO pages
Depends on: Prompt 19
Docs: docs/integrations/search-console.md, docs/integrations/crux.md
Reference: #/c/kestrel/organic/performance, queries, pages, countries; #/c/kestrel/technical/indexing, cwv, sitemaps, crawl

Goal
Build Search Console reporting and the indexing views.

Organic search (/clients/[clientId]/organic/[tab])
- Lag banner: both periods end on the last available Search Console day.
- Performance: four selectable metric cards (clicks, impressions, CTR, average position) driving one chart (position axis inverted with a note), biggest position losses and gains (non-brand, minimum impressions), top queries table with Brand / Non-brand / All filter, position as from-to, top page linking to the URL drawer, and the anonymised queries note.
- Queries, Pages, Countries and devices tabs.

Technical SEO (/clients/[clientId]/technical/[tab])
- Indexing: tier legend (Google-reported, Crawler-detected, Derived), tiles (known URLs, inspected in last 14 days, indexed, not indexed with change), derived pattern callouts (for example many new URLs from one sitemap date in the same state), reasons list that filters the URL table, inspection budget per property, URL table with Re-inspect.
- Core Web Vitals: per site LCP, INP, CLS (p75, mobile, 28 days) from the Chrome UX Report API or PageSpeed Insights API, with Needs work and Poor tags. Add a small provider "crux" that fetches this weekly.
- Sitemaps: submitted sitemaps, URLs, last read, status.
- Crawl issues: Planned empty state (our own crawler arrives later, tier Crawler-detected).

Deliverables
- Organic and Technical SEO routes, CrUX provider, tests for brand splitting and position weighting in the UI layer.

Acceptance criteria
- Position values everywhere are impression-weighted.
- Derived callouts are labelled Derived and phrased as patterns, not causes.

Verification
- Compare five numbers with the Search Console interface for one client.
```

### Phase 4 checkpoint

- Walk through every screen built so far against the prototype in light and dark, at 1440px, 1100px with the AI panel slot open, and 390px.
- Accessibility pass: keyboard-only navigation of overview, tables, drawers and pickers; axe checks in Playwright on the main routes with no serious violations.
- Data checks: for two real clients, compare 10 figures with GA4 and Search Console.
- Product owner sign-off on issue rules and thresholds.
- All tests pass. Tag `phase-4`. This is the first version worth using internally.

---

# Phase 5: More providers

## Prompt 21: Google Ads provider and Paid media pages

```text
PROMPT 21 OF 31: Google Ads provider and Paid media pages
Depends on: Prompt 20
Docs: docs/integrations/google-ads.md, docs/metrics.md
Reference: #/c/kestrel/paid (Cross-platform, Google Ads, Meta Ads tabs), #/c/bramley/paid

Goal
Add Google Ads data and build the Paid media section so further ad platforms only add a provider.

Provider (src/server/providers/google-ads)
- Uses the Google Ads API through the agency manager account: developer token and login-customer-id from env (GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_LOGIN_CUSTOMER_ID); OAuth via the existing Google connection with the adwords scope added (Reconnect prompts for the new scope).
- listAvailableSources: accessible customer accounts under the manager account.
- sync with GAQL: daily cost (convert micros), impressions, clicks, conversions, conversions_value by campaign and campaign type; account currency stored with each fact. Tier "platform" for conversions and value; spend is also "platform" but marked summable across platforms in the registry.
- Store the conversion action settings (attribution model and window) per account so the UI can label them.

Shared ads model
- Campaign metadata table (dataSourceId, externalId, name, type, status) so facts can reference campaigns by id and names can change.
- metrics-service support for per-platform breakdowns that are never summed for conversions or conversion value.

Paid media pages (/clients/[clientId]/paid with tabs per connected platform)
- Cross-platform: Delivery table (spend, change, impressions, clicks, CTR, CPC) with a total row (these are comparable); for ecommerce clients "What did ads earn? Three honest answers" (each platform's claimed value with its attribution window, GA4 paid channels revenue, store revenue) shown side by side and never added, plus MER; weekly spend stacked by platform.
- Platform tab: campaign table (spend, clicks, conversions, conversion value and ROAS, or CPA for lead generation), attribution label, currency note.
- "Analyse with AI" on both tables (wired in Prompt 28).

Deliverables
- Google Ads provider with fixtures and tests, campaign metadata, Paid media pages.

Acceptance criteria
- Spend and conversions match the Google Ads interface for the same dates and accounts.
- No view anywhere shows a total of conversions or conversion value across platforms.

Verification
- Compare spend, clicks and conversions for one account with the Google Ads interface.
```

## Prompt 22: Meta Ads and LinkedIn Ads providers

```text
PROMPT 22 OF 31: Meta Ads and LinkedIn Ads providers
Depends on: Prompt 21
Docs: docs/integrations/meta.md, docs/integrations/linkedin.md

Goal
Add Meta Ads and LinkedIn Ads performance data using the provider framework, with no changes to page structure.

Meta Ads provider
- Authentication: a system user token from the agency Business Manager stored as a TOKEN connection (preferred, does not expire with a person), or OAuth.
- listAvailableSources: ad accounts the system user can access.
- sync: Insights API at campaign level with time_increment=1: spend, impressions, clicks, frequency, actions and action_values for purchase and lead action types, using the account's configured attribution windows (store the window used, for example 7-day click and 1-day view, on each fact or the source settings).
- Campaign metadata including objective.

LinkedIn Ads provider
- OAuth with the LinkedIn Marketing API (requires approved access). Ad accounts as sources; daily analytics by campaign: spend, impressions, clicks, conversions, leads (one-click lead form opens and submissions where available).
- If access is not yet approved, register the provider as Planned so it appears in Integrations with an explanation.

Shared
- Registry entries for platform conversions per provider; labels in the UI read "Platform-reported" with the attribution window.
- Rate limit handling per provider (Meta usage headers, LinkedIn throttling).

Deliverables
- Two providers with fixtures and tests; Paid media tabs appear automatically for connected platforms.

Acceptance criteria
- Adding these providers required no change to Paid media page components beyond the platform list.
- Meta attribution windows show next to Meta figures.

Verification
- Compare spend and results for one Meta account and (if approved) one LinkedIn account with each platform's interface.
```

## Prompt 23: Lead forms and the Leads section

```text
PROMPT 23 OF 31: Lead forms and the Leads section
Depends on: Prompt 22
Docs: docs/integrations/meta.md (lead forms), docs/integrations/linkedin.md (Lead Gen Forms), docs/data-model.md (Leads)
Reference: #/c/bramley/leads (overview, list, forms, delivery), lead detail panel (click a lead), "View leads" links on #/c/bramley/paid

Goal
Collect leads from Meta Instant Forms and LinkedIn Lead Gen Forms, store them securely, and build the Leads section with consistent counts across Leads and Paid media.

Data model
- LeadForm: dataSourceId, externalId, name, platform, status, questions (JSON: key, label, type, options), createdAtPlatform.
- Lead: clientId, dataSourceId, formId, platformLeadId (unique per source), submittedAt, campaignId, adSetOrGroup, adName (nullable), isOrganic, isTest, isRepeat (same email hash within 30 days), and personal data encrypted with Prompt 8: name, email, phone, answers (JSON). emailHash (blind index) for repeat detection and exact search.
- LeadExport: userId, clientId, filters, rowCount, createdAt (audit).
- Placeholder for later: LeadDelivery (leadId, channel, status, attemptedAt) and DeliveryTarget (clientId, channel, settings). Create the tables but no logic.

Retrieval
- Meta: leads_retrieval permission; poll each form's leads on a schedule (every 15 minutes) and, optionally, subscribe to the leadgen webhook (verify signatures with the app secret) to fetch new leads immediately.
- LinkedIn: Lead Sync API (requires approval); poll on a schedule.
- Detect Meta test leads (from the Lead Ads Testing Tool) and mark isTest.
- Counting rule used everywhere: leads = submissions in the period, excluding isTest and isRepeat. formLeads facts are written from Lead rows by a job so Paid media, Leads and the AI all read the same numbers.

Leads section (/clients/[clientId]/leads/[tab]); appears only when a lead source is connected
- Overview: Total leads, Cost per lead (lead form campaign spend divided by paid leads, Derived), spend on lead form campaigns, average per day; comparison or "No comparison: lead forms were connected on <date>"; daily chart (total or by platform); by platform, by form, by campaign tables with "View leads".
- All leads: search by name, email or phone (exact email via blind index; name and phone search over decrypted rows for the current page scope is acceptable for the data volumes expected, or add a separate searchable token index); filters for date, source, campaign, form; show test leads toggle; sort; pagination 25 per page; counts strip ("144 submissions · 138 counted as leads"); empty and no-results states; export.
- Lead detail drawer: contact with copy and mailto/tel links, all form answers with "Pre-filled from profile" notes, attribution (platform, campaign, ad set or campaign group, ad, form) or "Attribution not available" for organic, source (platform lead id, synced time, counted or why not), delivery status "Not forwarded" linking to the Delivery tab, previous and next.
- Forms: each form with status, leads this period, latest lead, questions (expandable), campaigns using it.
- Delivery: Planned page with Email, CRM and Webhook cards (disabled) and an empty delivery history, so delivery can be added later without changing navigation.
- Paid media: "Lead form results" card on Cross-platform, "Form leads" column and "View N leads" buttons on lead campaigns, Actual tier label.

Security and privacy
- viewLeads and exportLeads capabilities. Specialists and viewers cannot export.
- CSV export generated server-side, streamed, logged in LeadExport and AuditLog, with a personal-data warning in the export dialog. Optional inclusion of test and repeat leads.
- Retention setting (default 24 months) with a nightly purge job.
- Never send lead personal data to the AI service or MCP unless a future explicit setting allows it.

Deliverables
- Models, retrieval jobs and webhook, counting job, Leads pages and drawer, export, tests.

Acceptance criteria
- Leads totals on the Leads overview, the Paid media lead card, campaign rows and the lead list ("counted as leads") are identical for the same period.
- Personal data is encrypted at rest (verify in the database) and absent from logs.
- Webhook requests with invalid signatures are rejected.

Verification
- Use Meta's Lead Ads Testing Tool to submit a test lead: it appears within minutes, marked as a test lead and excluded from counts.
```

## Prompt 24: Shopify provider and Ecommerce section

```text
PROMPT 24 OF 31: Shopify provider and Ecommerce section
Depends on: Prompt 23
Docs: docs/integrations/shopify.md, docs/integrations/woocommerce.md and docs/integrations/magento.md (for the shared contract)
Reference: #/c/kestrel/ecommerce/sales, products, stores; store table on the Kestrel overview

Goal
Add store data (Actual tier) and build the Ecommerce section, starting with Shopify and leaving clean seams for WooCommerce and Magento.

Shopify provider
- One Connection per store (Admin API access token from a custom app, stored encrypted), with the store domain as the source and mapping to a Site.
- sync: orders (paid, with created and processed dates, currency, totals, discounts, refunds), line items aggregated to daily product facts (units, revenue), refunds by day. Use the GraphQL Admin API with bulk operations for backfills and incremental queries by updated_at for recent days. Respect the API cost-based rate limit.
- Facts: storeRevenue, orders, refunds by day, and by product. Tier "actual". Store currency per fact.

Seams for other platforms
- Shared ecommerce fact contract so WooCommerce (REST API keys) and Magento (integration token) providers can be added later as separate prompts using the same pages.

Ecommerce pages (/clients/[clientId]/ecommerce/[tab])
- Sales: store switcher (All stores converted to the reporting currency, or each store in its own currency), KPI cards (revenue, orders, AOV, refunds and refund rate), weekly revenue by store, top products, tracking check (store vs GA4 revenue per store with gap and a warning tag over 10%).
- Products and Stores tabs.
- Client overview's Ecommerce by store card and the issues rule for store vs GA4 gap now use real data.

Deliverables
- Shopify provider with fixtures and tests, Ecommerce pages, FX conversion applied with the rate date shown.

Acceptance criteria
- Revenue and orders match Shopify's own reports for the same dates and time zone.
- Mixed-currency clients never show a summed total in local mode.

Verification
- Compare a week of orders and revenue for one store with the Shopify admin.
```

## Prompt 25: Uptime monitoring

```text
PROMPT 25 OF 31: Uptime monitoring
Depends on: Prompt 24
Docs: docs/integrations/uptime.md, docs/integrations/cloudflare.md
Reference: #/c/tidewater/uptime and #/c/kestrel/uptime

Goal
Monitor every active site from the worker and feed uptime into issues, overview cards and reports.

Tasks
1. UptimeCheck job every minute per active site (batched): HTTPS GET with a timeout, record status code, response time, TLS certificate expiry (checked daily). Store raw checks for 7 days and daily rollups (uptime %, median and p95 response) long term.
2. Down detection: three consecutive failures open a CRITICAL "site not responding" issue (dedupe per site); three consecutive successes resolve it. Record incidents with start, end and cause text.
3. Optional Cloudflare provider (API token, read-only): zone analytics per site (requests, cached share, threats blocked). Planned if not configured.
4. Uptime page: per-site cards (status, 30-day strip, uptime, response median and p95, SSL expiry warning under 21 days), response time chart, incidents list, Cloudflare card, server resources Planned note.
5. Optionally run checks from a second location later; note the limitation of a single VPS location in the UI copy ("Checked every minute from our server").

Deliverables
- Uptime jobs, incidents, issue integration, Uptime page, optional Cloudflare provider.

Acceptance criteria
- Pointing a test site at a closed port opens a CRITICAL issue within about three minutes and resolves it after recovery.

Verification
- Simulate downtime with a local test server.
```

### Phase 5 checkpoint

- Consistency audit: for one ecommerce client and one lead generation client, check that every figure appears identically on the overview, the section page, the issues evidence and any AI context (when built).
- Provider isolation: disable each provider in turn and confirm the rest of the app works, sections hide, and no screen shows zeros for missing data.
- All tests pass. Tag `phase-5`.

---

# Phase 6: Reporting

## Prompt 26: Report builder and PDF

```text
PROMPT 26 OF 31: Report builder and PDF
Depends on: Prompt 25
Docs: docs/data-model.md (reports)
Reference: #/agency/reports and #/c/kestrel/reports

Goal
Let staff build, preview and export client reports from the same components as the app, with saved configurations and history.

Tasks
1. Models: ReportConfig (clientId, name, template type by client type, period type, comparison, sections, includeYoY), Report (configId, clientId, periodStart, periodEnd, status DRAFT | READY | SENT, commentary JSON per section, createdById, approvedById, approvedAt, aiAssisted flag, pdf storage path), ReportEvent.
2. Builder: client (preselected in client scope), period (last calendar month by default, quarter, custom) with comparison and optional year-on-year column; sections limited to connected sources; commentary editor per section; suggested talking points from signals; banner when open tracking issues affect the period.
3. Preview: A4 page thumbnails; a dedicated print route (/print/reports/[id]) rendering report pages with the same KPI cards, charts (non-interactive) and tier tags, light theme only, cover page with the Pulse by Disruptive lockup and client name.
4. PDF: render the print route to PDF in the worker using Playwright Chromium (add it to the worker image), store the file on a mounted volume, download through a permission-checked route. Generation runs as a job with progress.
5. History: recent reports with status, author, period, and Download or Continue.
6. Saved configurations and duplicate last month's report.
7. Scheduling (monthly auto-draft) is Planned: leave the model ready, UI disabled.

Deliverables
- Models, builder, print route, PDF job, history, tests for period calculation and section availability.

Acceptance criteria
- A generated PDF matches the on-screen figures for the same period and shows tier labels under each chart.
- PDFs are only downloadable by users with access to the client.

Verification
- Generate a monthly report for one real client and review it with an account manager.
```

### Phase 6 checkpoint

- Account managers produce one real report each and list anything missing.
- All tests pass. Tag `phase-6`.

---

# Phase 7: AI

## Prompt 27: AI service layer

```text
PROMPT 27 OF 31: AI service layer
Depends on: Prompt 26
Docs: docs/ai.md
Reference: the "Ask AI" panel answers in the prototype (structure, labels, sources, method), Settings > AI & MCP > In-app assistant

Goal
Build the server-only AI service that answers questions and analyses views from Pulse's own data through the OpenAI API, with structured output, evidence checks, permissions, budget limits and audit.

Rules (non-negotiable)
- The OpenAI API key lives only in server env (OPENAI_API_KEY). The browser talks only to Pulse routes.
- The model never fetches data itself and never invents figures. Pulse builds a context pack from the metrics service and sends only that.
- Every answer separates confirmed findings (backed by figures in the context), hypotheses and recommendations. It must not claim causation from correlation; hypotheses say what would test them.
- Lead personal data and credentials are never included in prompts.

Tasks
1. src/server/ai/context.ts: buildContext({ user, mode: client | agency, clientId?, page, tab, range, compare, scope, filters, target? }) returns a compact JSON pack: metric results (value, comparison, change, judgement, tier, sources, freshness, availability reasons), relevant breakdowns for the page or target (channels, queries, campaigns, stores, forms), open issues, annotations, recent signals, and approved Client knowledge entries (Prompt 29, add later). Each item gets a stable reference id (for example "m:storeRevenue", "t:channels"). Respect permissions: agency mode includes only accessible clients.
2. src/server/ai/schema.ts: zod schema for AIResponse: status (ok | insufficient | no_data | restricted), title, blocks (text, findings with kind and refs, table, chart series, callout), sources (ref ids with label, tier, range, freshness), method (list), followUps (list). Use OpenAI structured outputs with the JSON schema generated from zod.
3. src/server/ai/client.ts: OpenAI SDK client, model names from settings (AI_MODEL_ANALYSIS, AI_MODEL_FAST, editable in AI settings, never hard-coded in components), low temperature, timeouts, retries for transient errors.
4. Evidence check: after the model replies, verify every number in confirmed findings and tables appears in the context pack (allowing formatting differences and rounding). Drop or downgrade unverifiable findings to hypotheses and add a note. Reject responses that cite unknown refs.
5. Guardrails: if a required source is failing or a tracking issue covers the period, the context includes it and the system prompt requires the answer to lead with that data caveat. Questions about other clients in client mode return status restricted. Forecast requests return insufficient unless a forecast feature exists.
6. Budget and usage: AiUsage table (user, feature, clientId, model, tokens in and out, cost estimate, createdAt). Monthly budget, alert threshold and behaviour at the limit (switch to the fast model, or pause) from AI settings. Pause returns status budget with a friendly message.
7. Audit: AiInteraction table storing the question, mode, page, refs used and the response JSON (not the full context), retained per the retention setting.
8. Route handlers: POST /api/ai/ask, POST /api/ai/analyse (target such as "channels", "chart:storeRevenue", "insight:<id>", "leads"), both streaming status updates (server-sent events: stages such as reading context, checking freshness, comparing periods) then the final validated response.
9. Settings > AI & MCP > In-app assistant (admins): connection status (key configured or not, never the key), model choices by quality tier, answer length, budget, alert threshold, on-limit behaviour, usage by feature and person, permissions by role (use AI client mode, agency mode, draft reports, approve AI reports, AI settings), data sources the AI may read, retention, audit log. A "Simulate" panel is not needed in production.
10. Tests: context building (permissions, no personal data), schema validation, evidence check with crafted fake model outputs, budget logic. Mock the OpenAI client in tests.

Deliverables
- AI context, schema, client, evidence checker, usage and audit, routes, settings page, tests.

Acceptance criteria
- A model response containing a figure not present in the context never reaches the user as a confirmed finding.
- Agency-mode context for an account manager contains only their accessible clients.
- With the budget set to £0 and "pause" selected, AI routes return the budget status without calling OpenAI.

Verification
- Ask five real questions for one client and review answers with an account manager for accuracy and labelling.
```

## Prompt 28: AI panel, insights and report drafting

```text
PROMPT 28 OF 31: AI panel, insights and report drafting
Depends on: Prompt 27
Docs: docs/ai.md
Reference: Ask AI panel, "Analyse with AI" buttons, #/c/kestrel/insights, AI insights card on #/c/kestrel/overview, AI drafting on #/c/kestrel/reports

Goal
Build the AI experiences on top of the AI service.

AI panel (fills the Prompt 4 slot)
- Header: AI analyst, new conversation, collapse. Mode SegmentedControl: This client / Agency-wide (agency scope shows agency-wide only, with a hint).
- Context chips: client or agency scope, page, date range and comparison, active filters. Updates as the user navigates.
- Empty state: what the analyst can do, suggested questions and actions specific to the current page (for example Ecommerce: "Which store is growing fastest?"; Leads: "Which form brings the cheapest leads?").
- Thread: user messages; streaming progress steps with a Stop button; responses rendering blocks (text, findings by kind with numbered source refs, tables, mini charts, callouts), Sources and "How this was worked out" disclosures, status badges (Insufficient evidence, No data, Outside scope), errors with retry, budget-reached state, follow-up chips, actions: Save to Client knowledge (Prompt 29), Add to report, Copy, helpful / not helpful feedback.
- Composer: textarea, Enter to send, Shift+Enter for a new line.
- Docked at 1200px and wider, overlay below; persists across navigation.

Analyse with AI
- Buttons on the overview chart, KPI summary ("Summarise with AI"), channels, top queries, paid tables, store tracking check, products, indexing URLs, uptime incidents, lead campaigns and the agency movers table. Each sends a target to /api/ai/analyse and opens the panel.

AI insights
- Nightly job per client generating insights from rules plus the AI service: types change, anomaly, risk, opportunity, data gap; each with evidence (values with tiers), confirmed text, optional hypothesis, recommendation, confidence, sources and a link to the relevant section. Store with the period they cover.
- /clients/[clientId]/insights: filter by type, dismiss and restore, show dismissed, cards with Ask about this, Save to Client knowledge, Add to report, open section.
- Overview AI insights card: top three, expandable in place, excluding insights that duplicate an open issue.

Report drafting
- In the report builder: "Draft with AI" with tone (plain English for the client, detailed for marketing leads). Generates a summary and per-section commentary from the report period's context, with source refs and flags (contains a hypothesis; affected by an open tracking issue).
- Per section: editable text, Shorter, Regenerate, Approve section. Editing an approved section returns it to review.
- "Approve for client" requires every section approved and a reviewer confirmation checkbox. Until then PDF generation is disabled with an explanation. Approved reports record approver and time, and the PDF notes "AI-assisted commentary, reviewed by <name>".
- Only users with approveAiReports can approve.

Deliverables
- Panel, analyse actions, insights job and page, overview card, drafting workflow, tests (approval gating, insight dedupe with issues).

Acceptance criteria
- PDF export is impossible for a report with unapproved AI commentary (enforced on the server, not just the UI).
- Suggested questions differ by page and client type.
- Panel answers always show the context chips they were generated from.

Verification
- Playwright: ask a question, stop a request, retry after a simulated error, save an answer to Client knowledge, draft and approve a report, generate the PDF.
```

## Prompt 29: Client knowledge

```text
PROMPT 29 OF 31: Client knowledge
Depends on: Prompt 28
Docs: docs/ai.md, docs/data-model.md (knowledge)
Reference: #/c/kestrel/knowledge (approval queue, latest decisions, filters, entry drawer), "Save to Client knowledge" in AI answers and insights

Goal
Give each client a shared, searchable record of notes, findings and decisions, including approved summaries from AI tools, and let the AI reference it.

Data model
- KnowledgeEntry: clientId, category (DECISION, FINDING, NOTE, MEETING, AI_SUMMARY), title, body (plain text with optional "Confirmed:", "Hypothesis:", "Recommendation:" line labels), tags, source (MANUAL, AI_ANALYST, CHATGPT, CLAUDE, CURSOR, OTHER_MCP), createdById, status (PENDING, APPROVED, REJECTED), approvedById, approvedAt, links (JSON: issue ids, routes), searchVector (PostgreSQL tsvector, updated by trigger or Prisma middleware), retention.
- KnowledgeEntryRevision for edits (keep the original).

Features
- Page /clients/[clientId]/knowledge: header with Ask AI about this and Add note; Awaiting approval queue (entries from AI tools need the client owner's or an admin's approval, per the knowledge-sharing setting); latest decisions strip; search (PostgreSQL full-text); filters for source, contributor, category and date; cards; empty state for clients with nothing yet.
- Entry drawer: category, source, author, approval, tags, body with labelled findings, related reporting data links, related entries, Approve or Reject, Ask AI about this, Edit (creates a revision).
- Add note dialog with validation; entries from the AI panel or insights open the dialog prefilled and go to the approval queue.
- AI integration: the context builder adds up to a few approved entries matching the question or target (full-text search), with ref ids and the tier "Team knowledge". Answers show them in a separate "From Client knowledge" block and the sources list, never as confirmed reporting data.
- Personal data stripping before saving AI-originated text (names, emails and phone numbers of the client's customers).

Deliverables
- Models, search, pages, drawer, approval workflow, AI context integration, tests.

Acceptance criteria
- Pending entries are invisible to everyone except the author and approvers.
- Knowledge never crosses clients.
- An AI answer citing knowledge labels it as team knowledge and links to the entry.

Verification
- Add, search, approve and reject entries; ask "What have we decided for this client?" and check the cited entries.
```

### Phase 7 checkpoint

- AI evaluation set: 20 questions across three clients with expected facts. Run them, review accuracy, labelling (confirmed, hypothesis, recommendation), data caveats and refusals. Record results in docs/ai-eval.md and repeat after prompt changes.
- Cost check: average cost per request and projected monthly spend against the budget.
- Security: confirm no lead personal data, credentials or other clients' data appear in stored AI interactions.
- All tests pass. Tag `phase-7`.

---

# Phase 8: MCP

## Prompt 30: MCP server and AI & MCP settings

```text
PROMPT 30 OF 31: MCP server and AI & MCP settings
Depends on: Prompt 29
Docs: docs/mcp.md, docs/permissions.md
Reference: Settings > AI & MCP: Connected apps, Team access, Capabilities, Activity, Knowledge sharing (#/agency/settings/ai/connections and the other sections)

Goal
Expose Pulse data to staff's own AI apps (Cursor, Claude, ChatGPT and other MCP clients) through an authenticated MCP server that enforces each person's permissions, and build the settings to manage it.

Server
- Use the official MCP TypeScript SDK with the Streamable HTTP transport, served by a route in the web app (for example /mcp) or a small separate service in the same image.
- Authorisation: follow the current MCP authorisation specification (OAuth 2.1 with protected resource metadata). Pulse acts as the authorisation server for its own users: the person signs in with their Pulse (Google) account and approves the access shown. Issue short-lived access tokens and refresh tokens bound to the user and the app; store tokens hashed. Check the specification version at implementation time.
- Every tool call runs as the signed-in user: client access, capabilities and the per-person MCP information categories (reporting data, issues, client knowledge, revenue and spend, save notes) all apply. Denied calls return a clear message and are logged.

Tools (initial set; each with zod input schemas and concise descriptions)
- list_clients, get_client_summary (KPIs, open issues, freshness for a period), get_metrics (metric keys, period, scope, optional dimension), list_issues, list_insights, search_knowledge, list_decisions, add_knowledge_note (goes to the approval queue), save_conversation_summary (labels required; goes to the approval queue).
- Planned and disabled by default: draft_report_commentary, create_issue.
- Responses include tiers, freshness and the reference ranges, so external assistants keep the same honesty rules. Never return lead personal data or credentials.

Settings (/agency/settings/ai/[section], admins)
- Connected apps: server URL with copy, sign-in note, summary tiles, cards per app (Claude, Cursor, ChatGPT, Other MCP app) showing status (connected, needs attention, disconnected, not connected), people, last activity, requests in 7 days, Manage (drawer with people, re-send sign-in, revoke) and Disconnect (confirmation; revokes all tokens for that app). Connect opens illustrative setup steps (menus vary by app version) and a waiting-for-sign-in state that completes when the first token is issued.
- Team access: per person apps, client access, information categories; Edit access dialog; Revoke.
- Capabilities: tool on/off switches with Read or Write labels; Planned tools disabled.
- Activity: filterable log of tool calls (person, app, action, client, result: allowed, denied, sent for approval).
- Knowledge sharing: who approves AI-created entries, allow apps to read or write knowledge, retention, weekly digest; locked rules (personal data removed, labels kept, no cross-client sharing).

Deliverables
- MCP server, authorisation flow, tools, token storage, activity log, settings sections, tests (permission enforcement per tool, token expiry and revocation).

Acceptance criteria
- Connecting Claude Desktop or Cursor to the server works end to end for a test user and shows only that user's clients.
- Revoking a person or disconnecting an app stops tool calls immediately.
- A specialist without "revenue and spend" access receives no money values from get_metrics.

Verification
- Connect at least two different MCP clients, run each tool, check the Activity log, then revoke and confirm access ends.
```

### Phase 8 checkpoint

- Permission matrix test across roles and MCP information categories.
- External assistant smoke test with two team members.
- All tests pass. Tag `phase-8`.

---

# Phase 9: Production

## Prompt 31: Production deployment, backups and hardening

```text
PROMPT 31 OF 31: Production deployment, backups and hardening
Depends on: Prompt 30
Docs: docs/environment.md, docs/architecture.md

Goal
Deploy Pulse to the agency VPS with Docker Compose safely, with backups, monitoring and a security review.

Tasks
1. Production compose file: web and worker from a tagged image, postgres and redis on an internal network only, restart policies, resource limits, named volumes for database, Redis and report PDFs. Web listens on an internal port for the VPS's existing reverse proxy (HTTPS, HSTS, sensible timeouts, request size limits).
2. Release process: build and tag the image (CI optional), run prisma migrate deploy as a one-off job before starting the new web and worker, health check, roll back by re-tagging. Document it in docs/deploy.md.
3. Backups: nightly pg_dump (compressed, encrypted) to off-server storage with 30-day retention; weekly restore test into a scratch database; back up the encryption keys separately and securely (losing them makes credentials and lead data unreadable).
4. Monitoring: uptime check on /api/health/ready; error tracking (Sentry or an equivalent self-hosted option) for web and worker with personal-data scrubbing; alerts on failed jobs spikes, queue backlog and disk usage.
5. Security headers: Content-Security-Policy (no inline scripts beyond what Next.js needs, connect-src limited to the app), frame-ancestors none, Referrer-Policy, Permissions-Policy. Rate limiting on auth, AI, export and MCP routes. CSRF protection on server actions (built in) and route handlers.
6. Security review checklist in docs/security.md: secrets only in env, encryption keys rotated, no tokens or personal data in logs, every route and action permission-checked (add an automated test that enumerates route handlers and server actions and asserts each calls requireCapability or requireUser), dependency audit, least-privilege API scopes, data retention jobs running.
7. Performance: database indexes reviewed with EXPLAIN on the heaviest queries (overview, movers, lead list), consider monthly partitioning of MetricFactDaily if it passes a size threshold, caching of metric results per client, range and scope with invalidation after syncs.
8. Final README covering local development, environment variables, adding a new provider (step by step, using the provider interface), and operations.

Deliverables
- Production compose, deploy and restore documentation, backup jobs, monitoring, security headers, rate limits, route-guard test, performance indexes.

Acceptance criteria
- A fresh VPS deploy following docs/deploy.md succeeds.
- A backup restores into a scratch database and the app runs against it.
- The route-guard test fails if any new route lacks a permission check.

Verification
- Run the full test suite, an axe accessibility pass, and a manual walkthrough of every section with real data before inviting the team.
```

### Phase 9 checkpoint

- Go-live review with the team: walkthrough, known limitations, support route for bugs.
- Tag `v1.0.0`.

---

# Appendix A: Testing approach (applies to every prompt)

- **Unit tests (Vitest):** metrics, comparisons, currency, permissions, crypto, provider mappers, issue rules, AI evidence checks.
- **Integration tests:** providers against recorded, sanitised fixtures (never live APIs in CI); jobs against a real Redis and PostgreSQL from Docker Compose.
- **End-to-end tests (Playwright):** sign-in per role, navigation and URL state, client overview, issues workflow, leads export permissions, report approval gating, AI panel flows with a mocked AI service.
- **Accessibility:** axe checks on main routes; keyboard-only walkthroughs at each phase checkpoint.
- **Visual check:** compare each new screen with the prototype in light and dark at 1440px, 1100px and 390px.
- **Data accuracy:** at every provider prompt, compare five figures with the native platform for the same dates and time zone, and record the comparison in docs/data-checks.md.

# Appendix B: Adding a new data provider later

1. Create `src/server/providers/<id>/` implementing the provider interface (sources, sync, error mapping, capabilities, expected lag).
2. Register it in `src/server/providers/index.ts`.
3. Add any new metric keys to the metric registry with tier, betterWhen and description.
4. Add fixtures and tests.
5. If it needs a new screen, add a section and a sidebar entry that only appears when the source is connected.

No changes should be needed to the shell, the facts storage, the jobs framework or existing pages.

# Appendix C: Decisions still open

- The website's real body font (Plus Jakarta Sans is a stand-in) and the logo as SVG.
- SMTP provider for notification and digest emails.
- Off-server backup destination.
- Whether WooCommerce, Magento, Merchant Center, Clarity and monday.com are next after Phase 5, and in what order.
- Lead delivery to clients (email, CRM, webhook): designed for, not built.
