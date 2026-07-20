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

## Future Exploration: Common Failing Ancestor Task

Serenity/JS activity trees are nested — tasks compose other tasks and interactions. This
creates an opportunity for a more powerful clustering dimension: **common failing ancestor**.

### Example

Test 1:
```
- task T1.1
  - task T1.2
    - task T1.3
      - task T1.4
        - activity A1
        - activity A2  → Error
```

Test 2:
```
- task T2.1
  - task T2.2
    - task T1.3
      - task T1.4
        - activity A1
        - activity A2  → Error
```

The deepest failing leaf (`activity A2`) is the same in both — that's what the "Failing
step" dimension would group on. But the **common failing ancestor** is `T1.3`, which is
the business-meaningful task that wraps the actual failure point.

### Why this is valuable

- The deepest leaf is often a generic interaction (`Ensure.that(...)`, `Click.on(...)`)
  that appears in many unrelated tests
- The ancestor task carries business meaning ("Authenticate", "Complete checkout",
  "Verify dashboard loads") which tells the user *what workflow* is broken
- Two tests that share `T1.3 → T1.4 → A2` as a sub-tree are very likely failing for the
  same root cause, even if their top-level task names differ entirely

### Algorithm sketch

For each pair of failing scenarios:
1. Walk both activity trees to find the failing leaf path (ancestors → leaf)
2. Compare paths bottom-up to find the longest common suffix
3. The topmost node of the common suffix is the "common failing ancestor"

For grouping N scenarios:
1. Compute the failing path for each scenario (list of activity names from root to leaf)
2. Group by longest common suffix (greedy: start with pairs, merge into clusters)
3. Label each cluster with its common ancestor task name

### Considerations

- This requires comparing activity names across scenarios — could be expensive for large
  reports (>500 failures), but in practice failure count is usually small
- The algorithm is a variant of longest common suffix on sequences of strings
- Actor names prefix task descriptions (`Alice attempts to...`) — these must be stripped
  before comparison to avoid false negatives across actors
- Parameterised values in task names (e.g., `Navigate to "https://..."`) need
  normalisation to cluster correctly

### Verdict

Worth exploring as a v2 enhancement to the "Failing step" dimension. The v1 (deepest
leaf only) ships first because it requires no cross-scenario comparison. The ancestor
algorithm can be added later as a refinement that produces better cluster labels.
