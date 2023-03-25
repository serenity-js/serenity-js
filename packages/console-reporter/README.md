# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

### Installation

```console
npm install --save-dev @serenity-js/{core,console-reporter}
```

Learn more about [Serenity/JS Console Reporter](https://serenity-js.org/handbook/reporting/console-reporter.html)

#### Windows

If you're on Windows, consider using [Windows Terminal](https://github.com/microsoft/terminal)
instead of `cmd.exe` to benefit from the colour output.

### Usage

To allow Serenity/JS to print the progress report to standard output, assign the `ConsoleReporter` to the `Stage`.

This can be done:
- via `playwright.config.ts`, if you're using Serenity/JS with [Playwright Test](https://serenity-js.org/api/playwright-test)
- via `wdio.conf.ts`, if you're using Serenity/JS with [WebdriverIO](https://serenity-js.org/api/playwright-test)
- via `protractor.conf.js`, if you're using Serenity/JS with [Protractor](https://serenity-js.org/api/protractor)
- or programmatically.

#### Usage with Playwright Test

Learn more about using [Serenity/JS with Playwright Test](https://serenity-js.org/api/playwright-test).

```typescript
// playwright.config.ts
import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';

const config: PlaywrightTestConfig = {
    reporter: [
        [ '@serenity-js/playwright-test', {
            crew: [
                // console reporter with default settings
                '@serenity-js/console-reporter',
                
                // console reporter with a theme for 'dark', 'light' or 'mono' terminals
                // [ '@serenity-js/console-reporter', { theme: 'auto' } ]                
            ]
        }]
    ],

    // Other configuration omitted for brevity
    // For details, see https://playwright.dev/docs/test-configuration    
};

export default config;
```

#### Usage with WebdriverIO

Learn more about using [Serenity/JS with WebdriverIO](https://serenity-js.org/api/webdriverio).

```typescript
// wdio.conf.ts

import { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        crew: [
            // console reporter with default settings
            '@serenity-js/console-reporter',

            // console reporter with a theme for 'dark', 'light' or 'mono' terminals
            // [ '@serenity-js/console-reporter', { theme: 'auto' } ]  
        ]
    },

    // Other configuration omitted for brevity
    // For details, see https://webdriver.io/docs/options
};
```

#### Usage with Protractor

Learn more about using [Serenity/JS with Protractor](https://serenity-js.org/api/protractor).

```javascript
// protractor.conf.js

exports.config = {

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            // console reporter with default settings
            '@serenity-js/console-reporter',

            // console reporter with a theme for 'dark', 'light' or 'mono' terminals
            // [ '@serenity-js/console-reporter', { theme: 'auto' } ]  
        ]
    },

    // ...
}
```

#### Programmatic configuration

Learn more about [configuring Serenity/JS programmatically](https://serenity-js.org/api/core/class/SerenityConfig).

```typescript
import { configure } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';

configure({
    crew: [
        ConsoleReporter.withDefaultColourSupport(),
    ],
});
```

#### Colour Themes

Consult the API docs of the [`ConsoleReporter`](/api/console-reporter/class/ConsoleReporter) class
to learn more about the supported colour themes.
