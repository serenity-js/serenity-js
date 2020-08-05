---
title: Serenity/JS 2.x Migration Guide
layout: handbook.hbs
---

# Serenity/JS 2.x Migration Guide

## Introduction

This guide is designed for people that have built Serenity/JS 1.x projects and wish to upgrade to Serenity/JS 2.x. The upgrade path is relatively straightforward as the main classes ([Actor](https://serenity-js.org/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html), 
[Task](https://serenity-js.org/modules/core/class/src/screenplay/Task.ts~Task.html), [Interaction](https://serenity-js.org/modules/core/class/src/screenplay/Interaction.ts~Interaction.html) and [Question](https://serenity-js.org/modules/core/class/src/screenplay/Question.ts~Question.html)) 
are backwardly compatible. 

There are some [example mini-projects within the Serenity/JS main repo](https://github.com/jan-molak/serenity-js/tree/master/examples) created in version 2.x format that demonstrate the major features for each supported framework. 
For instance there are Serenity/JS 2.x implementations of a [calculator](https://github.com/serenity-js/serenity-js/tree/master/examples/calculator-app) or the [popular todomvc](https://github.com/serenity-js/serenity-js/tree/master/examples/protractor-jasmine-todomvc) project.
There are also some separate repos that provide empty templates for [Protractor](https://github.com/serenity-js/serenity-js-cucumber-protractor-template), [Jasmine](https://github.com/serenity-js/serenity-js-jasmine-protractor-template) and [Mocha](https://github.com/serenity-js/serenity-js-mocha-protractor-template).
However, it can sometimes be difficult to know how to apply patterns from example or empty projects into your existing project. 

As with any major library or framework release, there are a number of breaking changes that will prevent your project from being immediately runnable upon changing to the new version. 
So this documentation attempts to provide straightforward distillation of likely changes that will be needed to get your project migrated. In fact this article was compiled by examining all changes that were made to a real project Serenity/JS 1.10.2 project in order to migrate it to 2.x!

The changes are laid out in the following sequence:

1. [Introduction](/handbook/integration/serenity-2-migration-guide.html#introduction)
2. [Migrating package.json](/handbook/integration/serenity-2-migration-guide.html#migrating-package-json)
  * [Updating dependencies](/handbook/integration/serenity-2-migration-guide.html#updating-dependencies)
  * [Updating scripts](/handbook/integration/serenity-2-migration-guide.html#updating-scripts)
3. [Protractor configuration (protractor.conf.js)](/handbook/integration/serenity-2-migration-guide.html##protractor-configuration-protractorconfjs)
  * [The Crew](/handbook/integration/serenity-2-migration-guide.html#the-crew)
  * [The new ConsoleReporter](/handbook/integration/serenity-2-migration-guide.html#the-new-consolereporter)
  * [Runner specific configurations](/handbook/integration/serenity-2-migration-guide.html#runner-specific-configurations)
    * [Mocha](/handbook/integration/serenity-2-migration-guide.html#mocha)
    * [Cucumber](/handbook/integration/serenity-2-migration-guide.html#cucumber)
    * [Jasmine](/handbook/integration/serenity-2-migration-guide.html#jasmine)
  * [Creating a Dressing Room for the Actors](/handbook/integration/serenity-2-migration-guide.html#creating-a-dressing-room-for-the-actors)
  * [Browser Synchronisation](/handbook/integration/serenity-2-migration-guide.html#browser-synchronisation)
4. [Source file changes](/handbook/integration/serenity-2-migration-guide.html#source-file-changes)
  * [Globally replacing imports](/handbook/integration/serenity-2-migration-guide.html#globally-replacing-imports)
  * [Target argument types](/handbook/integration/serenity-2-migration-guide.html#target-argument-types)
  * [WebElement.of()](/handbook/integration/serenity-2-migration-guide.html#webelement-of-)
  * [Changes to Target arguments](/handbook/integration/serenity-2-migration-guide.html#changes-to-target-arguments)
  * [Migration of Target to WebElement resolution code](/handbook/integration/serenity-2-migration-guide.html#migration-of-target-to-webelement-resolution-code)
  * [Migration of Targets that return multiple WebElements](/handbook/integration/serenity-2-migration-guide.html#migration-of-targets-that-return-multiple-webelements)
  * [Migrate PromiseLike to Promise](/handbook/integration/serenity-2-migration-guide.html#migrate-promiselike-to-promise)
    * [Background](/handbook/integration/serenity-2-migration-guide.html#background)
    * [How to migrate Promise code](/handbook/integration/serenity-2-migration-guide.html#how-to-migrate-promise-code)
6. [Migrating Activity code](/handbook/integration/serenity-2-migration-guide.html#migrating-activity-code)
  * [Migrating @step annotations](/handbook/integration/serenity-2-migration-guide.html#migrating-step-annotations)
  * [Simplifying Tasks using Task.where](/handbook/integration/serenity-2-migration-guide.md#simplifying-tasks-using-taskwhere)
  * [Alert handling](/handbook/integration/serenity-2-migration-guide.html#alert-handling)
    * [Alert related imports](/handbook/integration/serenity-2-migration-guide.html#alert-related-imports)
7. [Migrating Assertions](/handbook/integration/serenity-2-migration-guide.html#migrating-assertions)
  * [chai](/handbook/integration/serenity-2-migration-guide.html#chai)
  * [Migrating See.if to Ensure.that](/handbook/integration/serenity-2-migration-guide.html#migrating-see-if-to-ensure-that)
  * [Is no longer Is :-)](/handbook/integration/serenity-2-migration-guide.html#is-no-longer-is-)
8. [Migrating Questions](/handbook/integration/serenity-2-migration-guide.html#migrating-questions)
9. [Migrating Script Execution Tasks](/handbook/integration/serenity-2-migration-guide.html#migrating-script-execution-tasks)
   * [Serenity/JS 1.x implementation of Hide Task](/handbook/integration/serenity-2-migration-guide.html#serenity-js-1-x-implementation-of-hide-task)
   * [Serenity/JS 2.x implementation of Hide Task](/handbook/integration/serenity-2-migration-guide.html#serenity-js-2-0-implementation-of-hide-task)

## Migrating package.json
### Updating dependencies
Various libraries are no longer needed. Here's a high-level summary of changes:
 * Chai is no longer needed as it's been superseded by `@serenity-js/assertions` 
 * mocha is not yet supported so if you used that in 1.x, you'll need to switch to jasmine. 
 * serenity-cli has been replaced by `@serenity-js/serenity-bdd`. 

So remove all of these from your dependencies section:
   ```javascript
    "@types/chai"
    "@types/chai-as-promised"
    "@types/mocha"
    "chai"
    "chai-as-promised"
    "chai-smoothie"
    "mocha",
    "serenity-cli"
```    
Now that Serenity/JS 2.x is officially released, versions can be set to "^2.0.0" in order to get the latest for this release:

   ```javascript
    "@serenity-js/assertions": "^2.0.0",
    "@serenity-js/console-reporter": "^2.0.0",
    "@serenity-js/core": "^2.0.0",
    "@serenity-js/cucumber": "^2.0.0",
    "@serenity-js/jasmine": "^2.0.0",
    "@serenity-js/protractor": "^2.0.0",
    "@serenity-js/rest": "^2.0.0",
    "@serenity-js/serenity-bdd": "^2.0.0"
 ```   

If you want to want to stay on a fixed version, use that instead. You can find out the latest available version by visiting the [releases page](https://github.com/jan-molak/serenity-js/releases).

You may have other dependencies such as express, jasmine, node, sinon, in your existing project, but you won't need to have these unless you need to use them directly. 
Adding the above Serenity/JS dependencies should bring all runtime dependencies across. If you do need them and you want to pick a compatible version, see the versions in the [Protractor](https://github.com/serenity-js/serenity-js-cucumber-protractor-template), [Jasmine](https://github.com/serenity-js/serenity-js-jasmine-protractor-template) or [Mocha](https://github.com/serenity-js/serenity-js-mocha-protractor-template) template repos.

### Updating scripts
  
If you have `--verbose` as an argument in your lint script, remove it as the version of tslint that you now have does not support this parameter. (verbose can now be supplied as a format but stylish is probably better):     
    
```javascript    
"lint": "tslint --config ./tslint.json --project ./tsconfig.json --format stylish",
```
         
Any scripts that used to run `serenity update` or `webdriver-manager update`  should now be updated to `serenity-bdd update`. So for instance:

    "postinstall": "serenity-bdd update --ignoreSSL", 
    
For further information, please see [the modules section of the serenity/JS website](https://serenity-js.org/modules/serenity-bdd)           

## Protractor configuration (protractor.conf.js)

### The Crew

Previously you will have had a single import for crew as follows:
```javascript
const crew = require("serenity-js/lib/stage_crew");
``` 

But a new `@serenity-js/console-reporter` module has now superseded the experimental (and now deleted) `ConsoleReporter` class that used to ship with `@serenity-js/core`.

So replace your previous crew import sections with the following:

```javascript
const {ConsoleReporter} = require('@serenity-js/console-reporter'),
  {ArtifactArchiver} = require("@serenity-js/core"),
  {Photographer, TakePhotosOfInteractions} = require('@serenity-js/protractor'),
  {SerenityBDDReporter} = require("@serenity-js/serenity-bdd");
```

Also remove whatever was in the `crew []` section in the `serenity` object as this all needs to be replaced.

Make the following changes in your config object so that it looks like this:

```javascript
exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,
    directConnect: true,
    allScriptsTimeout: 11000,
    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),
    specs: [ 'spec/*.spec.ts', ],
    serenity: {
        crew: [
          ArtifactArchiver.storingArtifactsAt("./target/site/serenity"),
          Photographer.whoWill(TakePhotosOfInteractions),
          new SerenityBDDReporter(),
          ConsoleReporter.withDefaultColourSupport(),
        ],
    },
    // other Protractor config (see Runner specific configurations below)
    };
 ```

### The new ConsoleReporter
The new ConsoleReporter supports several colour themes, which you can choose by calling either of the following factory methods:
```javascript
ConsoleReporter.withDefaultColourSupport()
ConsoleReporter.forMonochromaticTerminals()
ConsoleReporter.forDarkTerminals()
ConsoleReporter.forLightTerminals()
```

### Runner specific configurations
#### Mocha
Note that Mocha is not useable yet with 2.x, so if you previously used mocha you'll need to switch to an alterntive runner for the time being. 
Jasmine is recommended as the switch to it should be trivial. There are very few differences between how mocha and jasmine specs now look, 
given that assertions for all runners will use the new `@serenity-js/assertions`, exposing a uniform `Ensure` API.
So if you previously used mocha then remove your `mochaOpts` section:

```javascript
 mochaOpts: {
    ui: "bdd",
    compiler: "ts:ts-node/register",
  },
```

#### Cucumber
If you use Cucumber, you'll need a section similar to this: 
```javascript
 cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/*.ts',
        ],
        'require-module': ['ts-node/register'],
        tags: [],
    },
```
Make sure you add a folder (e.g. support) and reference a setup.ts file this within the require array section where you can add any global configuration and setup (explained below)
#### Jasmine
If you use Jasmine, you'll need a section similar to this:
```javascript
 jasmineNodeOpts: {
    requires: [
      "ts-node/register"
    ],
    helpers: [
      "spec/support/*.ts"
    ]
  },
```
Make sure you add a folder (e.g. support) and reference a setup.ts file this within the require array section where you can add any global configuration and setup (explained in next section)

### Changes to the Cast

If you had a `Cast` implementation that set up the default abilities on your actors like this in your 1.x project:
```javascript
import { protractor } from "protractor";
import { TakeNotes } from "serenity-js/lib/screenplay";
import { Actor, BrowseTheWeb, Cast } from "serenity-js/lib/screenplay-protractor";

export class Members implements Cast {
    public actor(name: string): Actor {
        const notepad = {};
        return Actor.named(name)
            .whoCan(BrowseTheWeb.using(protractor.browser))
            .whoCan(TakeNotes.using(notepad));
    }
}

```
Then this will now need to be replaced by a version 2.x equivalent:

```javascript
import { Actor, Cast } from "@serenity-js/core";
import { BrowseTheWeb } from "@serenity-js/protractor";
import { protractor } from "protractor";

export class Actors implements Cast {
  prepare(actor: Actor): Actor {
    return actor.whoCan(
      BrowseTheWeb.using(protractor.browser),
      TakeNotes.usingAnEmptyNotepad(),
    );
  }
}
```

Your Cast may configure different abilities, if for example you are using a local HTTP server or calling an API:

```javascript
import { Actor, Cast } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';

import { requestHandler } from '@serenity-js-examples/calculator-app';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            ManageALocalServer.runningAHttpListener(requestHandler),
            CallAnApi.at('http://localhost'),
        );
    }
}
```

The above file will need to be placed in the `support` location specified for your test runner. See previous test runner sections where the specifics of each are explained.
    
If you want to perform global setup for all of your features, you can create a file e.g. called `configure_cast.ts` containing the following and place in the `support` location specified for your test runner:

For Jasmine: 

```javascript
import { engage } from '@serenity-js/core';
import { Actors } from "../../screenplay/actors";

beforeEach(function () {
  engage(new Actors());
});
```

For Cucumber: 

```javascript
import { engage } from '@serenity-js/core';
import { Actors } from "../../screenplay/actors";
import { Before } from 'cucumber';

Before(() => engage(new Actors()));
```

Alternatively, this can be added at the top of your test(s) if you don't wish to apply this configuration globally.

### Browser Synchronisation

If your Serenity/JS project is testing a non-angular site you may have an `onPrepare` section in your protractor.config that contains the following:

```javascript
onPrepare: function () {
    browser.ignoreSynchronization = true;
},
```
If this is the case you will need to change this to the new syntax as follows:
```javascript
onPrepare: function () {
    browser.waitForAngularEnabled(false);
},
```
For more information on this topic, [see the docs](http://www.protractortest.org/#/api?view=ProtractorBrowser.prototype.waitForAngularEnabled)

## Source file changes
### Globally replacing imports
If your project contains a large number of source files, quite a bit of time might need to be spent changing imports from the 1.x package structure to the 2.x equivalents. 
If you tackle this on a per-file basis, the easiest approach might be to delete any invalid imports from the top of the source file, and allow your IDE to auto-detect and apply the correct imports. 
However, this can get tedious very quickly as you'll find yourself repeating the same import process on many files. 

The table below therefore itemises some common import changes that you are likely to need and you can use the "replace in path" function in your IDE to quickly make these changes across all of your sources files. 

 from | to 
 ---- | --- 
 serenity-js/lib/serenity-protractor | @serenity-js/protractor 
 serenity-js/lib/screenplay-protractor | @serenity-js/protractor 
 serenity-js/protractor | @serenity-js/protractor
 serenity-js/lib/screenplay | @serenity-js/core
 @serenity-js/core/lib/screenplay | @serenity-js/core

### Changes to Target arguments
#### Target argument types
It's quite likely that you'll have written some custom `Activity` classes in your project where a `Target` has been passed as an argument - for instance in the constructor:
```javascript
constructor(private target: Target) {}
```
In the task you are likely to be passing the target to a built-in task like `Click.on(this.target))`. If this is the case you will now find that there is a compilation error on `Click` as `Target` is now passed using a different type.
So, any place that you used to pass Target as a type will now need to be changed to a union type: `Question<ElementFinder> | ElementFinder`. So now your constructor will look like this: 
```javascript
constructor(private target: Question<ElementFinder> | ElementFinder) {}
```
This will need additional imports to added as follows:

```javascript
import { Question } from "@serenity-js/core";
import { ElementFinder } from "protractor";
```

#### WebElement.of()
In Serenity/JS 1.x `WebElement.of()` could be used to wrap a `Target` in order to return a `WebElement` but this is no longer valid syntax and should be replaced with `answeredby()` as explained in the next section. 

#### Migration of Target to WebElement resolution code  
In Serenity/JS 1.x, a `Target` was resolved to a `WebElement` by means of the `locate` method on the `BrowseTheWeb` ability. 
For instance it was common place to see `BrowseTheWeb.as(actor).locate(this.target)` in a `Question`. 
However this approach will no longer work because `locate()` now takes a `Locator` type, so passing anything other than this type will result in an `Invalid Locator` run time error.  

All areas of your 1.x code that use the above method of `Target` resolution will need to be migrated to call the `answeredBy` method on the the `ElementFinder`.
This approach is perhaps better demonstrated by means of a simple example `Question` called `CheckedValue` which takes a `Target` as an argument and in the `answeredBy` method the Target is resolved to a WebElement
 and the `isSelected()` value is resolved from it. The code for `CheckedValue` is now shown using both Serenity/JS 1.x and Serenity/JS 2.x implementations:

##### Serenity/JS 1.x implementation of CheckedValue Question

```javascript
import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { BrowseTheWeb, Target } from "@serenity-js/protractor";

export class CheckedValue implements Question<Promise<boolean>> {
  static of = (target: Target) => new CheckedValue(target);            

  constructor(private target: Target) {                              (1)
  }

  answeredBy(actor: UsesAbilities): Promise<boolean> {
    return BrowseTheWeb.as(actor).locate(this.target).isSelected();  (2) (3)
  }

  toString = () => `the checked value of ${this.target}`;
}

```
In the example above:
 1. the `Target` was passed in the constructor.
 2. the `BrowseTheWeb` ability was used to resolve a `WebElement` by passing the `Target` to the `locate` method.
 3. `isSelected()` method is called on the `WebElement`. 


##### Serenity/JS 2.x implementation of CheckedValue Question

```javascript
import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { ElementFinder } from "protractor";

export class CheckedValue implements Question<Promise<boolean>> {
  static of = (target: Question<ElementFinder> | ElementFinder) => new CheckedValue(target);

  constructor(private target: Question<ElementFinder> | ElementFinder) {      (1)
  }

  answeredBy(actor: UsesAbilities & AnswersQuestions): Promise<boolean> {     
    return promiseOf(this.target.answeredBy(actor).isSelected()));            (2)(3)(4)
  }

  toString = () => `the checked value of ${this.target}`;
}
```
In the example above:

1. `Question<ElementFinder> | ElementFinder` is now passed in the constructor.
2.  `answeredBy` method is called on the the `ElementFinder` which returns a `WebElement`. 
3. `isSelected()` method is called on the `WebElement`. 
4. Note also that `promiseOf` is used as a wrapper in order to ensure that a native `Promise` is returned as described in [Migrate PromiseLike to Promise](/handbook/integration/serenity-2-migration-guide.html#migrate-promiselike-to-promise).



Note that if you are now invoking the `answeredBy()` on the `ElementFinder` when you werent in the 1.x version of your code, 
the ability `& AnswersQuestions` must be added into the Question `answeredBy()` method signature, otherwise there will be a compilation error on the `ElementFinder` `answeredBy()`.

#### Migration of Targets that return multiple WebElements 

In Serenity/JS 1.x, a `Target` could be resolved to a `WebElement[]` array by means of the `locateAll` method on the `BrowseTheWeb` ability. 
For instance it was common place to see `BrowseTheWeb.as(actor).locateAll(this.target)` in a `Question` or `Activity`.
 
As described in [Migration of Target to WebElement resolution code](/handbook/integration/serenity-2-migration-guide.html#migration-of-target-to-webelement-resolution-code) above, this approach will no longer work because `locateAll()` now takes a `Locator` type, so passing anything other than this type will result in an `Invalid Locator` run time error.

All areas of your 1.x code that use the `locateAll()` method of `Target` resolution will now need to:
 * Define a `TargetElements` object rather than `TargetElement` as part of your page definition. 
 * call the `answeredBy` method on the `TargetElements` using the form: `<TargetElements>.answeredBy(actor)`. This will return a `WebElement[]` array which you can then transform, interact with and/or return values from.

Note that the `TargetElements`, is new to Serenity/JS 2.x. An object of this type is created by calling the `all()` method on `Target` in contrast to the historically used `the()` method. For instance:

```javascript
const bookTitles: TargetElements = Target.all("book titles").located(by.id("book-title"));
``` 
 
Here is an example `answeredBy()` method body of a `Question` showing how `TargetElements` can be resolved to a `WebElement[]` array and then filtered and mapped in order to extract the element text:  

```javascript
   answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
     const bookTitles: TargetElements = Target.all("book titles").located(by.id("book-title"));
     return promiseOf(bookTitles.answeredBy(actor)
       .filter(option => option.isSelected())
       .map(values => values.getText())));
   }

```  

### Migrate PromiseLike to Promise
#### Background

Webdriver-js has historically used its own promise manager accessed by means of [controlflow](http://www.protractortest.org/#/control-flow), but this has been a complex component to maintain given that native support for [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) is now part of [ES6](https://en.wikipedia.org/wiki/ECMAScript#6th_Edition_-_ECMAScript_2015). 
The selenium / webdriver project is now moving towards Native Promise support with complete migration targeted for Selenium 4 and Protractor 6.

Because controlflow promise chains do not return true promises, they return data via the `PromiseLike` interface which returns only a basic [thenable](https://promisesaplus.com/#point-7) object containing the `then` method.

However, `Promise` also implements a `catch` method enabling better structured and documented error handling to be implemented, combined with superior flow control in the event of exceptions thrown within a promise chain. 
For example, you could use the `catch` method to implement a retry of your question in the event of a specific webdriver exception such as `StaleElementReferenceError` condition as follows:

```javascript
return this.target.answeredBy(actor)
        .map((result, rowIndex) => doSomething(result, rowIndex)
        .then(doSomethingElse(result))
        .then(doAfinalThing(result)))
      .catch(error => {
        if (error.name === "StaleElementReferenceError") {
          return this.answeredBy(actor);
        } else {
          throw error;
        }
      });

  }

```
Previously error handling would have to be implemented by passing the error handling function as the second `onRejected` argument `then` which is far less obvious to someone maintaining or debugging the code. 

#### How to migrate Promise code

As a result of the above shift, much of Serenity/JS 2.x has now also migrated from `PromiseLike<T>` to `Promise<T>` return types, so it's best that you also follow suit with your own project as a large number of compilation errors will likely be cured by doing this.
The first step of the process is to perform a global replacement of `PromiseLike` to `Promise` in your code. No changing of imports is required given that both of these types are part of the javascript namespace.

Once you have done this, You may find that some of your `answeredBy` methods on your `Question` types , now fail to compile due to the following error `Error:(x, y) TS2739: Type 'Promise<boolean>' is missing the following properties from type 'Promise<boolean>': [Symbol.toStringTag], finally`:
For example in the `UploadError Question` below `WalksTargets.uploadResultSummary` is a `TargetElement`, however this will not compile because any method on WebElement returns a 
webdriver promise `wdpromise.Promise` which is not the same as a native `Promise`:

```javascript
import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { WalksTargets } from "../../ui/ramblers/walksTargets";

export class UploadError implements Question<Promise<boolean>> {

  static displayed = () => new UploadError();

  toString() {
    return "walk upload error is showing";
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {
    return WalksTargets.uploadResultSummary.answeredBy(actor).isPresent();
  }

}
```

So to get over this, you will need to wrap the returned statement in `promiseOf`. This function resolves the `wdpromise.Promise`, then returns that value in a new native Promise. 
So, to get the code to compile it will now look like this: 

```javascript
import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { WalksTargets } from "../../ui/ramblers/walksTargets";

export class UploadError implements Question<Promise<boolean>> {

  static displayed = () => new UploadError();

  toString() {
    return "walk upload error is showing";
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {
    return promiseOf(WalksTargets.uploadResultSummary.answeredBy(actor).isPresent());
  }

}
```

If you are still having compilation problems after doing the above, then you will need to provide the Typescript compiler some help that this method is fine by adding `as Promise<boolean>` (or whatever the return type is from your `Question`) to the end of the return statement.
If your method returns a more complex domain type e.g. `Promise<TradeSummary[]>` then adding `as Promise<TradeSummary[]>` may still not work. If this is the case 
then try adding `as Promise<any>` instead to see whether your code now compiles. This is obviously not ideal as you are essentially removing type-safety from your code, but you can at least see whether the method now compiles, or another problem area is highlighted. 
 
## Migrating Activity code
### Migrating @step annotations

It's quite possible that you have classes in your 1.x project that have `@step` annotations. An example `Task` is as shown in `(1)` below which disables Angular synchronisation and then opens a supplied `url`: 

```javascript
export class NavigateToNonAngular implements Task {

    static url(url: string) {
        return new NavigateToNonAngular(url);
    }

    @step("{0} actor navigates to #url")                              (1)
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
                UseAngular.disableSynchronisation(),
                Open.browserOn(url),
        );
    }

    constructor(private url: string) {
    }
}
```

If you have used `@step` annotations as in the above example, you will now have to re-implement them with an equivalent `toString()` method as `@step` has been removed in version 2.x. 
An equivalent example of the `toString()` method for the above is as follows :  

```javascript
toString() {
    return "#actor navigates to #url";
  }
```

There isn't really a straightforward using search/replace to accomplish this task as it requires the original string passed to the annotation to be cut from its original location and appended to the return statement. 
Be sure to replace the actor placeholder `{0}` with `#actor` in the final string. You will also have to remove the step import as well:  
  
```javascript
import { step } from "@serenity-js/core/lib/recording";
```

### Simplifying Tasks using Task.where

Serenity/JS 2.x now has factory for creating tasks by means of [Task.where](https://serenity-js.org/modules/core/class/src/screenplay/Task.ts~Task.html#static-method-where). 
For instance here is a re-written version of the `NavigateToNonAngular` example `Task` described in the previous section:

```javascript
Task.where(`#actor navigates to ${url}`,
    UseAngular.disableSynchronisation(),
    Open.browserOn(url),
)}
```

The benefit of `Task.where` is that it allows sequences of tasks to be defined in-line along with the task description without having to declare a concrete class. 
Whilst this syntax was available in Serenity/JS 1.x, but it may be worth re-writing old concrete tasks to the `Task.where` syntax whilst you are replacing your step annotations as it will result in more maintainable code with less 'boilerplate.'


### Alert handling

Alert handling tasks have been brought inline with the new Wait API which uses the form `Wait.until(<Anwserable>, <expectation>)`. So if you've got any alert tasks in your project you'll have to make the following changes:

 from | to  
 ---- | --- 
 WaitForAlert.toBePresent() | Wait.until(Alert.visibility(), equals(true)) 
 WaitForAlert.toBeAbsent() | Wait.until(Alert.visibility(), equals(false)) 

#### Alert related imports
These can be removed
```javascript
import { Alert } from "serenity-js/lib/serenity-protractor/screenplay/interactions/alert";
import { WaitForAlert } from "serenity-js/lib/serenity-protractor/screenplay/interactions/waitForAlert";
```

## Migrating Assertions

### chai
If you previously had a chai configuration class in your project you can delete / deference this as this will no longer be needed. 
```javascript
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

export const expect = chai.expect;
```

### Migrating See.if to Ensure.that

Serenity/JS 2.x now has a completely rewritten [assertions](https://serenity-js.org/modules/assertions/) library. 
in Serenity/JS 1.x the entry point to an assertion was `See.if`, however the new assertion syntax now begins with [Ensure.that](https://serenity-js.org/modules/assertions/class/src/Ensure.ts~Ensure.html).  
All assertions and expectations can be found in `@serenity-js/assertions`, so you'll typically see all imports grouped together as follows: 

```javascript
import { Expectation, Ensure, and, or, isGreaterThan, isLessThan, equals, not } from "@serenity-js/assertions";
```
Some examples of how the 1.x syntax can be migrated to the the 2.x syntax are as follows:

from | to 
---- | ---
See.if(WalksAndEventsManagerQuestions.LoginStatus, equals("Login")) | Ensure.that(WalksAndEventsManagerQuestions.LoginStatus, equals("Login"))
Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.chatWindow, Is.invisible()) | Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.chatWindow, not(isVisible()))

### Is no longer "Is" :-)

The `Is` class from 1.x has now been replaced with [expectations](https://github.com/jan-molak/serenity-js/tree/master/packages/protractor/src/expectations) that can be used with both Wait and Ensure. `Is` was previously in `serenity-js/lib/serenity-protractor`, but now [expectations](https://github.com/jan-molak/serenity-js/tree/master/packages/protractor/src/expectations) can be found in `@serenity-js/protractor`. Some examples of replacements that might need to be made are as follows:

from | to  
---- | --- 
Is.clickable()  | isClickable()  
Is.enabled()  | isEnabled()
Is.present()  | isPresent()
Is.selected()  | isSelected()
Is.visible()  | isVisible()

A full reference of the API can be found in the [expectations documentation](https://serenity-js.org/modules/protractor/identifiers.html#expectations).

## Migrating Questions

The method signature for the `answeredBy()` method has changed in that the `PerformsTasks` ability has now been renamed to  `AnswersQuestions`,
so you will need to globally replace `PerformsTasks` with `AnswersQuestions` in your entire codebase. This is pretty straightforward as the import is still from `@serenity-js/core/lib/screenplay`.

```javascript
answeredBy(actor: PerformsTasks & UsesAbilities): 
```

```javascript
answeredBy(actor: PerformsActivities & AnswersQuestions & UsesAbilities):
```

## Migrating Script Execution Tasks

There are some cases when you may wish to perform a low level page interaction that cannot be accomplished by means of the standard protractor API. 
Under these circumstances you are able to execute javascript directly in the browser. 
In Serenity/JS 1.x this was achieved by passing the script and any arguments to the `executeScript` method of the `BrowseTheWeb` ability.

Serenity/JS 2.x offers more flexibility for executing scripts by means of the `ExecuteScript` `Interaction`.  

This approach is perhaps better demonstrated by means of a relatively simple example `Task` called `Hide` which takes a `Target` as an argument which represents the element on the page we wish to hide. 
The purpose of the `Task` is to first determine whether the element is present on the page and if so, hide the element using javascript. 
This might be used in cases where a floating window is overlaying another element that you wish to interact with and the presence of the floating window is sometimes causing an `ElementClickInterceptedException` to be thrown resulting in your test failing or being 
[flaky](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html).
  
The code for `Hide` is now shown using both Serenity/JS 1.x and Serenity/JS 2.x implementations:

### Serenity/JS 1.x implementation of Hide Task

```javascript
import { PerformsTasks, Task, UsesAbilities } from "serenity-js/lib/screenplay";
import { BrowseTheWeb, Target } from "serenity-js/lib/serenity-protractor";

export class Hide implements Task {

    static target(target: Target): Task {
        return new Hide(target);
    }

    constructor(private target: Target) {                                                            (1)
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        const browseTheWeb = BrowseTheWeb.as(actor);                                                 (2)
        const element = browseTheWeb.locate(this.target);                                            (3)
        return element.isPresent()
         .then(present =>                                                                            (4)
          present && browseTheWeb.executeScript("arguments[0].style.visibility='hidden'", element)); (5)
    }
}
```
In the example above:
 1. the `Target` was passed in the constructor.
 2. the `BrowseTheWeb` ability was extracted to a local variable as it will be used more than once in the function body.
 3. a `WebElement`is resolved by passing the `Target` to the `locate` method.
 4. the `isPresent()` method is called on the `WebElement` and a `present` value is extracted in the `Promise` `then` block.
 5. if the `present` value is `true` the `executeScript` method is executed. Two arguments are passed: 
    - the script text 
    - the web element

### Serenity/JS 2.x implementation of Hide Task

```javascript
import { AnswersQuestions, PerformsActivities, Question, Task, UsesAbilities } from "@serenity-js/core";
import { ExecuteScript } from "@serenity-js/protractor";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { ElementFinder } from "protractor";

export const Hide = (target: Question<ElementFinder> | ElementFinder) =>                              (1)
    Task.where(`#actor hides ${ target }`,
        Check.whether(target, isPresent())                                                            (2)
            .andIfSo(                                                                                 
                ExecuteScript.sync(`arguments[0].style.visibility='hidden'`)                          (3)
                .withArguments(target))                                                               (4)
    )
```
In the example above:
 1. the `target` argument of type `Question<ElementFinder> | ElementFinder` is now passed in the constructor.
 2. the `Check` task is invoked with the `target` and `isPresent` `Expectation` passed to it. 
 3. if the `Check` task returns `true` the actor performs the `ExecuteScript` task, passing the script to the `sync` method.
 4. the `target` is passed to the `withArguments` method which then executes the script and after converting the `target` to a `WebElement`.
