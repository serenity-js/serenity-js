# Writing Idiomatic Serenity/JS Tests

This document captures patterns for writing expressive, maintainable Serenity/JS tests using the Screenplay Pattern.
It focuses on the **test-writing** side — how to compose interactions, questions, and assertions idiomatically — rather
than how to implement new Screenplay Pattern components (covered in `screenplay-pattern.md`).

## Principles

### Tests describe user behaviour, not implementation

A test should read as a description of what a user does and what they observe. Implementation details —
CSS selectors, DOM structure, timing mechanisms — are encapsulated in interaction objects (Screenplay-native
Page Objects).

```typescript
// Good — describes what the user does
await actor.attemptsTo(
    scenariosView.find('expired card'),
    scenariosView.selectFilter('Failed'),
    Ensure.that(scenariosView.scenarioCalled('Payment should reject an expired card').outcome(), equals('FAILURE')),
);

// Bad — exposes implementation details in the test
await actor.attemptsTo(
    Enter.theValue('expired card').into(PageElement.located(By.css('.search-input'))),
    Click.on(PageElement.located(By.css('button.filter-chip.failed'))),
    Ensure.that(Text.of(PageElement.located(By.css('.scenario-item .outcome-badge'))), equals('FAILURE')),
);
```

### Prefer declarative PEQL over imperative element manipulation

The Page Element Query Language (PEQL) provides declarative filtering, mapping, and composition.
Use it instead of imperative loops, manual element iteration, or procedural attribute extraction.

### Interaction objects represent user-observable behaviour

An interaction object's public API should mirror what a user can **see** and **do** — not what the DOM contains.
Method names describe the user's perspective, not the technical implementation.

### Tests interact with views, not with view internals

Tests call view-level methods. Never reach into child interaction objects from a test:

```typescript
// ✓ Good — view-level action
await actor.attemptsTo(
    scenariosView.selectFilter('Failed'),
);

// ✗ Bad — reaches into internal composition
await actor.attemptsTo(
    scenariosView.filterBar.selectFilter('Failed'),
);
```

The view exposes delegating methods for any child behaviour that tests need. Child interaction
objects remain accessible for **component tests** that exercise the interaction object API directly,
but integration tests never use them.

### Name constants after their role, not their content

When test data values are repeated, extract them into constants named after their **purpose in the
test**, not the string they contain:

```typescript
// ✓ Good — describes why this scenario matters in the test
const failingTest = 'Payment should reject an expired card';
const degradedTest = 'Completion should complete an item';
const timeoutTest = 'Login should display a timeout error when the server is slow';

// ✗ Bad — restates the string content as a variable name
const expiredCardScenario = 'Payment should reject an expired card';
const completeItemScenario = 'Completion should complete an item';
```

When constants are shared across multiple spec files, extract them to a shared module:
```typescript
// src/scenarios.ts
export const failingTest = 'Payment should reject an expired card';
export const degradedTest = 'Completion should complete an item';
```

## Interaction Object Design

### Structure

```typescript
export class ScenariosView<NET> extends InteractionObject<NET> {

    // Composed child interaction objects — public, for direct access in component tests
    readonly searchInput: SearchInput<NET>;
    readonly filterBar: FilterBar<NET>;

    constructor(rootElement: Answerable<PageElement<NET>>, private readonly navigation: Navigation) {
        super(rootElement);
        this.searchInput = new SearchInput(this.child(By.css('[data-testid="search-input"]')));
        this.filterBar = new FilterBar(this.child(By.css('[data-testid="filter-bar"]')));
    }

    // Questions — what the user observes (nouns)
    scenarioCount = (): QuestionAdapter<number> =>
        this.scenarioItems().count().describedAs('number of scenarios');

    // Parameterised access — find an item the user can identify
    scenarioCalled = (name: string): ScenarioItem<NET> => { ...
    };

    // Tasks — what the user does (verbs)
    open = (): Task =>
        Task.where('#actor opens the Scenarios view',
            this.navigation.openView('Test Scenarios'),
        );

    find = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${ searchTerm }`,
            this.searchInput.enter(searchTerm),
        );

    // Delegating methods — expose child behaviour at the view level for integration tests
    selectFilter = (label: Answerable<string>): Task =>
        this.filterBar.selectFilter(label);
}
```

### Naming conventions

| Kind                          | Convention                 | Examples                                                       |
|-------------------------------|----------------------------|----------------------------------------------------------------|
| **Questions** (observe state) | Nouns or adjective phrases | `outcome()`, `name()`, `isPresent()`, `scenarioCount()`        |
| **Tasks** (perform actions)   | Verbs or verb phrases      | `open()`, `find(term)`, `viewDetails()`, `selectFilter(label)` |
| **Parameterised locators**    | `thingCalled(name)`        | `scenarioCalled('checkout')`, `kpiCardCalled('Pass Rate')`     |
| **Child interaction objects** | Noun fields                | `searchInput`, `filterBar`, `errorBlock()`                     |

### Locators are private

Tests never see CSS selectors, `data-testid` values, or DOM structure. All locators live inside the
interaction object as private methods:

```typescript
// Private — locates elements within the interaction object's scope
private
chips = () =>
    PageElements.located(By.css('.filter-chip'))
        .of(this.rootElement)
        .describedAs('filter chips');

// Public — exposes user-meaningful API
filterLabels = (): Question<Promise<string[]>> =>
    this.chips()
        .eachMappedTo(Text.of(this.chipLabel()))
        .describedAs('filter chip labels');
```

### Use semantic identifiers in the DOM

When an element is hard to identify, prefer (in order):

1. **Semantic HTML** — `role`, `aria-label`, `aria-pressed`
2. **`data-testid`** — for elements with no semantic role
3. **`data-*` attributes** — for observable state (`data-outcome="SUCCESS"`)

Avoid:

- CSS class parsing (`classList.includes('active')`)
- Positional selectors (`:nth-child(3)`)
- CSS hacks (`span:not(.count)`)

When the component lacks a suitable identifier, **add one to the component source** rather than
using a fragile selector in the interaction object.

## Idiomatic Patterns

### 1. Text retrieval — use the fluent chain

```typescript
// ✓ Idiomatic — concise, declarative
label = (): QuestionAdapter<string> =>
    this.labelElement().text().trim()
        .describedAs('KPI card label');

// ✗ Avoid — unnecessarily imperative
label = (): Question<Promise<string>> =>
    Question.about('KPI card label', async actor => {
        const element = await actor.answer(this.labelElement());
        return (await element.text()).trim();
    });
```

### 2. Attribute retrieval — use `Attribute.called()`

```typescript
// ✓ Idiomatic
outcome = (): QuestionAdapter<string> =>
    Attribute.called('data-outcome').of(this.outcomeBadge())
        .describedAs('scenario outcome');

accessibleLabel = (): QuestionAdapter<string> =>
    Attribute.called('aria-label').of(this.rootElement)
        .describedAs('KPI card accessible label');

// ✗ Avoid — imperative attribute extraction
outcome = (): Question<Promise<string>> =>
    Question.about('outcome', async actor => {
        const el = await actor.answer(this.outcomeBadge());
        return (await el.attribute('data-outcome')) || '';
    });
```

### 3. Finding and clicking elements — use PEQL `.where()` + `Click.on()`

```typescript
// ✓ Idiomatic — declarative filter + click
selectFilter = (label: Answerable<string>): Task =>
    Task.where(the`#actor selects the "${ label }" filter`,
        Click.on(this.chips()
            .where(Text.of(this.chipLabel()), includes(label))
            .first()
            .describedAs(the`filter chip "${ label }"`)
        ),
    );

// ✗ Avoid — imperative loop to find and click
selectFilter = (label: Answerable<string>): Interaction =>
    Interaction.where(the`#actor selects the "${ label }" filter`, async actor => {
        const labelText = await actor.answer(label);
        const elements = await actor.answer(this.chips());
        for (const element of elements) {
            if ((await element.text()).includes(labelText)) {
                await element.click();
                return;
            }
        }
    });
```

### 4. Mapping collections — use `eachMappedTo()`

When you need to extract structured data from a list of elements, define a MetaQuestion class
and use `.eachMappedTo()`:

```typescript
// MetaQuestion class — maps a single element to structured data
class HistoryDotOutcome {
    static of = <NET>(dot: PageElement<NET>) =>
        Question.fromObject({
            type: Attribute.called('data-outcome').of(dot),
            title: Attribute.called('title').of(dot),
        }).describedAs('history dot outcome');
}

// Usage — map the collection declaratively
outcomes = (): Question<Promise<HistoryDotEntry[]>> =>
    this.dots()
        .eachMappedTo(HistoryDotOutcome)
        .describedAs('outcomes of history dots');
```

For simple text extraction from a collection:

```typescript
// ✓ Idiomatic — eachMappedTo with Text meta-question
scenarioNames = (): Question<Promise<string[]>> =>
    this.children(By.css('.scenario-name'))
        .eachMappedTo(Text)
        .describedAs('scenario names');

// ✗ Avoid — imperative loop
scenarioNames = (): Question<Promise<string[]>> =>
    Question.about('scenario names', async actor => {
        const elements = await actor.answer(this.children(By.css('.scenario-name')));
        const names: string[] = [];
        for (const el of elements) {
            names.push((await el.text()).trim());
        }
        return names;
    });
```

### 5. Filtering collections — use `.where()` with expectations

```typescript
// Filter by attribute value
activeFilters = (): Question<Promise<string[]>> =>
    this.chips()
        .where(Attribute.called('aria-pressed'), equals('true'))
        .eachMappedTo(Text.of(this.chipLabel()))
        .describedAs('active filter labels');

// Filter by text content (substring match)
scenarioCalled = (name: string): ScenarioItem<NET> => {
    const matchingItem = this.children(By.css('.scenario-item'))
        .where(Text.of(PageElement.located(By.css('.scenario-name'))), includes(name))
        .first()
        .describedAs(`scenario called "${ name }"`);
    return new ScenarioItem(matchingItem);
};
```

### 6. Performing actions — use `Task.where()` with composed activities

```typescript
// ✓ Idiomatic — Task wrapping standard Interactions
viewDetails = (): Task =>
    Task.where('#actor views scenario details',
        Click.on(this.rootElement),
    );

// ✓ Idiomatic — composing sub-tasks
open = (): Task =>
    Task.where('#actor opens the Scenarios view',
        this.navigation.openView('Test Scenarios'),
    );

// ✗ Avoid — Interaction.where with imperative body
viewDetails = (): Interaction =>
    Interaction.where('#actor views scenario details', async actor => {
        const element = await actor.answer(this.rootElement);
        await element.click();
    });
```

Use `Interaction.where()` only when wrapping a **single action** that has no existing Serenity/JS
interaction (e.g., calling a custom Ability method). For anything involving web elements, prefer
the existing `Click.on()`, `Enter.theValue()`, `Press.the()` interactions.

### 7. Value retrieval — use `Value.of()`

```typescript
// ✓ Idiomatic
selectedSort = (): QuestionAdapter<string> =>
    Value.of(this.sortSelect())
        .describedAs('selected sort option');

// ✗ Avoid
selectedSort = (): Question<Promise<string>> =>
    Question.about('selected sort option', async actor => {
        const select = await actor.answer(this.sortSelect());
        return (await select.value()) || '';
    });
```

## When `Question.about()` IS appropriate

Use `Question.about()` when the extraction logic genuinely cannot be expressed with PEQL:

- **Cross-element correlation** — data from one element determines which sibling to read
- **Complex string parsing** — regex extraction that can't be handled by `.trim()` / `.replace()` / `.as()`
- **Conditional logic** — "if element X exists, read Y; otherwise read Z"
- **External state** — reading from `notes()`, `localStorage`, or non-DOM sources

If you find yourself writing `Question.about()` for simple text or attribute reads, step back and
check whether a fluent chain or `eachMappedTo` pattern would work.

## Test Structure

### Assertions use `Ensure.that()`

All assertions flow through the Screenplay Pattern via `Ensure.that()`:

```typescript
await actor.attemptsTo(
    Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('75')),
    Ensure.that(scenariosView.scenarioCalled('Test D').outcome(), equals('FAILURE')),
    Ensure.that(consistencyView.scenarioNames(), contain('Flaky Test A')),
);
```

Never mix Playwright's `expect()` with Screenplay assertions in the same test.

### Navigation uses interaction object `.open()` methods

```typescript
// ✓ Realistic user flow — navigates via sidebar
await actor.attemptsTo(
    scenariosView.open(),
    scenariosView.find('checkout'),
);

// ✓ Deep-link testing — tests URL-driven state restoration
await actor.attemptsTo(
    Navigate.to('/index.html#/tests?filter=failed&search=checkout'),
    Ensure.that(scenariosView.scenarioCount(), equals(1)),
);
```

Use `.open()` by default. Use `Navigate.to()` only when explicitly testing deep-link behaviour.

### One logical assertion per `Ensure.that()`

Each `Ensure.that()` checks one aspect of the observable state. Group related assertions
in the same `attemptsTo()` call, but each verifies a distinct fact:

```typescript
await actor.attemptsTo(
    Ensure.that(scenario.name(), includes('checkout')),
    Ensure.that(scenario.outcome(), equals('FAILURE')),
    Ensure.that(scenario.sourceLocation(), includes('checkout.spec.ts')),
);
```

### Unimplemented steps use pending Tasks

When a test step cannot yet be implemented (missing interaction object API, feature not built),
use a pending Task as a placeholder:

```typescript
await actor.attemptsTo(
    scenarioDetailView.open(),
    // TODO: implement screenshot lightbox interaction object
    Task.where('#actor opens the screenshot at point of failure'),
);
```

Pending tasks are visible in reports and serve as a backlog of interaction object work needed.

## Composition Hierarchy

```
Integration test
  └── uses interaction objects (scenariosView, dashboardView, ...)
        ├── expose Questions (read observable state)
        │     └── use PEQL: .text(), Attribute.called(), .eachMappedTo(), .where()
        ├── expose Tasks (perform user actions)
        │     └── compose Interactions: Click.on(), Enter.theValue(), Press.the()
        └── compose child interaction objects (filterBar, searchInput, ...)

Component test
  └── mounts a single component with test data
        └── uses the same interaction objects as integration tests
              └── verifies behaviour in isolation
```

The same interaction object is used at both the component level (isolated, fast feedback)
and the integration level (full app, realistic navigation). This ensures the component test
validates exactly the API that integration tests depend on.

## Anti-patterns

| Anti-pattern                               | Why it's wrong                     | Correct approach                                   |
|--------------------------------------------|------------------------------------|----------------------------------------------------|
| CSS class parsing in interaction objects   | Brittle, breaks on style changes   | Add `data-*` attributes to the component           |
| `By.css('span:not(.count)')`               | CSS hack, unclear intent           | Add a class or `data-testid` to the target element |
| Imperative `for` loop over elements        | Verbose, error-prone               | `.eachMappedTo(Text)` or `.where().first()`        |
| `Question.about()` for simple text         | Unnecessarily verbose              | `.text().trim().describedAs()`                     |
| `Interaction.where()` for clicking         | Ignores existing Click interaction | `Task.where(..., Click.on(element))`               |
| `actor.answer()` + manual operations       | Bypasses PEQL composition          | Use fluent PEQL chains                             |
| Exposing raw locators in tests             | Couples tests to DOM structure     | Encapsulate in interaction object                  |
| Using `expect()` alongside `Ensure.that()` | Inconsistent assertion style       | Always use `Ensure.that()`                         |
| Positional access (`nth(0)`)               | Fragile, order-dependent           | `.where(criteria).first()`                         |
| Accessing child objects in tests           | Leaks composition into tests       | Add delegating method on the view                  |
| Naming constants after content             | Doesn't explain why it matters     | Name after role: `failingTest`, not `expiredCard`  |
| `includes('%')` or `includes` for known values | Doesn't catch wrong values     | Use `equals('93%')` when the expected value is deterministic |
| `Ensure.that(x.isPresent(), equals(true))` | Verbose, not idiomatic             | `Ensure.that(x, isPresent())` — IO implements `Optional` |
| Multiple `contain(...)` for a known set    | Doesn't catch extra unexpected items | `equals(['All', 'Healthy', ...])` for exact set |
| Negative method names (`isNotCollapsible`) | Double negatives harm readability  | Positive name + assert `equals(false)`: `isCollapsible()` |
| `hasX()` boolean when content is available | Proves existence but not correctness | Assert on the actual content: `detailTitle()`, `confidence()` |
