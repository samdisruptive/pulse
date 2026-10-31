# ADR-0002: Toolchain pins for Next.js 16

- Status: Accepted
- Date: 31 October 2026

## Context

The newest package versions available at M0 setup were not compatible with
`eslint-config-next`:

- TypeScript 7.0 is not supported by `typescript-eslint` yet.
- ESLint 10 is not accepted by several Next.js ESLint plugins that still
  declare ESLint 9 peer ranges.

## Decision

1. Pin `typescript` to `6.0.3` until `typescript-eslint` and Next.js support a
   newer major release.
2. Pin `eslint` to `9.39.5`, the latest ESLint 9 release that satisfies the
   current Next.js plugin peer ranges.
3. Use Corepack with `packageManager: pnpm@12.16.1`. Prefer
   `corepack pnpm ...` when the local `pnpm` shim is unavailable.
4. Approve the `unrs-resolver` native build through `pnpm-workspace.yaml`
   `allowBuilds` so installs remain non-interactive and reproducible.

## Consequences

- Lint, typecheck and Next builds succeed with a coherent toolchain.
- Dependency upgrades for TypeScript and ESLint must be deliberate and
  rechecked against Next.js tooling before changing the pins.
