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

## Serenity/JS WebdriverIO

[`@serenity-js/webdriverio`](https://serenity-js.org/api/webdriverio/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [WebdriverIO](https://webdriver.io/) that will help you with testing Web and mobile apps.

### Installation

To install this module, use an [existing WebdriverIO project](https://webdriver.io/docs/gettingstarted/) or generate a new one by running:

```sh
npm init wdio .
```

Install the below Serenity/JS modules in your WebdriverIO project directory:

```sh
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/serenity-bdd @serenity-js/web @serenity-js/webdriverio
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide fpr WebdriverIO](https://serenity-js.org/handbook/getting-started/serenity-js-with-webdriverio/).

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

### Configuring WebdriverIO

To integrate Serenity/JS with WebdriverIO, 
configure your `wdio.conf.ts` to specify `framework: '@serenity-js/webdriverio'`.
You can [configure Serenity/JS](https://serenity-js.org/api/core/class/SerenityConfig) in the same file.

```typescript title="wdio.conf.ts"
// wdio.conf.ts
import { WebdriverIOConfig } from '@serenity-js/webdriverio'

// Optional, import custom Actors if needed; More on this below.
import { Actors } from './serenity/Actors.ts'

export const config: WebdriverIOConfig = {
    
    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use an appropriate test runner adapter
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // Optional, register custom Cast to configure your Serenity/JS actors
        actors: new Actors(`https://api.example.org`),
        
        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
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
}
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
- [Jasmine configuration options](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
- [Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)

#### Using custom Serenity/JS Actors

By default, Serenity/JS uses a default [cast of actors](https://serenity-js.org/api/core/class/Cast) where every actor can:
- [`BrowseTheWebWithWebdriverIO`](https://serenity-js.org/api/webdriverio/class/BrowseTheWebWithWebdriverIO)
- [`TakeNotes.usingAnEmptyNotepad()`](https://serenity-js.org/api/core/class/TakeNotes)

If you're planning to implement scenarios where [actors](https://serenity-js.org/api/core/class/Actor) have
additional [abilities](https://serenity-js.org/api/core/class/Ability), you can replace this default setup
with a custom [`Cast`](https://serenity-js.org/api/core/class/Cast), like this one:

```typescript title="serenity/Actors.ts"
// serenity/Actors.ts
import { Actor, Cast, TakeNotes } from '@serenity-js/core'
import { CallAnApi } from '@serenity-js/rest'
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio'
import type { Browser } from 'webdriverio'

export class Actors implements Cast {

    // Inject custom parameters via constructor
    constructor(private readonly apiUrl: string) {
    }
    
    prepare(actor: Actor): Actor {
        // You can assign abilities based on actor name, env variables, and so on
        switch (actor.name) {
            
            case 'Apisitt':
                return actor.whoCan(
                    CallAnApi.at(this.apiUrl)
                )
                
            default:
                return actor.whoCan(
                    BrowseTheWebWithWebdriverIO.using(browser), // global WDIO browser
                    TakeNotes.usingAnEmptyNotepad(),
                )
        }

    }
}
```

### Using Serenity/JS with WebdriverIO and Mocha

```typescript title="specs/example.spec.ts"
// specs/example.spec.ts
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { By, Navigate, PageElement, Text } from '@serenity-js/web'
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio'

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header')          // description to be used in reports
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
                    equals('Enable collaborative test automation at any scale!')
                ),
            )
    })
})
```

To learn more, check out the [example projects](https://github.com/serenity-js/serenity-js/tree/main/examples).

### Template Repositories

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, WebdriverIO and either [Mocha](https://mochajs.org/), [Cucumber](https://github.com/cucumber/cucumber-js) or [Jasmine](https://jasmine.github.io/) is by using one of the below template repositories:

- [Serenity/JS, Mocha, and WebdriverIO template](https://github.com/serenity-js/serenity-js-mocha-webdriverio-template)
- [Serenity/JS, Cucumber, and WebdriverIO template](https://github.com/serenity-js/serenity-js-cucumber-webdriverio-template)
- Serenity/JS, Jasmine, and WebdriverIO template (coming soon!)

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
