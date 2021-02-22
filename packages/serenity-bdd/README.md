# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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

This can be done in your `protractor.conf.js` file if you're using Protractor, or programmatically.

#### Programmatic configuration

```typescript
import { ArtifactArchiver, serenity } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

serenity.configure({
    crew: [
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
        new SerenityBDDReporter()
    ],
});
```

#### Protractor

```javascript
// protractor.conf.js

const
    { ArtifactArchiver }    = require('@serenity-js/core'),
    { SerenityBDDReporter } = require('@serenity-js/serenity-bdd'),

exports.config = {

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            new SerenityBDDReporter(),
        ]
    },

    // ...
}
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
Learn more about configuring [`serenity.properties`](https://serenity-bdd.github.io/theserenitybook/latest/serenity-system-properties.html).

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

The easiest way to ensure that the Serenity BDD reporting CLI is up to date
and that the Serenity BDD test report is produced after each test run is to
add the following entries to the scripts section of the `package.json` file:

```json
{
  "scripts": {
    "test:update-serenity": "serenity-bdd update",
    "test:acceptance": "/* invoke the test runner */",
    "test:report": "serenity-bdd run",
    "test": "failsafe test:acceptance test:update-serenity test:report",
    // ... other scripts
  },
  // ... other config
}
```

In the above example, the [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) module is used to invoke
each of the `test:update-serenity`, `test:acceptance` and `test:report` scripts when `npm test` is executed.
This is to ensure that the Serenity BDD report is produced even when there is a test failure.
