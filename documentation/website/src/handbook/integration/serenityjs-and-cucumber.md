---
title: Serenity/JS and Cucumber
layout: handbook.hbs
cta: cta-share
---
# Serenity/JS and Cucumber

[Cucumber](https://github.com/cucumber/cucumber-js) is a popular [collaboration tool](https://cucumber.io/blog/collaboration/the-worlds-most-misunderstood-collaboration-tool/) and a test runner capable of executing test scenarios written in [plain language](https://cucumber.io/docs/guides/overview/).

When integration with Cucumber is enabled, your Serenity/JS-based test framework can gather and report additional data about your Cucumber scenarios. This includes their name, file system location, details of executed Cucumber steps, their arguments, provide code snippets for steps with missing implementation, and more.

If you prefer to dive straight into the code, several reference implementations are available in the [Serenity/JS repository](https://github.com/serenity-js/serenity-js/tree/master/examples).

## Integration

To integrate Cucumber with Serenity/JS, you need to:
- install relevant Serenity/JS modules,
- configure [`@serenity-js/core`](/modules/core) to use [Serenity/JS reporting modules](/handbook/integration/reporting.html),
- register a [`@serenity-js/cucumber`](/modules/cucumber) reporting adapter with Cucumber,
- configure [Serenity/JS reporting modules](/handbook/integration/reporting.html).

The way you do it differs slightly depending on whether you execute Cucumber directly via its command line interface, or via another test runner like Angular Protractor. 

**Please note:** `@serenity-js/cucumber` module provides adapters for  _all versions_ of Cucumber and can automatically find the best one to use, so you don't need to worry about it.

## Cucumber standalone 

Integration architecture depicted below is applicable when you want to invoke the `cucumber-js` command line interface directly, for example for domain-level or [REST/HTTP API-level](/modules/rest) testing.

<div class="mermaid">
graph TB
    DEV(["fas:fa-laptop-code Developer"])
    CLI["fas:fa-terminal cucumber-js"]
    C["cucumber.Cli"]
    SC(["@serenity-js/core"])
    SCA(["@serenity-js/cucumber"])
    CF["fas:fa-file config.ts"]
    R(["fas:fa-chart-pie Serenity/JS reporting module(s)"])

    DEV -- invokes --> CLI
    CLI -- uses --> C
    C -- loads --> CF
    C -- notifies --> SCA
    SCA -- notifies --> SC
    CF -- configures --> SC
    SC -- notifies --> R

    subgraph "@cucumber/cucumber"
    CLI
    C
    end

    class R socket
</div>

### Install dependencies

Assuming you already have Cucumber [installed](/modules/cucumber/#installation), add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/cucumber`](/modules/cucumber)

To do that, run the following command in your terminal:

```console
npm install --save-dev @serenity-js/{core,cucumber}
```

### Configure Serenity/JS

In a [TypeScript](https://www.typescriptlang.org/) project, create a configuration file at `features/support/config.ts` to inform Serenity/JS what [reporting services](/handbook/integration/reporting.html) you wish to use:

```typescript
// features/support/config.ts

import { configure } from '@serenity-js/core';

configure({
    crew: [
        // ... reporting services
    ],
});
```

In a JavaScript project, create a configuration file at `features/support/config.js` instead:

```javascript
// features/support/config.js

const { configure } = require('@serenity-js/core');

configure({
    crew: [
        // ... reporting services
    ],
});
```

Learn more about [Serenity/JS reporting](/handbook/integration/reporting.html).

### Register Serenity/JS adapter

To register `@serenity-js/cucumber` adapter with Cucumber, use the [`--format`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) option.

For example, when running Cucumber in a JavaScript project:

```console
cucumber-js --format '@serenity-js/cucumber' \
    --require 'features/support/config.js' \
    [... any other options]
```

To make Cucumber support step definitions and configuration written in TypeScript, you'll need to add a dev dependency on [`ts-node`](https://www.npmjs.com/package/ts-node) and register it via [`--require-module`](https://github.com/cucumber/cucumber-js/blob/master/features/require_module.feature):

```console
cucumber-js --format '@serenity-js/cucumber' \
    --require-module 'ts-node/register' \
    --require 'features/support/config.ts' \ 
    [... any other options]
```

The above configuration works with the latest version of the `cucumber.Cli` available as part of the [`@cucumber/cucumber`](https://www.npmjs.com/package/@cucumber/cucumber) module. Consult the [`@serenity-js/cucumber` documentation](/modules/cucumber) to learn how to configure the adapter with older versions of the runner.


## Cucumber with Protractor

To use [Angular Protractor](https://www.protractortest.org/) with both Cucumber and Serenity/JS, you need an additional adapter available as part of the [`@serenity-js/protractor` module](/modules/protractor).

As per the architecture diagram below, the Serenity/JS Protractor adapter:
- manages interactions between Protractor and Cucumber,
- helps to configure [`@serenity-js/core`](/modules/core) based on your [`protractor.conf.js`](https://github.com/angular/protractor/blob/master/lib/config.ts),
- registers the [`@serenity-js/cucumber`](/modules/cucumber) adapter for you, so you don't need to do it explicitly.

<div class="mermaid">
graph TB
    DEV(["fas:fa-laptop-code Developer"])
    P(["protractor"])
    PCF["fas:fa-file protractor.conf.js"]
    SPA(["@serenity-js/protractor"])
    SC(["@serenity-js/core"])
    TR(["@cucumber/cucumber"])
    TRA(["@serenity-js/cucumber"])
    R(["fas:fa-chart-pie Serenity/JS reporting module(s)"])

    DEV -- invokes --> P
    P -- uses --> SPA
    P -- loads --> PCF
    PCF -- configures --> SPA
    SPA -- configures -->SC
    SPA -- manages --> TR
    SPA -- registers --> TRA
    TR -- notifies --> TRA
    TRA -- notifies --> SC
    SC -- notifies --> R

    class R socket

    click SP "/modules/protractor"
    click SC "/modules/core"
</div>

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong> [`@serenity-js/protractor`](/modules/protractor) can manage [other test runners](/handbook/integration/serenityjs-and-protractor.html) too!</p></div>
</div>

### Install dependencies

Assuming you already have a [Protractor project](https://github.com/angular/protractor/blob/master/docs/getting-started.md) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/cucumber`](/modules/cucumber)
- [`@serenity-js/protractor`](/modules/protractor)

To do that, run the following command in your terminal:
```console
npm install --save-dev @serenity-js/{core,cucumber,protractor}
```

### Configure Protractor and Serenity/JS

Modify your `protractor.conf.js` file to register the [`@serenity-js/protractor`](/modules/protractor)
and configure it to execute your Cucumber `specs`:

```javascript
// protractor.conf.js

exports.config = {
    
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
    
    serenity: {
        runner: 'cucumber',
        crew: [
            // ... reporting services
        ]
    },

    specs: [ 'features/*.feature', ],
    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
        ],
        'require-module': ['ts-node/register'],
    },
    
    // ... other Protractor config omitted for brevity 
};
```

Note that any Cucumber-specific configuration can be provided via [`cucumberOpts`](/modules/cucumber/class/src/cli/CucumberConfig.ts~CucumberConfig.html).

## Reporting

To install and configure Serenity/JS reporting modules appropriate for your project - follow the [Serenity/JS reporting guide](/handbook/integration/reporting.html) 
