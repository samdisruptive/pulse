# Pulse

Pulse is Digitally Disruptive's internal client intelligence, reporting and
operations platform. It is not a public SaaS product.

This repository contains the M1 visual foundation on top of the M0
application scaffold. Product behaviour is specified in
[`docs/handoff.md`](docs/handoff.md), with the interactive prototype and
design tokens under [`docs/reference`](docs/reference).

## Requirements

- Node.js 24 or later
- pnpm 12.16.1, managed through Corepack
- TypeScript 6.0.3 and ESLint 9.39.5, pinned for Next.js tooling compatibility

```powershell
corepack pnpm install
```

If Corepack shims are already enabled, `pnpm install` is equivalent.

Remote: [github.com/samdisruptive/pulse](https://github.com/samdisruptive/pulse)

## Local development

Copy `.env.example` to `.env.local` only when local configuration is needed.
Never commit local environment files.

```powershell
pnpm dev
```

Open `http://localhost:3000`.

## Quality checks

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm format:check
```

The end-to-end suite starts the development server automatically. Install its
browser once with `pnpm exec playwright install chromium`.

## Project boundaries

- `src/app`: App Router routes
- `src/components/ui`: shadcn/ui primitives
- `src/components/pulse`: Pulse design-system components
- `src/components/shell`: application shell
- `src/features`: feature modules
- `src/lib`: shared client-safe utilities and metrics definitions
- `src/server`: server-only services, permissions and provider code
- `worker`: the separate background worker entry point
- `prisma`: schema, migrations and seed
- `tests/e2e`: Playwright tests

Modules under `src/server` import `server-only`. Provider credentials and
secrets must never cross the server boundary.

## Demo mode

Demo fixtures live only in `src/demo` and are labelled in the interface. They
never share a production database. Local development shows them unless
`DEMO_DATA=false`. Production rejects `DEMO_DATA=true` and renders no catalogue.

## Milestones

M1 is the approved visual foundation: design tokens, the application shell,
reusable dashboard components, and demo overview screens. Local development
keeps showing those fixtures until a later milestone reads the database.
An early staging deployment is planned after authentication and the application
foundation are complete.

Work stops for review after every approved milestone.

## Outstanding visual work

These screens and controls shipped with M1 and are still unfinished:

- Reports, integrations, agency settings and AI settings are headings with explanatory copy.
- Client sections share one demo chart. Their tabs are labels, not links. A section the client has not connected shows that gap instead of zeroes.
- Significant changes on the agency overview explains that demo signals are not stored as issues.
- Export and notifications have no behaviour. Closing an issue drawer leaves an empty `issue` parameter in the URL.
- Ask AI opens a placeholder panel on wide screens. Summarise with AI and Generate report do not call a model.
- The logo is a stand-in until the final mark is supplied.
