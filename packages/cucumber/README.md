# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Cucumber

[`@serenity-js/cucumber`](https://serenity-js.org/modules/cucumber/) contains a set of adapters you register with [Cucumber CLI runners](https://github.com/cucumber/cucumber-js/) to enable integration and reporting between Cucumber.js and Serenity/JS.

**Please note:** To use Cucumber and Serenity/JS to execute web-based acceptance tests, you should register Serenity/JS Cucumber adapter using Protractor configuration file. 

Learn more about integrating Serenity/JS Cucumber:
- with [Protractor and Cucumber.js](https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-cucumber),
- with [Cucumber.js](https://serenity-js.org/handbook/integration/serenityjs-and-cucumber.html).

### Installation

To install this module, run:
```
npm install --save-dev @serenity-js/{cucumber,core}
```

This module reports test scenarios executed by **any version of Cucumber.js**, from 0.x to 7.x, which you need to install
separately.

To install [Cucumber 7.x](https://www.npmjs.com/package/@cucumber/cucumber), run:
```
npm install --save-dev @cucumber/cucumber 
```

To install [Cucumber 6.x](https://www.npmjs.com/package/cucumber) or earlier, run:
```
npm install --save-dev cucumber 
```

### Command line usage

#### Cucumber 7.x

```
cucumber-js --format @serenity-js/cucumber \
    --require ./features/support/setup.js \
    --require ./features/step_definitions/sample.steps.js 
```

#### Cucumber 3.x to 6.x

```
cucumber-js --format node_modules/@serenity-js/cucumber \
    --require ./features/support/setup.js \
    --require ./features/step_definitions/sample.steps.js 
```

#### Cucumber 0.x to 2.x

```
cucumber-js --require=node_modules/@serenity-js/cucumber/lib/index.js \
    --require ./features/support/setup.js \
    --require ./features/step_definitions/sample.steps.js 
```

### Configuration

When used with a configuration file written in JavaScript:

```javascript
// features/support/setup.js

const { configure } = require('@serenity-js/core');

configure({
    // ... configure Serenity/JS 
});
```

When used with a configuration file written in TypeScript:

```typescript
// features/support/setup.ts

import { configure } from '@serenity-js/core';

configure({
    // ... configure Serenity/JS 
});
```

### Integration

This module can be integrated with:
- [`@serenity-js/serenity-bdd`](https://serenity-js.org/modules/serenity-bdd) to produce HTML reports and living documentation,
- [`@serenity-js/console-reporter`](https://serenity-js.org/modules/console-reporter) to print test execution reports to your computer terminal,
- [`@serenity-js/protractor`](https://serenity-js.org/modules/protractor) to implement Cucumber scenarios interacting with Web applications.

Learn more about [Serenity/JS Modules](https://serenity-js.org/modules).
