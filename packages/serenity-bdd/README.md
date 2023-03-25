# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity BDD

[`@serenity-js/serenity-bdd`](https://serenity-js.org/modules/serenity-bdd/) module integrates Serenity/JS and the Serenity BDD reporting CLI.

This integration enables your Serenity/JS tests to produce interim JSON reports, which the Serenity BDD reporting CLI
can then turn into world-class, illustrated test reports and living documentation. Learn more about [Serenity/JS reporting](https://serenity-js.org/handbook/reporting/index.html).

### Installation

To install this module, run the following command in your computer terminal:

```console
npm install --save-dev @serenity-js/{core,serenity-bdd}
```

### SerenityBDDReporter

To allow Serenity/JS to produce Serenity BDD-standard JSON reports, assign the `SerenityBDDReporter` to the `Stage`
and configure the `ArtifactArchiver` to store the reports at the location where Serenity BDD expects to find them.

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
                '@serenity-js/serenity-bdd',
                [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
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
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
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
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
        ]
    },

    // ...
}
```

#### Programmatic configuration

Learn more about [configuring Serenity/JS programmatically](https://serenity-js.org/api/core/class/SerenityConfig).

```typescript
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

configure({
    crew: [
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
        new SerenityBDDReporter()
    ],
});
```

### Serenity BDD Living Documentation

To turn the Serenity BDD-standard JSON reports produced by the `SerenityBDDReporter` into Serenity BDD test reports,
you need the [Serenity BDD reporting CLI](https://github.com/serenity-bdd/serenity-cli).

The Serenity BDD reporting CLI is a Java program, distributed as an executable `.jar` file and [available on Bintray](https://bintray.com/serenity/maven/serenity-cli).

This module ships with a `serenity-bdd` CLI wrapper that makes downloading and running the Serenity BDD reporting CLI easy.

To learn more about the usage of the `serenity-bdd` wrapper, run:

```console
npx serenity-bdd --help
```

#### Configuring Serenity BDD reporting CLI

To configure the [Serenity BDD reporting CLI](https://github.com/serenity-bdd/serenity-cli), place a file called `serenity.properties`
in your project root directory. 

For example:

```
# serenity.properties
serenity.project.name=My awesome project
```

Please note that the reporting CLI considers only those properties that are related to producing test reports.
Learn more about configuring [`serenity.properties`](https://serenity-bdd.github.io/docs/reference/serenity-properties).

#### Downloading the Serenity BDD reporting CLI

To download the Serenity BDD reporting CLI or to update it, use the update command:

```console
npx serenity-bdd update
```

You can also tell it to download the Serenity BDD reporting CLI jar from your company's artifact repository if you can't use the official Bintray one:

```
npx serenity-bdd update --repository https://artifactory.example.org/
```

To learn more about the `update` command, run:

```
npx serenity-bdd --help update
```

Please note that the `update` command will try to download the `.jar` only if you don't have it cached already, or when the one you have is not up to date. Otherwise, no outbound network calls are made.

##### Downloading through a proxy

The `update` command will pick up your proxy configuration automatically from your [NPM config](https://docs.npmjs.com/cli/v6/commands/npm-config), [`.npmrc` file](https://docs.npmjs.com/cli/v6/configuring-npm/npmrc), or environment variables. 

Please note that you only need to use one of those configuration mechanisms.

###### Use NPM config (Linux, macOS, Windows)

To use NPM-level configuration, run the following commands in your terminal:

```console
npm config set proxy http://[user:pwd]@domain.tld:port
npm config set https-proxy http://[user:pwd]@domain.tld:port
```

If your proxy requires a certificate file, you can provide a path to it as follows:

```console
npm config set cafile /path/to/root-ca.pem
```

The above can also be accomplished by placing an [`.npmrc` file](https://docs.npmjs.com/cli/v6/configuring-npm/npmrc) with following contents in your home directory or your project root:

```bash
# ~/.npmrc
proxy = http://[user:pwd]@domain.tld:port
https-proxy = http://[user:pwd]@domain.tld:port

cafile = /path/to/root-ca.pem          # optional
noproxy = localhost,mycompany.com      # optional
```

###### Environment variables on Linux or macOS

To set your proxy on Linux or macOS, run the following commands in your terminal:

```console
export HTTP_PROXY=http://[user:pwd]@domain.tld:port
export HTTPS_PROXY=http://[user:pwd]@domain.tld:port
```

If needed, you can also set a `NO_PROXY` variable to a comma-separated list of domains that don't require a proxy, for example:

```console
export NO_PROXY=localhost,mycompany.com
```

Please note that you can add the above commands to your shell's `~/.profile`, so that they're executed whenever you open a new terminal.

###### Environment variables on Windows

To configure a proxy on Windows, run the following commands in Command Prompt:

```console
set HTTP_PROXY=http://[user:pwd]@domain.tld:port
set HTTPS_PROXY=http://[user:pwd]@domain.tld:port
```

If you're using Powershell, run the following commands instead:

```console
$env:HTTP_PROXY = http://[user:pwd]@domain.tld:port
$env:HTTPS_PROXY = http://[user:pwd]@domain.tld:port
```

##### Use a specific User-Agent

If your artifact registry requires you to use a specific user agent, you can configure it using NPM config:

```console
npm config set user-agent "Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0"
``` 

##### Ignore SSL checks

You can instruct the `update` command to ignore any SSL certificate errors by providing an `--ignoreSSL` flag when running the command:  

```console
npx serenity-bdd update --ignoreSSL
```

You can also disable certificate checks at the NPM config level by running: 

```console
npm config set strict-ssl false
```

Alternative, you can accomplish the same with an `.npmrc` file:

```bash
# ~/.npmrc
npm_config_strict-ssl = false
```

#### Producing the Serenity BDD test report

To produce the Serenity BDD test report and living documentation using default settings, run:

```
npx serenity-bdd run
```

To learn more about the `run` command and how to change the default settings, run:

```
npx serenity-bdd --help run
```

### Using NPM scripts

[Serenity BDD reports](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter) are generated by [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli),
a Java program downloaded and managed by the [`@serenity-js/serenity-bdd`](https://serenity-js.org/api/serenity-bdd) module.

In general, to produce Serenity BDD reports, your test suite must:
- download the Serenity BDD CLI, by calling `serenity-bdd update`
- produce intermediate Serenity BDD `.json` reports, by registering [`SerenityBDDReporter`](https://serenity-js.org/api/serenity-bdd/class/SerenityBDDReporter)
- invoke the Serenity BDD CLI when you want to produce the report, by calling `serenity-bdd run`

The pattern used by all the [Serenity/JS Project Templates](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates) relies
on using:
- an NPM [`postinstall`](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-operation-order) script to download the Serenity BDD CLI
- [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) to run the reporting process even if the test suite itself has failed (which is precisely when you need test reports the most...).
- [`rimraf`](https://www.npmjs.com/package/rimraf) as a convenience method to remove any test reports left over from the previous run

```json title="package.json"
{
  "scripts": {
    "postinstall": "serenity-bdd update",
    "clean": "rimraf target",
    "test": "failsafe clean test:execute test:report",
    "test:execute": "cucumber-js",
    "test:report": "serenity-bdd run --features ./features ",
  }
}
```
Note that in the above code sample, you should configure `test:execute` to invoke [your test runner of choice](https://serenity-js.org/handbook/test-runners/).
