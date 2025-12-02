# Serenity/JS Playwright Test

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fplaywright-test.svg)](https://badge.fury.io/js/%40serenity-js%2Fplaywright-test)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/playwright-test/badge.svg)](https://snyk.io/test/npm/@serenity-js/playwright-test)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/playwright-test`](https://serenity-js.org/api/playwright-test/) brings full [Serenity reporting](https://serenity-js.org/handbook/reporting/) capabilities to [Playwright Test](https://playwright.dev/docs/intro) and provides fixtures that enable writing tests using the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

Learn more about using [Serenity/JS with Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/)

## Features

- Integrates Serenity/JS with Playwright Test using dedicated test fixtures
- Supports testing websites, web apps, and HTTP APIs
- Enables [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/) APIs in Playwright Test scenarios
- Supports all [Serenity/JS reporting features](https://serenity-js.org/handbook/reporting/) and expands native Playwright Test reports
- TypeScript-first design with strong typing for safer and more predictable test code.

## Installation

Use an existing [Playwright Test project](https://playwright.dev/docs/intro) or generate a new one by running:

```sh
npm init playwright@latest
```

Install the below Serenity/JS modules in your Playwright Test project directory:

```sh
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/rest @serenity-js/serenity-bdd @serenity-js/web @serenity-js/playwright @serenity-js/playwright-test
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

```ts
import { describe, it } from '@serenity-js/playwright-test'
import { Navigate, Page } from '@serenity-js/web'
import { Ensure, startsWith } from '@serenity-js/assertions'

describe('Website', () => {
    
    it('should have a title', async ({ actor }) => {

        await actor.attemptsTo(
            Navigate.to('https://serenity-js.org/'),
            Ensure.that(Page.current().title(), startsWith('Serenity/JS')),
        )
    })
})
```

Explore the in-depth Serenity/JS and Playwright Test integration guide in the [Serenity/JS Handbook](https://serenity-js.org/handbook/test-runners/playwright-test/).

## Serenity/JS Playwright Fixtures

To use Serenity/JS Screenplay Pattern APIs and benefit from the in-depth reporting capabilities,
import Serenity/JS `test` fixtures instead of the default ones:

```diff
// todo_app.spec.ts
+ import { test } from '@serenity-js/playwright-test'
- import { test } from '@playwright/test'

test.describe('To-do app', () => {
    
    test.describe('New Todo', () => {

        test('should allow me to add todo items', async ({ page }) => {
            //...
        })
    })
})
```

If you prefer, Serenity/JS also offers the more concise BDD-style `describe/it` syntax:

```typescript
// todo_app.spec.ts
import { describe, it, test } from '@serenity-js/playwright-test'

test.use({
    headless: true,
})

describe('To-do app', () => {
    
    describe('New Todo', () => {

        it('should allow me to add todo items', async ({ page }) => {
            //...
        })
    })
})
```

## Serenity/JS Screenplay Pattern Actors

Serenity/JS test fixtures simplify how you manage the [actors](https://serenity-js.org/api/core/class/Actor/).

### Single-actor scenarios

If your tests need only a single actor, you can inject it using the `actor` fixture.
To configure the name of your default actor, use the `defaultActorName` configuration property:

```typescript
// todo_app.spec.ts

// import fixtures
import { describe, it, test } from '@serenity-js/playwright-test'
// import Screenplay Pattern web APIs
import { Navigate, Page } from '@serenity-js/web'
// import Screenplay Pattern assertion APIs
import { Ensure, equals } from '@serenity-js/assertions'                                        

test.use({
    headless: true,
    // change default actor name
    defaultActorName: 'Serena'
})

describe('To-do app', () => {
    
    describe('New Todo', () => {

        // inject default actor:
        it('should allow me to add todo items', async ({ actor }) => { 
            
            // define test workflow
            await actor.attemptsTo(                                                  
                Navigate.to('https://todo-app.serenity-js.org/'),
                Ensure.that(Page.current().title(), equals('Serenity/JS TodoApp')),
            )
        })
    })
})
```

### Multi-actor scenarios

For multi-actor scenarios, for example where you need each actor to use a separate browser, 
use the `actorCalled` fixture.

```typescript
// todo_app.spec.ts

import { describe, it, test } from '@serenity-js/playwright-test'   // import fixtures

test.use({
    // change default actor name
    defaultActorName: 'Alice' 
})

describe('To-do app', () => {
    
    describe('Chat app', () => {

        it('should allow actors to send and receive messages', async ({ actor, actorCalled, browser }) => { 

            // Define part of the workflow performed by the default actor:
            await actor.attemptsTo(                               
                // Navigate to a chat app...
                // Post a message to Bob...
            )

            // Fefine parts of the workflow performed by the any other actors.
            // Note that invoking actorCalled(name) multiple times
            // while using the same name and within the scope of a single test
            // returns the same actor, so you don't need to cache them:
            await actorCalled('Bob')
                // The second actor can use a separate browser instance
                .whoCan(BrowseTheWebWithPlaywright.using(browser))
                .attemptsTo(                                 
                    // Navigate to a chat app...
                    // Post a reply to Alice...
                )


            await actor.attemptsTo(                              
                // Check if the reply from Bob is received                      
            )                                                                   
        })
    })
})
```

To learn more about customising actors and managing their abilities, see the [Serenity/JS Handbook section on Playwright Test customisation](https://serenity-js.org/handbook/test-runners/playwright-test/#modifying-default-abilities).

### Customising test fixtures

The [`useFixtures`](https://serenity-js.org/api/playwright-test/function/useFixtures/) function 
lets you configure your actors in a single place,
and define custom [test fixtures](https://playwright.dev/docs/test-fixtures) if needed.   

```typescript
// my-custom-api.ts
export const { 
    describe, it, test, beforeAll, beforeEach, afterEach, afterAll, expect
} = useFixtures<{ email: string }>({
    
    // Override Serenity/JS fixtures:
    actors: async ({ browser, baseURL }, use) => {
        await use(
            Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.using(browser),
                TakeNotes.usingAnEmptyNotepad(),
                CallAnApi.at(baseURL),
            ))
        )
    },
    
    // Add your own fixtures:
    email: async ({ actor }, use) => {
        await use(`${ actor.name }@example.org`);
    },    
})
```

Next, use your custom test API definition in your test files:

```typescript
// todo_app.spec.ts
import { Log } from '@serenity-js/core'

// Import describe/it/test from your custom API
import { describe, it, test } from './my-custom-api'   

describe('To-do app', () => {

    describe('New Todo', () => {

        // inject default actor:
        it('should allow me to add todo items', async ({ actor, email }) => {

            // define test workflow
            await actor.attemptsTo(
                Log.the(email),
            )
        })
    })
})
```

## UI Component Testing

You can use Serenity/JS and Playwright Test to write UI component tests and **reuse your test code** between component and end-to-end test suites.

To get started with component testing:
- Follow the [Playwright Test Component Testing tutorial](https://playwright.dev/docs/test-components) to configure your component test suite,
- Use Serenity/JS test fixtures instead of the default ones.

```diff
// src/App.spec.tsx
- import { test, expect } from '@playwright/experimental-ct-react'
+ import { test as componentTest } from '@playwright/experimental-ct-react'
+ import { useBase } from '@serenity-js/playwright-test'

+ const { test, expect } = useBase(componentTest)

import App from './App'

test.use({ viewport: { width: 500, height: 500 } })

test('should work', async ({ mount }) => {
  const component = await mount(<App />)
  await expect(component).toContainText('Learn React')
})
```

### Using Serenity/JS actors for Component Testing

Serenity/JS [`useBase(test)`](https://serenity-js.org/api/playwright-test/function/useBase/) creates
a test API that gives you access to all the [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
you could access in any other regular end-to-end test.

This capability allows you to use [Serenity/JS actors](https://serenity-js.org/api/core/class/Actor/) and design
and experiment with your [tasks](https://serenity-js.org/api/core/class/Task/)
before incorporating them in your high-level acceptance and end-to-end tests.

```tsx
import { test as componentTest } from '@playwright/experimental-ct-react'
import { Ensure, contain } from '@serenity-js/assertions'
import { useBase } from '@serenity-js/playwright-test'
import { Enter, PageElement, CssClasses } from '@serenity-js/web'

import EmailInput from './EmailInput'

const { it, describe } = useBase(componentTest).useFixtures<{ emailAddress: string }>({
    emailAddress: ({ actor }, use) => {
        use(`${ actor.name }@example.org`)
    }
})

describe('EmailInput', () => {

    it('allows valid email addresses', async ({ actor, mount, emailAddress }) => {
        const nativeComponent = await mount(<EmailInput/>)

        const component = PageElement.from(nativeComponent)

        await actor.attemptsTo(
            Enter.theValue(emailAddress).into(component),
            Ensure.that(CssClasses.of(component), contain('valid')),
        )
    })
})
```

Explore the in-depth Serenity/JS and Playwright Test integration guide in the [Serenity/JS Handbook](https://serenity-js.org/handbook/test-runners/playwright-test/).

## Reporting

To use Serenity/JS reporting capabilities, register the `@serenity-js/playwright-test` reporter in your
`playwright.config.ts` and define the appropriate reporting services (a.k.a. your "stage crew").

For example, to enable [Serenity/JS Console Reporter](https://serenity-js.org/handbook/reporting/console-reporter/)
and [Serenity BDD Reporter](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter/), install the relevant modules:

```bash
npm install --save-dev @serenity-js/console-reporter @serenity-js/serenity-bdd
```

Next, configure your Playwright project as follows:

```typescript
// playwright.config.ts

import { defineConfig } from '@playwright/test';
import { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './spec',
    
    reporter: [
        [ '@serenity-js/playwright-test', {
            crew: [
                '@serenity-js/console-reporter',
                [ '@serenity-js/serenity-bdd', { specDirectory: './spec' } ],
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
                // '@serenity-js/core:StreamReporter',
            ]
        }],

        // optional
        [ 'html', { open: 'never' } ],          // built-in Playwright HTML reporter
    ],

    // Other configuration omitted for brevity
    // For details, see https://playwright.dev/docs/test-configuration
})
```

Serenity/JS reporters work well with native [Playwright reporters](https://playwright.dev/docs/test-reporters).

## Documentation

- [API Reference](https://serenity-js.org/api/)
- [Screenplay Pattern Guide](https://serenity-js.org/handbook/design/screenplay-pattern/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)
- [More examples and reference implementations](https://github.com/serenity-js/serenity-js/tree/main/examples)
- [Tutorial: First Web Scenario](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/)
- [Tutorial: First API Scenario](https://serenity-js.org/handbook/tutorials/your-first-api-scenario/)

## Contributing

Contributions of all kinds are welcome! Get started with the [Contributing Guide](https://serenity-js.org/community/contributing/).

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [Discussions Forum](https://github.com/orgs/serenity-js/discussions)
    - Visit the [💡How to... ?](https://github.com/orgs/serenity-js/discussions/categories/how-to) section for answers to common questions

If you enjoy using Serenity/JS, make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

## License

The Serenity/JS code base is licensed under the [Apache-2.0](https://opensource.org/license/apache-2-0) license,
while its documentation and the [Serenity/JS Handbook](https://serenity-js.org/handbook/) are licensed under the [Creative Commons BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the [Serenity/JS License](https://serenity-js.org/legal/license/).

## Support

Support ongoing development through [GitHub Sponsors](https://github.com/sponsors/serenity-js). Sponsors gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks)
and priority help in the [Discussions Forum](https://github.com/orgs/serenity-js/discussions).

For corporate sponsorship or commercial support, please contact [Jan Molak](https://www.linkedin.com/in/janmolak/).

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js).

