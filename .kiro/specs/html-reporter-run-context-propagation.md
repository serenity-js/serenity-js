# Spec: Historical Run Context Propagation (NAV-4)

## Status: DESIGN COMPLETE — Ready for implementation

## Problem

When a user selects a historical run via RunSelector (e.g. `#/tests?run=2026-07-27T21:50:50.675Z`) and navigates to another view via the sidebar, the `?run=` parameter is dropped. The new view loads the latest run with no indication that context changed. This breaks the "investigate a historical run across views" workflow.

## Design Constraint

Per the UX architecture ("View Independence"), each view owns its own state. Views never share filter state (search, filter, sort). However, `?run=` is not a filter — it's a **session-level investigation context** ("which build am I looking at?"). It's analogous to a breadcrumb preserving navigation context.

## Design Decision

Propagate `?run=` through sidebar navigation, but **only to views that can consume it**. Views that cannot display historical data must not receive `?run=` — a URL claiming `?run=X` while showing latest data is worse than dropping the parameter.

## View Audit

| View | Supports `?run=` today | Should support it | Effort | Notes |
|------|:---:|:---:|--------|-------|
| Dashboard | No | No | — | Already a cross-run summary; trend chart IS the historical view |
| Tests/Scenarios | ✅ | ✅ | Done | Has RunSelector, shows historical data |
| Scenario Detail | ✅ | ✅ | Done | Navigated to from Tests with `?run=` |
| Errors | ✅ | ✅ | Done | Has RunSelector, shows historical data |
| Consistency | ✅ | ✅ | Done | Inherently cross-run (shows trends) |
| Timeline | No | **Yes** | Low | Activity data is already per-run; just needs run resolution |
| Tags | No | **Yes** | Medium | Per-run tag stats need computing from `scenarios` filtered by run |
| Capabilities | No | **Eventually** | High | Requires per-run capability tree storage or recomputation |

## Implementation Plan

### Phase 1: Enable `?run=` on Timeline and Tags

**Timeline:**
- Data is already per-run (activities with timestamps per scenario)
- Add `?run=` param parsing via `resolveRunIndex()`
- Add RunSelector to the view header
- Filter displayed scenarios to the selected run's data

**Tags:**
- Tag statistics are currently computed from all scenarios in the latest snapshot
- Add `?run=` param parsing
- Add RunSelector to the view header
- When viewing a historical run, recompute tag stats from the historical `scenes` data
- Requires access to per-run scenario outcomes (available in `history[runIndex]` or from stored `db.json`)

### Phase 2: Sidebar propagation

**Route definition extension:**
```typescript
interface RouteDefinition {
    // ... existing fields
    supportsRunContext?: boolean;  // NEW — defaults to false
}
```

**Sidebar link generation:**
- Read current `?run=` from the active route
- When generating sidebar nav links, append `?run=` only to routes where `supportsRunContext: true`
- Routes without support get plain links (no `?run=`)

**Visual feedback:**
- When the sidebar drops `?run=` (navigating from a run-aware view to a non-run-aware view), the RunSelector amber state naturally disappears — this is sufficient feedback
- No toast or notification needed — the absence of RunSelector on the target view communicates "this view doesn't support historical runs"

### Phase 3 (Future): Capabilities historical view

- Requires storing capability tree snapshots per run in `db.json`, or
- Recomputing capability trees from historical `scenes` arrays
- Separate spec when prioritised

## Acceptance Criteria

### Phase 1 — Timeline `?run=`
- [ ] Timeline view accepts `?run=` URL parameter
- [ ] Timeline shows RunSelector when multiple runs exist
- [ ] Selecting a historical run shows that run's scenario timelines
- [ ] Deep link `#/timeline?run=<timestamp>` restores the correct run

### Phase 1 — Tags `?run=`
- [ ] Tags view accepts `?run=` URL parameter
- [ ] Tags shows RunSelector when multiple runs exist
- [ ] Selecting a historical run shows tag statistics for that run
- [ ] Deep link `#/tags?run=<timestamp>` restores the correct run

### Phase 2 — Sidebar propagation
- [ ] Sidebar links to Tests, Errors, Consistency, Timeline, Tags include `?run=` when the current view has one
- [ ] Sidebar links to Dashboard, Capabilities do NOT include `?run=`
- [ ] Navigating away from a historical run to a non-run-aware view does not show stale `?run=` in the URL
- [ ] Route definitions declare `supportsRunContext: true` for run-aware views

## Out of Scope

- Capabilities historical view (separate future spec)
- Global "pinned run" state (rejected — too much architectural departure)
- Toast/notification on context loss (unnecessary given the RunSelector presence/absence signal)

## Test Strategy

- Phase 1: Component tests mounting Timeline/Tags with `?run=` param, asserting correct data displayed
- Phase 2: Integration test navigating from `#/tests?run=X` via sidebar to Errors, asserting `?run=X` is preserved
- Integration test navigating from `#/tests?run=X` to Dashboard, asserting no `?run=` in URL
