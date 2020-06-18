# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Protractor

The `@serenity-js/protractor` module is a Screenplay Patter-style adapter for the [Protractor framework](https://www.protractortest.org/), which helps with testing Angular, React, Vue and other frontend web apps.

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

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, Protractor and either [Jasmine](https://jasmine.github.io/) or [Cucumber](https://github.com/cucumber/cucumber-js) is by using one of the below template repositories:

- [Sernity/JS, Jasmine, and Protractor template](https://github.com/serenity-js/serenity-js-jasmine-protractor-template)
- [Serenity/JS, Cucumber, and Protractor template](https://github.com/serenity-js/serenity-js-jasmine-protractor-template)


