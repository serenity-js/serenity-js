---
status: rejected
reason: Cosmetic rename with high churn, zero functional benefit. Current layout is sufficient.
---

# Phase 9: Package Layout Restructuring

## Goal

Reorganise `packages/html-reporter/` from the generic `src/` + `spec/` layout into a
domain-oriented top-level structure that reflects the three distinct bounded contexts
within the package.

## Target Layout

```
packages/html-reporter/
├── cli/                ← Node.js reporter, archiver, CLI aggregation (current src/)
├── app/                ← Preact single-page app (current template/)
├── serenity/           ← Interaction objects (current src/serenity/)
├── spec/
│   ├── cli/            ← Unit tests for reporter/archiver (current spec/ minus components/)
│   └── components/     ← Component tests (already exists)
├── lib/                ← CJS compiled output
├── esm/                ← ESM compiled output
├── package.json
└── tsconfig*.json
```

## Rationale

The html-reporter contains three conceptually distinct codebases sharing one npm package:

1. **cli** — Node.js code that collects domain events, writes `db.json`/`data.js`, aggregates
   test runs, and generates the final HTML report. Runs at build time.
2. **app** — A Preact SPA bundled into a self-contained HTML template. Runs in the browser
   at `file://` URLs. Has no Node.js dependencies.
3. **serenity** — Screenplay Pattern interaction objects for testing the report. Published as
   `@serenity-js/html-reporter/serenity`. Used by component tests and integration tests.

The current `src/` directory conflates (1) and (3). The rename from `template/` to `app/`
better communicates that it's a standalone application, not just HTML templates.

## Migration Steps

1. Rename `template/` → `app/`
2. Rename `src/` → `cli/` (move interaction objects out first)
3. Move `src/serenity/` → top-level `serenity/`
4. Move `spec/` unit tests to `spec/cli/` (keep `spec/components/` as-is)
5. Update `tsconfig-cjs.build.json` and `tsconfig-esm.build.json`:
   - `rootDir` and `include` to cover `cli/` + `serenity/`
   - Ensure output paths in `lib/` and `esm/` remain stable for the `exports` field
6. Update `package.json` `exports` field if output paths change
7. Update `scripts/bundle-template.mjs` to read from `app/` instead of `template/`
8. Update esbuild fixture in `spec/components/fixtures.ts` (TEMPLATE_DIR)
9. Update all relative imports in spec files
10. Verify: compile, component tests, integration tests, lint

## Risks

- **Convention break** — every other package uses `src/` → `lib/`. This makes html-reporter
  structurally unique. Acceptable given its unique nature (it contains a full SPA).
- **TypeScript rootDir** — with multiple source roots, the compiled output structure will
  change. May need `rootDir: "."` or composite project references.
- **CI blast radius** — build scripts, coverage config (`.c8rc.json`), and any hardcoded
  paths in CI need updating.

## Status

✅ **Complete** — all phase-9 work is done.

### Package layout restructuring

Restructured in two steps:
1. Mechanical renames: `template/` → `app/`, `src/*.ts` → `src/cli/`, `spec/*.spec.ts` → `spec/cli/`, `spec/components/` → `spec/app/`
2. Domain sub-grouping: 10 domain directories (dashboard, scenarios, consistency, errors, capabilities, timeline, tags, test-runs, about, common) in `app/components/`, mirrored in `src/serenity/` and `spec/app/`

Compiled output paths in `lib/` and `esm/` unchanged (`index.js`, `serenity.js`, `template.js` at top level).

### Component test IO conversions (6 files)

1. ✅ `CapabilitiesView.spec.ts` — 11 raw `expect()` remain (accessibility: ARIA roles, tabindex, keyboard)
2. ✅ `ExecutionHistory.spec.ts` — 0 raw `expect()`
3. ✅ `PhotoStrip.spec.ts` — 0 raw `expect()`
4. ✅ `ActivityNode.spec.ts` — 0 raw `expect()`
5. ✅ `SegmentedBar.spec.ts` — 5 raw `expect()` remain (visual: CSS heights, colours, widths)
6. ✅ `Delta.spec.ts` — 0 raw `expect()`

247 component tests, all passing. Remaining files tracked in **phase 10**.

### Integration tests

Fully refactored to idiomatic Screenplay Pattern — no `Task.where()` placeholders remain.

- 39 integration tests across 16 domain-oriented spec files, all passing
- Organised by user journey: dashboard, scenarios, capabilities, consistency, errors, tags, timeline, test-runs, navigation, system-context
- Shared scenario constants in `integration/html-reporter/src/scenarios.ts`
- Playwright Test fixtures provide typed interaction objects per view (`dashboardView`, `scenariosView`, `capabilitiesView`, etc.)

All originally-pending IO APIs are now implemented:
- ✅ `dashboardView.consistencyCardScenarioNames()` — lists degraded/recovered test names
- ✅ `dashboardView.slowestTestNames()` — lists slowest tests on dashboard
- ✅ `capabilitiesView.confidence()` — overall confidence score
- ✅ `capabilitiesView.childCapabilityNames()` — child capability names
- ✅ `scenarioDetailView.photoStripCount()` — number of screenshots
- ✅ `scenarioDetailView.copySourceLocation()` — click copy button
- ✅ Timeline tests in `execution-timing.spec.ts`

### TestRunsView GitLink decision

Deferred to phase 10 (item 10.7). `TestRunsView.spec.ts` has 7 raw `expect()` calls for
git link rendering — will be addressed during the full component test IO conversion pass.
