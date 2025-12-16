## Serenity/JS Playwright

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fplaywright.svg)](https://badge.fury.io/js/%40serenity-js%2Fplaywright)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/playwright/badge.svg)](https://snyk.io/test/npm/@serenity-js/playwright)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/playwright`](https://serenity-js.org/api/playwright/) brings full [Serenity reporting](https://serenity-js.org/handbook/reporting/) capabilities to [Playwright](https://playwright.dev/) and enables writing tests using the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

## Features

- Integrates Serenity/JS with Playwright providing standardised [Screenplay Web API](https://serenity-js.org/api/web/)
- Supports all [Serenity/JS reporting features](https://serenity-js.org/handbook/reporting/) and expands native Playwright Test reports
- TypeScript-first design with strong typing for safer and more predictable test code.

## Installation

```bash
npm install --save-dev @serenity-js/assertions @serenity-js/console-reporter @serenity-js/core @serenity-js/serenity-bdd @serenity-js/web @serenity-js/playwright
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

### Usage with Playwright Test

```ts
import { describe, it } from '@serenity-js/playwright-test'
import { Navigate, Page } from '@serenity-js/web'
import { Ensure, startsWith } from '@serenity-js/assertions'

describe('Website', () => {
    
    it('should have a title', async ({ actor }) => {

        await actor.attemptsTo(
            Navigate.to('https://serenity-js.org/'),
            Ensure.that(Page.current().title(), startsWith('Serenity/JS')),
        )
    })
})
```

Explore the in-depth Serenity/JS and Playwright Test integration guide in the [Serenity/JS Handbook](https://serenity-js.org/handbook/test-runners/playwright-test/).

### Usage with Cucumber

Follow the [Serenity/JS configuration guide for Cucumber](https://serenity-js.org/handbook/test-runners/cucumber/)
and the [Serenity/JS Cucumber and Playwright Project Template](https://github.com/serenity-js/serenity-js-cucumber-playwright-template).

### Usage with Mocha

```typescript
import { Ensure, startsWith } from '@serenity-js/assertions'
import { actorCalled, Cast, configure, Duration } from '@serenity-js/core'
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
import { Navigate, Page } from '@serenity-js/web'

import { describe, it, beforeAll, afterAll } from 'mocha'
import * as playwright from 'playwright'

describe('Website', () => {

    let browser: playwright.Browser
    
    beforeAll(async () => {
        // Start a single browser before all the tests,
        // Serenity/JS will open new tabs
        // and manage Playwright browser context as needed  
        browser = await playwright.chromium.launch({
            headless: true
        })

        // Configure Serenity/JS providing your Actors
        // and required "stage crew memebers" (a.k.a. reporting services)
        configure({
            actors: Cast.where(actor => actor.whoCan(
                BrowseTheWebWithPlaywright.using(
                    browser,
                    { baseURL: `https://serenity-js.org` },
                    {
                        defaultNavigationTimeout:   Duration.ofSeconds(2).inMilliseconds(),
                        defaultTimeout:             Duration.ofMilliseconds(750).inMilliseconds(),
                    }
                )
            )),
            crew: [
                [ '@serenity-js/console-reporter', { theme: 'auto' } ],
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
                [ '@serenity-js/web:Photographer', {
                    strategy: 'TakePhotosOfFailures',
                    // strategy: 'TakePhotosOfInteractions',
                } ],
                [ '@serenity-js/serenity-bdd', { specDirectory: 'spec' } ],
            ]
        })
    })
    
    it('should have a title', async () => {
 
        await actorCalled('William').attemptsTo(
            Navigate.to('https://serenity-js.org'),
            Ensure.that(Page.current().title(), startsWith('Serenity/JS')),        
        )
    })

    afterAll(async () => {
        // Close the browser after all the tests are finished
        if (browser) {
            await browser.close()
        }
    })
})
```

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
