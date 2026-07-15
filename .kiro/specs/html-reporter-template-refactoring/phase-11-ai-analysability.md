# Phase 11: AI Analysability Improvements

## Goal

Make the HTML report easier for AI agents (and automation tools) to triage failures by
reducing the cognitive/parsing effort needed to go from "N failures" to "M distinct root
causes." The improvements also benefit human users — faster scanning, better progressive
disclosure in list views.

## Motivation

Feedback from an AI agent analysing the live report at
`https://serenity-js.github.io/serenity-js/#/tests?filter=failed` identified that 12
failure rows represented only 2 distinct bugs × 3 viewports. The bottleneck was
pattern-matching across rows to deduplicate — something the report's data model already
supports but the presentation layer doesn't surface.

## Workstream A: Scenario Row Enrichment (app/)

Enrich the scenario list row to show more diagnostic information without click-through.

### A1. Structured expected/received in error summary

Instead of a single truncated error string, render the error with structured fields when
an assertion error is detected:

```
Expected: contain('End-to-End Flows')
Received: ['authentication', 'checkout', 'todo', 'e2e']
```

Detection: assertion errors already carry `expected` and `actual` fields in the domain
model (`AssertionError`). Surface them as distinct visual elements in the row's error
block (e.g., two `<code>` blocks with labels, or a mini diff).

### A2. Failing activity indicator

Show the name of the activity that failed directly in the scenario row:

```
✗ Payment checkout  ·  Failed at: Serena ensures that total equals "£42.00"  ·  1.2s
```

Implementation: the `db.json` activity tree already marks which node failed. Walk the tree
to find the deepest failed leaf and display its description in the row.

### A3. "Failing since" badge

When execution history is available, show which run first introduced the failure:

```
✗ Payment checkout  ·  failing since #8282  ·  1.2s
```

Implementation: the consistency data (`executionHistory` array) already has per-run
outcomes. Find the first contiguous failing run from the end of the history and display
its run number.

### A4. Failure cluster indicator

When multiple scenarios share the same error fingerprint, indicate the cluster size:

```
✗ Payment checkout  ·  1 of 6 with this error  ·  1.2s
```

Implementation: compute error fingerprints (error type + message, ignoring stack traces
and ANSI codes) across all failed scenarios, then annotate each row with its cluster
membership.

## Workstream B: Error Grouping in Tests View (app/)

### B1. "Group by error" toggle

Add a view mode to the Tests view (alongside the existing sort/filter controls) that
collapses scenarios sharing the same error fingerprint into grouped rows:

```
┌─ AssertionError: Expected child capability names to contain "End-to-End Flows"  (3 scenarios)
│   ✗ capability-health / desktop
│   ✗ capability-health / tablet
│   ✗ capability-health / mobile
└─
┌─ ListItemNotFoundError: Can't retrieve the first item from a list with 0 items  (9 scenarios)
│   ✗ living-documentation / readme link (desktop)
│   ...
└─
```

Error fingerprinting logic: normalise the error message by stripping:
- ANSI escape sequences
- Absolute file paths (keep filename + line only)
- Numeric values that vary per run (timestamps, ports)

This gives stable grouping across runs.

## Workstream C: Machine-Readable Summary (cli/)

### C1. Structured summary block in HTML

Inject a `<script type="application/json" id="report-summary">` block into the generated
HTML containing a pre-computed failure summary:

```json
{
  "generated": "2026-07-15T10:00:00Z",
  "totals": { "passed": 64, "failed": 12, "pending": 2, "skipped": 0 },
  "failureClusters": [
    {
      "errorType": "AssertionError",
      "message": "Expected child capability names to contain \"End-to-End Flows\"",
      "expected": "contain('End-to-End Flows')",
      "received": "['authentication', 'checkout', 'todo', 'e2e']",
      "scenarios": [
        {
          "name": "capability-health / desktop",
          "source": "capability-health.spec.ts:24",
          "failingSince": "#8282",
          "failingStep": "Serena ensures that child capability names does contain \"End-to-End Flows\""
        }
      ]
    }
  ]
}
```

This is generated at report-build time by the `HtmlReportGenerator` (cli/ code), not
computed at runtime in the browser. It's a one-way projection of `db.json` data optimised
for machine consumption.

### C2. Relative source paths

Strip common path prefixes from stack traces at report generation time:

- Detect the common prefix across all source locations in the test run
- Store both `absolutePath` and `relativePath` in the data model
- Render `relativePath` in the UI; keep `absolutePath` available for copy-to-clipboard

Implementation location: `TestRunArchiver` or `HtmlReportGenerator` when writing `db.json`.

## Workstream D: Interaction Objects (serenity/)

Each new UI element introduced in workstreams A and B needs interaction object coverage.

### D1. ScenarioRow enrichment

Extend the `ScenarioItem` interaction object:
- `failingStep()` → Question<string> — the failing activity description
- `failingSince()` → Question<string | undefined> — run number where failure started
- `clusterSize()` → Question<number | undefined> — how many scenarios share this error
- `expected()` → Question<string | undefined> — structured expected value
- `received()` → Question<string | undefined> — structured received value

### D2. Error grouping

Add to `ScenariosView` interaction object:
- `groupByError()` → Task — activate the error grouping toggle
- `errorGroups()` → Question<Array<{message, count}>> — grouped error summaries
- `errorGroupCalled(message).scenarios()` → Question<string[]> — scenarios in a group

## Dependencies

- Phase 9 must be complete (package layout finalised, interaction objects in `serenity/`)
- Error fingerprinting logic should be shared between the Preact app (B1) and the CLI
  summary generator (C1) — place it in a `shared/` utilities module within the package

## Non-Goals

- This phase does NOT add a new "Errors" view (that already exists)
- This phase does NOT change the data model of `db.json` (C1 adds a summary alongside it,
  C2 adds a computed field — both are additive)
- This phase does NOT introduce new npm dependencies

## Acceptance Criteria

- [ ] A1: Scenario rows show structured expected/received when the error is an assertion error
- [ ] A2: Scenario rows show the failing activity name
- [ ] A3: Scenario rows show "failing since #N" when history is available
- [ ] A4: Scenario rows show cluster membership when >1 scenario shares the error
- [ ] B1: Tests view has a "Group by error" mode that collapses matching failures
- [ ] C1: Generated HTML contains `<script id="report-summary">` with failure clusters
- [ ] C2: Stack traces show relative paths; full paths available on copy
- [ ] D1: `ScenarioItem` interaction object exposes new questions with component tests
- [ ] D2: `ScenariosView` interaction object exposes grouping tasks/questions with component tests
- [ ] All existing integration tests continue to pass (no regression)

## Ordering

Within phase 10, the natural ordering is:

1. **C2** (relative paths) — smallest, most isolated, immediate value
2. **A1** (structured expected/received) — data already available, render change only
3. **A2** (failing step) — requires tree traversal logic, reusable in C1
4. **A3** (failing since) — requires history computation, reusable in C1
5. **A4** (cluster indicator) — requires fingerprinting, needed for B1
6. **B1** (group by error) — builds on fingerprinting from A4
7. **C1** (machine-readable summary) — builds on all of the above
8. **D1 + D2** (interaction objects) — parallel with each UI piece, but captured last here
   because in practice each IO is written alongside its component (test-first)

## Status

Not started. Blocked on phase 10 completion.
