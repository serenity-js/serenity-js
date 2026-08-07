---
inclusion: fileMatch
fileMatchPattern: "**/web/**,**/playwright/**,**/webdriverio/**,**/protractor/**"
---

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

## Adding Browser-Specific Features

When implementing a new web capability:

1. **Does the abstraction belong in `@serenity-js/web`?** — if the capability applies across all browsers, define the abstract interface there
2. **Implement in each browser package** — provide concrete implementations that satisfy the contract
3. **Browser-specific only?** — if a capability is unique to one browser (e.g., Playwright-specific tracing), keep it in that browser's package

```typescript
// 1. Abstract contract in @serenity-js/web
export abstract class Page {
    abstract newMethod(): Promise<Result>;
}

// 2. Concrete implementation in @serenity-js/playwright
export class PlaywrightPage extends Page {
    async newMethod(): Promise<Result> {
        return this.page.playwrightSpecificMethod();
    }
}
```

## Integration Tests

```bash
make INTEGRATION_SCOPE=playwright-web integration-test
make INTEGRATION_SCOPE=webdriverio-web integration-test
```

Shared web specifications live in `integration/web-specs/`. Browser-specific tests live in `integration/<browser>-web/`.
