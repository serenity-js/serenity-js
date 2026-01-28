---
inclusion: fileMatch
fileMatchPattern: "**/web/**,**/playwright/**,**/webdriverio/**,**/protractor/**"
---

# Web Testing in Serenity/JS

## Package Hierarchy

Web testing is split across multiple packages:

```
@serenity-js/web          # Abstract web testing APIs
    ↑
    ├── @serenity-js/playwright      # Playwright implementation
    ├── @serenity-js/webdriverio     # WebdriverIO v9+ implementation  
    ├── @serenity-js/webdriverio-8   # WebdriverIO v8 implementation
    └── @serenity-js/protractor      # Protractor implementation (legacy)
```

The `@serenity-js/web` package defines abstract interfaces. Browser-specific packages provide implementations.

## Core Web Abstractions

### BrowseTheWeb Ability

Abstract ability in `@serenity-js/web`, implemented by each browser package:

```typescript
// Abstract (web package)
export abstract class BrowseTheWeb extends Ability {
    abstract currentPage(): Promise<Page>;
    abstract allPages(): Promise<Page[]>;
}

// Concrete (playwright package)
export class BrowseTheWebWithPlaywright extends BrowseTheWeb {
    static using(browser: PlaywrightBrowser): BrowseTheWebWithPlaywright;
}
```

### Page Model

Represents a browser page/tab:

```typescript
export abstract class Page {
    abstract url(): Promise<string>;
    abstract title(): Promise<string>;
    abstract navigate(url: string): Promise<void>;
    abstract executeScript<T>(script: string | Function): Promise<T>;
    // ... more methods
}
```

## Page Element Query Language (PEQL)

Serenity/JS uses a composable, Screenplay Pattern-compatible abstraction for identifying web elements.
See: https://serenity-js.org/handbook/web-testing/page-element-query-language/

### Locator Strategies

```typescript
import { By } from '@serenity-js/web';

By.css('.class-name')
By.id('element-id')
By.xpath('//div[@class="example"]')
By.tagName('button')
By.linkText('Click here')
By.partialLinkText('Click')
```

### Single Elements (PageElement)

```typescript
const submitButton = PageElement.located(By.css('.submit'))
    .describedAs('submit button');
```

### Collections (PageElements)

```typescript
const basketItems = () =>
    PageElements.located(By.css('#basket .item'))
        .describedAs('basket items');

// Access specific elements
basketItems().first()
basketItems().last()
basketItems().nth(2)
basketItems().count()
```

### Composing Elements with Meta-Questions

PageElement is a meta-question - it can be composed with other PageElements using `.of()`:

```typescript
// Define reusable element locators
const basketItem = () =>
    PageElement.located(By.css('.item'))
        .describedAs('basket item');

const itemName = () =>
    PageElement.located(By.css('.name'))
        .describedAs('name');

// Compose: find name within basket item
const name = itemName().of(basketItem());
```

### Mapping Collections

Use `eachMappedTo` to transform each element in a collection:

```typescript
// Get text of each item name
const names = basketItems().eachMappedTo(Text.of(itemName()));

await actor.attemptsTo(
    Ensure.that(names, equals(['apples', 'bananas']))
);
```

### Filtering with `.where()`

Filter collections using expectations:

```typescript
import { contain } from '@serenity-js/assertions';

// Find items where CSS classes contain 'selected'
const selectedItems = basketItems()
    .where(CssClasses, contain('selected'));

// Chain multiple filters
const expensiveSelectedItems = basketItems()
    .where(CssClasses, contain('selected'))
    .where(Text.of(itemPrice()), equals('£10.00'));
```

### Dynamic Selectors

Selectors can use Answerable values resolved at runtime:

```typescript
import { q } from '@serenity-js/core';

const itemById = (id: Answerable<string>) =>
    PageElement.located(By.css(q`.item[data-id="${id}"]`))
        .describedAs('item');
```

### Transforming Question Results

Questions proxy methods of their answer type:

```typescript
// Text.of() returns QuestionAdapter<string>, proxying string methods
const price = Text.of(priceElement)
    .trim()
    .replace('£', '')
    .as(Number);  // Transform to number
```

## Web Interactions

Located in `packages/web/src/screenplay/interactions/`:

```typescript
import { Click, Enter, Press, Clear, Scroll, Hover } from '@serenity-js/web';

await actor.attemptsTo(
    Click.on(submitButton),
    Enter.theValue('hello').into(inputField),
    Press.the(Key.Enter),
    Clear.theValueOf(inputField),
    Scroll.to(element),
    Hover.over(menuItem),
);
```

## Web Questions

Located in `packages/web/src/screenplay/questions/`:

```typescript
import { Text, Value, Attribute, CssClasses } from '@serenity-js/web';

const buttonText = await actor.answer(Text.of(button));
const inputValue = await actor.answer(Value.of(inputField));
const href = await actor.answer(Attribute.called('href').of(link));
const classes = await actor.answer(CssClasses.of(element));
```

## Web Expectations

Located in `packages/web/src/expectations/`:

```typescript
import { isVisible, isEnabled, isClickable, isSelected } from '@serenity-js/web';
import { Ensure } from '@serenity-js/assertions';

await actor.attemptsTo(
    Ensure.that(button, isVisible()),
    Ensure.that(button, isEnabled()),
    Ensure.that(button, isClickable()),
    Ensure.that(checkbox, isSelected()),
);
```

## Implementing Browser-Specific Features

When adding features to a browser package:

1. Check if an abstract interface exists in `@serenity-js/web`
2. If yes, implement the interface
3. If no, consider if the feature should be abstract (reusable) or browser-specific

### Example: Adding a new Page method

```typescript
// 1. Add abstract method to packages/web/src/screenplay/models/Page.ts
export abstract class Page {
    abstract newMethod(): Promise<Result>;
}

// 2. Implement in each browser package
// packages/playwright/src/screenplay/models/PlaywrightPage.ts
export class PlaywrightPage extends Page {
    async newMethod(): Promise<Result> {
        return this.page.playwrightSpecificMethod();
    }
}
```

## Integration Tests

Web integration tests are in:

- `integration/playwright-web/` - Playwright web interactions
- `integration/webdriverio-web/` - WebdriverIO v9+ web interactions
- `integration/webdriverio-8-web/` - WebdriverIO v8 web interactions
- `integration/protractor-web/` - Protractor web interactions
- `integration/web-specs/` - Shared web test specifications

Run with:

```bash
make INTEGRATION_SCOPE=playwright-web integration-test
make INTEGRATION_SCOPE=webdriverio-web integration-test
```
