# Serenity/JS with WebdriverIO 8 🚀

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?label=Serenity%2FJS&logo=github&style=badge)](https://github.com/serenity-js/serenity-js)
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

## 🚀 Why choose Serenity/JS?

- Write **expressive**, **maintainable** tests that align with your unique domain using the [**Serenity/JS Screenplay Pattern**](https://serenity-js.org/handbook/design/screenplay-pattern) APIs.
- **Leverage advanced reporting** to track progress, detect failures, and share results with both technical and business stakeholders.
- Build on flexible, modular, and extensible architecture that supports a wide range of test automation needs.
- Integrate with WebdriverIO 8 and modern test automation tools.

## 🛠️ Integrate WebdriverIO 8 with Serenity/JS in 4 steps

### 1. Installing Serenity/JS modules

To add Serenity/JS to an existing WebdriverIO 8 project, install the following Serenity/JS modules from NPM:

```sh
npm install --save-dev @serenity-js/core @serenity-js/web @serenity-js/webdriverio-8 @serenity-js/assertions @serenity-js/rest @serenity-js/console-reporter @serenity-js/serenity-bdd
```

Learn more about Serenity/JS modules:
- [`@serenity-js/core`](/api/core/)
- [`@serenity-js/web`](/api/web/)
- [`@serenity-js/webdriverio-8`](/api/webdriverio-8/)
- [`@serenity-js/assertions`](/api/assertions/)
- [`@serenity-js/rest`](/api/rest/)
- [`@serenity-js/console-reporter`](/api/console-reporter/)
- [`@serenity-js/serenity-bdd`](/api/serenity-bdd/)

If you prefer to review a reference implementation first, clone a [Serenity/JS Project Template](https://serenity-js.org/handbook/getting-started/project-templates/) for your preferred test runner.

### 2. Configuring Serenity/JS

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
- [Serenity/JS Cucumber configuration options](/api/cucumber-adapter/interface/CucumberConfig/)
- [Serenity/JS Jasmine configuration options](/api/jasmine-adapter/interface/JasmineConfig/)
- [Serenity/JS Mocha configuration options](/api/mocha-adapter/interface/MochaConfig/)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)

### 3. Generating Serenity BDD reports and living documentation 

[Serenity BDD reports and living documentation](https://serenity-bdd.github.io/docs/reporting/the_serenity_reports) are generated by [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli),
a Java program provided by the [`@serenity-js/serenity-bdd`](/api/serenity-bdd/) module.

To produce Serenity BDD reports, your test suite must:
- produce intermediate Serenity BDD `.json` reports, by registering [`SerenityBDDReporter`](/api/serenity-bdd/class/SerenityBDDReporter/) as per the [configuration instructions](#configuring-serenityjs)
- invoke the Serenity BDD CLI when you want to produce the report, by calling `serenity-bdd run`

The pattern used by all the [Serenity/JS Project Templates](/handbook/getting-started/project-templates/) relies
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
- installation instructions in [`@serenity-js/serenity-bdd` documentation](/api/serenity-bdd/),
- configuration examples in [`SerenityBDDReporter` API docs](/api/serenity-bdd/class/SerenityBDDReporter/),
- [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples).

### 4. Writing a test scenario

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

### 4. Running your tests and generating reports

To run your tests and generate Serenity/JS reports, execute the following command in your terminal:

```sh
npm test
```

Your test results will be available in the `target/site/serenity` directory.
To view them, open the `index.html` file in your preferred web browser.

## 💡️ Learn Serenity/JS

- [Serenity/JS WebdriverIO integration guide](https://serenity-js.org/handbook/test-runners/webdriverio/) - Integrate Serenity/JS with your WebdriverIO test suite, enable Serenity BDD reports, and start using the Screenplay Pattern
- [Serenity/JS Handbook](https://serenity-js.org/handbook/) - Write high-quality automated acceptance tests with Serenity/JS
- [Serenity/JS API documentation](https://serenity-js.org/api/) - Explore Serenity/JS modules and features
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/getting-started/project-templates/) - Kickstart your projects with best practices built right in

## 👋 Join the Serenity/JS Community

- [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im) - Meet Serenity/JS developers and maintainers
- [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-to) - Find answers to your Serenity/JS questions
- [Contribute to Serenity/JS](https://serenity-js.org/community/contributing/) - Learn how to propose features, report bugs, and contribute to the Serenity/JS codebase

## 📣 Stay up to date

- [Serenity/JS on YouTube](https://www.youtube.com/@serenity-js) - Subscribe for tutorials, demos, conference talks, and more
- [Serenity/JS on LinkedIn](https://www.linkedin.com/company/serenity-js) - Follow for release and community event announcements
- [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) - Star Serenity/JS to help others discover the framework!

## 💛 Support Serenity/JS

Support our mission to make test automation collaborative and easier to scale. Become a Serenity/JS GitHub Sponsor today!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
