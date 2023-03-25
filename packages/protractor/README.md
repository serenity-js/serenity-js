# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Protractor

[`@serenity-js/protractor`](https://serenity-js.org/modules/protractor/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [Protractor framework](https://www.protractortest.org/), that helps with testing Angular, React, Vue
and other frontend web apps.

Learn more about [integrating Serenity/JS with Protractor](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html).

### Installation

To install this module, run:

```console
npm install --save-dev @serenity-js/{core,protractor}
```

Next, install one of the below test runner adapters.

Learn more about [integrating Serenity/JS with Protractor](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html).

#### Usage with Cucumber.js

To use Serenity/JS Protractor with Cucumber.js, install the following adapter:
```console
npm install --save-dev @serenity-js/cucumber
```

**Please note** that Serenity/JS Protractor / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#built-in-formatters), so you can use this module as a drop-in replacement of [`protractor-cucumber-framework`](https://www.npmjs.com/package/protractor-cucumber-framework).

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-cucumber).

#### Usage with Jasmine

To use Serenity/JS Protractor with Jasmine, install the following adapter:
```console
npm install --save-dev @serenity-js/jasmine
```

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-jasmine).

#### Usage with Mocha

To use Serenity/JS Protractor with Mocha, install the following adapter:
```console
npm install --save-dev @serenity-js/mocha
```

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-mocha).

### Configuring Protractor

```typescript
// protractor.conf.js

// Import the Serenity/JS reporting services, a.k.a. the "Stage Crew Members"
const
    { ArtifactArchiver } = require('@serenity-js/core'),
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { Photographer, TakePhotosOfFailures, TakePhotosOfInteractions } = require('@serenity-js/protractor'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd');

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
};
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/modules/cucumber/class/src/cli/CucumberConfig.ts~CucumberConfig.html)
- [Jasmine configuration options](https://serenity-js.org/modules/jasmine/class/src/adapter/JasmineConfig.ts~JasmineConfig.html)
- [Mocha configuration options](https://serenity-js.org/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html)
- [Protractor configuration file](https://github.com/angular/protractor/blob/master/lib/config.ts).

### Interacting with websites and web apps

```typescript
import { actorCalled } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { By, Navigate, Target, Text } from '@serenity-js/web';
import { BrowseTheWebWithProtractor } from '@serenity-js/protractor';
import { protractor } from 'protractor';

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header');         // description to be used in reports
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


