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
- [Serenity/JS Project Templates on GitHub](https://serenity-js.org/handbook/getting-started/project-templates/)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/community/contributing/),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Console Reporter

[`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/) writes [text-based reports](https://serenity-js.org/handbook/reporting/console-reporter)
to your computer terminal.


### Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/console-reporter
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide](https://serenity-js.org/handbook/getting-started/).

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
import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'

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
}

export default config
```

#### Usage with WebdriverIO

Learn more about using [Serenity/JS with WebdriverIO](https://serenity-js.org/api/webdriverio).

```typescript
// wdio.conf.ts

import { WebdriverIOConfig } from '@serenity-js/webdriverio'

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
}
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
import { configure } from '@serenity-js/core'
import { ConsoleReporter } from '@serenity-js/console-reporter'

configure({
    crew: [
        ConsoleReporter.withDefaultColourSupport(),
    ],
})
```

#### Colour Themes

Consult the API docs of the [`ConsoleReporter`](https://serenity-js.org/api/console-reporter/class/ConsoleReporter) class
to learn more about the supported colour themes.

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
