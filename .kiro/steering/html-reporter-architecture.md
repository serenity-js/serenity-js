---
inclusion: fileMatch
fileMatchPattern: "**/html-reporter/**"
---

# HTML Reporter — Implementation Architecture

Architectural decisions, component patterns, data flow, and constraints for the `@serenity-js/html-reporter` module.
Complements `html-reporter-ux.md` (which covers design principles, personas, and accessibility).

## Stack & Runtime Constraints

| Decision | Rationale |
|----------|-----------|
| Preact + htm (tagged templates) | Tiny runtime (~4KB), no JSX build step, fast IIFE bundle |
| esbuild IIFE bundle | Single-pass compile, tree-shakes dead code, produces one JS blob |
| Single self-contained HTML file | Must work from `file://` URLs — no server, no CDN, no network requests |
| `window.__SERENITY_REPORT_DATA__` | Data loaded via `<script src="data.js">` — enables `file://` support |
| @tanstack/virtual-core | Virtualisation for lists > 50 items, framework-agnostic core |
| Chart.js | Only charting library — do not introduce alternatives |
| Zod | Runtime validation for `db.json` files via `RunDataSchema` |
| No React, Tailwind, or shadcn | Keep bundle small and dependency-free |

## Package Layout

```
packages/html-reporter/
├── app/                 ← Preact SPA source
│   ├── router/          ← Route definitions + resolver
│   ├── config/          ← Layout constants (row heights, header heights)
│   ├── components/      ← Domain-organised (dashboard/, scenarios/, consistency/, errors/, about/, common/)
│   ├── hooks/           ← Custom Preact hooks (useVirtualizer, useStickyHeader, useHashHistory)
│   └── utils/           ← Shared selectors, formatters, navigation helpers
├── src/                 ← Node.js code
│   ├── cli/             ← Top-level crew members (HtmlReporter, HtmlReportGenerator)
│   │   ├── collection/  ← Data collection during test run (TestRunArchiver, SceneDataCollector, etc.)
│   │   ├── aggregation/ ← Combining runs into a snapshot (ReportAggregator, SingleSource/MultiSource)
│   │   ├── reporting/   ← Final output generation (ReportTemplateWriter, ReportData types)
│   │   ├── analysis/    ← Scoring and clustering (CapabilityConfidenceScorer, FailureClusterAnalyser)
│   │   ├── capabilities/← Capabilities tree building
│   │   ├── history/     ← Execution history building
│   │   └── model/       ← Data model (RunData, validation, scene identity)
│   ├── navigation/      ← URL builder (link.ts — shared by app and interaction objects)
│   └── serenity/        ← Interaction objects for component/integration tests
├── spec/
│   ├── cli/             ← Unit tests (mirrors src/cli/ subdirectory structure)
│   ├── navigation/      ← Link URL builder tests
│   └── app/             ← Component tests (Playwright + esbuild fixture)
├── scripts/             ← Build scripts (bundle-template.mjs, generate-summary-schema.mjs)
└── bin/                 ← CLI entry point (bootstrap.mjs + yargs)
```

## Route Architecture

### Single Source of Truth

All routes defined declaratively in `app/router/routes.ts`. Each entry specifies: pattern, title, view component, icon,
navLabel, badge function, and `data()` selector.

Adding a new view = add one entry to `routes.ts` + create one view component. No other files need editing.

### Typed Route Definitions

Routes use a `defineRoute<P>()` builder function that infers the generic and proves consistency between `data()`
output and view component props. The collection stores type-erased `RouteDefinition` — the generic proved safety at
registration time.

### Route Matching

Three rules: exact match, query params, dynamic segment (`:path`). No regex, no nested routes, no middleware.

### Query-Parameter Deep Links

URLs with `?route=/path&key=value` are converted to `#/path?key=value` via `history.replaceState` before the app
renders. This enables linking from contexts that strip `#` fragments (markdown on `file://`, Slack, CI logs).

## Virtualisation

### GroupedVirtualList

All virtualised lists use a single `GroupedVirtualList<T>` component. Views pass: `items`, `groupBy`, `rowHeight`,
`renderItem`, `renderGroupHeader`.

The component encapsulates:
- `useVirtualizer` (tanstack/virtual-core wrapper)
- `useStickyHeader` (scroll-aware sticky group headers)
- `rangeExtractor` (ensures active header stays rendered)

**Constraint:** No view should import `useVirtualizer`, `useStickyHeader`, `defaultRangeExtractor`, or height constants
directly — all access via `GroupedVirtualList` or `config/layout.ts`.

### Row Heights

Defined in `app/config/layout.ts`. These MUST match the rendered CSS height. If you change row padding or font-size,
update these values.

### Flex-Fill Layout

Views with virtual scroll use `.flex-fill-view` class. The CSS establishes a height-constrained flex chain:
```
.main-content:has(> .flex-fill-view) { height: 100vh; overflow: hidden }
  → .flex-fill-view { flex: 1 }
    → .card { flex: 1; padding-bottom: 0 }
      → .scroll-container { flex: 1; max-height: none; overflow-y: auto }
```

This eliminates the old fixed `max-height: calc(100vh - Xpx)` approach that caused bottom padding gaps.

## Data Flow & Aggregation

### Two Execution Modes

1. **Crew member mode** (`TestRunArchiver` + `HtmlReportGenerator`) — runs during a test, writes artifacts directly
   to `test-runs/`, aggregates from the same output directory. No `sourceFileSystem` needed.
2. **CLI aggregate mode** — reads `db.json` from arbitrary external paths, needs `sourceFileSystem` rooted at their
   common ancestor to copy artifacts into the output directory.

### Confidence Score Formulas

Two distinct formulas for different contexts:

```
Report/run confidence = completeness × 0.30 + passRate × 0.35 + stability × 0.35
Capability confidence = passRate × 0.40 + consistency × 0.35 + completeness × 0.25
```

The capability formula weights pass rate highest ("can we ship this feature?").

### Consistency Classification

| Kind | Rule | Meaning |
|------|------|---------|
| **Flaky** | Last outcome is RETRIED_SUCCESS, no genuine failure in history | Passes only via retry |
| **Inconsistent** | Has genuine failure in history AND last outcome is RETRIED_SUCCESS | Retry masking a deeper problem |
| **Degraded** | Has failure in history AND last outcome is a failure | Newly broken |
| **Recovered** | Has failure in history AND last outcome is SUCCESS (clean, no retry) | Fixed |

"Recovered" requires a clean pass. A test passing via retry is "flaky" or "inconsistent" — never "recovered."

Classification logic lives in `classifyConsistencyKind()` in `utils/selectors.ts`.

### Scene Identity

Always use `sceneIdentity(scene)` — never inline `source.path + ':' + source.line`. Client-side lookups must include
`tagDiscriminator` (browser/project/platform tags) to distinguish multi-variant scenarios.

### Error Fingerprinting

Normalise by stripping: ANSI escape sequences, absolute file paths (keep filename + line), run-varying numeric values
(timestamps, ports). This ensures the same root cause clusters across machines and runs.

### Additive Merge Rules (CI Re-runs)

When overlapping scenes appear in the same attempt group:
- Different outcome → record as retry attempt
- Same outcome → keep the later version, skip duplicate

### Incomplete Run Detection (Crash Recovery)

Detects when a CI runner crashes before `TestRunFinishes` fires, using a two-phase write pattern:

1. **On `TestRunStarts`:** write a placeholder `db.json` with `startedAt`, empty `scenes[]`, and `systemContext` — but
   no `finishedAt` and no `testRunner`
2. **On `TestRunFinishes`:** overwrite with the full `db.json` including `finishedAt`

If the process crashes between steps 1 and 2, the placeholder persists. During aggregation, `db.json` files without
`finishedAt` are classified as incomplete modules.

**Data model:**
- `RunData.finishedAt` and `RunData.testRunner` are optional (absent in placeholders)
- `RunData.modules`: `Array<{ moduleId, startedAt, finishedAt?, outcome?, outcomes? }>` — tracks per-module completion
- `ReportHistoryEntry.modules` passes through to the client for UI rendering

**UI indicators:**
- ⚠️ prefix on trend chart x-axis labels for runs with incomplete modules
- Warning icon + "(incomplete)" suffix in RunSelector dropdown entries
- Module table in TrendChartDetails showing per-module status (✅/❌/⚠️)
- Ambient banner on Dashboard when the latest run is incomplete

**Rule:** `finishedAt` absence is the sole signal — no separate `status` field. A `db.json` without `finishedAt` is
valid, not a schema error.

### RunData Validation

`db.json` files are validated via Zod schema (`RunDataSchema` in `src/cli/model/RunDataSchema.ts`). The schema is the
single source of truth for the `RunData` structure — when fields become optional, update the schema and the TypeScript
interface together.

Validation rules:
- `schemaVersion` is checked first; future versions throw `IncompatibleSchemaError` (semantic, not structural)
- All other validation errors throw `InvalidRunDataError` with the Zod error path
- `scenes` are `z.unknown()` — trusted producer code, not validated deeply
- `systemContext` is `z.unknown()` — contains `Version` TinyType that serialises to string; validating deeply would require a separate JSON shape interface
- `attempt` must be `>= 1` when present
- Outcome counts must be non-negative integers

The schema lives alongside the interface (`RunData.ts`) — keep them in sync.

## Component Patterns

### Extraction Cycle

Every new component follows this sequence:
1. Extract Preact component → `app/components/<domain>/<Name>.ts`
2. Create interaction object → `src/serenity/<domain>/<Name>.serenity.ts`
3. Write component test → `spec/app/<domain>/<Name>.spec.ts`
4. Wire into integration tests if needed

Complete the full cycle before starting the next extraction.

### Interaction Object Rules

- Constructor accepts `Answerable<PageElement<NET>>` (handles all forms)
- All locators scoped via `.of(this.rootElement)` — never global selectors
- Return type for components: `ReturnType<typeof html>` (not `VNode`)
- **Questions** (nouns): `text()`, `outcomeType()`, `outcomes()`
- **Tasks** (verbs): `open()`, `find()`, `selectFilter()`
- No implementation leakage: never expose `ariaLive()`, `cssClass()`, raw attribute accessors
- Structured results: return `Array<{type, title}>` not parallel arrays

### When to Use IO vs Raw Playwright in Tests

**Convert to IO:** text content, counts, presence/absence, navigation, filtering, search, interactions

**Keep raw Playwright:** ARIA attributes, CSS heights/colours/widths, class names, keyboard focus, theme, ANSI rendering.
Add explanatory comment before the describe block explaining why.

### Integration Test Architecture

```
Fixture → typed interaction objects per view (dashboardView, scenariosView, ...)
View IO → scopes child widget IOs via data-testid
Widget IO → scopes its own locators within constructor-provided element
```

Tests call view-level methods only. Never reach into child IOs from test code.

### Prefix Matching for State-Dependent Attributes

When a component appends to `aria-label` based on state, use `[aria-label^="..."]` in locators, not exact match.

## Icons

All SVG icons are defined in `app/components/common/icons.ts`. Never define SVGs inline in component templates —
always add to the icons file and reference by name.

## Known Limitations

### ListItemNotFoundError

`.first()` on an empty filtered list throws during **description resolution** (before `isPresent()` can evaluate).
`Ensure.that(question, not(isPresent()))` doesn't work when the chain includes `.first()` on a potentially empty list.

Workaround: skip `not(isPresent())` for these cases. Fix scope: `@serenity-js/core` + `@serenity-js/assertions`.

### Virtual Scroll + Position Sticky

The `.scroll-container` has `overflow-y: auto`, which creates its own scroll context. `position: sticky` on elements
outside the scroll container will never activate. Don't add sticky CSS above virtual scroll lists.

### Inline Styles vs Media Queries

Inline `style=` attributes bypass all CSS media query overrides (higher specificity). Always use CSS classes for
properties that need responsive behaviour.

### CSS Source Order

Base rules must appear BEFORE responsive overrides in the file. Same specificity + later source position = later wins.

## Future Work

These are planned but not yet specified in detail:

- **Global search** (Cmd+K overlay) — navigation tool, not view filter. May seed local filters on navigation.
- **Risk score per requirement** — passRate + instability + recency
- **Historical trend per requirement node** — pass rate over time for each capability
- **Expandable inline diagnostics** — stack trace + screenshots in scenario rows without click-through
- **Error view clustering dimensions** — message (done), type, failing step, location-based
