# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

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

Study [Serenity/JS example projects](https://github.com/serenity-js/serenity-js/tree/main/examples) to learn more. 
