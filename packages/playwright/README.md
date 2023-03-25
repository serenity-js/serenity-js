# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Playwright

[`@serenity-js/playwright`](https://serenity-js.org/modules/playwright/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [Playwright](https://playwright.dev/), that helps with testing Web-based apps.

### Installation

To install this module, run the following command in your [Playwright project directory](https://playwright.dev/docs/intro):

```bash
npm install --save-dev @serenity-js/{assertions,console-reporter,core,serenity-bdd,web,playwright}
```

### Usage with Mocha

```typescript
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Actor, ArtifactArchiver, Cast, configure, Duration } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { By, Navigate, PageElement, Photographer, TakePhotosOfFailures, Text } from '@serenity-js/web';

import { describe, it, beforeAll, afterAll } from 'mocha';
import * as playwright from 'playwright';

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {                   
    static header = () => 
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header');         // description to be used in reports
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
        );
    }
}

describe('Serenity/JS', () => {

    let browser: playwright.Browser;
    
    beforeAll(async () => {
        // Start a single browser before all the tests,
        // Serenity/JS will open new tabs
        // and manage Playwright browser context as needed  
        browser = await playwright.chromium.launch({
            headless: true
        });

        // Configure Serenity/JS providing your Actors
        // and required "stage crew memebers" (a.k.a. reporting services)
        configure({
            actors: new Actors(browser, {
                    baseURL: `https://serenity-js.org`,
                    defaultNavigationTimeout:   Duration.ofSeconds(2).inMilliseconds(),
                    defaultTimeout:             Duration.ofMilliseconds(750).inMilliseconds(),
            }),
            crew: [
                ArtifactArchiver.storingArtifactsAt(`./target/site/serenity`),
                Photographer.whoWill(TakePhotosOfFailures),
                new SerenityBDDReporter(),
                ConsoleReporter.forDarkTerminals(),
            ]
        });
    });
    
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
    });
});
```

Next steps:
- Add [`@serenity-js/mocha`](https://serenity-js.org/modules/mocha/) adapter to produce the reports
- Learn about the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern.html)
- Explore [`@serenity-js/web`](https://serenity-js.org/modules/web) and [`@serenity-js/assertions`](https://serenity-js.org/modules/assertions) APIs

## Usage with `@playwright/test`

See [@serenity-js/playwright-test](https://serenity-js.org/api/playwright-test).

## Usage with Cucumber

Tutorial coming soon! 

Follow [@SerenityJS on Twitter](https://twitter.com/@SerenityJS) to get notified about new tutorials.

## More coming soon!

New features, tutorials, and demos are coming soon, so follow us on [LinkedIn](https://www.linkedin.com/company/serenity-js) and join the [Serenity/JS Community Chat channel](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
