---
title: Hello, Serenity/JS!
layout: handbook.hbs
---
# Hello, Serenity/JS!

In this chapter, you'll learn how to write your first Serenity/JS scenario in both JavaScript and TypeScript.

I will also show you how the core elements of Serenity/JS work, and how the framework is different from other tools you might have seen in the past. 

If you prefer to dive straight into the code, you can also experiment with:
- the [finished project](https://github.com/serenity-js/tutorial-hello-serenity-js) on Serenity/JS GitHub, 
- a [Repl.it sandbox](https://replit.com/@jan_molak/tutorial-hello-serenity-js), where you can run the code in your web browser without having to install anything on your computer.

## Prerequisites

### Node.js LTS

Serenity/JS is a Node.js program, so in order to use the framework and complete this tutorial you'll need a recent Long-Term Support version of [**Node.js**](https://nodejs.org/).

If you don't have Node.js already, follow the [installation instructions](/handbook/integration/runtime-dependencies.html#node-js).

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Every single build of Serenity/JS is tested against the latest three Node.js LTS versions, so **%package.engines.node%**.
    </p></div>
</div>

### Node.js project

The second thing you'll need is a [Node.js project](/handbook/integration/runtime-dependencies.html#a-node-js-project), which basically means an empty directory for your code, e.g. `tutorial-hello-serenity-js`, with a [`package.json`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json) file in it. 

You can create them by running the following commands in your computer terminal:
```shell-session
mkdir tutorial-hello-serenity-js
cd tutorial-hello-serenity-js
npm init --yes
```

To learn more about the `npm init` command, check out the [official Node.js documentation](https://docs.npmjs.com/cli/v7/commands/npm-init).

## Serenity/JS Core

Serenity/JS is a [modular framework](/handbook/integration/architecture.html). The [`@serenity-js/core`](/modules/core) module is agnostic of any test runners and tools you can integrate it with. It provides the core interfaces you need to build your test frameworks, write test scenarios, and perform reporting. 

Enabling ways to integrate your test scenarios with [Web interafaces](/modules/webdriverio), [REST APIs](/modules/rest), or any other external interface of your systems is the responsibility of the auxiliary [Serenity/JS modules](/modules), rather than the "core" itself.

However, it's worth noting that you can use `@serenity-js/core` without any test runners nor any auxiliary modules whatsoever. And this is exactly what we're going to do next!

To add the `@serenity-js/core` module to the Node.js project you've just created, run the following command in your computer terminal:

```shell-session
npm install --save-dev @serenity-js/core
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Apart from providing modules to integrate your test scenarios with the various interfaces of your system, Serenity/JS also provides adapters for popular test runners, such as [Mocha](/modules/mocha), [Jasmine](/modules/jasmine), [Cucumber](/modules/cucumber), [Protractor](/modules/protractor) and [WebdriverIO](/modules/webdriverio). We'll talk more about that in the next chapter.
    </p></div>
</div>


## Actors

One of the key features that set Serenity/JS apart from other test frameworks is that it strongly favours [User-Centred Design](https://en.wikipedia.org/wiki/User-centered_design).
  In fact, every Serenity/JS scenario needs at least one ["actor"](/handbook/design/actors.html) to represent a user or an external system interacting with the system under test. Actors perform the workflows that verify if your system meets its acceptance criteria and are the cornerstone of the [Screenplay Pattern](/handbook/design/screenplay-pattern.html). We'll talk more about that later.

To create your first Serenity/JS actor, create a JavaScript file called `hello-serenity.js` with the following contents:

```javascript
// tutorial-hello-serenity-js/hello-serenity.js
const { actorCalled } = require('@serenity-js/core')

const Alice = actorCalled('Alice')
```

In the code sample above, [`actorCalled(name: string)`](/modules/core/function/index.html#static-function-actorCalled) is a function that instantiates a new actor, or retrieves one that's already been instantiated with the same name within a given scope. We'll cover scopes later on.

## Activities

The next novel thing about Serenity/JS is that it natively supports the [Screenplay Pattern](/modules/core/function/index.html#static-function-actorCalled). 

When you follow the Screenplay Pattern, each one of your test scenarios becomes like a little _stage-play_, with the workflows expressed as sequences of _activities_ performed by the various actors.

Those [_activities_](/modules/core/class/src/screenplay/Activity.ts~Activity.html) are first-class citizens in your Serenity/JS scenarios, and are one of the primary building blocks you'll compose your scenarios from. 

While the activities you'll use in your everyday work with Serenity/JS will typically represent high-level domain-specific [_tasks_](/handbook/design/tasks.html), such as "register a customer", or "book a flight", you need to know how to create such high-level tasks and compose them from _interactions_ and lower-level tasks.

To help with that, let's start our exploration of the framework with a simple [_interaction_](/handbook/design/interactions.html) to [`Log.the(value)`](/modules/core/class/src/screenplay/interactions/Log.ts~Log.html):

```javascript
// tutorial-hello-serenity-js/hello-serenity.js
const { actorCalled, Log } = require('@serenity-js/core')   // 1

const Alice = actorCalled('Alice')

Alice.attemptsTo(
    Log.the('Hello Serenity/JS'),                           // 2
)
```

In the code sample above, you'll notice that we've:
1. imported the interaction to `Log` from `@serenity-js/core`
2. _parametrised_ the interaction to `Log` with a `string` and asked the actor to _attempt to_ perform it

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    [`Log.the`](/modules/core/class/src/screenplay/interactions/Log.ts~Log.html#static-method-the) is a factory method that instantiates a new [`Interaction`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html) to [`Log`](/modules/core/class/src/screenplay/interactions/Log.ts~Log.html). 
    <br />
    All the built-in Serenity/JS interactions leverage either "factory method" or "builder" design patterns to help you write code that's easy to read and understand.
    </p></div>
</div>

However, if you try to run the file with the above code, you'll notice that it doesn't produce any output:

```shell-session
node hello-serenity.js
```

To understand why this is the case, I need to tell you more about how Serenity/JS reporting features work.

## Reporting

Whenever an actor performs an _activity_ (a [task](/handbook/design/tasks.html) or an [interaction](/handbook/design/interactions.html)), it emits [events](/handbook/design/tasks.html) that inform [Serenity/JS reporting services](/handbook/reporting/index.html) about the activities taking place. 

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    The reason for the separation between interactions and reporting is so that no matter what and how many reporting services you use, they all have a complete picture of what the actors did. It also means that you'll never need to waste your time jumping between an HTML report and a log output of your build server to understand what happened in the test.
    </p></div>
</div>

In short, in oder to see what activities our actors perform, we need to register at least one _reporting service_. 

Serenity/JS reporting services ship in auxiliary [Serenity/JS modules](/modules), 
so let's add  [`@serenity-js/console-reporter`](/modules/console-reporter) to your project:

```shell-session
npm install --save-dev @serenity-js/console-reporter
```

Next, [`configure`](/modules/core/function/index.html#static-function-configure) Serenity/JS to use the [`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html) as follows:

```javascript
// tutorial-hello-serenity-js/hello-serenity.js
const { actorCalled, configure, Log } = require('@serenity-js/core')    // 1 
const { ConsoleReporter } = require('@serenity-js/console-reporter')    // 2

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),                             // 3
    ]
})

const Alice = actorCalled('Alice')

Alice.attemptsTo(
    Log.the('Hello Serenity/JS'),
)
```

In the code sample above, we:
1. import a function to [`configure`](/modules/core/function/index.html#static-function-configure) Serenity/JS,
2. import `ConsoleReporter`,
3. tell Serenity/JS to register `ConsoleReporter` as a member of the _stage crew_.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Just like the [design patterns](/handbook/design/index.html) in the Serenity/JS scenarios revolve around the [system metaphor](http://www.extremeprogramming.org/rules/metaphor.html) of a [stage performance](/handbook/design/screenplay-pattern.html), Serenity/JS _reporting_ and _supporting_ services follow the metaphor of a [stage crew](https://en.wikipedia.org/wiki/Running_crew).
    </p></div>
</div>

When you run the scenario again, you should now see the following output:

```shell-session
node hello-serenity.js 

  ✓ Alice logs: Hello Serenity/JS (2ms)
    'Hello Serenity/JS'
```

## Using TypeScript

[TypeScript](https://www.typescriptlang.org/) is an amazing language that greatly improves developer productivity by catching errors and providing fixes before you run code. Serenity/JS itself is written in TypeScript and I strongly encourage you to consider using it to build your test frameworks and write test scenarios based on Serenity/JS.

If you haven't used TypeScript before, don't worry! I'll show you enough to become comfortable with it.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Serenity/JS was born in June 2016, and to my knowledge was the first test framework written entirely in [TypeScript](https://www.typescriptlang.org/) from the very beginning.
  </p></div>
</div>

In order to use TypeScript, you'll need to add the following modules to your project:

```shell-session
npm install --save-dev typescript @types/node ts-node
```

Above:
- [`typescript`](https://www.npmjs.com/package/typescript) module provides support for the language,
- [`@types/node`](https://www.npmjs.com/package/@types/node) provides [type definitions](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html) for Node.js
- [`ts-node`](https://www.npmjs.com/package/ts-node) lets you run TypeScript programs without having to explicitly compile them to JavaScript first.  

To turn your JavaScript scenario into one written in TypeScript, rename the file `hello-serenity.js` to `hello-serenity.ts` using your editor or your computer terminal:  

```shell-session
mv hello-serenity.js hello-serenity.ts
```

Next, modify the [`require`](https://nodejs.org/en/knowledge/getting-started/what-is-require/) statements to become [`import`](https://www.typescriptlang.org/docs/handbook/modules.html#import) statements instead. The rest of the file should remain as it was:

```typescript
// tutorial-hello-serenity-js/hello-serenity.ts
import { actorCalled, configure, Log } from '@serenity-js/core' 
import { ConsoleReporter } from '@serenity-js/console-reporter'

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ]
})

const Alice = actorCalled('Alice')

Alice.attemptsTo(
    Log.the('Hello Serenity/JS'),
)
```

Et voilà! Your first Serenity/JS scenario is now written in TypeScript.

To run it, use `ts-node`:

```shell-session
npx ts-node hello-serenity.ts

  ✓ Alice logs: Hello Serenity/JS (3ms)
    'Hello Serenity/JS'
```

The output produced by the TypeScript version of your scenario should remain the same. 

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    When Serenity/JS is used with a test runner like Cucumber or WebdriverIO, you can configure the test runner to use `ts-node`, so that you don't have to invoke the module explicitly.
  </p><p>
    We'll talk more about it in the next chapter
 </p></div>
</div>

## Exercises

Hungry for more? Try the below exercises to solidify what you've learnt:
1. `ConsoleReporter` supports both dark and light terminals, study the [API docs](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html) to learn how you can configure it to use the different colour themes.
2. `ConsoleReporter` allows for the output stream to be redirected to a file instead of the terminal. Study the [examples](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html) to learn how to do it.
3. `Log.the` supports "[rest parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html)". See what happens when you provide more than one value, e.g. `Log.the('Hello Serenity/JS', 42)`
4. Try to log something other than a `string`, try an object: `{ name: 'Alice' }`, a Promise: `Promise.resolve(42)` or an Array: `['apples', 'bananas']`
5. `actor.attemptsTo` supports "[rest parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html)" too! Can you tell the actor to perform the interaction to `Log` more than once?

## Try it yourself

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jan_molak/tutorial-hello-serenity-js?embed=true&tab=code&theme=dark#spec/hello-serenity.ts"></iframe>

Check out the [finished project](https://github.com/serenity-js/tutorial-hello-serenity-js) on Serenity/JS GitHub or experiment with the [Repl.it sandbox](https://replit.com/@jan_molak/tutorial-hello-serenity-js) above.

## Summary

In this chapter, you've learnt how to write and run your first Serenity/JS scenario in both JavaScript and TypeScript.

In the next chapter, I'll show you how to use Serenity/JS with a test runner.

## Your feedback matters!

If you've enjoyed this tutorial and would like to be notified when I publish the next part, follow us on Twitter:

<a href="https://twitter.com/@SerenityJS" class="img-link">
    <img src="https://img.shields.io/twitter/follow/SerenityJS?style=social" alt="Follow SerenityJS on Twitter" />
</a>
<a href="https://twitter.com/@JanMolak" class="img-link">
    <img src="https://img.shields.io/twitter/follow/JanMolak?style=social" alt="Follow JanMolak on Twitter" />
</a>

If you have any questions or feedback about this tutorial or working with Serenity/JS in general, join our Community Chat Channel:

[![Chat on Gitter](https://badges.gitter.im/serenity-js/Lobby.svg)](https://gitter.im/serenity-js/Lobby)

If you'd like to say thank you, please give Serenity/JS a star on GitHub or become our GitHub Sponsor:

<a class="github-button" href="https://github.com/serenity-js/serenity-js" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star jan-molak/serenity-js on GitHub">Star</a>
<a class="github-button" href="https://github.com/sponsors/serenity-js" data-icon="octicon-heart" data-size="large" aria-label="Sponsor Serenity/JS on GitHub">Sponsor</a>
