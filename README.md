# Pulse

Pulse is Digitally Disruptive's internal client intelligence, reporting and
operations platform. It is not a public SaaS product.

This repository currently contains the M0 application foundation. Product
behaviour is specified in [`docs/handoff.md`](docs/handoff.md), with the
interactive prototype and design tokens under [`docs/reference`](docs/reference).

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

Demo data will live behind explicit adapters and will never share production
storage paths. `DEMO_DATA=true` is rejected when `NODE_ENV=production`. No demo
fixtures are included in this milestone.

## Milestones

The next proposed milestone is an early visual review: design tokens, the Pulse
application shell and core dashboard components based on the supplied
prototype. Backend platform work begins only after that interface is reviewed.
An early staging deployment is planned after authentication and the application
foundation are complete.

Work stops for review after every approved milestone.
