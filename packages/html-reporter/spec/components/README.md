# Component Tests with Interaction Objects

## Overview

Component tests in the html-reporter use the **Interaction Object** pattern — a Screenplay-native
equivalent of the Page Object pattern, scoped to a single UI component.

Each interaction object encapsulates the locators, questions, and tasks for interacting with
a component, keeping tests focused on *behaviour* rather than DOM structure.

## Architecture

```
spec/components/*.spec.ts     ← Tests: mount component, use interaction object
src/*.serenity.ts             ← Interaction Objects: encapsulate component interaction
spec/components/fixtures.ts   ← Test harness: mount + interactionObject wiring
template/components/*.ts      ← Preact components under test
```

## Writing an Interaction Object

An interaction object is a class that receives the mounted component's root element
and exposes Questions (for reading state) and Tasks (for performing actions):

```typescript
// src/SearchInput.serenity.ts
import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { Task, the } from '@serenity-js/core';
import { Attribute, By, Click, Enter, PageElement, Value } from '@serenity-js/web';

export class SearchInput<NET> {

    constructor(private readonly rootElement: Question<PageElement<NET>> | PageElement<NET>) {
    }

    // Private locators — scoped to the root element via .of()
    private inputField = () =>
        PageElement.located(By.css('.search-input'))
            .of(this.rootElement)
            .describedAs('search input field');

    // Questions — retrieve state without side effects
    value = (): QuestionAdapter<string> =>
        Value.of(this.inputField())
            .describedAs('search input value');

    placeholder = (): QuestionAdapter<string> =>
        Attribute.called('placeholder').of(this.inputField())
            .describedAs('search input placeholder');

    // Tasks — perform actions
    enter = (searchTerm: Answerable<string>): Task =>
        Task.where(the`#actor searches for ${ searchTerm }`,
            Enter.theValue(searchTerm).into(this.inputField()),
        );
}
```

### Design rules

- **Locators are private** — tests never see CSS selectors
- **Locators use `.of(this.rootElement)`** — scoping ensures isolation when multiple instances exist
- **Questions are instance methods** returning `QuestionAdapter<T>` or `Question<Promise<T>>`
- **Tasks are instance methods** returning `Task`
- **The constructor accepts `Question<PageElement<NET>> | PageElement<NET>`** — compatible with what
  `PageElement.located(...)` returns

## Writing a Component Test

```typescript
// spec/components/SearchInput.spec.ts
import { Ensure, equals, isFalse } from '@serenity-js/assertions';

import { SearchInput } from '../../src/serenity/SearchInput.serenity.js';
import { beforeEach, describe, it } from './fixtures.js';

describe('SearchInput', () => {

    beforeEach(async ({ page }) => {
        await page.exposeFunction('__noop', () => { /* noop */
        });
    });

    it('displays the default placeholder', async ({ mount, actor }) => {
        const searchInput = await mount({
            component: 'SearchInput',
            importPath: './components/SearchInput',
            props: { value: '', onInput: '__noop' },
            interactionObject: SearchInput,
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find test scenarios...')),
        );
    });
});
```

### Key points

1. **Pass `interactionObject` to `mount`** — the fixture instantiates it with the mounted
   component's root element (`#app > *`) and returns the instance
2. **Use the instance** — call `searchInput.placeholder()`, not `SearchInput.placeholder()`
3. **All assertions use `Ensure.that(...)`** — keep everything in the Screenplay flow,
   avoid mixing with `expect().to*()` style assertions
4. **`data` and `dataAsProps` are optional** — only needed for view-level components that
   read from `window.__SERENITY_REPORT_DATA__`
5. **Expose callbacks via `page.exposeFunction`** — props referencing window functions
   (prefixed with `__`) are automatically resolved by the mount harness

## The `mount` Fixture

The `mount` fixture handles:

1. Bundling the component with esbuild
2. Serving it in a minimal HTML page
3. Navigating Playwright to the page
4. Instantiating the interaction object with a `PageElement` pointing to the rendered component

```typescript
const searchInput = await mount<SearchInput<unknown>>({
    component: 'SearchInput',          // Export name from the template module
    importPath: './components/SearchInput', // Import path relative to template/
    props: { value: '', onInput: '__noop' },  // Props passed to the component
    interactionObject: SearchInput,    // Class to instantiate
});
```

The generic type `IO` is inferred from the `interactionObject` class, giving full
type safety on the returned instance.

## File Naming Convention

| File                      | Location               | Purpose            |
|---------------------------|------------------------|--------------------|
| `SearchInput.ts`          | `template/components/` | Preact component   |
| `SearchInput.serenity.ts` | `src/`                 | Interaction object |
| `SearchInput.spec.ts`     | `spec/components/`     | Component test     |
