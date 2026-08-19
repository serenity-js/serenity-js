# WebdriverIO Parallel Worker Report Aggregation

## Problem Statement

When `HtmlReporter` is used as a crew member with WebdriverIO, each parallel worker process instantiates its own `HtmlReporter` (which composes `TestRunArchiver` + `HtmlReportGenerator`). Each worker's `TestRunArchiver` correctly writes worker-specific `db-{workerId}.json` files. However, `SingleSourceAggregator` (used by `HtmlReportGenerator`) only looks for `db.json` — it never finds the worker files, so `data.js` is never generated.

**Affected runners:** WebdriverIO v8 and v9 with `maxInstances > 1` (both `@serenity-js/webdriverio` and `@serenity-js/webdriverio-8` packages)
**Not affected:** Playwright Test (reporter runs in main process), Protractor (single process), standalone Mocha/Jasmine (single process), WebdriverIO with `maxInstances: 1`

## Evidence

- GitHub Actions run: https://github.com/serenity-js/serenity-js-jasmine-webdriverio-template/actions/runs/32132102509
- gh-pages output: `index.html` present, `data.js` absent, `test-runs/2153/.../db-0-0.json` present
- `SingleSourceAggregator.loadRuns()` reads only `db.json` per directory
- `ReportAggregator.resolveDbJsonDirectories()` checks only for `db.json` existence

## Root Cause Analysis

WebdriverIO's architecture (since v5) instantiates reporters **per worker process**. Reporters have no `onComplete` hook — their lifecycle ends when the worker exits. The framework module (`config.framework`) is loaded only in worker processes; the launcher/main process never imports it. This means:

1. Each worker independently runs `TestRunArchiver` (writes `db-{workerId}.json`) ✓
2. Each worker independently runs `HtmlReportGenerator` → `SingleSourceAggregator` (looks for `db.json` only) ✗
3. No aggregation runs in the main process after all workers finish

The established WebdriverIO ecosystem pattern for post-run aggregation is a **Launcher Service** — a class with `onPrepare`/`onComplete` hooks that runs exactly once in the main process. Reporters like `wdio-timeline-reporter` and `wdio-html-nice-reporter` both use this pattern.

---

## Phase 1: Fix `SingleSourceAggregator` to Handle `db-*.json`

### Goal

Make `SingleSourceAggregator` correctly discover and merge worker-produced `db-*.json` files. This is a bug fix — the aggregator should be able to read files that its sibling `RunDataWriter` legitimately writes. The fix is needed regardless of Phase 2.

### Changes Required

**`ReportAggregator.ts`** (base class):
- `resolveDbJsonDirectories()`: also detect directories containing `db-*.json` (not just `db.json`)
- Discovery rule: a directory is a run directory if it contains `db.json` OR any file matching `/^db-[^/]+\.json$/`

**`SingleSourceAggregator.ts`**:
- `loadRuns()`: for each run directory:
  - If `db.json` exists → read it (it's either a single-worker result or a pre-merged aggregate)
  - If only `db-*.json` files exist → read all, `mergeAdditively()` them into one `RunData`
- Reuse the existing `mergeAdditively()` function from `resolveRetries.ts`

### Design Decision: `db.json` vs `db-*.json` Precedence

If both `db.json` AND `db-*.json` files exist in the same directory, use `db.json` only. Rationale: after the first successful aggregation run, the output directory will contain both `db.json` (written by the last worker's aggregation) and lingering `db-*.json` files. The `db.json` represents the correct merged state — re-merging the worker files would double-count scenes.

### Impact on Existing Behaviour

| Runner | Current behaviour | After change |
|--------|------------------|--------------|
| Playwright Test | Writes `db.json`. Found and aggregated. | **No change** — `db.json` found first. |
| Protractor | Writes `db.json` (single process). | **No change.** |
| Mocha/Jasmine standalone | Writes `db.json` (single process). | **No change.** |
| WebdriverIO `maxInstances: 1` | Writes `db-0-0.json` (one worker). | **Fixed** — file discovered and loaded. |
| WebdriverIO `maxInstances: N` | Writes `db-0-0.json`, `db-0-1.json`, etc. None found. | **Fixed** — all files discovered, merged. |
| CLI aggregate (`MultiSourceAggregator`) | Already handles `db-*.json` via glob + `classifyRunPath`. | **No change** — different code path. |

### Risks

1. **Race condition**: Multiple workers call `aggregate()` concurrently. The last worker to finish sees all `db-*.json` files and produces the most complete `data.js`, overwriting any incomplete earlier version. This is acceptable because:
   - `storeSync()` uses `fs.writeFileSync()` — sequential blocking writes
   - The "last writer wins" produces the most correct result
   - CI artifact uploads happen after all workers exit (via `onComplete` or process exit)

2. **Redundant work**: N workers each run aggregation. Only the last result matters. Acceptable for typical 4–8 worker setups; Phase 2 eliminates this.

### Test Plan

**Unit tests** (in `packages/html-reporter/spec/cli/aggregation/SingleSourceAggregator.spec.ts`):
1. `aggregates data from worker-specific db-{workerId}.json files` — single run dir with `db-0-0.json` + `db-0-1.json`, verify `data.js` produced with merged scenes
2. `discovers directories containing only worker files (no db.json)` — verify directory detection works
3. `prefers db.json over worker files when both exist` — if `db.json` exists alongside worker files, use `db.json` only
4. `handles mixed layout: some dirs with db.json, others with worker files` — multi-run history where older runs have `db.json` and the latest has worker files
5. Existing tests continue to pass unchanged

**Integration test** (in `integration/webdriverio-jasmine/` or similar):
- Configure `HtmlReporter` in the crew, run with `maxInstances > 1`, verify `data.js` exists and contains all scenarios

---

## Phase 2: `defineConfig()` Wrapper + Launcher Service

### Goal

Eliminate redundant per-worker aggregation by running report generation exactly once in the main process after all workers finish. Follow the established WebdriverIO ecosystem pattern (Launcher Service) while providing a clean user experience via a `defineConfig()` wrapper — matching the convention used by Playwright Test, Vitest, and other modern frameworks.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ LAUNCHER PROCESS (main)                                 │
│                                                         │
│ defineConfig() injects SerenityBDDLauncherService       │
│   → onComplete(): SingleSourceAggregator.aggregate()    │
│                    ReportTemplateWriter.write()          │
└─────────────────────────────────────────────────────────┘
         │ spawns workers
         ▼
┌─────────────────────────────────────────────────────────┐
│ WORKER PROCESS (one per spec/capability)                │
│                                                         │
│ HtmlReporter detects WDIO_WORKER_ID                     │
│   → TestRunArchiver: ACTIVE (writes db-{workerId}.json) │
│   → HtmlReportGenerator: SKIPPED (no-op)               │
└─────────────────────────────────────────────────────────┘
```

### User-Facing API

```typescript
// wdio.conf.ts
import { defineConfig } from '@serenity-js/webdriverio';

export const config = defineConfig({
    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'jasmine',
        crew: [
            '@serenity-js/console-reporter',
            ['@serenity-js/html-reporter', {
                outputDirectory: './reports/serenity',
                specDirectory: './spec',
            }],
        ],
    },

    specs: ['./spec/**/*.spec.ts'],
    maxInstances: 4,
});
```

The `defineConfig()` function:
1. Passes through all config unchanged
2. Inspects `serenity.crew` for `@serenity-js/html-reporter` entries
3. If found: auto-injects a `SerenityReportLauncherService` into the `services` array with the matching config
4. Returns the enriched config

### Changes Required

**New file: `packages/webdriverio/src/launcher/SerenityReportLauncherService.ts`**:
- A WebdriverIO Launcher Service (plain object with `onComplete`)
- `onComplete()`: instantiates `SingleSourceAggregator` + `ReportTemplateWriter`, calls `aggregate()` + `write()`
- Accepts `HtmlReporterConfig` options extracted by `defineConfig()`
- Depends on `@serenity-js/html-reporter` — import aggregation classes

**New file: `packages/webdriverio/src/defineConfig.ts`**:
- `defineConfig(config: WebdriverIOConfig): WebdriverIOConfig`
- Scans `config.serenity.crew` for `@serenity-js/html-reporter` (string or tuple)
- Extracts config, creates `[SerenityReportLauncherService, extractedConfig]` entry
- Appends to `config.services` (creates array if absent)
- Returns modified config

**Modified: `packages/html-reporter/src/cli/HtmlReporter.ts`**:
- When `WDIO_WORKER_ID` is detected in environment, `HtmlReportGenerator.notifyOf()` becomes a no-op
- `TestRunArchiver` continues to operate normally
- This makes `HtmlReporter` safe in worker processes regardless of whether `defineConfig()` is used

**Modified: `packages/webdriverio/src/index.ts`** and **`packages/webdriverio/src/api.ts`**:
- Export `defineConfig` from the public API
- Export `launcher` (the `SerenityReportLauncherService` class) for advanced users who prefer manual service registration

### Package Dependency Impact

`@serenity-js/webdriverio` gains an **optional peer dependency** on `@serenity-js/html-reporter`:
- `defineConfig()` only injects the service if `@serenity-js/html-reporter` is in the crew AND importable
- If the package is not installed, `defineConfig()` is a passthrough — no error
- The launcher service lazily imports `@serenity-js/html-reporter` aggregation classes

This avoids a hard dependency while enabling the zero-config experience when both packages are present.

### Backwards Compatibility

| Scenario | Behaviour |
|----------|-----------|
| User uses `defineConfig()` + `HtmlReporter` in crew | Optimal: single aggregation in main process |
| User does NOT use `defineConfig()` + `HtmlReporter` in crew | Phase 1 behaviour: per-worker aggregation, last writer wins |
| User uses `defineConfig()` without `HtmlReporter` | Passthrough: `defineConfig()` is a no-op |
| User manually registers the launcher service | Works: `defineConfig()` detects existing service, doesn't duplicate |

No breaking changes. Existing `wdio.conf.ts` files without `defineConfig()` continue to work via Phase 1's fix.

### Why `defineConfig()` Instead of Alternatives

| Alternative | Why rejected |
|-------------|-------------|
| Framework exports `launcher` | WDIO's `initializeLauncherService` only processes `services[]` entries. The framework module is never loaded in the launcher process. |
| `isSynchronised` on a reporter | Only delays worker exit; doesn't coordinate across workers or run in the main process. |
| User manually adds a service | Error-prone, non-discoverable, config duplication between crew and services. |
| Auto-detect `WDIO_WORKER_ID` only | Eliminates redundant work but doesn't provide a single aggregation point — relies on last-writer-wins. |

### Risks

1. **Optional peer dependency**: `@serenity-js/webdriverio` importing from `@serenity-js/html-reporter` at runtime creates a coupling. Mitigated by lazy import + graceful fallback.

2. **Config inspection**: `defineConfig()` must parse the crew array which can contain strings, tuples, or class references. Edge cases (custom subclasses of `HtmlReporter`, dynamically computed crew arrays) may not be detected.

3. **WebdriverIO 8 vs 9**: Both versions must be supported. The Launcher Service contract (`onComplete(exitCode, config, capabilities, results)`) is consistent across both. Need a separate `defineConfig` in `@serenity-js/webdriverio-8` or a shared implementation.

### Test Plan

**Unit tests** (in `packages/webdriverio/spec/`):
1. `defineConfig() injects launcher service when HtmlReporter is in crew` — verify services array is modified
2. `defineConfig() extracts HtmlReporter config correctly` — verify outputDirectory, specDirectory passed through
3. `defineConfig() is a passthrough when no HtmlReporter in crew` — verify no modification
4. `defineConfig() does not duplicate service if already present` — verify idempotency
5. `defineConfig() handles string crew entries` — `'@serenity-js/html-reporter'`
6. `defineConfig() handles tuple crew entries` — `['@serenity-js/html-reporter', { ... }]`
7. `SerenityReportLauncherService.onComplete() runs aggregation` — verify aggregate + write called

**Unit tests** (in `packages/html-reporter/spec/`):
1. `HtmlReporter skips generation when WDIO_WORKER_ID is set` — verify no aggregate/write calls
2. `HtmlReporter still archives when WDIO_WORKER_ID is set` — verify TestRunArchiver operates normally

**Integration test**:
- Same scenarios as Phase 1 but with `defineConfig()` in the config
- Verify only one `data.js` write occurs (no redundant aggregation)

---

## Implementation Order

1. **Phase 1** — ship as a patch fix (`fix(html-reporter): discover worker db-*.json files in SingleSourceAggregator`)
2. **Phase 2** — ship as a feature (`feat(webdriverio): add defineConfig() for optimal parallel report aggregation`)

Phase 1 is a prerequisite for Phase 2 — the `SingleSourceAggregator` fix is needed by the launcher service in Phase 2 regardless.
