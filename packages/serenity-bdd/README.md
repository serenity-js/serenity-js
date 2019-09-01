# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity BDD

The `@serenity-js/serenity-bdd` module integrates Serenity/JS and the Serenity BDD reporting CLI.

This integration enables your Serenity/JS tests to produce interim JSON reports, which the Serenity BDD reporting CLI
can then turn into world-class, illustrated test reports and living documentation.

### Installation

```
npm install --save-dev @serenity-js/core @serenity-js/assertions @serenity-js/rest @serenity-js/serenity-bdd
```

### SerenityBDDReporter

To allow Serenity/JS to produce Serenity BDD-standard JSON reports, assign the `SerenityBDDReporter` to the `Stage`
and configure the `ArtifactArchiver` to store the reports at the location where Serenity BDD expects to find them.

This can be done in your `protractor.conf.js` file if you're using Protractor, or programmatically.

#### Programmatic configuration

```typescript
import { ArtifactArchiver, serenity } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

serenity.setTheStage(
    ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
    new SerenityBDDReporter(),
);
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

```
npx serenity-bdd --help
```

#### Downloading the Serenity BDD reporting CLI

To download the Serenity BDD reporting CLI or update it, use the update command:

```
npx serenity-bdd update
```

Please note that the `update` command will try to download the jar only if you don't have one cached already,
or when the one you have is not up to date. Otherwise no outbound network calls are made.

If you're behind a corporate proxy server that causes certificate errors you can tell the wrapper to ignore the SSL certificate check:

```
npx serenity-bdd update --ignoreSSL
```

You can also tell it to download the Serenity BDD reporting CLI jar from your company's artifact repository
if you can't use the official Bintray one:

```
npx serenity-bdd update --repository https://artifactory.example.org/
```

To learn more about the `update` command, run:

```
npx serenity-bdd --help update
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
