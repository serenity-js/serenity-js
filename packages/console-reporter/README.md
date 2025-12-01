## Serenity/JS Console Reporter

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fconsole-reporter.svg)](https://badge.fury.io/js/%40serenity-js%2Fconsole-reporter)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/console-reporter/badge.svg)](https://snyk.io/test/npm/@serenity-js/console-reporter)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/)
logs test progress and results to the console in a readable format.

## Features

- Colour-coded console output for test results
- Summaries of test runs and failures
- Works with all [supported test runners](https://serenity-js.org/handbook/test-runners/)

See example output in the [Serenity/JS Handbook](https://serenity-js.org/handbook/reporting/console-reporter/).

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/console-reporter
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

### Windows

If you're on Windows, consider using [Windows Terminal](https://github.com/microsoft/terminal)
instead of `cmd.exe` to benefit from the colour output.

## Quick Start

To use the console reporter in your Serenity/JS project, install the
[`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/) package
and configure the reporter as part of the `Stage` crew using your test runner's configuration file.

### Usage with Playwright Test

When integrating Serenity/JS with Playwright Test,
use the following configuration in your `playwright.config.ts` file to enable the console reporter:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({

    reporter: [
        [
            path.resolve(__dirname, '../../packages/playwright-test'),    // '@serenity-js/playwright-test'
            {
                crew: [
                    // Use console reporter with default settings
                    '@serenity-js/console-reporter',

                    // Alternatively, use console reporter
                    // with a theme for 'dark', 'light' or 'mono' terminals
                    // [ '@serenity-js/console-reporter', { theme: 'auto' } ]
                ],
            },
        ],
    ],

    // Other configuration omitted for brevity
    // For details, see https://playwright.dev/docs/test-configuration    
});
```

Learn more about using [Serenity/JS with Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/).

### Usage with WebdriverIO

When integrating Serenity/JS with WebdriverIO,
use the following configuration in your `wdio.conf.ts` file to enable the console reporter:

```typescript
// wdio.conf.ts

import { WebdriverIOConfig } from '@serenity-js/webdriverio'

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        crew: [
            // Use console reporter with default settings
            '@serenity-js/console-reporter',

            // Alternatively, use console reporter
            // with a theme for 'dark', 'light' or 'mono' terminals
            // [ '@serenity-js/console-reporter', { theme: 'auto' } ]
        ]
    },

    // Other configuration omitted for brevity
    // For details, see https://webdriver.io/docs/options
}
```

Learn more about using [Serenity/JS with WebdriverIO](https://serenity-js.org/api/webdriverio).

### Usage with Protractor

When integrating Serenity/JS with Protractor,
use the following configuration in your `protractor.conf.js` file to enable the console reporter:

```javascript
// protractor.conf.js

exports.config = {

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            // Use console reporter with default settings
            '@serenity-js/console-reporter',

            // Alternatively, use console reporter
            // with a theme for 'dark', 'light' or 'mono' terminals
            // [ '@serenity-js/console-reporter', { theme: 'auto' } ]
        ]
    },

    // ...
}
```

Learn more about using [Serenity/JS with Protractor](https://serenity-js.org/api/protractor).

### Programmatic configuration

When integrating Serenity/JS with a custom test runner setup, or using it programmatically,
use the [`Serenity.configure`](https://serenity-js.org/api/core/class/Serenity/#configure) method,
or the standalone [`configure`](https://serenity-js.org/api/core/function/configure/) function
to pass the [configuration object](https://serenity-js.org/api/core/class/SerenityConfig/)
that includes the `ConsoleReporter` as part of the `crew`.

```typescript
import { configure } from '@serenity-js/core'
import { ConsoleReporter } from '@serenity-js/console-reporter'

configure({
    crew: [
        ConsoleReporter.withDefaultColourSupport(),
    ],
})
```

### Changing the colour theme

See the [`ConsoleReporter` API docs](https://serenity-js.org/api/console-reporter/class/ConsoleReporter) 
to learn about the supported colour themes.

## Documentation

- [API Reference](https://serenity-js.org/api/)
- [Screenplay Pattern Guide](https://serenity-js.org/handbook/design/screenplay-pattern/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)
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

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js).
