# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Cucumber

The `@serenity-js/cucumber` module contains a set of adapters
that can be registered with [Cucumber CLI runner](https://github.com/cucumber/cucumber-js/) to enable integration and reporting between Cucumber and Serenity/JS.

**Please note:** To use Cucumber and Serenity/JS to execute web-based acceptance tests, you should register the Cucumber adapter via the Protractor configuration file. [Learn more](https://serenity-js.org/modules/protractor/).

### Installation

```
npm install --save-dev @serenity-js/core @serenity-js/cucumber cucumber
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

### Command line usage

#### Cucumber versions 1 and 2

```
cucumber-js --require=node_modules/@serenity-js/cucumber/lib/index.js \
    --require ./features/support/setup.js \
    --require ./features/step_definitions/sample.steps.js 
```

#### Cucumber versions 3 and above

```
cucumber-js --format node_modules/@serenity-js/cucumber \
    --require ./features/support/setup.js \
    --require ./features/step_definitions/sample.steps.js 
```
