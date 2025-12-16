# Serenity/JS Mocha

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fmocha.svg)](https://badge.fury.io/js/%40serenity-js%2Fmocha)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/mocha/badge.svg)](https://snyk.io/test/npm/@serenity-js/mocha)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[`@serenity-js/mocha`](https://serenity-js.org/api/mocha/) brings full [Serenity reporting](https://serenity-js.org/handbook/reporting/) capabilities to [Mocha](https://serenity-js.org/handbook/test-runners/mocha/) and enables writing tests using the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

## Features

- Enables [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/) APIs in Mocha tests
- Supports all [Serenity/JS reporting features](https://serenity-js.org/handbook/reporting/)
- TypeScript-first design with strong typing for safer and more predictable test code.

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/console-reporter @serenity-js/mocha
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

```typescript
import { actorCalled } from '@serenity-js/core';
import { describe, it } from 'mocha';

describe('Example Test', () => {
    it('supports actors', async () => {
        await actorCalled('Alice').attemptsTo(
            // Add tasks and interactions here
        )
    })
})
```

Explore practical examples and in-depth explanations in the [Serenity/JS Handbook](https://serenity-js.org/handbook/).

## Reporting

### Usage with standalone Mocha

To use Serenity/JS with standalone Mocha, for example to run tests of [REST APIs](https://serenity-js/api/rest),
you'll need a setup file that configures Serenity/JS reporting services.

#### JavaScript

If you're writing your tests in JavaScript, create a `serenity.config.js` file (for example under `spec/support/serenity.config.js`, but you can use any location you like):

```javascript
// spec/support/serenity.config.js
const { configure } = require('@serenity-js/core')

configure({
    crew: [
      '@serenity-js/console-reporter',
    ],
})
```

Next, run Mocha as follows:

```console
mocha --reporter=@serenity-js/mocha \
      --require=spec/support/serenity.config.js \
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
    "lib": ["ES2023"],
    "module": "nodenext",
    "target": "ES2023"
  }
}
```

Create a `serenity.config.ts` file (for example under `spec/support/serenity.config.ts`, but you can use any location you like):

```typescript
// spec/support/setup.ts
import { configure } from '@serenity-js/core'

configure({
  crew: [
    '@serenity-js/console-reporter',
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

You can use `.mocharc.yml` [configuration file](https://mochajs.org/#configuring-mocha-nodejs)
to simplify your command line execution.

For example:

```yaml title=".mocharc.yml"
reporter: '@serenity-js/mocha'
require:
  - ts-node/register
  - spec/support/serenity.config.ts
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

## Documentation

- [API Reference](https://serenity-js.org/api/)
- [Screenplay Pattern Guide](https://serenity-js.org/handbook/design/screenplay-pattern/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)
- [More examples and reference implementations](https://github.com/serenity-js/serenity-js/tree/main/examples)
- [Tutorial: First Web Scenario](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/)
- [Tutorial: First API Scenario](https://serenity-js.org/handbook/tutorials/your-first-api-scenario/)

## Contributing

Contributions of all kinds are welcome! Get started with the [Contributing Guide](https://serenity-js.org/community/contributing/).

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [Discussions Forum](https://github.com/orgs/serenity-js/discussions)
    - Visit the [💡How to... ?](https://github.com/orgs/serenity-js/discussions/categories/how-to) section for answers to common questions

If you enjoy using Serenity/JS, make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

## License

The Serenity/JS code base is licensed under the [Apache-2.0](https://opensource.org/license/apache-2-0) license,
while its documentation and the [Serenity/JS Handbook](https://serenity-js.org/handbook/) are licensed under the [Creative Commons BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the [Serenity/JS License](https://serenity-js.org/legal/license/).

## Support

Support ongoing development through [GitHub Sponsors](https://github.com/sponsors/serenity-js). Sponsors gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks)
and priority help in the [Discussions Forum](https://github.com/orgs/serenity-js/discussions).

For corporate sponsorship or commercial support, please contact [Jan Molak](https://www.linkedin.com/in/janmolak/).

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
