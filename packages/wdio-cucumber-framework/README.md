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

## Serenity/JS WebdriverIO Cucumber Framework

[`@serenity-js/wdio-cucumber-framework`](https://serenity-js.org/api/wdio-cucumber-framework/) module 
integrates [WebdriverIO](https://webdriver.io/), [Cucumber.js](https://github.com/cucumber/cucumber-js),
and Serenity/JS to help you test web and mobile apps and produce world class test execution reports
and living documentation of your project.

### Serenity/JS Project Templates

The easiest way to start writing acceptance tests using Serenity/JS and WebdriverIO
is to use the [Serenity/JS Project Templates](https://serenity-js.org/handbook/getting-started/project-templates/#webdriverio) 🚀

### Installation

To install this module, use an [existing WebdriverIO project](https://webdriver.io/docs/gettingstarted/) or generate a new one by running:

```sh
npm init wdio .
```

Then, in your WebdriverIO project directory, install Cucumber.js:
```sh
npm install --save-dev @cucumber/cucumber
```

Next, install the below Serenity/JS modules :

```sh
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/cucumber @serenity-js/serenity-bdd @serenity-js/web @serenity-js/wdio-cucumber-framework
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide fpr WebdriverIO](https://serenity-js.org/handbook/getting-started/serenity-js-with-webdriverio/).

### Configuring WebdriverIO

To integrate Serenity/JS with WebdriverIO, 
configure your `wdio.conf.ts` to specify `framework: '@serenity-js/webdriverio-cucumber-framework'`.

You can [configure Serenity/JS](https://serenity-js.org/api/core/class/SerenityConfig) in the same file.

```typescript title="wdio.conf.ts"
// wdio.conf.ts

// Optional, import custom Actors if needed; More on this below.
import { Actors } from './serenity/Actors.ts'

export const config: WebdriverIOConfig = {
    
    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio-cucumber-framework',

    // Serenity/JS configuration
    serenity: {
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

    // load Cucumber feature files
    specs: [
        './features/**/*.feature',
    ],
    
    // add any additional native WebdriverIO reporters
    // reporters: [
    //     'spec',
    // ],

    // ... other WebdriverIO-specific configuration   
}
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)
- [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) 
- [Native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)

### Using custom Serenity/JS Actors

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

### Defining Cucumber steps using Serenity/JS Screenplay Pattern

To easily refer to your [Serenity/JS Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/) actors from your Cucumber step definitions,
add the below [parameter types](https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md) to your `support` directory:

```typescript title="features/support/parameters.ts"
// features/support/parameters.ts
import { defineParameterType } from '@cucumber/cucumber'
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core'

defineParameterType({
    regexp: /[A-Z][a-z]+/,
    transformer(name: string) {
        return actorCalled(name)
    },
    name: 'actor',
})

defineParameterType({
    regexp: /he|she|they|his|her|their/,
    transformer() {
        return actorInTheSpotlight()
    },
    name: 'pronoun',
})
```

With the parameter types in place, you can refer to actors using the `{actor}` and `{pronoun}` tokens:

```typescript title="features/step_definitions/example.steps.ts"
// features/step_definitions/example.steps.ts
import { When, Then } from '@cucumber/cucumber'
import { Ensure, equals } from '@serenity-js/assertions'
import { Actor } from '@serenity-js/core'
import { By, Navigate, PageElement, Text } from '@serenity-js/web'

When('{actor} visits the Serenity/JS website', async (actor: Actor) => {
    await actor.attemptsTo(
        Navigate.to('https://serenity-js.org'),
    )
})

Then('{pronoun} should see title saying {string}', async (acot: Actor, title: string) => {
    await actor.attemptsTo(
        Ensure.that(
            Text.of(SerenityJSWebsite.header()),
            equals(title)
        ),
    )
})

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header')          // description to be used in reports
}
```

```gherkin
# features/example.feature
Feature: Example

  Scenario: Visiting the website

    When Alice visits the Serenity/JS Website
    Then she should see title saying "Enable collaborative test automation at any scale!"
```

Learn more:
- [Serenity/JS examples and reference implementations](https://github.com/serenity-js/serenity-js/tree/main/examples)
- [Serenity/JS Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/)

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
