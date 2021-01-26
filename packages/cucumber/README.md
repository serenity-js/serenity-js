# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Cucumber

The `@serenity-js/cucumber` module contains a set of adapters you register with [Cucumber CLI runners](https://github.com/cucumber/cucumber-js/) to enable integration and reporting between Cucumber.js and Serenity/JS.

**Please note:** To use Cucumber and Serenity/JS to execute web-based acceptance tests, you should register the Cucumber adapter via the Protractor configuration file. [Learn more](https://serenity-js.org/modules/protractor/).

### Installation

To install this module, run:
```
npm install --save-dev @serenity-js/cucumber
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
