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

To learn more about Serenity/JS, [follow the tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), [review the examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

## Serenity/JS WebdriverIO

[`@serenity-js/webdriverio`](https://serenity-js.org/modules/webdriverio/) module is a [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html)-style adapter
for [WebdriverIO](https://webdriver.io/), that helps with testing Web-based and mobile apps.

### Installation

To install this module, run the following command in your [WebdriverIO project directory](https://webdriver.io/docs/gettingstarted/):

```bash
npm install --save-dev @serenity-js/{core,webdriverio}
```

Next, install one of the below test runner adapters.

#### Usage with Cucumber.js

To use Serenity/JS WebdriverIO with Cucumber.js, install the following adapter:
```bash
npm install --save-dev @serenity-js/cucumber
```

**Please note** that Serenity/JS WebdriverIO / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#built-in-formatters).

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
// wdio.conf.ts

// Import Serenity/JS reporting services, a.k.a. the "Stage Crew Members"
import { ArtifactArchiver } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures, WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {
    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    serenity: {
        // Configure Serenity/JS to use an appropriate test runner adapter
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // Register StageCrewMembers we've imported at the top of this file    
        crew: [
            ArtifactArchiver.storingArtifactsAt(process.cwd(), 'target/site/serenity'),
            ConsoleReporter.forDarkTerminals(),
            new SerenityBDDReporter(),
            Photographer.whoWill(TakePhotosOfFailures),
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

### Interacting with websites and web apps

```typescript
import { actorCalled } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';
import { by, BrowseTheWeb, Navigate, Target, Text } from '@serenity-js/webdriverio';

class SerenityJSWebsite {
    static header = Target.the('header').located(by.css('h1'));
}

actorCalled('Wendy')
    .whoCan(
        BrowseTheWeb.using(browser)
    )
    .attemptsTo(
        Navigate.to('https://serenity-js.org'),
        Ensure.that(
            Text.of(SerenityJSWebsite.header), 
            equals('Next generation acceptance testing')
        ),
    )
```

To learn more, check out the [example projects](https://github.com/serenity-js/serenity-js/tree/master/examples).

### Template Repositories

The easiest way for you to start writing web-based acceptance tests using Serenity/JS, WebdriverIO and either [Mocha](https://mochajs.org/), [Cucumber](https://github.com/cucumber/cucumber-js) or [Jasmine](https://jasmine.github.io/) is by using one of the below template repositories:

- [Serenity/JS, Mocha, and WebdriverIO template](https://github.com/serenity-js/serenity-js-mocha-webdriverio-template)
- Serenity/JS, Cucumber, and WebdriverIO template (coming soon!)
- Serenity/JS, Jasmine, and WebdriverIO template (coming soon!)

## More coming soon!

New features, tutorials, and demos are coming soon, so follow us on Twitter and join the [Serenity/JS Community chat channel](https://gitter.im/serenity-js/Lobby) to stay up to date!

[![Twitter Follow](https://img.shields.io/twitter/follow/SerenityJS?style=social)](https://twitter.com/@SerenityJS)
[![Twitter Follow](https://img.shields.io/twitter/follow/JanMolak?style=social)](https://twitter.com/@JanMolak)
[![Chat on Gitter](https://badges.gitter.im/serenity-js/Lobby.svg)](https://gitter.im/serenity-js/Lobby)
