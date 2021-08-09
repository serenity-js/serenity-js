---
title: Integrating with Mocha
layout: handbook.hbs
cta: cta-share
---
# Integrating with Mocha

[Mocha.js](https://mochajs.org/) is a universal test runner providing a number of useful features, such as [automatic retry of failed tests](/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html#instance-member-retries). If your project already uses Mocha to run its unit tests, you can use the same runner for your acceptance tests too. 

When you integrate Mocha with Serenity/JS, the framework augments your test reports with additional information about your test scenarios, even if they don't follow the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html) yet!

If you prefer to dive straight into the code, several [reference implementations](https://github.com/serenity-js/serenity-js/tree/master/examples) are available in the [Serenity/JS GitHub repository](https://github.com/serenity-js/serenity-js). Those implementations demonstrate using Mocha and Serenity/JS to run both [REST API-](https://github.com/serenity-js/serenity-js/tree/master/examples/mocha-rest-api-level-testing) and [Web-based](https://github.com/serenity-js/serenity-js/tree/master/examples/protractor-mocha) acceptance tests.

## Integration architecture

[`@serenity-js/mocha` module](/modules/mocha) provides a **test runner adapter**, or "reporter" in Mocha-speak.

Serenity/JS test runner adapters translate the events that occur in the test runner to Serenity/JS [`DomainEvents`](/modules/core/identifiers.html#events); those can be then turned into test reports by [Serenity/JS reporting services](/handbook/reporting/index.html).

<div class="mermaid">
graph TB
    DEV(["fas:fa-laptop-code Developer"])
    TR(["mocha"])
    SC(["@serenity-js/core"])
    TRA(["@serenity-js/mocha"])
    CF["fas:fa-file config.ts"]
    R(["fas:fa-chart-pie Serenity/JS reporting services"])

    DEV -- invokes --> TR
    TR -- loads --> CF
    TR -- notifies --> TRA
    TRA -- notifies --> SC
    CF -- configures --> SC
    SC -- notifies --> R

    class R socket

    click R "/handbook/reporting/index.html"
    click SC "/modules/core"
    click TRA "/modules/mocha"
</div>

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        Integration architecture described in this chapter is applicable when you want to invoke `mocha` command line interface directly, for example for domain-level or [REST/HTTP API-level](/modules/rest) testing. 
    </p>
    <p>If you want your Mocha scenarios to interact with Web interfaces, check out [Integrating with Protractor](/handbook/integration/serenityjs-and-protractor.html) instead.
    </p></div>
</div>

#### Installation

Assuming you already have a [Node.js project ](/handbook/integration/runtime-dependencies.html#a-node-js-project) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/mocha`](/modules/mocha)
- [`mocha`](https://www.npmjs.com/package/mocha)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,mocha} mocha
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node @types/{mocha,node}
```

#### Configuration

In a [TypeScript](https://www.typescriptlang.org/) project, create a configuration file in a location of your choosing, i.e. `spec/config.ts`. This file will inform Serenity/JS what [reporting services](/handbook/reporting/) you wish to use:

```typescript
// spec/config.ts
import { configure } from '@serenity-js/core';

configure({
    crew: [
        // ... reporting services
    ],
});
```

In a JavaScript project, create a configuration file at `spec/config.js` instead:

```javascript
// spec/config.js
const { configure } = require('@serenity-js/core');

configure({
    crew: [
        // ... reporting services
    ],
});
```

Learn more about [Serenity/JS reporting](/handbook/reporting/).

#### Reporting

To register `@serenity-js/mocha` test runner adapter with Mocha, use the [`--reporter`](https://mochajs.org/#command-line-usage) option when invoking the runner.

For example, when running Mocha in a JavaScript project:

```bash
npx mocha --reporter '@serenity-js/mocha' \
    --require 'spec/config.js' \
    [... any other options]
```

To make Mocha support test scenarios and configuration written in TypeScript, you'll need to add a dev dependency on [`ts-node`](https://www.npmjs.com/package/ts-node) and register it via [`--require`](https://mochajs.org/#command-line-usage):

```bash
npx mocha --reporter '@serenity-js/mocha' \
    --require 'ts-node/register' \
    --require 'spec/config.ts' \ 
    [... any other options]
```

To install and configure Serenity/JS reporting services appropriate for your project - follow the [Serenity/JS reporting guide](/handbook/reporting/).
