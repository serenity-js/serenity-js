# Spec: Publish HTML Reporter Interaction Objects as Public API

## Context

The `@serenity-js/html-reporter` package exports interaction objects (Screenplay Pattern
Page Object equivalents) for testing the HTML report UI. These are currently marked `@package`
(internal) but could serve as:

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

## Requirements for Making Public

### 1. Comprehensive JSDoc on each interaction object

Each class needs:
- What report component it represents (with screenshot reference if helpful)
- How to instantiate it (what root element to pass, required constructor args)
- Available **Questions** (what you can observe) — listed as a table or bullet list
- Available **Tasks** (what actions you can perform) — listed as a table or bullet list
- A complete usage example in a component test

Example:
```typescript
/**
 * Represents the Test Scenarios view in the HTML report.
 *
 * ## Questions (observable state)
 * - {@link ScenariosView.scenarioCount | scenarioCount()} — number of visible scenarios
 * - {@link ScenariosView.scenarioNames | scenarioNames()} — names of visible scenarios
 *
 * ## Tasks (user actions)
 * - {@link ScenariosView.open | open()} — navigates to the Scenarios view
 * - {@link ScenariosView.find | find(term)} — searches for scenarios by name
 * - {@link ScenariosView.selectFilter | selectFilter(label)} — activates a filter chip
 *
 * ## Example
 *
 * ```ts
 * const scenariosView = new ScenariosView(
 *   PageElement.located(By.css('[data-testid="scenarios-view"]'))
 * );
 *
 * await actor.attemptsTo(
 *   scenariosView.open(),
 *   scenariosView.find('checkout'),
 *   Ensure.that(scenariosView.scenarioCount(), equals(3)),
 * );
 * ```
 *
 * @group Interaction Objects
 */
```

### 2. Base class documentation

The `InteractionObject` base class needs documentation explaining:
- The pattern (encapsulates a root element and provides scoped child lookups)
- The contract: `rootElement`, `child()`, `children()`, `isPresent()`
- How it implements `Optional` for presence assertions
- How to extend it for custom interaction objects
- Naming conventions (Questions = nouns, Tasks = verbs)

### 3. `@group` annotation

Use `@group Interaction Objects` for all classes in this category. This creates a distinct
section in the API docs separate from the `Stage` group (crew members).

### 4. Handbook page or guide

A handbook page showing:
- Why interaction objects exist (encapsulation, reusability, composition)
- The composition hierarchy (View → Widget → Item)
- How to write a custom interaction object for your own app
- How to use the HTML Reporter's interaction objects as a reference

### 5. Public contract review

Before publishing, review whether:
- `InteractionObjectOptions` (mobile flag) should be public — it's an implementation detail
  of responsive testing. Consider making it constructor-only (not part of the type export).
- The `Navigation` class should be a standalone export or only accessible via views.
- Child interaction objects (e.g., `ScenariosView.filterBar`) should be `readonly` public
  fields or accessible only via delegating methods.

## Value Proposition

- **Community reference** — demonstrates idiomatic Screenplay Pattern interaction objects
  that teams can study and adapt for their own projects
- **Extensibility** — enables teams customising the HTML report to write proper component tests
- **Dogfooding** — the same patterns recommended in the handbook are used internally
- **Living documentation** — the interaction objects ARE the documentation of the report's
  observable behaviour

## Acceptance Criteria

- [ ] All exported interaction objects have comprehensive JSDoc
- [ ] Usage examples compile and run correctly
- [ ] A handbook section explains the interaction object pattern
- [ ] `@group Interaction Objects` annotations create a clear category in the API docs
- [ ] The base `InteractionObject` class documents the contract
- [ ] At least one complete "how to write your own" example in the handbook
- [ ] Mobile-specific API (if exposed) is clearly documented

## Priority

Non-blocking for initial release. Can be published in a follow-up minor version.
The `@package` annotations prevent these from appearing in public API docs until ready.

## Related

- `.kiro/steering/idiomatic-screenplay-tests.md` — interaction object conventions
- `.kiro/steering/html-reporter-architecture.md` — component patterns section
- `packages/html-reporter/src/serenity/` — source files
- `packages/html-reporter/spec/app/` — existing component tests using these interaction objects
