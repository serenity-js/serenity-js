# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative open-source framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

⭐️ Get started with Serenity/JS!
- [Serenity/JS web testing tutorial](https://serenity-js.org/handbook/web-testing/your-first-web-scenario)
- [Serenity/JS Handbook](https://serenity-js.org/handbook) and [Getting Started guides](https://serenity-js.org/handbook/getting-started/)
- [API documentation](https://serenity-js.org/api/core)
- [Serenity/JS Project Templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/contributing),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Playwright Test

[`@serenity-js/playwright-test`](https://serenity-js.org/api/playwright-test/) module offers a Serenity/JS reporter
and fixtures that integrate [Playwright Test](https://playwright.dev/docs/intro) with Serenity/JS Screenplay Pattern APIs.

### Installation

To install this module, use an existing [Playwright Test project](https://playwright.dev/docs/intro) or generate a new one by running:

```sh
npm init playwright@latest
```

Install the below Serenity/JS modules in your Playwright Test project directory:

```sh
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/serenity-bdd @serenity-js/web @serenity-js/playwright @serenity-js/playwright-test
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide for Playwright Test](https://serenity-js.org/handbook/getting-started/serenity-js-with-playwright-test/).

### Serenity/JS Playwright Fixtures

To use Serenity/JS Screenplay Pattern APIs and benefit from the in-depth reporting capabilities,
import Serenity/JS test fixtures instead of the default ones:

```diff
// example.spec.ts
+ import { test } from '@serenity-js/playwright-test'
- import { test } from '@playwright/test'

test.describe('Serenity Screenplay with Playwright', () => {
    
    test.describe('New Todo', () => {

        test('should allow me to add todo items', async ({ page }) => {
            //...
        })
    })
})
```

If you prefer, Serenity/JS also offers the more concise BDD-style `describe/it` syntax:

```typescript
// example.spec.ts
import { describe, it, test } from '@serenity-js/playwright-test'

test.use({
    headless: true,
})

describe('Serenity Screenplay with Playwright', () => {
    
    describe('New Todo', () => {

        it('should allow me to add todo items', async ({ page }) => {
            //...
        })
    })
})
```

### Serenity/JS Screenplay Pattern Actors

Serenity/JS test fixtures simplify how you instantiate and use [Serenity/JS Screenplay Pattern Actors](https://serenity-js.org/api/core/class/Actor/).

#### Single-actor scenarios

If your tests need only a single actor, you can inject it using the `actor` fixture.
To configure the name of your default actor, use the `defaultActorName` configuration property:

```typescript
// example.spec.ts

import { describe, it, test } from '@serenity-js/playwright-test'   // import fixtures
import { Navigate, Page } from '@serenity-js/playwright'            // import Screenplay Pattern web APIs
import { Ensure, equals } from '@serenity-js/assertions'            // import Screenplay Pattern assertion APIs                            

test.use({
    headless: true,
    defaultActorName: 'Serena'  // change default actor name
})

describe('Serenity Screenplay with Playwright', () => {
    
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

#### Multi-actor scenarios

For multi-actor scenarios where you need each actor to use a separate browser, use the `actorCalled` fixture.
You can also use this pattern to override the default actor name on a per-scenario basis:

```typescript
// example.spec.ts

import { describe, it, test } from '@serenity-js/playwright-test'   // import fixtures

describe('Serenity Screenplay with Playwright', () => {
    
    describe('Chat app', () => {

        it('should allow actors to send and receive messages', async ({ actorCalled }) => { 

            // define part of the workflow performed by the first actor:
            await actorCalled('Alice').attemptsTo(                               
                // navigate to a chat app
                // post a message to Bob
            )

            // define parts of the workflow performed by the any other actors:
            await actorCalled('Bob').attemptsTo(                                 
                // navigate to a chat app
                // post a reply to Alice
            )

            // Note that invoking actorCalled(name) multiple times
            // while using the same name and within the scope of a single test
            // returns the same actor, so you don't need to cache them:
            await actorCalled('Alice').attemptsTo(                              
                // check if the reply from Bob is received                      
            )                                                                   
        })
    })
})
```

#### Customising Actors

The default [cast](https://serenity-js.org/api/core/class/Cast) of actors is limited to using a single ability
to [`BrowseTheWebWithPlaywright`](/api/playwright/class/BrowseTheWebWithPlaywright).

If you'd like to give your actors additional abilities, like to [`TakeNotes`](https://serenity-js.org/api/core/class/TakeNotes),
[`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi),
or [`ManageALocalServer`](https://serenity-js.org/api/local-server/class/ManageALocalServer), you can install the relevant Serenity/JS module
and configure them as follows:

```typescript
// example.spec.ts

import { Cast, TakeNotes } from '@serenity-js/core'
import { test } from '@serenity-js/playwright-test'
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
import { CallAnApi } from '@serenity-js/rest'                            

test.use({
    actors: async ({ browser, baseURL }, use) => {
        await use(
            Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.using(browser),
                TakeNotes.usingAnEmptyNotepad(),
                CallAnApi.at(baseURL),
            ))
        )
    },
})
```

For scenarios where different actors need to be configured differently, you can also implement your own `Cast`:

```typescript
// example.spec.ts

import { Cast } from '@serenity-js/core'
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright'
import { test } from '@serenity-js/playwright-test'
import { CallAnApi } from '@serenity-js/rest'
import { Browser } from 'playwright'

class Actors implements Cast {
    constructor(
        private readonly browser: Browser,
        private readonly options: PlaywrightOptions,
    ) {
    }

    prepare(actor: Actor) {
        switch (actor.name) {
            case 'James':
                return actor.whoCan(BrowseTheWebWithPlaywright.using(this.browser, this.options))
            default:
                return actor.whoCan(CallAnApi.at(this.options.baseURL))
        }
    }
}

test.use({
    actors: async ({ browser, config }) => {
        await use(new Actors(browser, {
            defaultNavigationWaitUntil: 'domcontentloaded'
        }))
    }
})
```

#### Customising test fixtures

[`useFixtures`](https://serenity-js.org/api/playwright-test/function/useFixtures/) lets you configure
Serenity/JS Screenplay Pattern actors in a single place,
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

With the custom test API definition in place, use it in your test files instead of the default one:

```typescript
// example.spec.ts
import { Log } from '@serenity-js/core'

import { describe, it, test } from './my-custom-api'    // Note the custom test API

describe('Serenity Screenplay with Playwright', () => {

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

### UI Component Testing

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

#### Using Serenity/JS Screenplay Pattern Actors for Component Testing

Serenity/JS [`useBase(test)`](https://serenity-js.org/api/playwright-test/function/useBase/) creates
a test API that gives you access to all the [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
you could access in any other regular end-to-end test.

This capability allows you to use [Serenity/JS Actors](https://serenity-js.org/api/core/class/Actor/) and design
and experiment with your [Screenplay Pattern Tasks](https://serenity-js.org/api/core/class/Task/)
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

### Serenity Reports

To use Serenity/JS reporting capabilities, register the `@serenity-js/playwright-test` reporter in your
`playwright.config.ts` and define the appropriate reporting services (a.k.a. your "stage crew").

For example, to enable Serenity/JS Console Reporter and Serenity BDD reporter, install the relevant modules:

```bash
npm install --save-dev @serenity-js/console-reporter @serenity-js/serenity-bdd
```

Next, configure your Playwright project as follows:

```typescript
// playwright.conf.ts

import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
    reporter: [
        [ '@serenity-js/playwright-test', {
            crew: [
                '@serenity-js/serenity-bdd',
                '@serenity-js/console-reporter',
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
                // '@serenity-js/core:StreamReporter',
            ]
        }],

        // optional
        [ 'html', { open: 'never' } ],          // built-in Playwright HTML reporter
    ],

    // Other configuration omitted for brevity
    // For details, see https://playwright.dev/docs/test-configuration
}

export default config
```

Note that Serenity/JS reporters work well with the built-in [Playwright reporters](https://playwright.dev/docs/test-reporters).

### Reference implementation

You can find a reference implementation demonstrating how to integrate Serenity/JS with Playwright Test in the [Serenity/JS
GitHub repository](https://github.com/serenity-js/serenity-js/tree/main/examples/playwright-test-todomvc).

## 📣 Stay up to date

New features, tutorials, and demos are coming soon!
Follow [Serenity/JS on LinkedIn](https://www.linkedin.com/company/serenity-js),
subscribe to [Serenity/JS channel on YouTube](https://www.youtube.com/@serenity-js) and join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
Please also make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?label=Serenity%2FJS&logo=github&style=badge)](https://github.com/serenity-js/serenity-js)

## 💛 Support Serenity/JS

If you appreciate all the effort that goes into making sophisticated tools easy to work with, please support our work and become a Serenity/JS GitHub Sponsor today!

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
