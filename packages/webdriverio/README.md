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

## 🚀 Why choose Serenity/JS?

- Write **expressive**, **maintainable** tests that align with your unique domain using the [**Serenity/JS Screenplay Pattern**](https://serenity-js.org/handbook/design/screenplay-pattern) APIs.
- **Leverage advanced reporting** to track progress, detect failures, and share results with both technical and business stakeholders.
- Build on flexible, modular, and extensible architecture that supports a wide range of test automation needs.
- Integrate with WebdriverIO and modern test automation tools.

## 🛠️ Get started in 3 steps

Serenity/JS integrates with the WebdriverIO command line wizard to help you set up a new project with the required dependencies, configuration and example tests.

If you prefer to review a reference implementation first or use it as a starting point for your project, you can clone a [Serenity/JS Project Template](https://serenity-js.org/handbook/getting-started/project-templates/) for your preferred test runner.

### 1. Using the WebdriverIO wizard

To use the WebdriverIO wizard to create a new project, run the following command in your computer terminal:

```sh
npm init wdio ./my-project
```

To create a Serenity/JS project, select the following options:

- Type of testing: **E2E Testing**
- Automation backend: **any** - Serenity/JS supports both local and remote WebdriverIO test runners; select **local** to keep it simple
- Environment: **web**
- Browser: **any** - Serenity/JS supports all browsers supported by WebdriverIO; selecting **Chrome** is a good starting point
- Framework: **Jasmine with Serenity/JS**, **Mocha with Serenity/JS**, or **Cucumber with Serenity/JS**; we'll use **Mocha with Serenity/JS** in this example
- Compiler: **any** - Serenity/JS supports both TypeScript and JavaScript; we recommend **TypeScript** for better tooling support
- Generate test files: **yes**, if you'd like Serenity/JS to give you a starting point for your test scenarios
- Test file location: **accept the defaults** unless you'd like to store your code in a different directory
- Test reporter: **any**, Serenity/JS configures the project to use [Serenity/JS reporting services](https://serenity-js.org/handbook/reporting/), and you can add native WebdriverIO reporters too if needed
- Plugins/add-ons/services: **none**; Serenity/JS doesn't require any additional plugins to work with WebdriverIO

To create a Serenity/JS, WebdriverIO and Cucumber project, follow the tutorial:

[![Watch the video](https://img.youtube.com/vi/8mMY6Of4nCw/mqdefault.jpg)](https://youtu.be/8mMY6Of4nCw)

### 2. Writing a test scenario

Assuming you've chosen **Mocha with Serenity/JS** and requested the wizard to generate example test files for you,
you'll find your first test file located at `./test/specs/example.spec.ts`:

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
    
    // ... other examples
})
```

You'll notice that the example test file uses:
- [`@serenity-js/assertions`](https://serenity-js.org/api/assertions/) - to make assertions about the state of the system under test
- [`@serenity-js/core`](https://serenity-js.org/api/core/) - to create and manage actors
- [`@serenity-js/web`](https://serenity-js.org/api/web/) - to interact with web pages

You can learn more about these and other Serenity/JS modules in the [Serenity/JS API documentation](https://serenity-js.org/api/).

The configuration of your project is located in the `wdio.conf.ts` file. Check out the [Serenity/JS WebdriverIO integration guide](https://serenity-js.org/handbook/test-runners/webdriverio/) for more details.

### 3. Running your tests and generating reports

To run your tests and generate Serenity/JS reports, execute the following command in your terminal:

```sh
npm run serenity
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
