---
title: Architecture
layout: handbook.hbs
---
# Architecture

Serenity/JS is a full-stack acceptance testing framework that helps you write high-quality tests interacting with any interface of your system.

In order to do that, Serenity/JS:
- Relies on popular and battle-tested tools to take care of the low-level interactions with your system - i.e. Serenity/JS uses [Protractor](https://github.com/angular/protractor) to [interact with Web Applications](/modules/protractor) and [Axios](https://github.com/axios/axios) to [communicate with REST APIs](/modules/rest). 
- Provides adapters (a.k.a. [Abilities](/handbook/design/abilities.html)) and an asynchronous communication mechanism to enable you to use those various (often incompatible) tools together in perfect harmony and a single test suite, or even a single test.
- Gives you a powerful and elegant model to create business-focused [DSLs](https://en.wikipedia.org/wiki/Domain-specific_language) - the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html), which also takes care of intricacies of the asynchronous nature of the underlying tools leaving your tests free of noise. 
- Uses its deep insight into the activities performed by your test actors, as well as information sourced from the low-level integration tools and test runners to provide you with comprehensive test execution reports and living documentation.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The easiest way to get started with Serenity/JS is by using one of the [template projects available on GitHub](https://github.com/serenity-js/). Serenity/JS template project come with appropriate Serenity/JS modules and lower-level integration and test tools already configured.
    </p></div>
</div> 

## Serenity/JS Modules

Serenity/JS Framework is a collection of [modules](/modules) you compose together to support the type of testing you want to do.
If you wish, you could also extend Serenity/JS to use a different integration library or interact with an interface that the framework itself doesn't support yet.

<figure>
![Serenity/JS modules](/images/architecture.png)
    <figcaption><span>Serenity/JS Modules</span></figcaption>
</figure>

### The Core

No matter the type of testing you'd like Serenity/JS to help you with, you'll always need the [`@serenity-js/core`](/modules/core) module
in your project.

The `core` is what provides a channel for other modules to communicate, and what gives you the building blocks of the [Screenplay Pattern](/handbook/thinking-in-serenity-js/screenplay-pattern.html).

### Test runner adapters

The next thing you need is an adapter that integrates your test runner of choice with `@serenity-js/core`.

Out of the box, Serenity/JS provides adapters for:
- a recent version of Jasmine - [`@serenity-js/jasmine`](/modules/jasmine)
- a recent version of Mocha - [`@serenity-js/mocha`](/modules/mocha)
- all major versions of Cucumber.js - [`@serenity-js/cucumber`](/modules/cucumber)

### Testing web interfaces

If you'd like to test a web interface, you'll need the [`@serenity-js/protractor`](/modules/protractor) module
in addition to one of the test runner adapters mentioned above.

Protractor manages the web browsers used in your tests but delegates the task of actually _running_ the tests to ["Protractor Frameworks"](https://github.com/angular/protractor/blob/master/docs/frameworks.md). While in the past Protractor used to ship with adapters for several different test runners, more recently the project has limited its support to Jasmine and relies on community-supported modules to integrate the tool with other test runners.
 
Since [`@serenity-js/protractor`](/modules/protractor) acts as a "Protractor Framework" it replaces the default "Jasmine Framework" and takes on the responsibility of delegating the task of running the test either to Jasmine, Mocha, Cucumber.js, or another test runner Serenity/JS might support in the future.

This means that in order to run a web-based test you need two Serenity/JS modules - [`@serenity-js/protractor`](/modules/protractor) and either [`@serenity-js/jasmine`](/modules/jasmine), [`@serenity-js/mocha`](/modules/mocha), or [`@serenity-js/cucumber`](/modules/cucumber).

### Testing REST interfaces

The [`@serenity-js/rest`](/modules/rest) module provides a library of Screenplay Pattern-style interactions, questions and abilities to let your test actors interact with REST and HTTP APIs.

### Assertions

The [`@serenity-js/assertions`](/modules/assertions) module provides a library of Screenplay Pattern-style assertions.

### Reporting modules

Serenity/JS provides several modules with reporting capabilities.
You can learn more about reporting capabilities of the framework from the [reporting guide](/handbook/reporting/).

#### Console Reporter

The [`@serenity-js/console-reporter`](/modules/console-reporter) module prints the test execution log to the console.

#### Serenity BDD

The [`@serenity-js/serenity-bdd`](/modules/serenity-bdd) module is a wrapper around the [Serenity BDD](https://github.com/serenity-bdd/) [Reporting CLI](https://github.com/serenity-bdd/serenity-cli), a program written in Java and capable of producing comprehensive HTML reports and living documentation of your project.

### Local Server

The [`@serenity-js/local-server`](/modules/local-server) provides adapters for popular HTTP and HTTPs Node.js servers you can use to manage their lifecycle in your tests.

### What modules should I choose?

That depends on the type of tests you want to write and the lower-level tools you want to integrate.

For example, if you wanted to create a test suite that exercised a REST API and didn't need to touch the UI, you'd use:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/assertions`](/modules/assertions)
- [`@serenity-js/rest`](/modules/rest)
- plus a test runner adapter and a reporting module

If you wanted to create a test suite that exercised a web interface:
- [`@serenity-js/core`](/modules/core)
- [`@serenity-js/assertions`](/modules/assertions)
- [`@serenity-js/protractor`](/modules/rest)
- plus a test runner adapter and a reporting module

On the other hand, if you were interested in basic reporting capabilities and were not ready to adopt the Screenplay Pattern-style testing yet, you could limit your Serenity/JS toolset to a test runner adapter and a reporting module. This is often a quick win in scenarios where you need to modernise your test code base but need time to refactor the legacy tests and want to benefit from improved reporting on day one.

### Serenity/JS Module structure

<div class="pro-tip">
    <div class="icon"><i class="fas fa-tools"></i></div>
    <div class="text">
        <p>
            This section is coming soon. Stay tuned or learn how you can [support the project](/support.html)!
        </p>
        <p><a class="github-button" href="https://github.com/sponsors/serenity-js" data-icon="octicon-heart" data-size="large" aria-label="Sponsor Serenity/JS on GitHub">Sponsor</a></p>
    </div>
</div>
