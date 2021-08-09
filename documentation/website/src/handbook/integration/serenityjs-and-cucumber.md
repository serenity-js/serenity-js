---
title: Integrating with Cucumber
layout: handbook.hbs
cta: cta-share
---
# Integrating with Cucumber

[Cucumber](https://github.com/cucumber/cucumber-js) is a popular [collaboration tool](https://cucumber.io/blog/collaboration/the-worlds-most-misunderstood-collaboration-tool/) and a test runner capable of executing test scenarios written in [plain language](https://cucumber.io/docs/guides/overview/).

When you integrate Cucumber.js with Serenity/JS, the framework gathers and reports additional data about your Cucumber scenarios, even if they don't follow the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html) yet! Information reported includes scenario details, details of executed Cucumber steps, their arguments, provide code snippets for steps with missing implementation, and much more.

If you prefer to dive straight into the code, several [reference implementations](https://github.com/serenity-js/serenity-js/tree/master/examples) are available in the [Serenity/JS GitHub repository](https://github.com/serenity-js/serenity-js).
Those implementations demonstrate using Cucumber and Serenity/JS to run both [REST API-](https://github.com/serenity-js/serenity-js/tree/master/examples/cucumber-rest-api-level-testing) and [Web-based](https://github.com/serenity-js/serenity-js/tree/master/examples/protractor-cucumber) acceptance tests.

## Integration architecture

[`@serenity-js/cucumber` module](/modules/cucumber) provides a set of **test runner adapters**, or "formatters" in Cucumber-speak, for **any version** of Cucumber.js. The module picks the most appropriate adapter automatically, depending on the version of Cucumber.js you're using.

Serenity/JS test runner adapters translate the events that occur in the test runner to Serenity/JS [`DomainEvents`](/modules/core/identifiers.html#events); those can be then turned into test reports by [Serenity/JS reporting services](/handbook/reporting/index.html).

<div class="mermaid">
graph TB
    DEV(["fas:fa-laptop-code Developer"])
    TR(["@cucumber/cucumber"])
    SC(["@serenity-js/core"])
    TRA(["@serenity-js/cucumber"])
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
    click TRA "/modules/cucumber"
</div>

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        Integration architecture described in this chapter is applicable when you want to invoke `cucumber-js` command line interface directly, for example for domain-level or [REST/HTTP API-level](/modules/rest) testing. 
    </p>
    <p>If you want your Cucumber scenarios to interact with Web interfaces, check out [Integrating with Protractor](/handbook/integration/serenityjs-and-protractor.html) instead.
    </p></div>
</div>

## Installation

Assuming you already have a [Node.js project ](/handbook/integration/runtime-dependencies.html#a-node-js-project) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/cucumber`](/modules/cucumber)
- [`@cucumber/cucumber`](https://www.npmjs.com/package/@cucumber/cucumber)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,cucumber} @cucumber/cucumber
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node @types/node
```

## Configuration

In a [TypeScript](https://www.typescriptlang.org/) project, create a configuration file at `features/support/config.ts` to inform Serenity/JS what [reporting services](/handbook/reporting/) you wish to use:

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

Learn more about [Serenity/JS reporting services](/handbook/reporting/).

## Reporting

To register `@serenity-js/cucumber` test runner adapter with Cucumber, use the [`--format`](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats) option when invoking the runner.

For example, when running Cucumber in a JavaScript project:

```bash
npx cucumber-js --format '@serenity-js/cucumber' \
    --require 'features/support/config.js' \
    [... any other options]
```

To make Cucumber support step definitions and configuration written in TypeScript, you'll need to add a dev dependency on [`ts-node`](https://www.npmjs.com/package/ts-node) and register it via [`--require-module`](https://github.com/cucumber/cucumber-js/blob/master/features/require_module.feature):

```bash
npx cucumber-js --format '@serenity-js/cucumber' \
    --require-module 'ts-node/register' \
    --require 'features/support/config.ts' \ 
    [... any other options]
```

The above configuration works with the latest version of the `cucumber.Cli` available as part of the [`@cucumber/cucumber`](https://www.npmjs.com/package/@cucumber/cucumber) module. Consult the [`@serenity-js/cucumber` documentation](/modules/cucumber) to learn how to configure the adapter with older versions of the runner.

To install and configure Serenity/JS reporting services appropriate for your project - follow the [Serenity/JS reporting guide](/handbook/reporting/).
