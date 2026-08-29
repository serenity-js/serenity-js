# Fluent Page Element Chaining and Identity Filtering

## Status: Implementation Complete — Pending Review

## Decisions Made

1. **Naming:** `.element()` / `.elements()` — mirrors `PageElement` / `PageElements` class names.
2. **Return type of `.elements()`:** `MetaList<PageElement>` via proxy forwarding (enables full PEQL).
3. **Single-arg `.where()` scope:** Accepts any `Expectation<Item_Type>` — works for non-web Lists too.
4. **InteractionObject deprecation:** Not now. `child()` / `children()` remain as slightly shorter aliases; InteractionObject provides other value (mobile branching, Optional interface, composition patterns).

## What's Implemented

- Single-arg `.where(expectation)` on `List`, `ArrayList`, `MetaList` (core)
- `Locator.createChildLocator(selector)` on all 4 adapters
- `PageElement.element(selector)` / `.elements(selector)` on all 4 adapters
- `ChainedElementQuestion` / `ChainedElementsLocator` for `.of()` composability
- `PageElement.located()` wired with `metaQuestionBody` for proper `.of()` support
- 10 integration tests (playwright-web), 5 unit tests (core)
- All 561 integration tests passing

## What Remains

- Integration tests for single-arg `.where(isVisible())` in a browser (needs visible/hidden elements in fixture)
- Deep chain test: `element → elements → where → first → elements → first`
- `Wait.until()` integration test with chained elements
- WebdriverIO integration test verification
- PEQL handbook page update
- API docs for new methods

## Problem

PEQL's current API for scoping elements within a parent requires constructing elements separately and composing them with `.of()`:

```typescript
// Current: verbose, non-obvious to new users
const item = PageElement.located(By.css('.item')).of(list);
const items = PageElements.located(By.css('.item')).of(list);
const label = PageElement.located(By.css('.label')).of(
    PageElements.located(By.css('.item')).of(list)
        .where(Text, includes('cheese'))
        .first()
);
```

Additionally, filtering a collection by an element's **own** properties (visibility, presence, enabled state) requires understanding MetaQuestions — there's no way to express "keep only visible elements" without a two-argument `.where()`:

```typescript
// Current: no good way to filter by element's own state
items.where(???, isVisible())  // what goes in the first arg?
```

These DX gaps surface as:
- Discussion: "Why are page elements questions?" (user confusion about the API model)
- Issue #1339: Complex `.where().where().first()` chains that are hard to express
- The need for `InteractionObject` base class just to get `child()`/`children()` convenience

## Design Goals

1. **Fluent chaining** — `parent.element(selector)` and `parent.elements(selector)` as natural child access
2. **Full composability** — `.of()` rescopes the entire chain; results work with `.where()`, `Text.of()`, `Click.on()`
3. **Identity filtering** — single-arg `.where(expectation)` applies the expectation to each element directly
4. **Backwards compatible** — additive API; existing code unchanged
5. **Integration-tool agnostic** — works identically across Playwright, WebdriverIO, and future adapters

## Proposed API

### Fluent Element Access

```typescript
import { By, PageElement, PageElements } from '@serenity-js/web';

const list = PageElement.located(By.css('.todo-list')).describedAs('todo list');

// Single child element — returns MetaQuestionAdapter<PageElement, PageElement>
list.element(By.css('.header'))

// Collection of children — returns MetaList<PageElement> (full PEQL)
list.elements(By.css('.item'))

// Chained drilling
list.element(By.css('.item')).element(By.css('.label'))

// Alternating single/collection
list.elements(By.css('.item'))
    .where(Text, includes('cheese'))
    .first()
    .element(By.css('.delete-button'))
```

### Single-Arg `.where()` for Identity Filtering

```typescript
import { isVisible, isEnabled, isPresent } from '@serenity-js/web';
import { includes } from '@serenity-js/assertions';

// Filter by element's own visibility
list.elements(By.css('.item')).where(isVisible()).first()

// Filter by element's own presence
list.elements(By.css('.item')).where(isPresent()).first()

// Combine identity and projection filters
list.elements(By.css('.item'))
    .where(isVisible())                    // element itself must be visible
    .where(Text, includes('cheese'))       // its text must include 'cheese'
    .first()
```

### Composability with `.of()`

```typescript
// Define a reusable relative locator (no parent bound yet)
const itemLabel = PageElement.located(By.css('.item'))
    .element(By.css('.label'));

// Compose with different parents at test time
const sidebar = PageElement.located(By.css('.sidebar'));
const main = PageElement.located(By.css('.main'));

Text.of(itemLabel.of(sidebar))   // finds .item within .sidebar, then .label within that
Text.of(itemLabel.of(main))      // same chain, different root
```

### Deep Chains

```typescript
// The full expressiveness: drill, fan out, filter, pick, drill again
PageElement.located(By.css('.app'))
    .element(By.css('.sidebar'))
    .elements(By.css('.menu-section'))
    .where(isVisible())
    .first()
    .elements(By.css('.menu-item'))
    .where(Text, includes('Settings'))
    .first()
```

## Type Signatures

### On `PageElement` (instance methods)

```typescript
abstract class PageElement<NET> {
    // Existing:
    abstract of(parentElement: PageElement<NET>): PageElement<NET>;

    // New:
    abstract element(selector: Selector): PageElement<NET>;
    abstract elements(selector: Selector): Array<PageElement<NET>>;
}
```

### On `MetaQuestionAdapter<PageElement, PageElement>` (via proxy forwarding)

When called on a `QuestionAdapter<PageElement>` (the proxy), the proxy resolves the parent element and calls the instance method. The result is wrapped in a new Question:

```typescript
// These are available automatically through the proxy — no explicit definition needed:
parent.element(selector)   // → QuestionAdapter<PageElement>  (proxy-wrapped)
parent.elements(selector)  // → QuestionAdapter<Array<PageElement>>  → needs MetaList wrapping
```

### On `List` (new overload)

```typescript
abstract class List<Item_Type> {
    // Existing:
    abstract where<Answer_Type>(
        question: MetaQuestion<Item_Type, Question<Promise<Answer_Type> | Answer_Type>>,
        expectation: Expectation<Answer_Type>
    ): List<Item_Type>;

    // New overload — identity filtering:
    abstract where(
        expectation: Expectation<Item_Type>
    ): List<Item_Type>;
}
```

## Architecture

### Component 1: `PageElement.element()` and `PageElement.elements()`

**Instance methods on the abstract `PageElement` class.** Each concrete implementation (Playwright, WebdriverIO) implements them by creating a child locator scoped within the current element.

```typescript
// PlaywrightPageElement:
element(selector: Selector): PageElement<playwright.Locator> {
    const childLocator = this.locator.createChildLocator(selector);
    return new PlaywrightPageElement(childLocator);
}

elements(selector: Selector): Array<PageElement<playwright.Locator>> {
    // Delegates to locator to find all matching children
}
```

**Requires:** New abstract method `createChildLocator(selector: Selector): Locator` on `Locator`.

### Component 2: Proxy Forwarding (zero changes to `@serenity-js/core`)

The existing `QuestionAdapter` proxy already forwards any method call to the resolved instance. Since `PageElement` gains `.element()` and `.elements()`, they're immediately available on any `QuestionAdapter<PageElement>`.

However, the proxy wraps the return in a plain `QuestionAdapter` — not a `MetaQuestionAdapter`. This means the result of `.element()` via the proxy **won't have a composable `.of()`** without additional work.

### Component 3: `ChainedPageElementLocator` (preserves `.of()` composability)

For `.element()` and `.elements()` to remain composable with `.of()`, we need explicit Question-level classes that **remember the chain** and replay it when `.of()` is called:

```typescript
/**
 * @package
 */
class ChainedElementQuestion<NET>
    extends Question<Promise<PageElement<NET>>>
    implements ChainableMetaQuestion<PageElement<NET>, Question<Promise<PageElement<NET>>>>
{
    constructor(
        private readonly parent: Answerable<PageElement<NET>> & ChainableMetaQuestion<PageElement<NET>, any>,
        private readonly selector: Answerable<Selector>,
    ) {
        super(the`${parent}.element(${selector})`);
    }

    of(context: Answerable<PageElement<NET>>): ChainedElementQuestion<NET> {
        return new ChainedElementQuestion(
            this.parent.of(context),   // rescope the parent
            this.selector,
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<PageElement<NET>> {
        const parent = await actor.answer(this.parent);
        const selector = await actor.answer(this.selector);
        return parent.element(selector);
    }

    // Also needs .element() and .elements() to continue the chain
    element(selector: Answerable<Selector>): ChainedElementQuestion<NET> {
        return new ChainedElementQuestion(this, selector);
    }

    elements(selector: Answerable<Selector>): ChainedElementsQuestion<NET> {
        return new ChainedElementsQuestion(this, selector);
    }
}
```

Similarly, `ChainedElementsQuestion` returns a `MetaList` and implements `ChainableMetaQuestion` so `.of()` propagates through the entire collection chain.

### Component 4: Entry Points on `MetaQuestionAdapter<PageElement>`

The `.element()` and `.elements()` methods need to be explicitly available on `PageElement.located()` results — not just through proxy forwarding (which loses `MetaQuestion` nature).

**Option A:** Add `.element()` / `.elements()` as methods on a new `PageElementQuestion` class that `PageElement.located()` returns.

**Option B:** Use the proxy `get` trap to detect calls to `.element()` / `.elements()` and return `ChainedElementQuestion` / `ChainedElementsQuestion` instead of generic proxy forwarding.

**Option C:** Make `PageElement.located()` return an enriched wrapper that has these methods alongside the existing proxy.

**Recommendation:** Option A — a dedicated class keeps the logic explicit and testable. The existing `MetaQuestionStatement` already demonstrates this pattern.

### Component 5: Single-Arg `.where()` on `List`

Add an overload to `List.where()` that accepts only an `Expectation<Item_Type>`:

```typescript
// In ArrayList and MetaList:
where(expectation: Expectation<Item_Type>): List<Item_Type>
where<AT>(question: MetaQuestion<Item_Type, Question<AT>>, expectation: Expectation<AT>): List<Item_Type>
where(...args: any[]): List<Item_Type> {
    if (args.length === 1) {
        // Identity filtering: apply expectation to each item directly
        return new ArrayList<Item_Type>(
            new WhereIdentity(this.collection, args[0], this.toString())
        );
    }
    // Existing two-arg form
    return new ArrayList<Item_Type>(
        new Where(this.collection, args[0], args[1], this.toString())
    );
}
```

`WhereIdentity` filters by passing each item directly to the expectation (no projection step).

### Component 6: `Locator.createChildLocator(selector)` (per integration tool)

Each concrete `Locator` needs a method to create a child locator scoped within itself:

```typescript
// PlaywrightLocator:
createChildLocator(selector: Selector): PlaywrightLocator {
    return new PlaywrightLocator(this, selector);
    // 'this' becomes the parent RootLocator
}
```

This is structurally identical to what happens when you call `locator.of(parentLocator)` — just initiated from the parent side instead of the child side.

## Packages Affected

| Package | Changes | Risk |
|---------|---------|------|
| `@serenity-js/core` | New `.where(expectation)` overload on `List`, `ArrayList`, `MetaList` | Low — additive overload |
| `@serenity-js/web` | New `element()`/`elements()` on `PageElement`; `ChainedElementQuestion`; `Locator.createChildLocator()` | Medium — new abstract methods require impl in each adapter |
| `@serenity-js/playwright` | Implement `element()`, `elements()`, `createChildLocator()` on `PlaywrightPageElement`/`PlaywrightLocator` | Low — delegates to existing Playwright locator scoping |
| `@serenity-js/webdriverio` | Same as Playwright | Low |
| `@serenity-js/protractor` | Same (if still maintained) | Low |

## Backwards Compatibility

- **Fully additive** — no existing method signatures change
- **No behaviour changes** — existing `.where(question, expectation)` unchanged
- **No breaking types** — new abstract methods on `PageElement` and `Locator` require implementation in concrete subclasses, but these are `@package`-internal (users don't subclass `PageElement`)
- **Deprecation:** None — `.of()` and `PageElement.located(x).of(y)` remain valid and equivalent

## Relation to Existing Work

### InteractionObject

`InteractionObject.child()` / `children()` become thin aliases for `this.rootElement.element()` / `this.rootElement.elements()`. The base class retains value for:
- Grouping Questions + Tasks into a cohesive domain API
- Mobile branching (`this.mobile` flag)
- `Optional` interface (view-level presence)
- Documentation pattern (composition hierarchy)

### Issue #1339

Single-arg `.where(isPresent())` / `.where(isVisible())` lets users pre-filter collections by element state without understanding MetaQuestions. Combined with `Wait.until()`, this reduces the "immediate throw on empty list" pattern that confused the reporter.

### Handbook / Documentation

The interaction object handbook page should be written **after** this ships, so it can position `InteractionObject` as the "when you outgrow ad-hoc chains" pattern rather than "the only way to scope elements."

## Test Plan

### Unit Tests (`packages/web/spec/`)

**`PageElement.element()`:**
1. Locates a child element within the parent
2. Chains multiple `.element()` calls (grandchild)
3. Works with `Text.of()`, `Attribute.called().of()`
4. `.of()` rescopes the entire chain to a new parent
5. Throws descriptively when the parent doesn't exist
6. Accepts `Answerable<Selector>` for runtime resolution

**`PageElement.elements()`:**
7. Returns a collection scoped within the parent
8. Supports `.where()`, `.first()`, `.last()`, `.count()`
9. Supports `.eachMappedTo(Text)`
10. `.of()` rescopes the entire collection chain
11. Chaining `.first().element()` re-enters single-element mode
12. Chaining `.first().elements()` re-enters collection mode

**Single-arg `.where()`:**
13. Filters by `isVisible()` — keeps only visible elements
14. Filters by `isPresent()` — keeps only present elements
15. Filters by `isEnabled()` — keeps only enabled elements
16. Composes with two-arg `.where()` — both forms in one chain
17. Returns empty list (doesn't throw) when no elements match
18. Works with `Wait.until(collection.where(isVisible()).first(), isPresent())`

### Integration Tests (`integration/playwright-web/` or `integration/web-specs/`)

19. Full chain resolves correctly in a real browser
20. `.of()` correctly rescopes across different parent elements
21. Single-arg `.where(isVisible())` filters hidden elements
22. Deep chain (element → elements → where → first → elements → first) resolves
23. Chain works with `Wait.until()` for dynamic content

## Implementation Sequence

1. **`@serenity-js/core`** — Add single-arg `.where()` overload to `List`, `ArrayList`, `MetaList` + `WhereIdentity` filter class
2. **`@serenity-js/web`** — Add `Locator.createChildLocator(selector)` abstract method
3. **`@serenity-js/web`** — Add `PageElement.element(selector)` and `PageElement.elements(selector)` abstract methods
4. **`@serenity-js/web`** — Implement `ChainedElementQuestion` and `ChainedElementsQuestion` classes
5. **`@serenity-js/web`** — Wire `.element()` / `.elements()` on `PageElement.located()` to return chained questions
6. **`@serenity-js/playwright`** — Implement `createChildLocator`, `element()`, `elements()` on `PlaywrightLocator` / `PlaywrightPageElement`
7. **`@serenity-js/webdriverio`** — Same for WebdriverIO
8. **Tests** — unit + integration tests per the plan above
9. **Documentation** — update PEQL handbook page, add examples

## Future Considerations

- **`.text()` as MetaQuestion on chains** — `parent.element(selector).text()` could return a MetaQuestion usable in `.where()` (eliminates `Text.of(PageElement.located(selector))` pattern)
- **`.attribute(name)` as MetaQuestion** — same pattern
- **Playwright `locator()` parity** — Playwright's `locator.locator(selector)` is the native equivalent; our implementation can delegate directly to it
