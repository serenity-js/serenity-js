---
status: proposed
---

# Error View Clustering

## Problem

The Errors view currently groups failures by error message fingerprint (normalised message
text). This answers "how many distinct bugs?" but doesn't help users answer:

- "What *kind* of problems do I have?" (timeouts vs assertions vs infrastructure)
- "Is there one flaky step causing many failures?" (common root cause at the activity level)

An AI agent analysing 12 failures across 3 viewports identified only 2 distinct root
causes — but needed to pattern-match across rows manually. Providing switchable clustering
dimensions reduces this cognitive/parsing effort.

## Proposal

Add a "Group by" control to the Errors view that lets users switch between three
clustering dimensions:

| Dimension | Groups by | Question it answers | Data source |
|-----------|-----------|--------------------:|-------------|
| **Message** (default) | Fingerprinted error message | "How many distinct bugs?" | `error.message` via `fingerprintError()` |
| **Type** | Error class name | "What kind of problems?" | `error.name` (`AssertionError`, `TimeoutError`, etc.) |
| **Failing step** | Deepest failed activity name | "Which step is the common failure point?" | `findFailingStep(activities)` |

## UI Design

### Control placement

Use the same filter-chip / segmented control pattern as the Tests view sort control.
Place it in the existing `.controls-row` alongside the search input and outcome filters:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Search...          │ All │ Failed │ Error │ ▾ Group: Message │
└─────────────────────────────────────────────────────────────────┘
```

The "Group by" control is a `<select>` or a set of segmented buttons (same pattern as
the sort control in ScenariosView). Options: Message | Type | Failing step.

### Grouped row display

Each group shows:
- A group header with the cluster label + scenario count
- Collapsed by default; expanding shows the individual scenario rows

```
┌─ AssertionError: Expected capability names to contain "End-to-End"  (3 scenarios)
│   ✗ capability-health / desktop
│   ✗ capability-health / tablet
│   ✗ capability-health / mobile
└─

┌─ TimeoutError: locator.click: Timeout 30000ms exceeded  (2 scenarios)
│   ✗ login / desktop
│   ✗ login / mobile
└─
```

When grouped by "Failing step":

```
┌─ Serena ensures that child capability names does contain "End-to-End"  (3 scenarios)
│   ...
└─

┌─ (no failing step)  (2 scenarios)
│   ✗ login timeout / desktop    ← hook/infrastructure failure
│   ✗ setup failure / mobile
└─
```

### URL state

The selected grouping dimension is serialised in the URL hash:
`#/errors?group=type` or `#/errors?group=step`

Default (`group=message`) is omitted from the URL for cleanliness.

## Data Layer

All required data is already available:

- **Error type**: `scenario.error.name` — already in `ReportScenario`
- **Error message fingerprint**: `fingerprintError()` in `FailureClusterAnalyser.ts`
- **Failing step**: `findFailingStep()` in `FailureClusterAnalyser.ts`

The clustering computation runs client-side in the Errors view component. For typical
report sizes (< 1000 scenarios, < 100 failures), this is instantaneous.

### Edge cases: "no failing step"

Scenarios where `findFailingStep()` returns `undefined`:

| Case | Why | Grouped as |
|------|-----|-----------|
| Hook failure (beforeAll/afterAll) | Error at scene level, empty or no-fail activity tree | "(no failing step)" |
| Pending/skipped | Not a real failure (filtered out before clustering) | — |
| Test framework timeout | Aborts before interactions run | "(no failing step)" |
| Empty activity tree | Scenario outline stubs, framework errors | "(no failing step)" |

The "(no failing step)" group is informative — it signals infrastructure/setup problems
vs test logic failures.

### Fingerprinting for "Failing step" dimension

Use exact activity name matching (not normalised). Two scenarios failing at
`Alice ensures that page title equals "Dashboard"` should cluster together even if
their error messages differ (e.g., different actual values).

For the "Message" dimension, continue using `fingerprintError()` which strips ANSI,
absolute paths, and large numbers.

## Interaction Objects

Extend `ErrorsView` interaction object:

```typescript
// Task — switch grouping
groupBy = (dimension: Answerable<string>): Task =>
    Task.where(the`#actor groups errors by ${dimension}`,
        /* select/click the dimension control */
    );

// Question — current grouping
activeGrouping = (): QuestionAdapter<string> => ...

// Question — group headers
errorGroupHeaders = (): Question<Promise<string[]>> => ...

// Question — scenarios within a group
errorGroupCalled = (label: string) => ({
    scenarioCount: (): QuestionAdapter<number> => ...,
    scenarioNames: (): Question<Promise<string[]>> => ...,
});
```

## Accessibility

- Group headers use `role="heading"` with appropriate level
- Expand/collapse uses `aria-expanded` on the group header button
- The "Group by" control uses `aria-label="Group errors by"`
- Screen reader announces count changes via `aria-live="polite"` on the results summary

## Implementation Plan

1. Add `groupBy` state to `ErrorsView` (default: `'message'`)
2. Extract grouping logic into `groupErrors(scenarios, dimension)` utility
3. Add the "Group by" control (select element, same style as sort in ScenariosView)
4. Render grouped rows with collapsible headers
5. Serialise/restore `group` param in URL hash
6. Extend `ErrorsView` interaction object
7. Write component tests for each dimension + URL state

## Effort Estimate

~3-4 hours total:
- Grouping logic + utility: 30min (data already available)
- UI control + rendering: 1.5h
- URL state + deep linking: 30min
- Interaction object + tests: 1h

## Dependencies

- Phase 11 C1 (summary.json) already computes `failureClusters` with `failingStep` — same
  data, just surfaced differently in the UI
- No new npm dependencies needed
- No new CSS patterns — reuses existing `.controls-row`, `.filter-chip`, collapsible patterns

## Open Questions

1. Should the "Failing step" group show the full activity path (e.g., "Alice attempts to >
   Navigate to > Ensure that...") or just the deepest leaf? Leaf is simpler and matches
   what `findFailingStep()` already returns.

2. Should the grouping dimensions be extensible (e.g., "Group by source file")? This would
   require a plugin/extension point. Defer unless there's demand.

3. Should the group headers show a mini segmented bar (outcome distribution within the
   group)? Nice-to-have, not essential for v1.

## Future Enhancement: Location-Based Clustering

### Motivation

The v1 "Failing step" dimension groups by activity *description*. This has problems:

- Descriptions include the actor name (`"Alice clicks on..."` vs `"Bob clicks on..."`)
- Descriptions include runtime-resolved values (`"enters 'foo@bar.com'..."` vs
  `"enters 'admin@test.com'..."`)
- Stripping actor names or parameters from descriptions is a string hack

A better clustering signal: **where in the source code** the activity was invoked.

### Approach: Cluster by Invocation Location

Every `ActivityRecord` already carries `location?: { path, line, column }` — a
`FileSystemLocation` value object serialised from `ActivityDetails`. Two scenarios
that fail at the same `path:line` are structurally failing at the same code point,
regardless of actor name, runtime parameters, or description text.

This is analogous to how `sceneIdentityWithTags()` uses `source.path:line` for
scenario identity rather than scenario name.

### Two-Tier Clustering

| Tier | Key source | When used |
|------|-----------|-----------|
| **1. Activity location** | `ActivityRecord.location` of the deepest failing node | Screenplay tests (activity tree present with locations) |
| **2. Stack-trace location** | First user-code frame from `ErrorRecord.stack` | Non-Screenplay tests, or activities without location data |

#### Tier 1: Activity-location clustering

Walk the activity tree depth-first, find the deepest node with `error !== undefined`.
Use its `location.path + ':' + location.line` as the cluster key.

#### Tier 2: Stack-trace clustering

When no activity location is available (plain Playwright Test without Screenplay,
Cucumber steps that don't use Tasks/Interactions, hook failures):

1. Parse `error.stack` to extract stack frames
2. Find the first frame whose path is inside `specDirectory`
3. Use `frame.path + ':' + frame.line` as the cluster key

The `specDirectory` is already available in the report data — it's the natural boundary
for distinguishing user-code frames from framework frames (`node_modules/@serenity-js/...`,
`node_modules/@playwright/...`).

### Cluster Key Data Model

```typescript
interface FailureLocationKey {
    path: string;       // relative to specDirectory
    line: number;
    source: 'activity' | 'stack';  // which tier produced it
}
```

### Where This Logic Lives

This is a reporting/read-model concern — it belongs in the html-reporter's aggregation
layer (`DataSnapshotAggregator` / `FailureClusterAnalyser`), NOT in `@serenity-js/core`.
The aggregator pre-computes the `clusterKey` for each failing scenario and embeds it in
`db.json`, so the client does a simple group-by without walking trees or parsing stacks.

### Data Availability

Confirmed in the existing data model:

- `ActivityRecord.location?: { path: string; line: number; column: number }` — present
  for all Screenplay activities emitted by Playwright Test and Cucumber adapters
- `ErrorRecord.stack: string` — present for all errors
- `FileSystemLocation.line` is optional in the core domain model, but in practice
  both Playwright Test and Cucumber adapters populate it

### Advantages Over Description-Based Matching

| Concern | Description-based | Location-based |
|---------|-------------------|----------------|
| Actor name in text | Must strip — fragile regex | Not in location |
| Runtime parameters | Must normalise — lossy | Not in location |
| Same step in different files | Wrongly clusters together | Correctly separates |
| Renamed step (same code) | Breaks cluster | Cluster survives |
| Added blank line above | N/A | Shifts line number (acceptable for single-run) |
| Non-Screenplay tests | No activity tree → no clustering | Stack trace fallback works |

### Relationship to v1 "Failing Step" Dimension

The v1 implementation (deepest leaf activity name) ships first as described in the
main proposal above. Location-based clustering is a **refinement** that can either:

- **Replace** the name-based approach entirely (simpler, more accurate), or
- **Augment** it as a fourth "Group by" dimension ("Group by: Location")

The recommendation is to replace: use location as the clustering key but display the
activity name (or parsed stack frame) as the human-readable cluster label.

### Open Questions for Implementation

1. **Cluster label when using location key**: The location (`login.ts:42`) is the
   identity, but what do we *display* as the group header? Options:
   - The activity name at that location (e.g., `Click.on(loginButton)`)
   - The file:line itself (e.g., `login.spec.ts:42`)
   - Both: activity name with file:line as secondary text
   Recommendation: activity name as primary, file:line as subtitle.

2. **Ancestor vs leaf clustering**: Should we cluster at the deepest failing
   Interaction (most precise) or the nearest failing Task ancestor (more
   business-meaningful)? The `ActivityRecord.type` field distinguishes them.
   Could offer both: "Group by: Failing interaction" vs "Group by: Failing task".

3. **Cross-run cluster stability**: `file:line` shifts when lines are added.
   For a single test run this doesn't matter (all scenarios point to the same
   code state). For cross-run comparison (e.g., "this cluster persists across
   runs"), we'd need fuzzy matching or a content-hash. Defer to v2.

4. **specDirectory for stack-trace tier**: What if `specDirectory` is not
   configured? Fallback options:
   - Use heuristic: first frame NOT in `node_modules/`
   - Use project root (everything is "user code")
   - Skip Tier 2 and fall back to message fingerprinting

5. **Multiple user-code frames in stack**: Should we use only the top frame,
   or could a "call path" (top N user-code frames) give better deduplication?
   E.g., two tests might both fail at `utils.ts:10` but arrive there via
   different call paths. Using just the top frame would over-cluster them.
   Start with top frame only; refine if real-world usage shows over-clustering.

6. **Pre-compute in aggregator vs compute client-side**: The recommendation is
   aggregator (avoids parsing stacks in the browser). But this means the
   clustering dimension is fixed at report generation time — the user can't
   switch between "cluster by leaf" and "cluster by ancestor" without
   re-aggregating. Alternative: ship both keys in `db.json` and let the
   client pick which to group by.
