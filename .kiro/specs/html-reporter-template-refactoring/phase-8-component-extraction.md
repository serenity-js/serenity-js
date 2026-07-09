
## Progress

| # | Component | Status | Commit |
|---|-----------|--------|--------|
| 8.1 | HistoryDots | ✅ Done | `315ca863d1` |
| 8.2 | OutcomeBadge | ✅ Done | `eeca2ed2df` |
| 8.3 | ResultCount | ✅ Done | `6713f459fc` |
| 8.4 | KpiCard (regular) | ✅ Done | — |
| 8.5 | FilterBar generalisation | ✅ Done | — |
| 8.6 | SortDropdown | ✅ Done (folded into 8.5) | — |
| 8.7 | DashboardKpiCard | ✅ Done | — |

API refinement applied in `82f77b6956`:
- OutcomeBadge: `outcomeClass()` → `outcomeType()`
- ResultCount: removed `ariaLive()` (implementation detail)
- HistoryDots: `outcomeClasses()` + `titles()` → `outcomes()` returning `Array<{type, title}>`
# Phase 8: Component Extraction & Interaction Object Coverage

## Goal

Extract reusable UI widgets from the html-reporter template views, introduce interaction
objects for each, and ensure both component tests and integration tests use those interaction
objects. After each extraction the integration tests must still pass.

## Strategy

Proceed **one component at a time**, completing the full cycle before moving to the next.
Each extraction follows the same four-step pattern. Never extract two components in parallel —
each step builds confidence that the prior extraction didn't break anything.

## The Extraction Cycle

For every component:

```
1. Extract component     → template/components/<Name>.ts
2. Interaction object    → src/<Name>.serenity.ts  (exported via src/serenity.ts)
3. Component test        → spec/components/<Name>.spec.ts
4. Integration wiring    → integration/html-reporter/src/<view>/<View>.ts uses the interaction object
```

### Step 1 — Extract the Preact component

- Identify the repeated markup and move it into `template/components/<Name>.ts`
- The component receives props — no internal state beyond what's needed for rendering
- Add `data-testid="<name>"` on the root element (kebab-case)
- Replace all inline occurrences in the views with the new component import
- Verify the report renders correctly (visual check in browser via `examples/`)

### Step 2 — Create the interaction object

- Create `src/<Name>.serenity.ts`
- Constructor accepts `Answerable<PageElement<NET>>` (the component's root element)
- Internal locators use `.of(this.rootElement)` for scoping
- Expose **Questions** (read state) and **Tasks** (perform actions) as instance methods
- Add the export to `src/serenity.ts`

### Step 3 — Write the component test

- Create `spec/components/<Name>.spec.ts`
- Use the `mount` fixture with `interactionObject: <Name>`
- All assertions via `Ensure.that(...)` — no `expect().to*()` style
- Test observable behaviour: rendered text, ARIA attributes, click effects
- No `data` / `dataAsProps` unless the component is a view-level component

### Step 4 — Wire into integration tests

- In `integration/html-reporter/src/`, the relevant view interaction object instantiates
  the new widget's interaction object, scoped via `[data-testid="<name>"]` within its own root
- The integration test spec uses the view's methods (which delegate to the widget)
- Run: `npx playwright test` in the integration/html-reporter directory
- All integration tests must pass before proceeding to the next extraction

### Verification gate

After each complete cycle:

```bash
# Component tests
cd packages/html-reporter && npx playwright test spec/components/<Name>.spec.ts

# All component tests
cd packages/html-reporter && npx playwright test

# Integration tests
cd integration/html-reporter && npx playwright test

# Type-check
cd packages/html-reporter && npx tsc --noEmit --project tsconfig.spec.json
cd integration/html-reporter && npx tsc --noEmit
```

All four must pass before committing and moving to the next component.

## Interaction Object Design

Interaction objects serve **both** component tests and integration tests. The same class
is used in two contexts:

| Context          | Root element source                                                      | Scope                     |
|------------------|--------------------------------------------------------------------------|---------------------------|
| Component test   | `mount` fixture provides `#app > *`                                      | Isolated single component |
| Integration test | View interaction object locates `[data-testid="<name>"]` within its root | Full report page          |

This dual-use is what makes the pattern valuable: one interaction object definition,
two levels of testing confidence.

### Constructor convention

```typescript
export class MyWidget<NET> {
    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }
}
```

Always `Answerable<PageElement<NET>>` — this accepts `PageElement.located(...)` results
(which are `MetaQuestionAdapter`, i.e. `Question<Promise<PageElement>>`).

### Scoping convention

```typescript
private someChild = () =>
    PageElement.located(By.css('.child-class'))
        .of(this.rootElement)
        .describedAs('child element');
```

All locators are scoped via `.of(this.rootElement)`. Never use global selectors.

### Integration object hierarchy

```
Fixture creates view interaction object:
    PageElement.located(By.css('[data-testid="consistency"]')) → ConsistencyView

View interaction object creates widget interaction objects:
    PageElement.located(By.css('[data-testid="search-input"]')).of(this.rootElement) → SearchInput
    PageElement.located(By.css('[data-testid="history-dots"]')).of(this.rootElement) → HistoryDots
```

## Extraction Order

Ordered by: self-containedness → duplication count → testability → risk.

### 8.1 — HistoryDots

| Aspect            | Detail                                                                |
|-------------------|-----------------------------------------------------------------------|
| Duplicated in     | `ScenarioRow.ts`, `ConsistencyRow.ts`, `DashboardView.ts`             |
| Props             | `entries: Array<{outcome: string, label?: string}>`, `max?: number`   |
| data-testid       | `history-dots`                                                        |
| Behaviour to test | Renders correct number of dots, correct outcome classes, respects max |

**Why first:** Smallest extraction, zero interactivity, pure rendering. Proves the pattern end-to-end with minimal risk.

### 8.2 — OutcomeBadge

| Aspect            | Detail                                                                                                             |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Duplicated in     | `ScenarioRow`, `ErrorRow`, `ConsistencyRow`, `TimelineView`, `ScenarioDetailView`, `DashboardView`, `TestRunsView` |
| Props             | `outcome: string`, `size?: 'sm'                                                                                    | 'md' | 'lg'` |
| data-testid       | `outcome-badge`                                                                                                    |
| Behaviour to test | Correct icon text, correct CSS class for outcome, size variant                                                     |

**Why second:** Trivial widget, 7+ duplications, no interactivity. High confidence from extraction.

### 8.3 — ResultCount

| Aspect            | Detail                                                               |
|-------------------|----------------------------------------------------------------------|
| Duplicated in     | `ScenariosView`, `ConsistencyView`, `ErrorsView`, `CapabilitiesView` |
| Props             | `showing: number`, `total: number`, `label: string`                  |
| data-testid       | `result-count`                                                       |
| Behaviour to test | Displays "Showing X of Y <label>", has `aria-live="polite"`          |

**Why third:** Small, accessibility-important (standardises inconsistent ARIA usage), 4 duplications.

### 8.4 — KpiCard (regular)

| Aspect            | Detail                                                                         |
|-------------------|--------------------------------------------------------------------------------|
| Duplicated in     | `TimelineView` (4 cards), `ErrorsView` (dynamic summary cards)                 |
| Props             | `label`, `value`, `subtitle?`, `valueColor?`, `ariaLabel`                      |
| data-testid       | `kpi-card`                                                                     |
| Behaviour to test | Renders label/value/subtitle, correct aria-label, optional value colour        |

**Why fourth:** 8+ instances of simple informational cards with identical structure. Clean extraction —
no children slots, no click behaviour, no variant classes.

**Scope:** Only the simple display cards in TimelineView and ErrorsView. The Dashboard cards are a
separate composite widget (see 8.7) with embedded sparklines, deltas, navigation, and variant classes.

### 8.5 — FilterBar generalisation

| Aspect            | Detail                                                                  |
|-------------------|-------------------------------------------------------------------------|
| Currently         | `FilterBar.ts` exists but hardcodes outcome semantics                   |
| Duplicated in     | `ConsistencyView` (inline), `CapabilitiesView` (local function)         |
| Props             | `filters: Array<{key, label, count, active}>`, `onToggle`, sort options |
| data-testid       | `filter-bar` (already exists on current FilterBar)                      |
| Behaviour to test | Chip toggling, active state, sort selection, counts display             |

**Why fifth:** Larger refactoring — requires generalising an existing component, updating its call sites, and ensuring
three views still work. Higher risk, higher reward.

### 8.6 — SortDropdown (extracted from FilterBar generalisation)

| Aspect            | Detail                                                               |
|-------------------|----------------------------------------------------------------------|
| Currently         | Inline in ConsistencyView, CapabilitiesView, and part of FilterBar   |
| Props             | `options: Array<{key, label}>`, `value`, `onChange`, `id?`, `label?` |
| data-testid       | `sort-dropdown`                                                      |
| Behaviour to test | Displays options, triggers onChange on selection                     |

**Why sixth:** Natural sub-extraction that falls out of the FilterBar generalisation. May be done as part of 8.5.

### 8.7 — DashboardKpiCard

| Aspect            | Detail                                                                                        |
|-------------------|-----------------------------------------------------------------------------------------------|
| Duplicated in     | `DashboardView` only (6 cards: hero, pass rate, consistency, completeness, failed, duration)  |
| Props             | `label`, `value`, `ariaLabel`, `onClick`, `valueColor?`, `variant?`, `children`               |
| data-testid       | `dashboard-kpi-card`                                                                          |
| Behaviour to test | Renders label/value, click triggers navigation, variant classes, children slot (Delta, etc.)   |

**Why last:** Single call site (DashboardView), high complexity — cards embed sparklines, Delta components,
DotTrend charts, and computed subtitles. The primary value here is the **interaction object**, which
enables structured integration testing of the Dashboard KPI row without brittle CSS selectors.

The component itself is a thin wrapper: `<button>` with `kpi-card` class, `aria-label`, a label/value
pair, and a `children` slot for the embedded charts and deltas. The variant prop controls `--hero` / `--operational`
class modifiers.

## Commit Convention

Each extraction cycle produces one commit:

```
feat(html-reporter): extract <ComponentName> component and interaction object
```

If the integration test wiring is substantial, it may be a second commit:

```
test(html-reporter): wire <ComponentName> interaction object into integration tests
```

## Reference Implementation

The `SearchInput` extraction is the reference for this entire phase:

| Artefact              | File                                                           |
|-----------------------|----------------------------------------------------------------|
| Preact component      | `template/components/SearchInput.ts`                           |
| Interaction object    | `src/SearchInput.serenity.ts`                                  |
| Export barrel         | `src/serenity.ts`                                              |
| Component test        | `spec/components/SearchInput.spec.ts`                          |
| Integration wiring    | `integration/html-reporter/src/consistency/ConsistencyView.ts` |
| Test fixtures         | `spec/components/fixtures.ts` (mount + interactionObject)      |
| Pattern documentation | `spec/components/README.md`                                    |

Follow this implementation exactly for each subsequent extraction.
