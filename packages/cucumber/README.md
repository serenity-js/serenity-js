# Serenity/JS Cucumber

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fcucumber.svg)](https://badge.fury.io/js/%40serenity-js%2Fcucumber)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/cucumber/badge.svg)](https://snyk.io/test/npm/@serenity-js/cucumber)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/cucumber`](https://serenity-js.org/api/cucumber/) integrates Serenity/JS with [Cucumber](https://github.com/cucumber/cucumber-js/),
enabling you to run automated, plain-language scenarios with rich reporting and powerful Screenplay-based abstractions.

## Features

- Integrates Serenity/JS with Cucumber.js
- Supports all Cucumber.js versions from 0.x to 12.x
- Enriches Serenity reports with Gherkin feature descriptions, scenarios, and steps
- Supports using Screenplay Pattern APIs in step definitions

## Installation

```
npm install --save-dev @serenity-js/cucumber @serenity-js/core
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

```ts
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { Given, When, Then } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';

Given('{word} has {int} apples', async (actorName: string, count: number) => {
    // Create or retrieve the actor by name
    await actorCalled(actorName).attemptsTo(
        // Add tasks or interactions
    );
});

When('she adds {int} apples', async (count: number) => {
    // Retrieve the most recently used actor
    await actorInTheSpotlight().attemptsTo(
        // Add tasks or interactions
    )
});

Then('she has {int} apples', async (expectedCount: number) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(/* actual count */, equals(expectedCount))
    )
})
```

Explore practical examples and in-depth explanations in the [Serenity/JS Handbook](https://serenity-js.org/handbook/).

## Configuration

When using Serenity/JS with WebdriverIO, follow the official [Serenity/JS WebdriverIO + Cucumber integration guide](https://serenity-js.org/handbook/test-runners/webdriverio/#integrating-serenityjs-reporting). 

To use Serenity/JS with Cucumber and Playwright, follow the steps below, or use one of the available [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/#playwright).

### Configuring Cucumber.js

Use the [`cucumber.js` configuration file](https://github.com/cucumber/cucumber-js/blob/main/docs/profiles.md)
to set up Cucumber to use Serenity/JS as the "formatter" and load extra `*.config.ts` files.

```javascript
// cucumber.js
module.exports = {
    default: {
        // Use TypeScript in-memory transpiler, ts-node 
        // requires `npm install --save-dev ts-node`
        requireModule: ['ts-node/register'],

        // Use Serenity/JS Cucumber adapter
        format: ['@serenity-js/cucumber'],
        // Configure the adapter
        formatOptions: {
            specDirectory: 'features'
        },
        require: [
            // Load configuration files
            './features/**/*.config.ts',
            // Load step definition libraries
            './features/**/*.steps.ts'
        ],
    }
}
```

### Configuring Serenity/JS

To configure Serenity/JS, create a `serenity.config.ts` file with the following content:

```typescript
// features/support/serenity.config.ts
import { configure, Cast } from '@serenity-js/core'
import { BeforeAll } from '@cucumber/cucumber'

BeforeAll(async () => {

    // ... start any services or browsers here
    
    // Configure Serenity/JS
    configure({
        
        actors: Cast.where(actor => {
            return actor.whoCan(
                // ... add abilities here
            )
        }),
        
        crew: [
            [ '@serenity-js/console-reporter', { theme: 'auto' } ],
            // ... add other crew members here
        ]
    })
})
```

See the Serenity/JS [configuration options](https://serenity-js.org/api/core/class/SerenityConfig/) and [reporting guide](https://serenity-js.org/handbook/reporting/).

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
