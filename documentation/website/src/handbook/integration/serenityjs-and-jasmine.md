---
title: Integrating with Jasmine
layout: handbook.hbs
cta: cta-share
---
# Integrating with Jasmine

[Jasmine](https://jasmine.github.io/) is a universal test runner, particularly popular with projects based on [Angular](https://angular.io/) framework. If your project already uses Jasmine to run its unit tests, you can use the same runner for your acceptance tests too.

When you integrate Jasmine with Serenity/JS, the test framework augments your test reports with additional information about your test scenarios, even if they don't follow the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html) yet!

If you prefer to dive straight into the code, several [reference implementations](https://github.com/serenity-js/serenity-js/tree/master/examples) are available in the [Serenity/JS GitHub repository](https://github.com/serenity-js/serenity-js). Those implementations demonstrate using Jasmine and Serenity/JS to run both [REST API-](https://github.com/serenity-js/serenity-js/tree/master/examples/jasmine-rest-api-level-testing) and [Web-based](https://github.com/serenity-js/serenity-js/tree/master/examples/protractor-jasmine) acceptance tests.

## Integration architecture

[`@serenity-js/jasmine` module](/modules/jasmine) provides a **test runner adapter**, or "reporter" in Jasmine-speak.

Serenity/JS test runner adapters translate the events that occur in the test runner to Serenity/JS [`DomainEvents`](/modules/core/identifiers.html#events); those can be then turned into test reports by [Serenity/JS reporting services](/handbook/reporting/index.html).

<div class="mermaid">
graph TB
    DEV(["fas:fa-laptop-code Developer"])
    TR(["jasmine"])
    SC(["@serenity-js/core"])
    TRA(["@serenity-js/jasmine"])
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
    click TRA "/modules/jasmine"
</div>

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        Integration architecture described in this chapter is applicable when you want to invoke `jasmine` command line interface directly, for example for domain-level or [REST/HTTP API-level](/modules/rest) testing. 
    </p>
    <p>If you want your Jasmine scenarios to interact with Web interfaces, check out [Integrating with Protractor](/handbook/integration/serenityjs-and-protractor.html) instead.
    </p></div>
</div>

### Installation

Assuming you already have a [Node.js project ](/handbook/integration/runtime-dependencies.html#a-node-js-project) set up, add the following dev dependencies:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/jasmine`](/modules/jasmine)
- [`jasmine`](https://www.npmjs.com/package/jasmine)

To do that, run the following command in your terminal:
```bash
npm install --save-dev @serenity-js/{core,jasmine} jasmine
```

If you'd like to implement your test suite in TypeScript, also run:
```bash
npm install --save-dev typescript ts-node @types/{jasmine,node}
```

If you haven't done so already, initialise Jasmine configuration file at `spec/support/jasmine.json` by running the following command:

```bash
npx jasmine init
```

The configuration file should look as follows:
```json
{
  "spec_dir": "spec",
  "spec_files": [
    "**/*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
}
```

### Configuration

#### Using JavaScript

In a JavaScript project, create a configuration file at `spec/helpers/config.js` with the following contents:

```javascript
// spec/helpers/config.js
const { configure } = require('@serenity-js/core');

configure({
    crew: [
        // ... reporting services
    ],
});
```

#### Using TypeScript

To make Jasmine understand test scenarios and configuration written in TypeScript, modify the `spec/support/jasmine.json` file as follows:

```json
{
  "spec_dir": "spec",
  "spec_files": [
    "**/*[sS]pec.ts"
  ],
  "helpers": [
    "helpers/**/*.ts"
  ],
  "requires": [
    "ts-node/register"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
}
```

Next, create a configuration file at `spec/helpers/config.ts`. 

This file will inform Serenity/JS what [reporting services](/handbook/reporting/) you wish to use:

```typescript
// spec/helpers/config.ts
import { configure } from '@serenity-js/core';

configure({
    crew: [
        // ... reporting services
    ],
});
```

#### Reporting

To register `@serenity-js/jasmine` test runner adapter with Jasmine, use the [`--reporter`](https://jasmine.github.io/setup/nodejs.html#--reporter) option when invoking the runner:

```bash
npx jasmine --reporter='@serenity-js/jasmine'
```

To install and configure Serenity/JS reporting services appropriate for your project - follow the [Serenity/JS reporting guide](/handbook/reporting/).
