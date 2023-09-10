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

## Serenity/JS Protractor

[`@serenity-js/protractor`](https://serenity-js.org/api/protractor/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [Protractor framework](https://www.protractortest.org/), that helps with testing Angular, React, Vue
and other frontend web apps.

Learn more about [integrating Serenity/JS with Protractor](https://serenity-js.org/handbook/test-runners/protractor/).

### Installation

To install this module, run:

```sh
npm install --save-dev @serenity-js/core @serenity-js/protractor
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide for Protractor](https://serenity-js.org/handbook/getting-started/serenity-js-with-protractor/).

#### Usage with Cucumber.js

To use Serenity/JS Protractor with Cucumber.js, install the following adapter:
```console
npm install --save-dev @serenity-js/cucumber
```

**Please note** that Serenity/JS Protractor / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#built-in-formatters), so you can use this module as a drop-in replacement of [`protractor-cucumber-framework`](https://www.npmjs.com/package/protractor-cucumber-framework).

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/test-runners/protractor/).

#### Usage with Jasmine

To use Serenity/JS Protractor with Jasmine, install the following adapter:
```console
npm install --save-dev @serenity-js/jasmine
```

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/test-runners/protractor/).

#### Usage with Mocha

To use Serenity/JS Protractor with Mocha, install the following adapter:
```console
npm install --save-dev @serenity-js/mocha
```

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/test-runners/protractor/).

### Configuring Protractor

```typescript
// protractor.conf.js

// Import the Serenity/JS reporting services, a.k.a. the "Stage Crew Members"
const
    { ArtifactArchiver } = require('@serenity-js/core'),
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { Photographer, TakePhotosOfFailures, TakePhotosOfInteractions } = require('@serenity-js/protractor'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd')

exports.config = {
    // Tell Protractor to use the Serenity/JS framework Protractor Adapter
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
  
    // Configure Serenity/JS to use an appropriate test runner
    // and the Stage Crew Members we've imported at the top of this file
    serenity: {
        runner: 'jasmine',
        // runner: 'cucumber',
        // runner: 'mocha',
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: './target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures', // or: 'TakePhotosOfInteractions'
            } ],
        ]
    },

    // configure Cucumber runner
    cucumberOpts: {
        // see the Cucumber configuration options below
    },

    // or configure Jasmine runner
    jasmineNodeOpts: {
        // see the Jasmine configuration options below
    },

    // or configure Mocha runner
    mochaOpts: {
        // see the Mocha configuration options below
    },

    // ... other Protractor-specific configuration   
}
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
- [Jasmine configuration options](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
- [Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
- [Protractor configuration file](https://github.com/angular/protractor/blob/master/lib/config.ts).

### Interacting with websites and web apps

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { By, Navigate, Target, Text } from '@serenity-js/web'
import { BrowseTheWebWithProtractor } from '@serenity-js/protractor'
import { protractor } from 'protractor'

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header')          // description to be used in reports
}

// example Jasmine test
describe('Serenity/JS', () => {
    
    it('works with Protractor and Jasmine', async () => {
        await actorCalled('Priya')
            .whoCan(
                BrowseTheWebWithProtractor.using(protractor.browser)
            )
            .attemptsTo(
                Navigate.to('https://serenity-js.org'),
                Ensure.that(
                    Text.of(SerenityJSWebsite.header()), 
                    equals('Next generation acceptance testing')
                ),
            )
    })
})
```

### Template Repositories

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, Protractor and either [Mocha](https://mochajs.org/), [Cucumber](https://github.com/cucumber/cucumber-js) or [Jasmine](https://jasmine.github.io/) is by using one of the below template repositories:

- [Serenity/JS, Mocha, and Protractor template](https://github.com/serenity-js/serenity-js-mocha-protractor-template)
- [Serenity/JS, Cucumber, and Protractor template](https://github.com/serenity-js/serenity-js-cucumber-protractor-template)
- [Serenity/JS, Jasmine, and Protractor template](https://github.com/serenity-js/serenity-js-jasmine-protractor-template)

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

