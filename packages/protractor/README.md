# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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

**Please note** that Serenity/JS Protractor / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#built-in-formatters), so you can use this module as a drop-in replacement of [`protractor-cucumber-framework`](https://www.npmjs.com/package/protractor-cucumber-framework).

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
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            ConsoleReporter.forDarkTerminals(),
            Photographer.whoWill(TakePhotosOfFailures),     // or Photographer.whoWill(TakePhotosOfInteractions),
            new SerenityBDDReporter(),
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
import { BrowseTheWeb, Navigate, Target, Text } from '@serenity-js/protractor';
import { protractor, by } from 'protractor';

class SerenityJSWebsite {
    static header = Target.the('header').located(by.css('h1'));
}

actorCalled('Priya')
    .whoCan(
        BrowseTheWeb.using(protractor.browser_download_url)
    )
    .attemptsTo(
        Navigate.to('https://serenity-js.org'),
        Ensure.that(Text.of(SerenityJSWebsite.header), equals('Next generation acceptance testing')),
)
```

### Template Repositories

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, Protractor and either [Mocha](https://mochajs.org/), [Cucumber](https://github.com/cucumber/cucumber-js) or [Jasmine](https://jasmine.github.io/) is by using one of the below template repositories:

- [Serenity/JS, Mocha, and Protractor template](https://github.com/serenity-js/serenity-js-mocha-protractor-template)
- [Serenity/JS, Cucumber, and Protractor template](https://github.com/serenity-js/serenity-js-cucumber-protractor-template)
- [Serenity/JS, Jasmine, and Protractor template](https://github.com/serenity-js/serenity-js-jasmine-protractor-template)


