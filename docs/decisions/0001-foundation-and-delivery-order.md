# ADR-0001: Foundation boundaries and delivery order

- Status: Accepted
- Date: 31 October 2026

## Context

Pulse needs a maintainable foundation before feature work, but the interface
must be reviewed early. Demo data must be isolated, the database must remain
extensible, existing VPS experiments need assessment before Google integration
work, and staging should not wait until the final production phase.

## Decision

1. Use the process and source boundaries in `docs/architecture.md`: Next.js web,
   a separate worker, PostgreSQL and Redis.
2. Follow M0 with an early visual milestone covering tokens, the application
   shell and core dashboard components before backend platform implementation.
3. Keep demo data behind explicit adapters. Reject `DEMO_DATA=true` in
   production and never seed demo records into a production database.
4. Add database models only when an approved milestone needs them. Integration
   providers share stable contracts and fact storage rather than speculative
   provider-specific schemas.
5. Inspect the existing VPS MCP and API experiments read-only before GA4 or
   Search Console implementation. Reuse, adaptation or replacement requires a
   written recommendation. VPS changes require separate approval.
6. Create a staging deployment milestone after authentication and the
   application foundation work. Production hardening remains a later phase.
7. Record specification conflicts in `docs/specification-conflicts.md` and
   resolve material conflicts before the affected milestone.

## Consequences

- Visual feedback arrives before substantial backend investment.
- Demo and production paths are testably separate.
- The initial Prisma schema remains smaller and migrations follow real needs.
- Google integration planning includes evidence from the existing VPS code.
- Deployment assumptions are tested earlier without treating staging as
  production-ready.
