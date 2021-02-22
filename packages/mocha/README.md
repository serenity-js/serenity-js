# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

## Serenity/JS Mocha

[`@serenity-js/mocha`](https://serenity-js.org/modules/mocha/) contains an adapter you register with [Mocha test runner](https://mochajs.org/) to enable integration between Mocha and Serenity/JS.

### Installation

Install [Mocha](https://mochajs.org/) version 8.x or newer:

```console
npm install --save-dev mocha@8.x
```

Install the `@serenity-js/mocha` adapter, as well as `@serenity-js/core` and any [Serenity/JS reporting modules](https://serenity-js.org/modules/console-reporter/) you'd like to use, for example [`@serenity-js/console-reporter`](https://serenity-js.org/modules/console-reporter/):

```console
npm install --save-dev @serenity-js/{core,console-reporter,mocha}
```

Learn more about [integrating Serenity/JS with Mocha](https://serenity-js.org/handbook/integration/serenityjs-and-mocha.html)

### Usage with standalone Mocha

To use Serenity/JS with standalone Mocha, for example to run tests of [REST APIs](https://serenity-js/modules/rest),
you'll need a setup file that configures Serenity/JS reporting services.

#### JavaScript

If you're writing your tests in JavaScript, create a `setup.js` file (for example under `spec/support/setup.js`, but you can use any location you like):

```javascript
// spec/support/setup.js

const 
    { ConsoleReporter } = require('@serenity-js/console-reporter'),
    { configure } = require('@serenity-js/core');

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ],
});
```

Next, run Mocha as follows:

```console
mocha --reporter=@serenity-js/mocha \
      --require=spec/support/setup.js \
      'spec/**/*.spec.js'
```

#### TypeScript

If you're writing your tests in TypeScript, you might want to run them via [`ts-node`](https://www.npmjs.com/package/ts-node), which transpiles TypeScript in memory without you having to do it before every test run.

```
npm install --save-dev typescript ts-node
```

If you haven't done so already, configure your TypeScript transpiler via [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html):

```json
{
  "compilerOptions": {
    "target": "es2018",
    "lib": ["es2018"],
    "module": "commonjs"
  }
}
```

Create a `setup.ts` file (for example under `spec/support/setup.ts`, but you can use any location you like):

```typescript
// spec/support/setup.ts

import { ConsoleReporter } from '@serenity-js/console-reporter';
import { configure } from '@serenity-js/core';

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ],
});
```

Next, run Mocha as follows: 

```
mocha --reporter=@serenity-js/mocha \
      --require=ts-node/register \
      --require=spec/support/setup.ts \
      'spec/**/*.spec.ts'
```

#### Using Mocha configuration file

Please note that you can use [Mocha configuration file](https://mochajs.org/#configuring-mocha-nodejs)
to simplify your command line execution.

For example:

```yaml
# .mocharc.yml
reporter: '@serenity-js/mocha'
require:
  - ts-node/register
  - spec/support/setup.ts
check-leaks: false
timeout: 5000
v8-stack-trace-limit: 100
# ...other config
```

### Usage with Protractor

Configure your Protractor installation as per instructions in [`@serenity-js/protractor`](https://serenity-js.org/modules/protractor/) module.

Next, instruct Serenity/JS to run your tests using Mocha. You can also use your `protractor.conf.js` file to [configure Mocha](https://serenity-js.org/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html) if needed:

```typescript
// protractor.conf.js

exports.config = {
    // Tell Protractor to use the Serenity/JS framework Protractor Adapter
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
  
    serenity: {
        runner: 'mocha',        // Use Mocha
        // ... other Serenity/JS-specific configuration
    },

    mochaOpts: {
        // Mocha-specific configuration
    },

    // ... other Protractor-specific configuration   
};
```

Learn more about supported [Mocha configuration options](https://serenity-js.org/modules/mocha/class/src/adapter/MochaConfig.ts~MochaConfig.html).

### Example projects

Study [Serenity/JS example projects](https://github.com/serenity-js/serenity-js/tree/master/examples) to learn more. 
