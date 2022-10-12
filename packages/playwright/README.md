# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

[![Twitter Follow](https://img.shields.io/twitter/follow/SerenityJS?style=social)](https://twitter.com/@SerenityJS)
[![Twitter Follow](https://img.shields.io/twitter/follow/JanMolak?style=social)](https://twitter.com/@JanMolak)
[![Chat on Gitter](https://badges.gitter.im/serenity-js/Lobby.svg)](https://gitter.im/serenity-js/Lobby)

Subscribe to [Serenity/JS YouTube channel](https://www.youtube.com/channel/UC0RdeVPyjtJopVHvlLrXd1Q) to get notified when new demos and video tutorials are available.

### Learning Serenity/JS

To learn more about Serenity/JS, [follow the tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), [review the examples](https://github.com/serenity-js/serenity-js/tree/main/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

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

New features, tutorials, and demos are coming soon, so follow us on Twitter and join the [Serenity/JS Community chat channel](https://gitter.im/serenity-js/Lobby) to stay up to date!

[![Twitter Follow](https://img.shields.io/twitter/follow/SerenityJS?style=social)](https://twitter.com/@SerenityJS)
[![Twitter Follow](https://img.shields.io/twitter/follow/JanMolak?style=social)](https://twitter.com/@JanMolak)
[![Chat on Gitter](https://badges.gitter.im/serenity-js/Lobby.svg)](https://gitter.im/serenity-js/Lobby)
