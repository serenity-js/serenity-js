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

✅ Complete — restructured in two steps:
1. Mechanical renames: `template/` → `app/`, `src/*.ts` → `src/cli/`, `spec/*.spec.ts` → `spec/cli/`, `spec/components/` → `spec/app/`
2. Domain sub-grouping: 10 domain directories (dashboard, scenarios, consistency, errors, capabilities, timeline, tags, test-runs, about, common) in `app/components/`, mirrored in `src/serenity/` and `spec/app/`

All 475 component tests pass. Compiled output paths in `lib/` and `esm/` unchanged (`index.js`, `serenity.js`, `template.js` at top level).

Integration tests refactored to idiomatic Screenplay Pattern:
- 4 persona specs (developer, product-owner, engineering-manager, qa-engineer) use interaction objects
- 64 of 76 integration tests pass; 12 remain as `Task.where(...)` pending placeholders
- 40/40 html-report.spec.ts baseline tests pass
- Shared scenario constants in `integration/html-reporter/src/scenarios.ts`
- Interaction objects extended: `kpiCardCalled()`, `scenarioCalled()`, `scenarioNames()`, `activityCalled()`, `selectFilter()`, `activeFilters()`

## Pending: Interaction Object APIs for Integration Tests

12 integration tests have `Task.where(...)` placeholders that need real implementations.
Each requires: component test first → interaction object method → integration test update.

### Dashboard consistency card (2 tests)
- `dashboardView.consistencyCard().scenarioNames()` — list degraded/recovered test names
- Used by: product-owner "newly failing tests", engineering-manager "new failures"

### Capabilities detail panel (4 tests)
- `capabilitiesView.selectedCapability().confidence()` — confidence score of selected node
- `capabilitiesView.selectedCapability().children()` — child capability names/scores
- `capabilitiesView.selectCapability(name)` — click a capability node
- Used by: product-owner "which features affected", "capability health review"
- Used by: engineering-manager "assess failure impact"

### Photo strip / lightbox (3 tests)
- `scenarioDetailView.photoStrip().count()` — number of screenshots
- `scenarioDetailView.photoStrip().openAt(index)` — open lightbox
- Used by: developer "screenshot at point of failure"
- Used by: qa-engineer "compare screenshots", "verify screenshots captured"

### Copy-to-clipboard (1 test)
- `scenarioDetailView.copySourceLocation()` — click copy button, verify toast
- Used by: developer "copy source location"

### Slowest tests (1 test)
- `dashboardView.slowestTests()` — list of slowest test names on dashboard
- Used by: qa-engineer "find the slowest tests"

### Timeline analysis (1 test)
- This is a placeholder for a user workflow that requires visual interpretation
  of the timeline chart. May remain as a pending task or be replaced with a
  simpler assertion (e.g., scenario count in timeline view).


## Pending: Component test refactoring to interaction objects

6 highest-impact files converted (phase 9 scope):
1. ✅ `CapabilitiesView.spec.ts` (64 → 19 raw, 4 intentionally kept for accessibility)
2. ✅ `ExecutionHistory.spec.ts` (44 → 0 raw)
3. ✅ `PhotoStrip.spec.ts` (40 → 0 raw)
4. ✅ `ActivityNode.spec.ts` (27 → 0 raw)
5. ✅ `SegmentedBar.spec.ts` (22 → 8 raw, 3 intentionally kept for visual rendering)
6. ✅ `Delta.spec.ts` (20 → 0 raw)

Remaining 15 files tracked in **phase 10** (`phase-10-component-test-io-conversion.md`).


## Pending: Review TestRunsView GitLink component test

The test `TestRunsView GitLink › renders branch and commit as links to the repository`
in `spec/app/test-runs/TestRunsView.spec.ts` uses raw Playwright `page.locator()` + `expect()`
instead of idiomatic Screenplay. Options:
- Add a `TestRunItem` interaction object with `branchLinkHref()` / `commitLinkHref()`
- Or expose link verification via `TestRunsView` directly
- Decide whether this is a component-level HTML test or should use interaction objects
