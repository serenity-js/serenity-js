# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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
