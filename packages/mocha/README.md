# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative open-source framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

⭐️ Get started with Serenity/JS!
- [Serenity/JS web testing tutorial](https://serenity-js.org/handbook/web-testing/your-first-web-scenario)
- [Serenity/JS Handbook](https://serenity-js.org/handbook) and [Getting Started guides](https://serenity-js.org/handbook/getting-started/)
- [API documentation](https://serenity-js.org/api/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/getting-started/project-templates/)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/community/contributing/),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Mocha

[`@serenity-js/mocha`](https://serenity-js.org/api/mocha/) contains an adapter you register with [Mocha test runner](https://mochajs.org/) to enable integration between Mocha and Serenity/JS.

### Installation

Install [Mocha](https://mochajs.org/) version 8.x or newer:

```sh
npm install --save-dev mocha@8.x
```

Install the `@serenity-js/mocha` adapter, as well as `@serenity-js/core` and any [Serenity/JS reporting modules](https://serenity-js.org/api/console-reporter/) you'd like to use, for example [`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/):

```sh
npm install --save-dev @serenity-js/core @serenity-js/console-reporter @serenity-js/mocha
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide](https://serenity-js.org/handbook/getting-started/).

### Usage with standalone Mocha

To use Serenity/JS with standalone Mocha, for example to run tests of [REST APIs](https://serenity-js/api/rest),
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
})
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

import { ConsoleReporter } from '@serenity-js/console-reporter'
import { configure } from '@serenity-js/core'

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ],
})
```

Next, run Mocha as follows: 

```
mocha --reporter=@serenity-js/mocha \
      --require=ts-node/register \
      --require=spec/support/setup.ts \
      'spec/**/*.spec.ts'
```

#### Using Mocha configuration file

Please note that you can use `.mocharc.yml` [configuration file](https://mochajs.org/#configuring-mocha-nodejs)
to simplify your command line execution.

For example:

```yaml title=".mocharc.yml"
reporter: '@serenity-js/mocha'
require:
  - ts-node/register
  - spec/support/setup.ts
check-leaks: false
timeout: 5000
v8-stack-trace-limit: 100
# ...other config
```

#### Configuring a custom requirements hierarchy root

```yaml title=".mocharc.yml"
reporter: '@serenity-js/mocha'
reporter-options:       # Note: array, not an object
  - 'specDirectory=e2e' # Configure custom requirements hierarchy root, such as "e2e"
```

### Using Serenity/JS Mocha with Protractor

Configure your Protractor installation as per instructions in [`@serenity-js/protractor`](https://serenity-js.org/api/protractor/) module.

Next, instruct Serenity/JS to run your tests using Mocha. You can also use your `protractor.conf.js` file to [configure Mocha](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/) if needed:

```typescript title="protractor.conf.js"
// protractor.conf.js

exports.config = {
    // Tell Protractor to use the Serenity/JS framework adapter
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
  
    serenity: {
        runner: 'mocha',        // Use Mocha
        // ... other Serenity/JS-specific configuration
    },

    mochaOpts: {
        // Custom requirements hierarchy root, optional 
        reporterOptions: [
            'specDirectory=e2e'
        ],
        
        // ... other Mocha-specific configuration
    },

    // ... other Protractor-specific configuration   
}
```

Learn more about supported [Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/).

### Using Serenity/JS Mocha with WebdriverIO

Configure your WebdriverIO installation as per instructions in [`@serenity-js/webdriverio`](https://serenity-js.org/api/webdriverio/) module.

Next, instruct Serenity/JS to run your tests using Mocha. You can also use your `wdio.conf.ts` file to [configure Mocha](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/) if needed:

```typescript title="wdio.conf.ts"
// wdio.conf.ts

export const config = {
    // Tell WebdriverIO to use the Serenity/JS framework adapter
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use an appropriate test runner adapter
        runner: 'mocha',        // Use Mocha
        // ... other Serenity/JS-specific configuration
    },

    mochaOpts: {
        // Custom requirements hierarchy root, optional 
        reporterOptions: [
            'specDirectory=e2e'
        ],

        // ... other Mocha-specific configuration
    },

    // ... other Protractor-specific configuration   
}
```

Learn more about supported [Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/).


### Example projects

Study [Serenity/JS example projects](https://github.com/serenity-js/serenity-js/tree/main/examples) to learn more. 

## 📣 Stay up to date

New features, tutorials, and demos are coming soon!
Follow [Serenity/JS on LinkedIn](https://www.linkedin.com/company/serenity-js),
subscribe to [Serenity/JS channel on YouTube](https://www.youtube.com/@serenity-js) and join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
Please also make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?label=Serenity%2FJS&logo=github&style=badge)](https://github.com/serenity-js/serenity-js)

## 💛 Support Serenity/JS

If you appreciate all the effort that goes into making sophisticated tools easy to work with, please support our work and become a Serenity/JS GitHub Sponsor today!

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
