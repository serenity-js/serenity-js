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
- [API documentation](https://serenity-js.org/api/)
- [Serenity/JS Project Templates on GitHub](https://serenity-js.org/handbook/getting-started/project-templates/)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/community/contributing/),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Playwright

[`@serenity-js/playwright`](https://serenity-js.org/api/playwright/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [Playwright](https://playwright.dev/), that helps with testing Web-based apps.

### Installation

To install this module, run the following command in your [Playwright project directory](https://playwright.dev/docs/intro):

```bash
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/serenity-bdd @serenity-js/web @serenity-js/playwright
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide](https://serenity-js.org/handbook/getting-started/).

## Usage with `@playwright/test`

Follow the [Serenity/JS Getting Started guide for Playwright Test](https://serenity-js.org/handbook/getting-started/serenity-js-with-playwright-test/).

## Usage with Cucumber

Follow the [Serenity/JS configuration guide for Cucumber](https://serenity-js.org/handbook/test-runners/cucumber/)
and review the [Serenity/JS Cucumber and Playwright Project Template](https://github.com/serenity-js/serenity-js-cucumber-playwright-template).

### Usage with Mocha

```typescript
import { Ensure, equals } from '@serenity-js/assertions'
import { actorCalled, Actor, Cast, configure, Duration } from '@serenity-js/core'
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright'
import { By, Navigate, PageElement, TakePhotosOfFailures, Text } from '@serenity-js/web'

import { describe, it, beforeAll, afterAll } from 'mocha'
import * as playwright from 'playwright'

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {                   
    static header = () => 
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header')          // description to be used in reports
}

// example Actors class, confgures Serenity/JS actors to use Playwright
class Actors implements Cast {              
    constructor(                            
        private readonly browser: playwright.Browser,
        private readonly options: PlaywrightOptions,
    ) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, this.options),
            // ... add other abilities as needed, like CallAnApi or TakeNotes
        )
    }
}

describe('Serenity/JS', () => {

    let browser: playwright.Browser
    
    beforeAll(async () => {
        // Start a single browser before all the tests,
        // Serenity/JS will open new tabs
        // and manage Playwright browser context as needed  
        browser = await playwright.chromium.launch({
            headless: true
        })

        // Configure Serenity/JS providing your Actors
        // and required "stage crew memebers" (a.k.a. reporting services)
        configure({
            actors: new Actors(browser, {
                    baseURL: `https://serenity-js.org`,
                    defaultNavigationTimeout:   Duration.ofSeconds(2).inMilliseconds(),
                    defaultTimeout:             Duration.ofMilliseconds(750).inMilliseconds(),
            }),
            crew: [
                [ '@serenity-js/console-reporter', { theme: 'auto' } ],
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
                [ '@serenity-js/web:Photographer', {
                    strategy: 'TakePhotosOfFailures',
                    // strategy: 'TakePhotosOfInteractions',
                } ],
                [ '@serenity-js/serenity-bdd', { specDirectory: 'spec' } ],
            ]
        })
    })
    
    it('supports Playwright', async () => {
        // actorCalled(name) instantiates or retrieves an existing actor identified by name
        // Actors class configures the actors to use Playwright 
        await actorCalled('William')                                
            .attemptsTo(
                Navigate.to('https://serenity-js.org'),
                Ensure.that(
                    Text.of(SerenityJSWebsite.header()),
                    equals('Next generation acceptance testing')
                ),
            )
    })

    afterAll(async () => {
        // Close the browser after all the tests are finished
        if (browser) {
            await browser.close()
        }
    })
})
```

Next steps:
- Add [`@serenity-js/mocha`](https://serenity-js.org/api/mocha/) adapter to produce the reports
- Learn about the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern.html)
- Explore [`@serenity-js/web`](https://serenity-js.org/api/web) and [`@serenity-js/assertions`](https://serenity-js.org/api/assertions) APIs

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
