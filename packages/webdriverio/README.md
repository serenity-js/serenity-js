# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS WebdriverIO

[`@serenity-js/webdriverio`](https://serenity-js.org/modules/webdriverio/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [WebdriverIO](https://webdriver.io/), that helps with testing Web-based and mobile apps.

### Installation

To install this module, run the following command in your [WebdriverIO project directory](https://webdriver.io/docs/gettingstarted/):

```bash
npm install --save-dev @serenity-js/{assertions,console-reporter,core,serenity-bdd,web,webdriverio}
```

Next, install one of the below test runner adapters.

#### Usage with Cucumber.js

To use Serenity/JS WebdriverIO with Cucumber.js, install the following adapter:
```bash
npm install --save-dev @serenity-js/cucumber
```

**Please note** that Serenity/JS WebdriverIO / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#built-in-formatters).

#### Usage with Jasmine

To use Serenity/JS WebdriverIO with Jasmine, install the following adapter:
```bash
npm install --save-dev @serenity-js/jasmine
```

#### Usage with Mocha

To use Serenity/JS WebdriverIO with Mocha, install the following adapter:
```bash
npm install --save-dev @serenity-js/mocha
```

### Configuring Webdriverio

```typescript
// serenity/Actors.ts
import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
import * as wdio from 'webdriverio';

// example Actors class, confgures Serenity/JS actors to use WebdriverIO
class Actors implements Cast {
    constructor(private readonly browser: wdio.Browser<'async'>) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithWebdriverIO.using(this.browser),
            // ... add other abilities as needed, like CallAnApi or TakeNotes
        );
    }
}

```

```typescript
// wdio.conf.ts

// Import Serenity/JS reporting services, a.k.a. the "Stage Crew Members"
import { Actors } from './serenity/Actors.ts'

export const config: WebdriverIOConfig = {
    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    serenity: {
        // Configure Serenity/JS to use an appropriate test runner adapter
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // register custom Actors class to configure your Serenity/JS actors
        actors: new Actors(),
        
        // Register StageCrewMembers we've imported at the top of this file    
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', { 
                strategy: 'TakePhotosOfFailures', // or: 'TakePhotosOfInteractions'
            } ],
        ]
    },

    // configure Cucumber runner
    cucumberOpts: {
        // see the Cucumber configuration options below
    },

    // or Jasmine runner
    jasmineOpts: {
        // see the Jasmine configuration options below
    },

    // or Mocha runner
    mochaOpts: {
        // see the Mocha configuration options below
    },

    specs: [
        // load Cucumber feature files
        './features/**/*.feature',
        // or Mocha/Jasmine spec files 
        // './spec/**/*.spec.ts',
    ],
    
    // add any additional native WebdriverIO reports
    // reporters: [
    //     'spec',
    // ],

    // ... other WebdriverIO-specific configuration   
};
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/modules/cucumber/class/src/cli/CucumberConfig.ts~CucumberConfig.html)
- [Jasmine configuration options](https://serenity-js.org/modules/jasmine/class/src/adapter/JasmineConfig.ts~JasmineConfig.html)
- [Mocha configuration options](https://serenity-js.org/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)

### Usage with Mocha

```typescript
import { actorCalled } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { By, Navigate, PageElement, Text } from '@serenity-js/web';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header');         // description to be used in reports
}

describe('Serenity/JS', () => {
    
    it('works with WebdriverIO and Mocha', async () => {
        // actorCalled(name) instantiates or retrieves an existing actor identified by name
        // Actors class configures the actors to use WebdriverIO 
        await actorCalled('Wendy')
            .attemptsTo(
                Navigate.to('https://serenity-js.org'),
                Ensure.that(
                    Text.of(SerenityJSWebsite.header()),
                    equals('Next generation acceptance testing')
                ),
            )
    })
});
```

To learn more, check out the [example projects](https://github.com/serenity-js/serenity-js/tree/main/examples).

### Template Repositories

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, WebdriverIO and either [Mocha](https://mochajs.org/), [Cucumber](https://github.com/cucumber/cucumber-js) or [Jasmine](https://jasmine.github.io/) is by using one of the below template repositories:

- [Serenity/JS, Mocha, and WebdriverIO template](https://github.com/serenity-js/serenity-js-mocha-webdriverio-template)
- [Serenity/JS, Cucumber, and WebdriverIO template](https://github.com/serenity-js/serenity-js-cucumber-webdriverio-template)
- Serenity/JS, Jasmine, and WebdriverIO template (coming soon!)

## More coming soon!

New features, tutorials, and demos are coming soon, so follow us on [LinkedIn](https://www.linkedin.com/company/serenity-js) and join the [Serenity/JS Community Chat channel](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
