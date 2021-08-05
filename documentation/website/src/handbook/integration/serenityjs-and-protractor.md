---
title: Integrating with Protractor
layout: handbook.hbs
cta: cta-share
---
# Integrating with Protractor

[Protractor](https://www.protractortest.org/#/) is both a test runner and a wrapper around the [WebDriverJS](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs) testing library.

While optimised for testing Angular applications, Protractor is perfectly capable of interacting with websites and web applications built using any other framework or technology stack. Protractor runs tests in real browsers, uses native events, and browser-specific drivers to interact with your system as a user would.

This chapter covers:
- [Integration architecture overview](/handbook/integration/serenityjs-and-protractor.html#integration-architecture-overview)
- [Integrating Protractor with Serenity/JS and Cucumber](/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-cucumber)
- [Integrating Protractor with Serenity/JS and Jasmine](/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-jasmine)
- [Integrating Protractor with Serenity/JS and Mocha](/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-mocha)
- [Reporting](/handbook/integration/serenityjs-and-protractor.html#reporting)

If you'd like to jump straight into the code, [Serenity/JS GitHub repository](https://github.com/serenity-js) provides a number of [example implementations](https://github.com/serenity-js/serenity-js/tree/master/examples) and [project templates](https://github.com/serenity-js).

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The easiest way to get started with Serenity/JS and Protractor is to use one of the [template projects](https://github.com/serenity-js/) available on GitHub. Serenity/JS template projects come with appropriate Serenity/JS modules and lower-level integration and test tools already configured.
    </p></div>
</div> 

## Integration architecture overview

Protractor consists of two main components:
- the `protractor` command-line interface, which manages the web browser lifecycle, and a 3-rd party test runner you use to actually run your tests,
- the `protractor` library, which provides WebDriverJS APIs your tests use to interact with your website or web application.

Protractor command-line interface doesn't run the tests by itself. Instead, it delegates this responsibility to Jasmine, or any other 3-rd party test runner, as long as you configure it with an [appropriate adapter](https://github.com/angular/protractor/tree/master/lib/frameworks). 

[`@serenity-js/protractor` module](/modules/protractor) provides such an adapter, which on top of vastly improving built-in Protractor reporting capabilities, also enables you to run your test scenarios using [Cucumber](/handbook/integration/serenityjs-and-cucumber.html), [Jasmine](/handbook/integration/serenityjs-and-jasmine.html), or [Mocha](/handbook/integration/serenityjs-and-mocha.html) test runners.

Apart from providing a Protractor adapter, `@serenity-js/protractor` module also gives you [several dozen interfaces](/modules/protractor) to help your web-based tests follow the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html).    

The architecture that you'll need to integrate Protractor with Serenity/JS looks as per the diagram below. We'll explore it in more detail in the context of specific test runners further on in this chapter.

<div class="mermaid">
graph TB
    SUT(["far:fa-window-maximize Web App"])
    DEV(["fas:fa-laptop-code Developer"])
    PCLI["fas:fa-terminal protractor"]
    P(["protractor"])
    PCF["fas:fa-file protractor.conf.js"]
    SPA(["@serenity-js/protractor/adapter"])
    SP(["@serenity-js/protractor"])
    SC(["@serenity-js/core"])
    TR(["fas:fa-plug 3rd-party test runner"])
    TRA(["fas:fa-plug Serenity/JS test runner adapter"])
    SPECS["fas:fa-tasks specs"]
    R(["fas:fa-chart-pie Serenity/JS reporting services"])

    DEV -- invokes --> PCLI
    PCLI -- loads --> PCF
    PCLI -- uses --> SPA
    PCF -- configures --> SC
    SPA -- registers --> TRA
    SPA -- manages --> TR
    TR -- notifies --> TRA
    TR -- executes --> SPECS
    SPECS -- use --> SP
    SP -- notifies --> SC
    SP -- uses --> P
    P -- interacts with --> SUT
    TRA -- notifies --> SC
    SC -- notifies --> R

    class TR socket
    class TRA socket
    class SPECS socket
    class R socket

    click SP "/modules/protractor"
    click SC "/modules/core"
    click R "/handbook/reporting/index.html"
</div>

## Integrating Protractor with Serenity/JS and Cucumber

To integrate Serenity/JS with Protractor and Cucumber, `@serenity-js/protractor/adapter` uses a test runner adapter and a Cucumber "formatter" available as part of the [`@serenity-js/cucumber` module](/handbook/integration/serenityjs-and-cucumber.html).

This means that no matter whether your test suite uses [Cucumber standalone](/handbook/integration/serenityjs-and-cucumber.html), or Cucumber running behind Protractor, the lower-level integration with Serenity/JS works exactly the same and provides the same capabilities.

<div class="mermaid">
graph TB
    SUT(["far:fa-window-maximize Web App"])
    DEV(["fas:fa-laptop-code Developer"])
    PCLI["fas:fa-terminal protractor"]
    P(["protractor"])
    PCF["fas:fa-file protractor.conf.js"]
    SPA(["@serenity-js/protractor/adapter"])
    SP(["@serenity-js/protractor"])
    SC(["@serenity-js/core"])
    TR(["@cucumber/cucumber"])
    TRA(["@serenity-js/cucumber"])
    SPECS["fas:fa-tasks \*.feature"]
    STEPS["fas:fa-file step_definitions/*.ts"]
    R(["fas:fa-chart-pie Serenity/JS reporting services"])

    DEV -- invokes --> PCLI
    PCLI -- loads --> PCF
    PCLI -- uses --> SPA
    PCF -- configures --> SC
    SPA -- registers --> TRA
    SPA -- manages --> TR
    TR -- notifies --> TRA
    TR -- parses --> SPECS
    TR -- uses --> STEPS
    STEPS -- use --> SP
    SP -- notifies --> SC
    SP -- uses --> P
    P -- interacts with --> SUT
    TRA -- notifies --> SC
    SC -- notifies --> R

    class R socket

    click SP "/modules/protractor"
    click SC "/modules/core"
    click R "/handbook/reporting/index.html"
</div>

### Installation

Assuming you already have a [Protractor project](https://github.com/angular/protractor/blob/master/docs/getting-started.md) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/cucumber`](/modules/cucumber)
- [`@serenity-js/protractor`](/modules/protractor)
- [`@cucumber/cucumber`](https://www.npmjs.com/package/@cucumber/cucumber)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,cucumber,protractor} @cucumber/cucumber
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node
```

### Configuration

Modify your `protractor.conf.js` file to register the [`@serenity-js/protractor/adapter`](/modules/protractor)
and configure it to execute your Cucumber scenarios ("`specs`" in Protractor-speak) and `require` your Cucumber step definitions:

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
            'features/step_definitions/**/*.ts',    // or *.js
        ],
        'require-module': ['ts-node/register'],     // to add support for TypeScript
    },
    
    // ... other Protractor config omitted for brevity 
};
```

To learn more about the available configuration options, check out:
- [`SerenityConfig`](/modules/core/class/src/SerenityConfig.ts~SerenityConfig.html), provided as `serenity` in `protractor.conf.js`
- [`CucumberConfig`](/modules/cucumber/class/src/cli/CucumberConfig.ts~CucumberConfig.html), provided as `cucumberOpts` in `protractor.conf.js`
- [`ProtractorConfig`](https://github.com/angular/protractor/blob/master/lib/config.ts)

To install and configure Serenity/JS reporting modules appropriate for your project (a.k.a. the `crew`) - follow the [Serenity/JS reporting guide](/handbook/reporting/).

#### Using native Cucumber reporters

You can use [native Cucumber reporters](https://github.com/cucumber/cucumber-js/tree/master/src/formatter) together with, or instead of those provided by Serenity/JS.

To do that, specify them using a `<formatterName:outputFileName>` format to save their output to a file, or simply `<formatterName>` to print their output to terminal. For example:

```javascript
// protractor.conf.js
exports.config = {

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    specs: [ 'features/*.feature', ],
    cucumberOpts: {
        format: [
            'usage',                // or 'usage:usage.txt' to print to file
            'html:cucumber.html',
            'snippets:snippets.txt',
            'summary:summary.txt',
        ],
        require: [
            'features/step_definitions/**/*.ts',    // or *.js
        ],
        'require-module': ['ts-node/register'],     // to add support for TypeScript
        tags:    ['~@wip'],
        strict:  false,
    },
    
    // ... other Protractor config omitted for brevity 
};
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        Cucumber.js supports <strong>only one native formatter per output</strong>.
        In particular, you can't have more than one Cucumber.js formatter writing to standard output or to the same file.
    </p><p>
        Please also note that when you configure Serenity/JS to use any of its [reporting services](https://serenity-js.org/handbook/reporting/index.html) (via the `serenity.crew` option), the framework will <strong>automatically disable</strong>
        any native Cucumber reporters printing to the terminal to avoid overlapping output.
    </p><p>
        You can, however, redirect output of such reporter to a file, so instead of `usage` use `usage:usage.txt`.
    </p></div>
</div>

## Integrating Protractor with Serenity/JS and Jasmine

To integrate Serenity/JS with Protractor and Jasmine, `@serenity-js/protractor/adapter` uses a test runner adapter and a Jasmine reporter available as part of the [`@serenity-js/jasmine` module](/handbook/integration/serenityjs-and-jasmine.html).

This means that no matter whether your test suite uses [Jasmine standalone](/handbook/integration/serenityjs-and-jasmine.html), or Jasmine running behind Protractor, the lower-level integration with Serenity/JS works exactly the same and provides the same capabilities.

<div class="mermaid">
graph TB
    SUT(["far:fa-window-maximize Web App"])
    DEV(["fas:fa-laptop-code Developer"])
    PCLI["fas:fa-terminal protractor"]
    P(["protractor"])
    PCF["fas:fa-file protractor.conf.js"]
    SPA(["@serenity-js/protractor/adapter"])
    SP(["@serenity-js/protractor"])
    SC(["@serenity-js/core"])
    TR(["jasmine"])
    TRA(["@serenity-js/jasmine"])
    SPECS["fas:fa-tasks \*.spec.ts"]
    SPECS -- use --> SP
    R(["fas:fa-chart-pie Serenity/JS reporting services"])

    DEV -- invokes --> PCLI
    PCLI -- loads --> PCF
    PCLI -- uses --> SPA
    PCF -- configures --> SC
    SPA -- registers --> TRA
    SPA -- manages --> TR
    TR -- notifies --> TRA
    TR -- runs --> SPECS
    SP -- notifies --> SC
    SP -- uses --> P
    P -- interacts with --> SUT
    TRA -- notifies --> SC
    SC -- notifies --> R

    class R socket

    click SP "/modules/protractor"
    click SC "/modules/core"
    click R "/handbook/reporting/index.html"
</div>

### Installation

Assuming you already have a [Protractor project](https://github.com/angular/protractor/blob/master/docs/getting-started.md) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/jasmine`](/modules/jasmine)
- [`@serenity-js/protractor`](/modules/protractor)
- [`jasmine`](https://www.npmjs.com/package/jasmine)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,jasmine,protractor} jasmine@3
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    `@serenity-js/jasmine` module enables your tests to use the latest version of Jasmine test runner, version 3. This version is newer than version 2 that ships with Protractor.
    </p></div>
</div>

### Configuration

Modify your `protractor.conf.js` file to register the [`@serenity-js/protractor/adapter`](/modules/protractor)
and configure it to execute your Jasmine "`specs`":

```javascript
// protractor.conf.js
exports.config = {
    
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
    
    serenity: {
        runner: 'jasmine',
        crew: [
            // ... reporting services
        ]
    },

    specs: [ 'spec/*.spec.ts', ],                   // or *.spec.js
    jasmineNodeOpts: {
        requires: [
            'ts-node/register',                     // to add support for TypeScript
        ]
    },
    
    // ... other Protractor config omitted for brevity 
};
```

To learn more about the available configuration options, check out:
- [`SerenityConfig`](/modules/core/class/src/SerenityConfig.ts~SerenityConfig.html), provided as `serenity` in `protractor.conf.js`
- [`JasmineConfig`](/modules/jasmine/class/src/adapter/JasmineConfig.ts~JasmineConfig.html), provided as `jasmineNodeOpts` in `protractor.conf.js`
- [`ProtractorConfig`](https://github.com/angular/protractor/blob/master/lib/config.ts)

To install and configure Serenity/JS reporting modules appropriate for your project (a.k.a. the `crew`) - follow the [Serenity/JS reporting guide](/handbook/reporting/).

## Integrating Protractor with Serenity/JS and Mocha

To integrate Serenity/JS with Protractor and Jasmine, `@serenity-js/protractor/adapter` uses a test runner adapter and a Mocha reporter available as part of the [`@serenity-js/mocha` module](/handbook/integration/serenityjs-and-mocha.html).

This means that no matter whether your test suite uses [Mocha standalone](/handbook/integration/serenityjs-and-mocha.html), or Mocha running behind Protractor, the lower-level integration with Serenity/JS works exactly the same and provides the same capabilities.

<div class="mermaid">
graph TB
    SUT(["far:fa-window-maximize Web App"])
    DEV(["fas:fa-laptop-code Developer"])
    PCLI["fas:fa-terminal protractor"]
    P(["protractor"])
    PCF["fas:fa-file protractor.conf.js"]
    SPA(["@serenity-js/protractor/adapter"])
    SP(["@serenity-js/protractor"])
    SC(["@serenity-js/core"])
    TR(["mocha"])
    TRA(["@serenity-js/mocha"])
    SPECS["fas:fa-tasks \*.spec.ts"]
    SPECS -- use --> SP
    R(["fas:fa-chart-pie Serenity/JS reporting services"])

    DEV -- invokes --> PCLI
    PCLI -- loads --> PCF
    PCLI -- uses --> SPA
    PCF -- configures --> SC
    SPA -- registers --> TRA
    SPA -- manages --> TR
    TR -- notifies --> TRA
    TR -- runs --> SPECS
    SP -- notifies --> SC
    SP -- uses --> P
    P -- interacts with --> SUT
    TRA -- notifies --> SC
    SC -- notifies --> R

    class R socket

    click SP "/modules/protractor"
    click SC "/modules/core"
    click R "/handbook/reporting/index.html"
</div>

### Installation

Assuming you already have a [Protractor project](https://github.com/angular/protractor/blob/master/docs/getting-started.md) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/mocha`](/modules/mocha)
- [`@serenity-js/protractor`](/modules/protractor)
- [`mocha`](https://www.npmjs.com/package/mocha)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,mocha,protractor} mocha
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node
```

### Configuration

Modify your `protractor.conf.js` file to register the [`@serenity-js/protractor/adapter`](/modules/protractor)
and configure it to execute your Mocha "`specs`":

```javascript
// protractor.conf.js
exports.config = {
    
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
    
    serenity: {
        runner: 'mocha',
        crew: [
            // ... reporting services
        ]
    },

    specs: [ 'spec/*.spec.ts', ],                   // or *.spec.js

    mochaOpts: {
        require: [
            'ts-node/register',                     // to add support for TypeScript
        ],
    },
    
    // ... other Protractor config omitted for brevity 
};
```

To learn more about the available configuration options, check out:
- [`SerenityConfig`](/modules/core/class/src/SerenityConfig.ts~SerenityConfig.html), provided as `serenity` in `protractor.conf.js`
- [`MochaConfig`](/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html), provided as `mochaOpts` in `protractor.conf.js`
- [`ProtractorConfig`](https://github.com/angular/protractor/blob/master/lib/config.ts)

To install and configure Serenity/JS reporting modules appropriate for your project (a.k.a. the `crew`) - follow the [Serenity/JS reporting guide](/handbook/reporting/).

## Reporting

To install and configure Serenity/JS reporting modules appropriate for your project - follow the [Serenity/JS reporting guide](/handbook/reporting/).
