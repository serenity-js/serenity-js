# Serenity/JS WebdriverIO

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fwebdriverio-8.svg)](https://badge.fury.io/js/%40serenity-js%2Fwebdriverio-8)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/webdriverio-8/badge.svg)](https://snyk.io/test/npm/@serenity-js/webdriverio-8)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) revolutionises automated testing by enabling your team to write **expressive**, **maintainable tests** that align
with **your unique domain**. Seamlessly integrating with [WebdriverIO](https://webdriver.io) and test runners like
[**Mocha**](https://serenity-js.org/handbook/test-runners/mocha/),
[**Cucumber**](https://serenity-js.org/handbook/test-runners/cucumber/),
and [**Jasmine**](https://serenity-js.org/handbook/test-runners/jasmine/),
Serenity/JS also offers **advanced reporting** that provides clear insights into test results,
helping both technical teams and business stakeholders understand the quality of the system under test.

Serenity/JS WebdriverIO 8 module is intended for existing projects that can't yet upgrade to WebdriverIO 9. 
If you're starting a new project, we recommend using the [Serenity/JS WebdriverIO module](https://serenity-js.org/api/webdriverio/).

## Features

- Write **expressive**, **maintainable** tests that align with your unique domain using the [**Serenity/JS Screenplay Pattern**](https://serenity-js.org/handbook/design/screenplay-pattern) APIs.
- **Leverage advanced reporting** to track progress, detect failures, and share results with both technical and business stakeholders.
- Build on flexible, modular, and extensible architecture that supports a wide range of test automation needs.
- Integrate with WebdriverIO 8 and modern test automation tools.

## Quick Start

### Installation

To add Serenity/JS to an existing WebdriverIO 8 project, install the following Serenity/JS modules from NPM:

```sh
npm install --save-dev @serenity-js/core @serenity-js/web @serenity-js/webdriverio-8 @serenity-js/assertions @serenity-js/rest @serenity-js/console-reporter @serenity-js/serenity-bdd
```

Learn more about Serenity/JS modules:
- [`@serenity-js/core`](https://serenity-js.org/api/core/)
- [`@serenity-js/web`](https://serenity-js.org/api/web/)
- [`@serenity-js/webdriverio-8`](https://serenity-js.org/api/webdriverio-8/)
- [`@serenity-js/assertions`](https://serenity-js.org/api/assertions/)
- [`@serenity-js/rest`](https://serenity-js.org/api/rest/)
- [`@serenity-js/console-reporter`](https://serenity-js.org/api/console-reporter/)
- [`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd/)

If you prefer to review a reference implementation first, clone a [Serenity/JS Project Template](https://serenity-js.org/handbook/project-templates/) for your preferred test runner.

### Configuring Serenity/JS

To enable integration with Serenity/JS, configure WebdriverIO as follows:

```ts
// wdio.conf.ts
import { WebdriverIOConfig } from '@serenity-js/webdriverio-8';

export const config: WebdriverIOConfig = {

    // Tell WebdriverIO to use Serenity/JS framework with the WebdriverIO 8 adapter
    // When you're ready to upgrade to WebdriverIO 9, switch to '@serenity-js/webdriverio'
    framework: '@serenity-js/webdriverio-8',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use the appropriate adapter
        // for your test runner
        runner: 'cucumber', // or 'mocha', or 'jasmine'

        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
        crew: [
            // Optional, print test execution results to standard output
            '@serenity-js/console-reporter',

            // Optional, produce Serenity BDD reports
            // and living documentation (HTML)
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', {
                outputDirectory: 'target/site/serenity'
            } ],

            // Optional, automatically capture screenshots
            // upon interaction failure
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures'
            } ],
        ]
    },

    // Location of your test files
    specs: [
        './test/specs/**/*.spec.ts',    // for Mocha or Jasmine
        // './features/**/*.feature',   // for Cucumber
    ],

    // Configure your Cucumber runner
    cucumberOpts: {
        // see Cucumber configuration options below
    },


    // ... or Jasmine runner
    jasmineOpts: {
        // see Jasmine configuration options below
    },

    // ... or Mocha runner
    mochaOpts: {
        // see Mocha configuration options below
    },

    runner: 'local',

    // Enable TypeScript in-memory compilation
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'tsconfig.json'
        }
    },

    // Any other WebdriverIO configuration
};
```

Learn more about:
- [Serenity/JS Cucumber configuration options](https://serenity-js.org/api/cucumber-adapter/interface/CucumberConfig/)
- [Serenity/JS Jasmine configuration options](https://serenity-js.org/api/jasmine-adapter/interface/JasmineConfig/)
- [Serenity/JS Mocha configuration options](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)

### Reporting 

[Serenity BDD reports and living documentation](https://serenity-bdd.github.io/docs/reporting/the_serenity_reports) are generated by [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli),
a Java program provided by the [`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd/) module.

To produce Serenity BDD reports, your test suite must:
- produce intermediate Serenity BDD `.json` reports, by registering [`SerenityBDDReporter`](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter/) as per the [configuration instructions](#2-configuring-serenityjs)
- invoke the Serenity BDD CLI when you want to produce the report, by calling `serenity-bdd run`

The pattern used by all the [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/) relies
on using the following Node modules:
- [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) to run the reporting process even if the test suite itself has failed (which is precisely when you need test reports the most...).
- [`rimraf`](https://www.npmjs.com/package/rimraf) as a convenience method to remove any test reports left over from the previous run

```json title="package.json"
{
  "scripts": {
    "test": "failsafe test:clean test:wdio test:report",
    "test:clean": "rimraf target",
    "test:wdio": "wdio run ./wdio.conf.ts",
    "test:report": "serenity-bdd run"
  }
}
```

To learn more about the `SerenityBDDReporter`, please consult:
- installation instructions in [`@serenity-js/serenity-bdd` documentation](https://serenity-js.org/api/serenity-bdd/),
- configuration examples in [`SerenityBDDReporter` API docs](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter/),
- [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples).

### Writing a test scenario

Assuming you're using WebdriverIO 8 with Mocha, create a test file under `./test/specs/example.spec.ts` with the following contents:

```ts
// ./test/specs/example.spec.ts
import { describe, it } from 'mocha'

import { Ensure, equals } from '@serenity-js/assertions'
import { actorCalled } from '@serenity-js/core'
import { By, Navigate, PageElement, Text } from '@serenity-js/web'

describe('Example', () => {

    it('interacts with a web page', async () => {

        await actorCalled('Alice').attemptsTo(
            Navigate.to('https://serenity-js.org'),
            Ensure.that(
                Text.of(PageElement.located(By.id('cta-start-automating'))),
                equals('Start automating 🚀')
            ),
        )
    })    
})
```

You'll notice that the example test file uses:
- [`@serenity-js/assertions`](https://serenity-js.org/api/assertions/) - to make assertions about the state of the system under test
- [`@serenity-js/core`](https://serenity-js.org/api/core/) - to create and manage actors
- [`@serenity-js/web`](https://serenity-js.org/api/web/) - to interact with web pages

You'll also notice that the file **does not** use the `@serenity-js/webdriverio-8` module directly.
This is because the `@serenity-js/web` module provides a higher-level API for interacting with web pages, 
allowing you to switch to `@serenity-js/webdriverio` whenever you're ready to upgrade to WebdriverIO 9 without changing your test scenarios.

You can learn more about these and other Serenity/JS modules in the [Serenity/JS API documentation](https://serenity-js.org/api/).
You might also want to check out the [Serenity/JS WebdriverIO integration guide](https://serenity-js.org/handbook/test-runners/webdriverio/) for more details on configuring your framework.

### Running your tests and generating reports

To run your tests and generate Serenity/JS reports, execute the following command in your terminal:

```sh
npm test
```

Your test results will be available in the `target/site/serenity` directory.
To view them, open the `index.html` file in your preferred web browser.

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

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js).
