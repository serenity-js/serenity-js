# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Console Reporter

`@serenity-js/console-reporter` module reports progress of your Serenity/JS tests to the terminal.

`ConsoleReporter` supports both colour and monochromatic output, as well as simple colour themes for terminals
with dark and light backgrounds.

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
