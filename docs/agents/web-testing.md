# Web Testing in Serenity/JS

## Architecture: Dependency Inversion

Web testing in Serenity/JS applies the Dependency Inversion Principle at the package level. Tests depend on the abstract `@serenity-js/web` package. Browser-specific packages provide concrete implementations that are substitutable without test changes.

```
@serenity-js/web              ← abstract contracts (PageElement, BrowseTheWeb, Page)
    ↑
    ├── @serenity-js/playwright       ← Playwright implementation
    ├── @serenity-js/webdriverio      ← WebdriverIO v9+ implementation
    ├── @serenity-js/webdriverio-8    ← WebdriverIO v8 implementation
    └── @serenity-js/protractor       ← Protractor implementation (legacy)
```

### BrowseTheWeb: The Ability Contract

```typescript
// Abstract contract (web package)
export abstract class BrowseTheWeb extends Ability {
    abstract currentPage(): Promise<Page>;
    abstract allPages(): Promise<Page[]>;
}

// Concrete implementation (playwright package)
export class BrowseTheWebWithPlaywright extends BrowseTheWeb {
    static using(browser: PlaywrightBrowser): BrowseTheWebWithPlaywright;
}
```

Tests interact with `BrowseTheWeb` — never with the concrete implementation directly.

## Page Element Query Language (PEQL)

PEQL is a composable abstraction for locating and querying web elements. It leverages meta-questions and the `.of()` composition pattern to create reusable, readable element definitions.

Reference: https://serenity-js.org/handbook/web-testing/page-element-query-language/

### Locating Elements

```typescript
import { By, PageElement, PageElements } from '@serenity-js/web';

// Single element
const submitButton = () =>
    PageElement.located(By.css('.submit'))
        .describedAs('submit button');

// Collection
const basketItems = () =>
    PageElements.located(By.css('#basket .item'))
        .describedAs('basket items');
```

### Composition via `.of()` (Meta-Questions)

The defining pattern of PEQL — elements compose with other elements to form scoped queries:

```typescript
// Reusable element definitions
const item = () =>
    PageElement.located(By.css('.item'))
        .describedAs('item');

const itemName = () =>
    PageElement.located(By.css('.name'))
        .describedAs('name');

const itemPrice = () =>
    PageElement.located(By.css('.price'))
        .describedAs('price');

// Compose: find name *within* item
const nameOfItem = itemName().of(item());
const priceOfItem = itemPrice().of(item());
```

This eliminates deep CSS selectors and makes element relationships explicit.

### Filtering with `.where()`

Filter collections using expectations (algebraic composition):

```typescript
import { contain, equals } from '@serenity-js/assertions';
import { CssClasses, Text } from '@serenity-js/web';

const selectedItems = basketItems()
    .where(CssClasses, contain('selected'));

// Chain filters (logical AND)
const expensiveSelectedItems = basketItems()
    .where(CssClasses, contain('selected'))
    .where(Text.of(itemPrice()), equals('£10.00'));
```

### Mapping Collections

Transform collection elements using `eachMappedTo`:

```typescript
const names = basketItems().eachMappedTo(Text.of(itemName()));

await actor.attemptsTo(
    Ensure.that(names, equals(['apples', 'bananas']))
);
```

### Accessing Collection Members

```typescript
basketItems().first()
basketItems().last()
basketItems().nth(2)
basketItems().count()
```

### Dynamic Selectors

Use the `q` tagged template for runtime-resolved selectors:

```typescript
import { q } from '@serenity-js/core';

const itemById = (id: Answerable<string>) =>
    PageElement.located(By.css(q`.item[data-id="${id}"]`))
        .describedAs('item');
```

### Transforming Question Results

`QuestionAdapter` proxies methods of the answer type:

```typescript
const price = Text.of(priceElement)
    .trim()
    .replace('£', '')
    .as(Number);  // QuestionAdapter<number>
```

## Web Interactions

Single-responsibility actions from `@serenity-js/web`:

```typescript
import { Click, Clear, Enter, Hover, Press, Scroll } from '@serenity-js/web';

await actor.attemptsTo(
    Click.on(submitButton()),
    Enter.theValue('hello').into(inputField()),
    Press.the(Key.Enter),
    Clear.theValueOf(inputField()),
    Scroll.to(element()),
    Hover.over(menuItem()),
);
```

### What retries, and what doesn't

| Construct | Behaviour when the element or list item isn't there yet |
|---|---|
| Interactions built on `PageElementInteraction` (`Click`, `DoubleClick`, `RightClick`, `Hover`, `Enter`, `Press`, `Clear`) | Retry resolving the target while it throws `ListItemNotFoundError`, until the interaction timeout. The underlying tool then waits for the element to be actionable |
| Questions, `Ensure.that()`, `Check.whether()` | Evaluate once |
| `Ensure.eventually()`, `Wait.until()` | Retry until the expectation is met or the timeout expires |

Custom interactions should compose the built-in ones, e.g. `Task.where(..., Click.on(element))`.
An `Interaction.where()` that calls `actor.answer(element)` and then `element.click()` bypasses the retry.

## Web Questions

```typescript
import { Attribute, CssClasses, Text, Value } from '@serenity-js/web';

Text.of(button())
Value.of(inputField())
Attribute.called('href').of(link())
CssClasses.of(element())
```

## Web Expectations

```typescript
import { isClickable, isEnabled, isSelected, isVisible } from '@serenity-js/web';
import { Ensure } from '@serenity-js/assertions';

await actor.attemptsTo(
    Ensure.that(button(), isVisible()),
    Ensure.that(button(), isEnabled()),
    Ensure.that(button(), isClickable()),
    Ensure.that(checkbox(), isSelected()),
);
```
