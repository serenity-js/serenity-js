---
title: Upgrading to Serenity/JS 2.0
layout: handbook.hbs
---

# Upgrading to Serenity/JS 2.0

If you wish to upgrade your existing Serenity/JS 1.x project to use version 2.0 of the framework - this guide is for you!

The upgrade path is relatively straightforward as the main Screenplay classes, such as [`Actor`](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html), 
[`Task`](/modules/core/class/src/screenplay/Task.ts~Task.html), [`Interaction`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html) and [`Question`](/modules/core/class/src/screenplay/Question.ts~Question.html) 
are backwards compatible. However, the latest version of Serenity/JS introduces a number of significant new features, which will give you an opportunity to simplify your existing code.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-hands-helping"></i></div>
    <div class="text">
        <h4>Need a hand?</h4>
        <p>
            If you'd like some help with the upgrade or a review of your code base - check out the [support options](/support.html).
        </p>
    </div>
</div>

## Project templates and examples

If you'd like to see Serenity/JS 2.0 in action, watch my talk on ["Full-stack acceptance testing with Serenity/JS 2.0"](/handbook/demo.html).

If you prefer to dive straight into the code, there are several [example mini-projects](https://github.com/serenity-js/serenity-js/tree/master/examples) within the [Serenity/JS main repo](https://github.com/serenity-js/serenity-js) that demonstrate some of the major features, as well as integrations and test runners the framework supports. 

In particular, you might be interested to check out:
- [`protractor-jasmine-todomvc`](https://github.com/serenity-js/serenity-js/tree/master/examples/protractor-jasmine-todomvc) - an example of a test suite interacting with the popular TodoMVC web app, and using Serenity/JS 2.0, Jasmine and Protractor,
- [`cucumber-rest-api-level-testing`](https://github.com/serenity-js/serenity-js/tree/master/examples/cucumber-rest-api-level-testing) - an example of a REST API-only test suite using Serenity/JS 2.0 and the latest version of Cucumber.js
- there are also [other projects](https://github.com/serenity-js/serenity-js/tree/master/examples), so feel free to explore! 

If you're starting a new project, the easiest way to do it is to use one of the [Serenity/JS project templates](https://github.com/serenity-js/) as the foundation.

The most popular templates include:
- [`serenity-js-cucumber-protractor-template`](https://github.com/serenity-js/serenity-js-cucumber-protractor-template) - a boilerplate project with Serenity/JS 2.x, latest version of Cucumber.js and Protractor,
- [`serenity-js-jasmine-protractor-template`](https://github.com/serenity-js/serenity-js-jasmine-protractor-template) - a boilerplate project with Serenity/JS 2.x, Jasmine and Protractor.
- [`serenity-js-mocha-protractor-template`](https://github.com/serenity-js/serenity-js-mocha-protractor-template) - a boilerplate project with Serenity/JS 2.x, Mocha and Protractor.

## A modular framework

The two main [Serenity/JS 1.x](https://github.com/serenity-js/serenity-js/tree/1.x) modules you have probably interacted with the most were [`serenity-js`](https://www.npmjs.com/package/serenity-js), which contained the bulk of the framework, and [`serenity-cli`](https://www.npmjs.com/package/serenity-cli) - a wrapper around the [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-cli), responsible for generating the [HTML reports and living documentation](https://serenity-bdd.github.io/theserenitybook/latest/living-documentation.html).
 
 This design of the framework made it easier for you to add it as a dependency to your project. However, it also meant that as the framework grew over time and became more sophisticated, you might have had to depend on parts of it that you did not necessarily need. For example, why should you need a dependency on Protractor and WebDriver if you were only writing API tests? And why would you need an adapter for Mocha if you were only ever going to use Cucumber? The answers to those questions seem obvious now, but when I originally designed the framework back in 2016, I never expected how popular it would become and how many use cases you'd find for it, dear fellow engineers! :-)
 
But, several years and thousands of Serenity/JS installations later, the internal structure of Serenity/JS 2.0 is in stark contrast with what you would've found here before.

While **almost all the public APIs** you'd use in your tests **remained intact** to help you make the upgrade as easy as possible, internally Serenity/JS 2.x has been re-architected to become a full-stack acceptance testing framework. Most importantly, it now offers a [modular, pluggable architecture](/handbook/integration/architecture.html) that you can extend to your needs to make your tests interact with **any interface of your system**, not just the Web and HTTP/REST APIs.

### New dependencies

The main consequence of those internal design changes is that the Serenity/JS framework is now distributed 
as a **collection of NPM modules** under the [`@serenity-js/*` namespace](https://www.npmjs.com/search?q=%40serenity-js).
 
While this distribution model requires you to think a little bit more about what parts of the framework you'll actually need for your project, it also makes the overall design much easier for you to extend and the framework itself more lightweight. Check out [the modules page](/modules/) to see what official Serenity/JS modules are currently available. 

So, assuming that your Serenity/JS 1.x-based project interacted with the Web interface of your system (after all, that was the most common use case), the first thing you'll need to do is to add the following Serenity/JS 2.x modules to the [`dependencies`](https://docs.npmjs.com/files/package.json#dependencies) or [`devDependencies`](https://docs.npmjs.com/files/package.json#devdependencies) section of your `packages.json`:

```javascript
"@serenity-js/assertions": "^2.0.0",
"@serenity-js/console-reporter": "^2.0.0",
"@serenity-js/core": "^2.0.0",
"@serenity-js/protractor": "^2.0.0",
"@serenity-js/rest": "^2.0.0",
"@serenity-js/serenity-bdd": "^2.0.0"
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>Semantic versioning</h4>
        <p>
            Serenity/JS uses [semantic versioning](https://semver.org/) and we take semantic versioning, as well as backwards compatibility and deprecations [very seriously](/handbook/integration/versioning.html). This means that the best way for you to stay up-to-date with all the latest features and patches is to set the version of `@serenity-js/*` modules you depend on to `"^2.0.0"`.
        </p>
        <p>
            However, if you'd prefer to stay on a fixed version instead, you can find out the latest available version by visiting the [releases page](https://github.com/serenity-js/serenity-js/releases).
        </p>
    </div>
</div>

Since test runner adapters are no longer part of the core framework but instead live in their own independent modules, the next thing you'll need to do is to pick such adapter for your test runner of choice.
 
For example, if you were using Serenity/JS with Cucumber, you'll need the [Serenity/JS Cucumber adapter](/modules/cucumber):

```
"@serenity-js/cucumber": "^2.0.0",
```

If you were using `mocha`, you can continue to do so by using [`@serenity-js/mocha`](/modules/mocha) adapter and a recent version of [`mocha`](https://mochajs.org/) itself:

```
"@serenity-js/mocha": "^2.0.0",
"mocha": "^8.0.0",
"@types/mocha": "latest",
```

Alternatively, you can also switch to [`jasmine`](/modules/jasmine) if you prefer that test runner:

```
"@serenity-js/jasmine": "^2.0.0",
"jasmine": "^3.5.0",
"@types/jasmine": "^3.5.10",
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>Mocha vs Jasmine</h4>
        <p>
            Both Mocha and Jasmine offer nearly identical `describe` and `it` APIs, and since Serenity/JS 2.0 offers its own [assertions library](/modules/assertions), you're unlikely to see much difference between the two test runners in this respect.
        </p>
        <p>
            The main reason why you'd want to use Jasmine instead of Mocha is if you're already using it in your project, for example to run your unit tests, and want to avoid additional dependencies.
        </p>
        <p>
            The main reason why you'd want to use Mocha instead of Jasmine is if you wanted a smaller test runner or needed to be able to [automatically retry](https://mochajs.org/#retry-tests) failed tests. Plus, Jasmine still has a problem where a failing `beforeEach` and `beforeAll` hook doesn't prevent the rest of the test from executing (see [`#577`](https://github.com/jasmine/jasmine/issues/577) and [`#1533`](https://github.com/jasmine/jasmine/issues/1533)).
        </p>
    </div>
</div>

### Obsolete dependencies

There's a number of libraries that Serenity/JS used to depend on that you won't need anymore with version 2.0 of the framework. 

In particular:

 - [`chai`](https://www.chaijs.com/) is no longer needed as it's been superseded by [`@serenity-js/assertions`](/modules/assertions/), 
 - `serenity-cli` has been merged with other code that enables integration of Serenity/JS and Serenity BDD and is available as [`@serenity-js/serenity-bdd`](/modules/serenity-bdd). 
 
All the above means that you can remove the following entries from the [`dependencies`](https://docs.npmjs.com/files/package.json#dependencies) or [`devDependencies`](https://docs.npmjs.com/files/package.json#devdependencies) section of your `packages.json`: 

```javascript
"@types/chai": "...",
"@types/chai-as-promised": "...",
"chai": "...",
"chai-as-promised": "...",
"chai-smoothie": "...",
"serenity-cli": "...",
"serenity-js": "...",
```    

### Updated scripts

In Serenity/JS 2.0, the old `serenity-cli` module that used to provide a wrapper around Serenity BDD CLI, has been merged with other code integrating Serenity/JS with Serenity BDD and is now available as [`@serenity-js/serenity-bdd`](/modules/serenity-bdd).

This new module ships with a new command you can use to download the Serenity BDD CLI `jar`. This means that any of the `pretest` or `postinstall` scripts defined in your `package.json` that used to call `serenity update` should be changed to call `serenity-bdd update` instead.

##### Before

```json
"postinstall": "serenity update --ignoreSSL",
```

##### After

```json
"postinstall": "serenity-bdd update --ignoreSSL", 
```

Learn more about [`@serenity-js/serenity-bdd`](/modules/serenity-bdd).

### Updated imports

In Serenity/JS 1.x, all the core and Protractor-specific APIs you'd use in your tests were made available via the `serenity-js` module. It was also common to import them either from `serenity-js/lib/serenity-protractor`, or its alias `serenity-js/protractor`, for example:

```typescript
import { Task, Click, Enter, /** etc. **/ } from 'serenity-js/protractor';
// or
import { Task, Click, Enter, /** etc.  **/ } from 'serenity-js/lib/serenity-protractor';
```

Another approach some engineers chose to use in their custom `Task` and `Interaction` classes was to import the Serenity/JS Screenplay Pattern APIs directly from `@serenity-js/core/lib/screenplay` or its alias `serenity-js/lib/screenplay`, for example:

```typescript
import { Task, Interaction, Actor, /** etc **/ } from '@serenity-js/core/lib/screenplay';
// or
import { Task, Interaction, Actor, /** etc **/ } from 'serenity-js/lib/screenplay';
```

Because of its [modular architecture](/handbook/integration/architecture.html), the nature of Serenity/JS 2.x imports has changed as well.
 
If your source files import **core Screenplay types** such as `Task`, `Actor`, `Interaction`, `Question` or `Ability` from `serenity-js/lib/screenplay-protractor`, they should now do so from [`@serenity-js/core`](/modules/core).
 
All the other **Protractor-specific types**, such as `Click`, `Enter`, etc. can be imported from the [`@serenity-js/protractor`](@serenity-js/protractor) module:

##### Before

```typescript
import { 
    Actor, Task, Interaction, Click, Enter, BrowseTheWeb, /** etc. **/ 
} from 'serenity-js/protractor';

// or
import {
    Actor, Task, Interaction, Click, Enter, BrowseTheWeb, /** etc.  **/
} from 'serenity-js/lib/serenity-protractor';
```

##### After

```typescript
// core Screenplay APIs:
import { Task, Interaction, Actor, /** etc **/ } from '@serenity-js/core';

// Protractor-specific APIs:
import { Click, Enter, BrowseTheWeb, /** etc **/ } from '@serenity-js/protractor';
```

#### Find and replace

You'll most likely have to change many of the imports used in your code base by manually editing the code as per the above instructions. However, if you used one of the more specific imports, such as the ones in the `before` column in the table below, you might simplify the process by using the "replace all" / "replace in path" function in your IDE to quickly make those changes across all your source files.

before (1.x) | after (2.x) 
---- | --- 
`serenity-js/lib/serenity-protractor` | `@serenity-js/protractor` 
`serenity-js/lib/screenplay` | `@serenity-js/core`
`@serenity-js/core/lib/screenplay` | `@serenity-js/core`

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>Project-level "find and replace"</h4>
        <p>
            To find out more about replacing multiple occurrences of a given string in your project, consult your IDE's manual.
        </p>
        <p>
            For example, here's how you'd do it in [WebStorm](https://www.jetbrains.com/help/webstorm/finding-and-replacing-text-in-project.html), [IntelliJ](https://www.jetbrains.com/help/go/finding-and-replacing-text-in-project.html), and [Visual Studio Code](https://code.visualstudio.com/Docs/editor/codebasics).
        </p>
    </div>
</div>

## Configuration

Serenity/JS 2.x is a full-stack acceptance testing framework and can be used with or without a web browser. However, since the most common use case for Serenity/JS 1.x was to **run Web-based tests via Protractor**, in this guide I'll focus on upgrading this particular setup.

To learn more about configuring a test runner that **doesn't use** Protractor, check out the documentation for the [Serenity/JS module](/modules) you're interested in, for example the [Cucumber](/modules/cucumber), [Jasmine](/modules/jasmine), or [Mocha](/modules/mocha) adapters. 

### Protractor

Serenity/JS 1.x bundled the various reporting services, a.k.a. the [`StageCrewMember`s](modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html), in the `serenity-js` module, which made it easier to import them in your `protractor.conf.js` file.

In Serenity/JS 2.x, the [`StageCrewMember`s](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html) are bundled together with other code supporting given integration, i.e. [`@serenity-js/protractor`](/modules/protractor) or [`@serenity-js/serenity-bdd`](/modules/serenity-bdd), or have their own standalone modules, i.e. [`@serenity-js/console-reporter`](/modules/console-reporter).

The new [`StageCrewMember`s](/modules/core/class/src/stage/StageCrewMember.ts~StageCrewMember.html) also no longer rely on the file system, as they used to in Serenity/JS 1.x. Instead, they delegate the responsibility of storing the artifacts they generate (such as screenshots, test reports, and so on) on disk to the [`ArtifactArchiver`](/modules/core/class/src/stage/crew/artifact-archiver/ArtifactArchiver.ts~ArtifactArchiver.html).

The above changes mean that the imports in a typical `protractor.conf.js` file will need to change as follows: 

##### Before

```javascript
// protractor.conf.js

const {
  consoleReporter,
  serenityBDDReporter,
  photographer,
} = require('serenity-js/lib/stage_crew');
```

##### After

```javascript
// protractor.conf.js

const 
  { ConsoleReporter } = require('@serenity-js/console-reporter'),
  { ArtifactArchiver } = require("@serenity-js/core"),
  { Photographer, TakePhotosOfInteractions } = require('@serenity-js/protractor'),
  { SerenityBDDReporter } = require("@serenity-js/serenity-bdd");
```

Once you have imported the new `StageCrewMember`s, you can tell the framework to use them
using syntax similar to version 1.x, as per the code sample below.

The main difference, though, is that since the core framework no longer depends on Protractor, instead of configuring the `frameworkPath` parameter to point at `require.resolve('serenity-js')`, you'll now point it at `require.resolve('@serenity-js/protractor/adapter')`:

```javascript
// protractor.conf.js

// Serenity/JS imports
const 
  { ConsoleReporter } = require('@serenity-js/console-reporter'),
  { ArtifactArchiver } = require("@serenity-js/core"),
  { Photographer, TakePhotosOfFailures } = require('@serenity-js/protractor'),
  { SerenityBDDReporter } = require("@serenity-js/serenity-bdd");

exports.config = {

    // Serenity/JS config
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            ArtifactArchiver.storingArtifactsAt("./target/site/serenity"),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
            ConsoleReporter.withDefaultColourSupport(),
        ],
    },
    
    // Test runner config [...]

    // Other Protractor config [...]
};
 ```

Learn more about the stage crew:
- [`ConsoleReporter`](/modules/console-reporter/)
- [`Photographer`](/modules/protractor/class/src/stage/crew/photographer/Photographer.ts~Photographer.html)
- [`SerenityBDDReporter`](/modules/serenity-bdd/)
- [`ArtifactArchiver`](/modules/core/class/src/stage/crew/artifact-archiver/ArtifactArchiver.ts~ArtifactArchiver.html)

#### Upgrading Mocha

Serenity/JS 2.x uses Mocha version 8 or newer, which has slightly different configuration options than version 5 that Serenity/JS 1.x supported. 

Provided you have added a recent version of [`mocha`](https://www.npmjs.com/package/mocha) to you `package.json`, you can configure Protractor to use it as follows:

##### Before
```javascript
// protractor.conf.js

// Serenity/JS imports [...]

exports.config = {
    
    // Serenity/JS config [...] 

    // Test runner config
    specs: [ 'spec/*.spec.ts', ],

    mochaOpts: {
        ui: 'bdd',
        compiler: 'ts:ts-node/register',
    },

    // Other Protractor config [...]
}
```

##### After

```javascript
// protractor.conf.js

// Serenity/JS imports [...]

exports.config = {
    
    // Serenity/JS config [...] 

    // Test runner config
    specs: [ 'spec/*.spec.ts', ],

    mochaOpts: {
        require: [ 
            'ts-node/register',
            'spec/setup.ts'
        ],
    },
    
    // Other Protractor config [...]
};
```

**Please note** that the above config instructs Mocha to load a `setup.ts` file located at `spec/setup.ts`.
While this is not mandatory, you can use a setup file like that to further configure Mocha and Serenity/JS to your needs.
I'll explain it in more depth in the next section.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>I'd still rather use Jest, or Ava, or Karma...)</h4>
        <p>
            Sure thing, and we'd love to support it! However, with limited time and virtually unlimited possibilities for extending Serenity/JS, we have to be very strict about our priorities.
        </p>
        <p>
            If you'd like to see Serenity/JS support your favourity test runner, please [raise a ticket](https://github.com/serenity-js/serenity-js/issues) or give a <i class="fas fa-thumbs-up"></i> thumbs up  to an existing proposal.
        </p>
        <p>
            Also, please consider [becoming our GitHub Sponsor](/support.html) to help the Serenity/JS team secure more time on the project to support more integrations.
        </p>
    </div>
</div>

#### Cucumber

While Serenity/JS supported Cucumber.js version 1.3.3, Serenity/JS 2.x supports all the versions of Cucumber.js from 0.x to 6.x. 

Provided you have added [`cucumber`](https://www.npmjs.com/package/cucumber) to you `package.json`, you can configure Protractor to use it as follows:

```javascript
// protractor.conf.js

// Serenity/JS imports [...]

exports.config = {
    
    // Serenity/JS config [...] 

    // Test runner config
    specs: [ 'features/*.feature', ],

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/setup.ts',
        ],
        'require-module': ['ts-node/register'],
        tags: [],
    },
    
    // Other Protractor config [...]
};
```

**Please note** that the above config instructs Cucumber.js to load a `setup.ts` file located at `features/support/setup.ts`.
While this is not mandatory, you can use a setup file like that to further configure Cucumber.js and Serenity/JS to your needs. I'll explain it in more depth in the next section.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>Cucumber without Protractor</h4>
        <p>
            If you'd like to use Serenity/JS with Cucumber but without Protractor, i.e. for non-Web testing, have a look
            at the documentation of the [`@serenity-js/cucumber`](/modules/cucumber/) module. 
        </p>
    </div>
</div>

## Actors and the Stage

Now that you know how to configure the Serenity/JS 2.x framework, it's time to look at how to upgrade your existing tests to
take advantage of the new features.

One of the important changes that Serenity/JS 2.x brings to the table is in how it simplifies the way you create, manage and access the [`Actor`s](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html), the cornerstone of the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html).

In Serenity/JS 1.x you had to instantiate the `Stage` where whe `Actor`s would perform, and make sure that it's accessible in your tests.

For example, if you were using Cucumber, you'd first define a `Cast` of `Actors`:

```typescript
// features/support/Actors.ts

import { protractor } from 'protractor';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

export class Actors implements Cast {
    actor(name: string): Actor {
        return Actor.named(name)
            .whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
```

You'd then use a mechanism like Cucumber [`World`](https://github.com/cucumber/cucumber-js/blob/1.x/docs/support_files/world.md) to  tell Serenity/JS to instantiate the `Stage` and make it available in your test steps:

```typescript
// features/support/world.ts

import { serenity } from 'serenity-js/lib/screenplay-protractor';
import { Actors } from './Actors.ts';

export = function () {

    this.World = function () {
        this.stage = serenity.callToStageFor(new Actors());
    };
};
```

Next, you'd access the `Actor` by invoking the `theActorCalled(name)` and `theActorInTheSpotlight()` APIs provided by the `Stage`:

```typescript
// features/step_definitions/steps.ts
export = function () {

    this.Given(/^.*that (.*) has an empty todo list$/, function (actorName: string) {
        return this.stage.theActorCalled(actorName).attemptsTo(
            // some tasks to perform...
        );
    });
    
    this.When(/^she adds "(.*?)" to her todo list$/, function (itemName: string) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            // some tasks to perform...
        );
    });
};
```

While the same general principle applies in version 2.x as well, the way you interact with the framework has
been simplified, so let me walk you through it step by step.

### Changes to the Cast

Both Serenity/JS 1.x and 2.x provide a [`Cast`](/modules/core/class/src/stage/Cast.ts~Cast.html) interface
that needs to be implemented by the class responsible for providing the `Actor`s for your tests.

However, while Serenity/JS 1.x expected the `Cast` to instantiate the `Actor`s, version 2.x instantiates them for you.

All you need to do is to `prepare` the actors for the performance by giving them the [`Abilities`](/handbook/design/abilities.html)
they need:

##### Before
```typescript
// features/support/Actors.ts

import { protractor } from 'protractor';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

export class Actors implements Cast {
    actor(name: string): Actor {
        return Actor.named(name)
            .whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
```

##### After
```typescript
// features/support/Actors.ts

import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {              // `prepare(actor: Actor)` instead of `actor(name: string)`
        return actor.whoCan(                    // add the abilities instead of instantiating the actor
            BrowseTheWeb.using(protractor.browser),
        );
    }
}
```

### You don't need the World

The second important difference is in how you tell Serenity/JS what actors to use.

In Serenity/JS 1.x you had to rely on Cucumber [`World`](https://github.com/cucumber/cucumber-js/blob/1.x/docs/support_files/world.md)
to set up the `Stage` and assign it to Cucumber context (`this`). 

In version 2.x, Serenity/JS takes on the responsibility of managing the execution context, so all you need to do
is simply tell the framework what actors you want to [`engage`](/modules/core/function/index.html#static-function-engage)
before each scenario.

##### Before (Cucumber 1.3.3, Serenity/JS 1.x)

```typescript
// features/support/world.ts

import { serenity } from 'serenity-js/lib/screenplay-protractor';
import { Actors } from './Actors.ts';

export = function () {

    this.World = function () {
        this.stage = serenity.callToStageFor(new Actors());
    };
};
```

##### After (Cucumber 1.3.3, Serenity/JS 2.x)

```typescript
// features/support/setup.ts

import { engage } from '@serenity-js/core';
import { Actors } from './Actors';

export = function () {
    this.Before(() => engage(new Actors());
}
```

##### After (Cucumber 6.x, Serenity/JS 2.x)

If you decided to upgrade Cucumber to recent version at the same time you upgrade Serenity/JS, you could simplify the above setup code even further:

```typescript
// features/support/setup.ts

import { engage } from '@serenity-js/core';
import { Before } from 'cucumber';
import { Actors } from './Actors';

Before(() => engage(new Actors());
```

### Accessing the actors

When using Cucumber without Serenity/JS, you use Cucumber `this` to manage state across multiple step definitions.
While this mechanism is quite convenient, it also requires you to use the full-blown `function` syntax since the simpler
arrow functions [don't have a separate `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#No_separate_this). For this reason, Cucumber documentation encourages you to [avoid the arrow functions](https://cucumber.io/docs/cucumber/api/#steps) altogether.

In version 2.0, Serenity/JS takes on the responsibility of managing state in your test scenarios, makes accessing the actors easier via [`actorCalled`](/modules/core/function/index.html#static-function-actorCalled) and [`actorInTheSpotlight`](/modules/core/function/index.html#static-function-actorInTheSpotlight), and since it doesn't rely on Cucumber `this` - it allows you to use the convenient and compact arrow functions to help you simplify your code further.

##### Before (Cucumber 1.3.3, Serenity/JS 1.x)

```typescript
// features/step_definitions/steps.ts

export = function () {

    this.Given(/^.*that (.*) has an empty todo list$/, function (actorName: string) {
        return this.stage.theActorCalled(actorName).attemptsTo(
            // some tasks to perform...
        );
    });
    
    this.When(/^she adds "(.*?)" to her todo list$/, function (itemName: string) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            // some tasks to perform...
        );
    });
};
```

##### After (Cucumber 1.3.3, Serenity/JS 2.x)

```typescript
// features/step_definitions/steps.ts

import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';

export = function () {

    this.Given(/^.*that (.*) has an empty todo list$/, (actorName: string) => {
        return actorCalled(actorName).attemptsTo(
            // some tasks to perform...
        );
    });
    
    this.When(/^she adds "(.*?)" to her todo list$/, (itemName: string) => {
        return actorInTheSpotlight().attemptsTo(
            // some tasks to perform...
        );
    });
};
```

##### After (Cucumber 6.x, Serenity/JS 2.x)

```typescript
// features/step_definitions/steps.ts

import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { Given, When } from 'cucumber';

Given(/^.*that (.*) has an empty todo list$/, (actorName: string) => {
    return actorCalled(actorName).attemptsTo(
        // some tasks to perform...
    );
});
    
When(/^she adds "(.*?)" to her todo list$/, (itemName: string) => {
    return actorInTheSpotlight().attemptsTo(
        // some tasks to perform...
    );
});
```

##### After (Cucumber 6.x, Serenity/JS 2.x, concise body)

If you want to take refactoring your step definitions even further, you could use arrow functions with a ["concise body"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#Function_body) and drop the `return` statements altogether: 

```typescript
// features/step_definitions/steps.ts

import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';
import { Given, When } from 'cucumber';

Given(/^.*that (.*) has an empty todo list$/, (actorName: string) => 
    actorCalled(actorName).attemptsTo(
        // some tasks to perform...
    ));
    
When(/^she adds "(.*?)" to her todo list$/, (itemName: string) =>
    actorInTheSpotlight().attemptsTo(
        // some tasks to perform...
    ));
```

### Actors in Mocha tests

The above-described mechanism for accessing the actors works regardless of the test runner you're using.

For example, this is how you could use the same strategy to implement a Mocha `setup.ts` file:  

```typescript
// spec/setup.ts

import 'mocha';

import { Actor, Cast, engage } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

class Actors implements Cast {
    prepare(actor: Actor): Actor {              // `prepare(actor: Actor)` instead of `actor(name: string)`
        return actor.whoCan(                    // add the abilities instead of instantiating the actor
            BrowseTheWeb.using(protractor.browser),
        );
    }
}

beforeEach(() => engage(new Actors()));         // the `beforeEach` can be defined either in spec/setup.ts
                                                // or in each spec file. 
```

And a test using the Mocha test runner:

```typescript
// spec/example.spec.ts

import 'mocha';
import { actorCalled } from '@serenity-js/core';

describe('some feature', () => {

    it('has some behaviour', () => 
        actorCalled('Jannice').attemptsTo(
            // some tasks to perform...
        ));   
});
```

## Implementing the Screenplay Pattern

### Tasks

The best way to illustrate how the `Task` has evolved is by using a concrete example.

Consider a task to `AddAnItem` to an imaginary to-do list that we'd invoke as follows:

```typescript
actorCalled('Tasha').attemptsTo(
    AddAnItem.called('Learn Serenity/JS'),
);
```

In Serenity/JS 1.x, the task to `AddAnItem` could be implemented like this:

```typescript
import { Enter, step, PerformsTasks, Task } from 'serenity-js/protractor';

/**
 * Any custom task had to implement the `Task` interface
 */
export class AddAnItem implements Task {

    static called(name: string) {
        return new AddAnItem(name);
    }

    constructor(private readonly name: string) {
    }

    /**
     * The `performAs` method received an `actor` who `PerformsTasks`
     * and returned a `PromiseLike<void>`
     *
     * The `@step` decorator was responsible for generating 
     * a human-friendly description to be used in the report
     */
    @step('{0} adds an item called #name')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            // The `attemptsTo` method invoked lower-level
            // tasks and interactions, such as `Click`, `Enter`, etc.
            Enter.theValue(this.name).into(/* some element */),
            // ...
        );
    }    
}
```

The same task implemented using the 2.x version would look as follows:

```typescript
import { Task, PerformsActivities } from '@serenity-js/core';
import { Enter } from '@serenity-js/protractor';

export class AddAnItem extends Task {
    static called(name: string) {
        return new AddAnItem(name);
    }    
    
    constructor(private readonly name: string) {
        super();
    }
    
    performAs(actor: PerformsActivities): PromiseLike<void> {
        return actor.attemptsTo(
            // ... list lower-level tasks and interactions:
            Enter.theValue(this.name).into(/* some element */),
        )   
    }
    
    toString() {
        return `#actor adds an item called ${ this.name }`;
    }
}
```

As you might have noticed, the above two code samples have several subtle differences:
- the imports are now more explicit, with all the Screenplay-specific types coming from `@serenity-js/core` and Protractor-specific ones from `@serenity-js/protractor`,
- instead of implementing a `Task` interface, the custom task now `extend`s a base `Task` class; extending a base class helps Serenity/JS distinguish the different types of activities performed by the actor at runtime and, for example, to capture screenshots upon `Interaction`s, but not upon `Task`s,
- the `@step` decorator is now superseded by a much more obvious `toString` method.

Please note that you also have an opportunity here to take your refactoring further as Serenity/JS 2.x still provides you with a convenient 
[`Task.where`](/modules/core/class/src/screenplay/Task.ts~Task.html#static-method-where) factory method that can
generate the task from the above example with much less code:

```typescript
import { Task } from '@serenity-js/core';
import { Enter } from '@serenity-js/protractor';

exports const AddAnItem = {
    called: (name: string) =>
        Task.where(`#actor adds an item called ${ this.name }`,
            // ... list lower-level tasks and interactions:
            Enter.theValue(this.name).into(/* some element */),
        ),       
}
```

### Interactions

Interaction have undergone an overhaul similar to tasks.

Consider an example Serenity/JS 1.x interaction that enables a disabled input element by injecting some JavaScript
into the browser using Protractor's [`executeScript` API](https://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.executeScript), available via the ability to `BrowseTheWeb`:

```typescript
import { BrowseTheWeb, Interaction, step, Target, UsesAbilities } from 'serenity-js/protractor';

export class Enable implements Interaction {

    public static the(target: Target): Enable {
        return new Enable(target);
    }

    constructor(private readonly target: Target) {
    }

    @step('{0} enables #target')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).
            executeScript(`arguments[0].removeAttribute("disabled");`, this.target);
    }
}
```

Now, compare it with this 2.x implementation:

```typescript
import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { ElementFinder } from 'protractor';

export class Enable extends Interaction {
    static the(target: Question<ElementFinder>) {
        return new Enable(target);
    }

    constructor(private readonly target: Question<ElementFinder>) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return this.target.answeredBy(actor).then(element => {
            return BrowseTheWeb.as(actor)
                .executeScript(`arguments[0].removeAttribute("disabled");`, element);
        });
    }

    toString(): string {
        return `#actor enables ${this.target}`;
    }
}
```

In Serenity/JS 2.x, a custom interaction:
- extends the base `Interaction` class,
- is responsible for resolving any `Question`s (more on this and the difference between `Target` and `Question` later)
- uses `toString` method rather than a `@step` decorator

Similarly to the `Task`, the `Interaction` class provides a convenient factory method [`Interaction.where`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html#static-method-where) to make defining custom interactions
easier. For instance, the above code sample could be implemented as follows:

```typescript
import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { ElementFinder } from 'protractor';

export const Enable = {
    the: (target: Question<ElementFinder>) =>
        Interaction.where(`#actor enables ${ target }`, (actor: UsesAbilities & AnswersQuestions) => {
            return target.answeredBy(actor)
                .then(element => {
                    return BrowseTheWeb.as(actor)
                        .executeScript(`arguments[0].removeAttribute("disabled");`, element);
                });
        }),
    },
}
```

**PRO TIP**: If you ever have the need to inject JavaScript into the UI of your system under test, please use the built-in
[`ExecuteScript`](/modules/protractor/class/src/screenplay/interactions/execute-script/ExecuteScript.ts~ExecuteScript.html)
interaction instead:

```typescript
import { Question, Task } from '@serenity-js/core';
import { ExecuteScript } from '@serenity-js/protractor';

export const Enable = {
    the: (target: Question<ElementFinder>) =>
        Task.where(`#actor enables ${ target }`,
            ExecuteScript.sync(`arguments[0].removeAttribute("disabled");`).
                withArguments(target), 
        ),
}
```  

### Questions

Apart from the main Screenplay Pattern interfaces, one of the most important and most commonly used classes in Serenity/JS 1.x was the `Target`.

The 1.x `Target` was a special class responsible for abstracting the way Protractor locates `WebElements`, or [`ElementFinder`s](https://www.protractortest.org/#/api?view=ElementFinder) and [`ElementArrayFinder`s](https://www.protractortest.org/#/api?view=ElementArrayFinder) in Protractor-speak.

However, unlike all the other classes responsible for retrieving information about the system under test, the `Target` [was not considered a `Question`](https://github.com/serenity-js/serenity-js/blob/1.x/packages/serenity-js/src/serenity-protractor/screenplay/ui/target.ts#L5), as it could only be used with Protractor-specific interactions. 

In Serenity/JS 2.x, the information retrieval mechanism is consistent across the board. This means that no matter whether you're retrieving a JSON body of the [last REST response](/modules/rest/class/src/screenplay/questions/LastResponse.ts~LastResponse.html#static-method-body), a [text of a web element](modules/protractor/class/src/screenplay/questions/text/Text.ts~Text.html#static-method-of), or [the web element itself](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html), they all implement the [`Question`](/modules/core/class/src/screenplay/Question.ts~Question.html) interface.

This means that Serenity/JS 2.x [`Target`s](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html) can be injected into Protractor-specific [interactions](/modules/protractor/identifiers.html#screenplay-interactions), but also [assertions](/modules/assertions) and [test synchronisation methods](/modules/protractor/class/src/screenplay/interactions/Wait.ts~Wait.html). You can also [nest `Target`s](modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html), therefore limiting the need for the problematic `XPath` selectors in your code base.

As you have probably already guessed, introducing this level of sophistication and flexibility required changing how the `Target` class works.

The original `Target` is now modelled by [four specialised `Question` classes](/modules/protractor/identifiers.html#screenplay-questions-targets) and the `Target` class itself was turned into a factory that takes care of instantiating them correctly.

However, the way you use it has remained intact:

```typescript
import { Target } from '@serenity-js/protractor';
import { by } from 'protractor';

// simple lean page object
class ToDoListApp {
    
    // Target.the captures a single element
    // and produces Question<ElementFinder> 
    static header = Target.the('header').located(by.css('h1'));

    // Target.all captures multiple elements
    // and produces Question<ElementArrayFinder>
    static items  = Target.all('the items').located(by.css('#todolist li'));
}
```

To learn more, check out the examples in the [API docs of the `Target` class](modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html).

#### Nested Targets

Serenity/JS 1.x provided a simple `Target.of` API that helped you replace parts of your locator dynamically during the test.

For example, you might have located a header of a table column using a `Target` defined as follows:

```typescript
import { Target } from 'serenity-js/protractor';
import { by } from 'protractor';

class DataTable {
    static Column_Header = Target.the('column header')
        .located(by.xpath(
            `//*[@id="data-table"]` +
            `//div[contains(@class, "ag-header-cell-label")]` +
            `//span[text()[contains(.,"{0}")]]`
        ));
}
```

You'd then configure such `Target` dynamically in your test scenario or task:

```typescript
const SortBy = (columnName: string) =>
    Task.where(`#actor sorts the data by ${ columnName }`,
        Click.on(
            DataTable.Column_Header.of(columnName),
        ),
    );
```

Serenity/JS 2.x allows you to nest `Target`s, which should help you get rid of some of those terrible `xpath` locators
from your codebase:

```typescript
import { Target } from '@serenity-js/protractor';
import { by } from 'protractor';

class DataTable {
    static component =
        Target.the('data table component').located(by.id('data-table'));

    static columnHeaders =
        Target.all('column headers').of(DataTable.component).located(by.css('.ag-header-cell-label'));
}
```

But what about picking a header with the right name?
This is where [`Pick`](/modules/protractor/class/src/screenplay/questions/Pick.ts~Pick.html) can help you:

```typescript
import { Target } from '@serenity-js/protractor';
import { includes } from '@serenity-js/assertions';
import { by } from 'protractor';

class DataTable {
    static component =
        Target.the('data table component').located(by.id('data-table'));

    static columnHeaders =
        Target.all('column headers').of(DataTable.component).located(by.css('.ag-header-cell-label'));

    static columnHeaderCalled = (name: string) =>
        Pick.from<ElementFinder, ElementArrayFinder>(DataTable.columnHeaders)
            .where(Text, includes(name))
            .first();
}
```

And then our `SortBy` task becomes:

```typescript
const SortBy = (columnName: string) =>
    Task.where(`#actor sorts the data by ${ columnName }`,
        Click.on(
            DataTable.columnHeaderCalled(columnName),
        ),
    );
```

Learn more about `Pick` from its [unit tests](/modules/protractor/test-file/spec/screenplay/questions/Pick.spec.ts.html).

#### Targets as arguments

Since the responsibilities of the 2.x `Target` differ from its predecessor, if you have written any custom [`Activity`](/modules/core/class/src/screenplay/Activity.ts~Activity.html) classes in your project where a [`Target`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html) is passed as an argument (for example in a constructor or a method call), you'll need to change the signatures to receive a `Question<ElementFinder>` for single-element activities or `Question<ElementArrayFinder>` for multi-element activities.
 
Consider a hypothetical Serenity/JS 1.x interaction we discussed earlier, the one that enabled a disabled element:

```typescript
import { BrowseTheWeb, Interaction, step, Target, UsesAbilities } from 'serenity-js/protractor';

export class Enable implements Interaction {

    public static the(target: Target): Enable {
        return new Enable(target);
    }

    constructor(private readonly target: Target) {
    }

    @step('{0} enables #target')
    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).
            executeScript(`arguments[0].removeAttribute("disabled");`, this.target);
    }
}
```

Since the above interaction accepts a single-element `Target`, it will need to change to accept
`Question<ElementFinder>` instead. 

Additionally, its `performAs` method will now need to resolve (a.k.a. "answer") the question 
before passing the underlying `ElementFinder` to lower-level abilities and Protractor-specific 
method calls: 

```typescript
import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { ElementFinder } from 'protractor';

export class Enable extends Interaction {
    
    // Target -> Question<ElementFinder>
    static the(target: Question<ElementFinder>) {
        return new Enable(target);
    }

    // Target -> Question<ElementFinder>
    constructor(private readonly target: Question<ElementFinder>) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        // the actor needs to answer the question
        // so that it can pass a Protractor-specific
        // ElementFinder object to BrowseTheWeb
        return this.target.answeredBy(actor).then((element: ElementFinder) => {
            return BrowseTheWeb.as(actor)
                .executeScript(`arguments[0].removeAttribute("disabled");`, element);
        });
    }

    toString(): string {
        return `#actor enables ${this.target}`;
    }
}
```

Similarly, if your custom `Activity` used to receive a product of the `Target.all(...)` call, so a multi-element `Target`, it will now need to change to receive `Question<ElementArrayFinder>`.

## Assertions

Serenity/JS 1.x did not have its own assertions library. Instead, it provided an interaction to `See.if`
which you'd use to delegate the act of performing the actual assertion to a library like [chai.js](https://www.chaijs.com/), typically combined with plugins like [`chai-as-promised`](https://www.npmjs.com/package/chai-as-promised) and [`chai-smoothie`](https://www.npmjs.com/package/chai-smoothie).

For example:

```typescript
import { See, Target, Text } from 'serenity-js/lib/serenity-protractor';
import { by } from 'protractor';

// import chai and chai-as-promised to assert on promises
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const TodoListItems = Target.the('items on the list').located(by.css('ul.todo-list li'));

actor.attemptsTo(
    See.if(Text.ofAll(TodoListItems), (textOfItems: PromiseLike<string[]>) =>
        // delegate the assertion to chai
        chai.expect(textOfItems).to.eventually.contain('Buy some milk')
    ),
)  
```

If you're happy with this model, Serenity/JS 2.x still ships with an interaction to [`See.if`](/modules/core/class/src/screenplay/interactions/See.ts~See.html), which you can import from the [`@serenity-js/core`](/modules/core) module
and your old assertions will work exactly the same way they used to.

However, 2.x gives you a brand new [`@serenity-js/assertions`](/modules/assertions) library that enables you to implement the above code sample as follows:

```typescript
import { contain, Ensure } from '@serenity-js/assertions';
import { Target, Text } from '@serenity-js/protractor';
import { by } from 'protractor';

const TodoListItems = Target.the('items on the list').located(by.css('ul.todo-list li'));

actor.attemptsTo(
    Ensure.that(Text.ofAll(TodoListItems), contain('Buy some milk')),
)  
```

In the above example, the expectation for a list to [`contain`](/modules/assertions/function/index.html#static-function-contain) an item is one of the many [`expectations`](/modules/assertions/identifiers.html#expectations) that ship with the [`@serenity-js/assertions`](/modules/assertions) module.

There's a number of **great things** about this new design, that I'm particularly proud of. 

For example, expectations can be composed:
```typescript
import { contain, Ensure, not } from '@serenity-js/assertions';

actor.attemptsTo(
    Ensure.that(Text.ofAll(TodoListItems), not(contain('Buy some milk'))),
)  
```

Which is useful if you need to cater for the much more sophisticated use cases:

```typescript
import { 
    and,
    contain,
    containAtLeastOneItemThat,
    Ensure,
    equals,
    not
} from '@serenity-js/assertions';

actor.attemptsTo(
    Ensure.that(Text.ofAll(TodoListItems), and(
        containAtLeastOneItemThat(equals('Buy some milk')),
        not(contain('Buy chocolate'))
    )),
);
``` 

Another great thing about the new [`expectations`](/modules/assertions/identifiers.html#expectations)
is that they're now **compatible with other interactions**, not just the one to [`Ensure`](/modules/assertions/class/src/Ensure.ts~Ensure.html)!

For example, you can use them to synchronise your tests with the UI thanks to the interaction to [`Wait`](/modules/protractor/class/src/screenplay/interactions/Wait.ts~Wait.html):

```typescript
import { Text, Wait } from '@serenity-js/protractor';
import { includes } from '@serenity-js/assertions';

actor.attemptsTo(
    Wait.until(Text.of(StatusBar), includes('Finished loading!'))
);
```  

You can also use them to control the flow of your test scenario using the interaction to [`Check`](/modules/assertions/class/src/Check.ts~Check.html):

```typescript
import { Click, isVisible } from '@serenity-js/protractor';
import { Check } from '@serenity-js/assertions';

actor.attemptsTo(
    Check.whether(CookieConsent.Dialog, isVisible())
        .andIfSo(Click.on(CookieConsent.AcceptButton))
);
```  

Did you notice that the [`@serenity-js/protractor`](/modules/protractor) module ships with UI-specific expectations, such as [`isVisible`](/modules/protractor/function/index.html#static-function-isVisible)?
They are as powerful as all the other expectations I showed you so far, which means that you can use them with `Wait`, `Check` and `Ensure`.

Those new [UI-specific expectations](/modules/protractor/identifiers.html#expectations) replace the ones that used to ship with Serenity/JS 1.x:

before | after  
---- | --- 
Is.clickable()  | isClickable()  
Is.enabled()  | isEnabled()
Is.present()  | isPresent()
Is.selected()  | isSelected()
Is.visible()  | isVisible()

## Before you go

Hopefully this guide gave you a good understanding of how version 2.0 improves upon the original design
and can help you to write even better acceptance tests.

If Serenity/JS has made your life easier, please [give us a star ★](https://github.com/serenity-js/serenity-js) on GitHub and consider [getting us a coffee](https://github.com/sponsors/serenity-js) every now and then by becoming a [GitHub Sponsor](https://github.com/sponsors/serenity-js) of the project from as little as $5. 

<div class="pro-tip">
    <div class="icon"><i class="fas fa-hands-helping"></i></div>
    <div class="text">
        <h4>Need a hand?</h4>
        <p>
            If you'd like some help with the upgrade or a member of the Serenity/JS core team to review your code base - [get in touch](/support.html).
        </p>
    </div>
</div>




