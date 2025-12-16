## Serenity/JS Protractor

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fprotractor.svg)](https://badge.fury.io/js/%40serenity-js%2Fprotractor)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/protractor/badge.svg)](https://snyk.io/test/npm/@serenity-js/protractor)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/protractor`](https://serenity-js.org/api/protractor/) brings full [Serenity reporting](https://serenity-js.org/handbook/reporting/) capabilities to [Protractor framework](https://www.protractortest.org/) and enables writing tests using the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/).

Learn more about [integrating Serenity/JS with Protractor](https://serenity-js.org/handbook/test-runners/protractor/).

## Features

- Integrates Serenity/JS with Protractor providing standardised [Screenplay Web API](https://serenity-js.org/api/web/)
- Supports Angular and non-Angular apps
- Enables [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/) APIs in Protractor tests
- Supports all [Serenity/JS reporting features](https://serenity-js.org/handbook/reporting/)
- TypeScript-first design with strong typing for safer and more predictable test code.

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/protractor
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

### Usage with Cucumber.js

To use Serenity/JS Protractor with Cucumber.js, install the following adapter:
```sh
npm install --save-dev @serenity-js/cucumber
```

**Please note** that Serenity/JS Protractor / Cucumber integration supports both [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/index.html) and [native Cucumber.js reporters](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#built-in-formatters), so you can use this module as a drop-in replacement of [`protractor-cucumber-framework`](https://www.npmjs.com/package/protractor-cucumber-framework).

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/test-runners/protractor/).

### Usage with Jasmine

To use Serenity/JS Protractor with Jasmine, install the following adapter:
```sh
npm install --save-dev @serenity-js/jasmine
```

Learn more about [integrating Serenity/JS Protractor with Cucumber](https://serenity-js.org/handbook/test-runners/protractor/).

### Usage with Mocha

To use Serenity/JS Protractor with Mocha, install the following adapter:
```sh
npm install --save-dev @serenity-js/mocha
```

Learn more about [integrating Serenity/JS Protractor with Mocha](https://serenity-js.org/handbook/test-runners/protractor/).

## Configuration

```javascript
// protractor.conf.js
exports.config = {
    // Tell Protractor to use the Serenity/JS framework Protractor Adapter
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
  
    // Configure Serenity/JS to use an appropriate test runner
    // and the Stage Crew Members we've imported at the top of this file
    serenity: {
        runner: 'jasmine',
        // runner: 'cucumber',
        // runner: 'mocha',
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: './target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures', // or: 'TakePhotosOfInteractions'
            } ],
        ]
    },

    // configure Cucumber runner
    cucumberOpts: {
        // see the Cucumber configuration options below
    },

    // or configure Jasmine runner
    jasmineNodeOpts: {
        // see the Jasmine configuration options below
    },

    // or configure Mocha runner
    mochaOpts: {
        // see the Mocha configuration options below
    },

    // ... other Protractor-specific configuration   
}
```

Learn more about:
- [Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
- [Jasmine configuration options](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
- [Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
- [Protractor configuration file](https://github.com/angular/protractor/blob/master/lib/config.ts).

## Interacting with websites and web apps

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { By, Navigate, Target, Text } from '@serenity-js/web'

// example Lean Page Object describing a widget we interact with in the test
class SerenityJSWebsite {
    static header = () =>
        PageElement.located(By.css('h1'))   // selector to identify the interactable element
            .describedAs('header')          // description to be used in reports
}

// example Jasmine test
describe('Serenity/JS', () => {
    
    it('works with Protractor and Jasmine', async () => {
        await actorCalled('Priya').attemptsTo(
            Navigate.to('https://serenity-js.org'),
            Ensure.that(
                Text.of(SerenityJSWebsite.header()), 
                equals('Enable collaborative test automation at any scale!')
            ),
        )
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
