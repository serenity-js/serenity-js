---
title: Serenity BDD Reporter
layout: handbook.hbs
cta: cta-share
---

# Serenity BDD Reporter

[`SerenityBDDReporter`](/modules/serenity-bdd/class/src/stage/crew/serenity-bdd-reporter/SerenityBDDReporter.ts~SerenityBDDReporter.html) is available as part of the [`@serenity-js/serenity-bdd`](/modules/serenity-bdd) module. 

This reporter emits [`Artifacts`](/modules/core/class/src/model/Artifact.ts~Artifact.html) containing Serenity BDD-standard JSON reports, which can be stored to disk by [`ArtifactArchiver`](/handbook/reporting/artifact-archiver.html), and then turned into Serenity BDD HTML reports by [Serenity BDD Reporting CLI](https://github.com/serenity-bdd/serenity-cli).

The resulting report contains screenshots, details of HTTP traffic for any [REST API](/modules/rest) interactions, details of any activities performed by Serenity/JS [`Actors`](/handbook/design/actors.html) and more.

<figure>
![Serenity BDD report](/handbook/reporting/images/serenity-bdd-reporter.png)
    <figcaption><span>Example Serenity BDD report</span></figcaption>
</figure>

## Installation

To use the `SerenityBDDReporter`, install the `@serenity-js/serenity-bdd` module:

```bash
npm install --save-dev @serenity-js/{core,serenity-bdd}
```

To generate Serenity BDD HTML reports, you'll need the Serenity BDD Reporting CLI. You can download it using the `serenity-bdd` command available as part of this module:

```bash
npx serenity-bdd update
```

The best way to ensure you always have the latest version of the CLI available is to run `serenity-bdd update` whenever you run `npm install`. To automate this process, add the below entry to your `package.json`: 

```json
{
  "scripts": {
    "postinstall": "serenity-bdd update"
  }
}
```

**Please note**: Serenity BDD Reporting CLI is a Java library, so make sure you have installed the [Java Runtime Environment](/handbook/integration/runtime-dependencies.html#java-runtime-environment).

## Integration

[`SerenityBDDReporter`](/modules/serenity-bdd/class/src/stage/crew/serenity-bdd-reporter/SerenityBDDReporter.ts~SerenityBDDReporter.html) listens to [`DomainEvents`](/modules/core/identifiers.html#events) emitted by [`Actors`](/handbook/design/actors.html) and Serenity/JS test runner adapters.

When a test scenario finishes (see [`SceneFinishes` event](/modules/core/class/src/events/SceneFinishes.ts~SceneFinishes.html)), the reporter emits an [`Artifact`](/modules/core/class/src/model/Artifact.ts~Artifact.html) containing a Serenity BDD-standard JSON report.

This artifact is then stored to disk by the [`ArtifactArchiver`](/handbook/reporting/artifact-archiver.html), where it can be parsed by the Serenity BDD Reporting CLI and used to generate a HTML report.


<div class="mermaid">
graph TB
    A(["fas:fa-users Actors"])
    TRA(["fas:fa-plug Serenity/JS test runner adapter"])
    DEV(["fas:fa-laptop-code Developer"])

    S["Serenity"]
    AA["ArtifactArchiver"]
    SBDDR["SerenityBDDReporter"]
    SBDDW["fas:fa-terminal serenity-bdd run"]
    TA["fas:fa-file json, png, etc."]
    SBDDCLI(["fab:fa-java serenity-bdd-cli.jar"])

    HTML["fas:fa-chart-pie Serenity BDD HTML reports"]

    A -- notify --> S
    TRA -- notifies --> S
    DEV -- invokes -----> SBDDW

    S -- notifies ---> SBDDR
    S -- "notifies<br>[ArtifactGenerated]" ---> AA
    AA -- "stores<br>[Artifact]" ----> TA

    SBDDR -- "notifies<br>[ArtifactGenerated]" --> S
    SBDDW -- manages --> SBDDCLI
    SBDDCLI -- reads --> TA
    SBDDCLI -- produces --> HTML

    subgraph "serenity-bdd"
    SBDDR
    SBDDCLI
    SBDDW
    end

    subgraph "core"
    S
    AA
    end

    subgraph "file system"
    TA
    HTML
    end

    class A socket
    class TRA socket
    class R socket

    click A "/handbook/design/actors.html"
    click S "/modules/core/class/src/Serenity.ts~Serenity.html"
    click AA "handbook/reporting/artifact-archiver.html"
    click SBDDR "/modules/serenity-bdd/class/src/stage/crew/serenity-bdd-reporter/SerenityBDDReporter.ts~SerenityBDDReporter.html"
    click SBDDW "/modules/serenity-bdd"
</div>

## Usage

To use the [`SerenityBDDReporter`](/modules/serenity-bdd/class/src/stage/crew/serenity-bdd-reporter/SerenityBDDReporter.ts~SerenityBDDReporter.html), register it as one of the [`StageCrewMembers`](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html), together with the [`ArtifactArchiver`](/handbook/reporting/artifact-archiver.html):

```typescript
import { configure, ArtifactArchiver } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

configure({
    crew: [
        new SerenityBDDReporter(),
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
    ],
});
```

When your test suite has finished running, generate the Serenity BDD reports by executing the following command in your terminal:

```bash
npx serenity-bdd run
```

To automate this process, install the following additional modules:
```bash
npm install --save-dev rimraf npm-failsafe
```

Next, add the below scripts to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "serenity-bdd update",
    "test": "failsafe test:clean test:run test:report",
    "test:clean": "rimraf target/site/serenity",
    "test:run": "/* invoke your test runner of choice, i.e. cucumber-js */",
    "test:report": "serenity-bdd run"    
  }
}
```

Now to run your test suite, execute:
```bash
npm test
```
The above command invokes:
- `test:clean`, which removes any artifacts left over from the previous run,
- `test:run`, which invokes your test runner of choice, configured with an appropriate Serenity/JS test runner adapter (learn how to configure Serenity/JS with [Cucumber](/handbook/integration/serenityjs-and-cucumber.html), [Mocha](/handbook/integration/serenityjs-and-mocha.html), or [Jasmine](/handbook/integration/serenityjs-and-jasmine.html)),
- `test:report`, which instructs the Serenity BDD Reporting CLI to generate the HTML report.

To learn more about the available configuration options of the `SerenityBDDReporter` and the `serenity-bdd` command, consult the documentation of the [`@serenity-js/serenity-bdd` module](/modules/serenity-bdd).

You might also want to explore the [example projects](https://github.com/serenity-js/serenity-js/tree/master/examples).
