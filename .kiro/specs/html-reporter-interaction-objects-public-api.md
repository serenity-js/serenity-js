# Spec: Publish HTML Reporter Interaction Objects as Public API

## Context

The `@serenity-js/html-reporter` package exports interaction objects (Screenplay Pattern
Page Object equivalents) for testing the HTML report UI. These could serve as:

1. **A reference implementation** showing how to write interaction objects following
   the patterns in `.kiro/steering/idiomatic-screenplay-tests.md`
2. **A public API for contributors** who want to extend, embed, or customise the report viewer
3. **Documentation examples** for the Serenity/JS community showing idiomatic Screenplay Pattern
   component testing with Playwright

## Exported Interaction Objects

From `src/serenity.ts`:

### Base

| Class | File | Purpose |
|-------|------|---------|
| `InteractionObject<NET>` | `common/InteractionObject.serenity.ts` | Base class: rootElement, child(), children(), isPresent() |
| `InteractionObjectOptions` | `common/InteractionObject.serenity.ts` | Options interface (mobile flag) |

### Common Widgets

| Class | Purpose |
|-------|---------|
| `FilterBar` | Toggle filter chips (outcome-based filtering) |
| `HistoryDots` | Execution history dot strip (pass/fail pattern across runs) |
| `KpiCard` | Key Performance Indicator card (clickable metric display) |
| `Navigation` | Sidebar navigation and view switching |
| `OutcomeBadge` | Outcome icon + label badge |
| `RestQueryPanel` | Collapsible HTTP request/response panel |
| `ResultCount` | Result count display (e.g., "42 scenarios") |
| `SearchInput` | Text search input with clear affordance |

### View-Level Interaction Objects

| Class | Report View |
|-------|-------------|
| `AboutView` | About / System Information view |
| `SystemContextView` | System context details (Node, OS, CI) |
| `CapabilitiesView` | Requirements hierarchy tree + README panels |
| `ConsistencyView` | Flaky/degraded/recovered test list |
| `DashboardView` | Dashboard with KPIs, trend chart, consistency summary |
| `ErrorsView` | Error clustering view |
| `ScenariosView` | Test scenario list with search + filters |
| `ScenarioDetailView` | Individual scenario detail (activity tree, evidence) |
| `TagsView` | Tag-based grouping view |
| `TestRunsView` | Historical test runs list |
| `TimelineView` | Execution timeline visualisation |

### Item-Level Interaction Objects

| Class | Purpose |
|-------|---------|
| `ActivityItem` | Single activity node in an activity tree |
| `ScenarioItem` | Single scenario row in the scenarios list |
| `DashboardKpiCard` | KPI card specific to the dashboard view |
| `ErrorBlock` | Error display block (message + stack trace) |

## Completed Work

### JSDoc documentation (done)

All 25 interaction object files have comprehensive JSDoc covering:

- **Class-level:** philosophy, what the IO represents, instantiation, fixture wiring, integration test usage
- **Method-level:** every public method has its own JSDoc with `## Example` section showing it in context
- **`@group Interaction Objects`** on every class
- **`@param`** annotations in multi-line format matching Serenity/JS conventions
- **`{@link}`** cross-references between composed IOs
- **Base class** documents the full pattern: philosophy (modelling consumer-observable state and actions declaratively), composition hierarchy, PEQL scoping, Optional interface, and a "create your own" example

Verified: 362 component tests pass, `npx tsc --noEmit` clean.

### `@package` annotations removed (done)

The `src/serenity.ts` entrypoint is not included in the API docs configuration,
so `@package` annotations are unnecessary and were removed.

## Remaining Work

### 1. Expose in API docs

Wire `src/serenity.ts` (or its individual exports) into the API documentation generation
so that the `Interaction Objects` group appears on serenity-js.org/api/html-reporter/.

### 2. Handbook page

Write a handbook page (serenity-js.org) explaining:
- Why interaction objects exist (encapsulation, reusability, composition)
- The composition hierarchy (View → Widget → Item)
- How to write a custom interaction object for your own app
- How to use the HTML Reporter's interaction objects as a reference

### 3. Public contract review

Before publishing to the API docs, decide:
- Should `InteractionObjectOptions` (mobile flag) be part of the public type export,
  or should it remain constructor-only?
- Should `Navigation` be a standalone export or only accessible via views?
- Should child interaction objects (e.g., `ScenariosView.filterBar`) remain as `readonly`
  public fields, or should they only be accessible via delegating methods?

## Acceptance Criteria

- [x] All exported interaction objects have comprehensive JSDoc
- [x] Usage examples compile and run correctly
- [ ] A handbook section explains the interaction object pattern
- [x] `@group Interaction Objects` annotations create a clear category in the API docs
- [x] The base `InteractionObject` class documents the contract
- [x] At least one complete "how to write your own" example in the base class JSDoc
- [x] Mobile-specific API (if exposed) is clearly documented
- [x] `src/serenity.ts` entrypoint wired into API docs generation (live at serenity-js.org/api/html-reporter-serenity/)
- [ ] Public contract review completed

## Priority

Non-blocking for initial release. Handbook page and API docs exposure can be published
in a follow-up minor version.

## Related

- `.kiro/steering/idiomatic-screenplay-tests.md` — interaction object conventions
- `.kiro/steering/html-reporter-architecture.md` — component patterns section
- `packages/html-reporter/src/serenity/` — source files
- `packages/html-reporter/spec/app/` — existing component tests using these interaction objects
