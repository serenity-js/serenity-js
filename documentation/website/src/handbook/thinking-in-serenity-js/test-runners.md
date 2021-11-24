---
title: Test Runners and Reporting
layout: handbook.hbs
cta: cta-feedback
---
# Test Runners and Serenity/JS Reporting

In the [previous chapter](/handbook/thinking-in-serenity-js/hello-serenity-js.html), you've learnt how to write and run your first Serenity/JS scenario in both JavaScript and TypeScript.

In this chapter, you'll learn how to integrate Serenity/JS with a test runner to create the foundations of your very own test framework, and how Serenity/JS reporting services will make analysing your test results easier. That's even if your tests don't follow the [Screenplay Pattern](/handbook/design/screenplay-pattern.html) (yet!).

If you prefer to dive straight into the code, you can experiment with:
- the [finished project](https://github.com/serenity-js/tutorial-test-runners) on Serenity/JS GitHub,
- a [Repl.it sandbox](https://replit.com/@jan_molak/tutorial-test-runners), where you can run the code in your web browser without having to install anything on your computer.


## A place to start

We'll be building on the codebase we've created in the previous chapter, so you can use your existing project.

Alternatively, you can [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the final result of the previous chapter using the button below and [clone it](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository) to your computer. 

<a class="github-button" href="https://github.com/serenity-js/tutorial-hello-serenity-js/fork" data-icon="octicon-repo-forked" data-size="large" data-show-count="true" aria-label="Fork serenity-js/tutorial-hello-serenity-js on GitHub">Fork</a>

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    While you could _just clone_ the original repository, creating a [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and cloning a forked copy instead will give you a place where you can [commit](https://github.com/git-guides/git-commit) and [push](https://github.com/git-guides/git-push) your local changes for future reference.  
    </p></div>
</div>

## Mocha

Serenity/JS supports a number of popular test runners, including [Cucumber](/modules/cucumber), [Jasmine](/modules/jasmine), [Mocha](/modules/mocha), [Protractor](/modules/protractor), and [WebdriverIO](/modules/webdriverio). 

In this chapter we'll be working with [Mocha](https://mochajs.org/), but the concepts you'll learn are easily applicable to other test runners too.

To use Mocha, add [`mocha`](https://www.npmjs.com/package/mocha), its [TypeScript type definitions](https://www.npmjs.com/package/@types/mocha), and a [`@serenity-js/mocha`](/modules/mocha) adapter to your project:

```shell-session
npm install --save-dev mocha @types/mocha @serenity-js/mocha
```

Next, create a directory for the test scenarios:
```shell-session
mkdir spec
```

We'll also need a file called `mocha.spec.ts` under `spec` where in just a moment we'll write our test scenarios:

```shell-session
npx touch spec/mocha.spec.ts
```

To test your installation, run the following command in your computer terminal:

```shell-session
npx mocha --require 'ts-node/register' 'spec/**.spec.ts' 
```

This should produce a result similar to:
```shell-session
  0 passing (1ms)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Neither Mocha nor Serenity/JS force you to use any specific name or location of your test directory.
    </p><p>
    Since I'm a practitioner of [Behaviour-Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development), I like to call this directory `spec` to highlight that it contains [executable specifications](https://en.wikipedia.org/wiki/Specification_by_example) of the system I'm working on. If you prefer a different name that's perfectly fine too 😊
    </p></div>
</div>

### Mocha configuration file

To make things easier and avoid having to type in the entire command every time you want to run the tests it's better to use a [configuration file](https://mochajs.org/#configuring-mocha-nodejs) instead, though.

To configure Mocha, create a file called `.mocharc.yml` with the following contents and place it in the root directory of your project:

```yaml
# .mocharc.yml
require:
  - ts-node/register
spec: 'spec/**/*.spec.ts'
timeout: 5000
```

You can now run the tests without having to provide any configuration parameters: 

```shell-session
npx mocha 
```

The above command should again produce a result similar to:
```shell-session
  0 passing (1ms)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    Mocha repository on GitHub contains a [great example](https://github.com/mochajs/mocha/blob/09ffc30b43db53b0cb3f54670132270271d8fe97/example/config/.mocharc.yml) of all the configuration properties you can specify in `.mocharc.yml`
    </p></div>
</div>

### Mocha / NPM integration

Instead of invoking Mocha directly using the `npx mocha` command, a more standard and developer-friendly way is to define an [npm `test` script](https://docs.npmjs.com/cli/v7/commands/npm-test) in `package.json`:

```json
{
  // ...
  "scripts": {
    "test": "mocha"
  }
  // ...
}
```

With the script in place, people or automated services trying to run the tests are no longer required to know that your project uses Mocha and can run them using the standard [`npm test`](https://docs.npmjs.com/cli/v7/commands/npm-test) command:

```shell-session
npm test 
```

Which, as you expected, should produce a result similar to:
```shell-session
  0 passing (1ms)
```

### Default Mocha Reporting

So far our project uses Mocha's default test reporter called ["spec"](https://mochajs.org/#spec). This reporter responsible for listening to events emitted by Mocha and producing console output you've seen in the previous section.

To better understand the differences between the results it produces and those provided by [Serenity/JS reporting services](/handbook/reporting/index.html), edit `spec/mocha.spec.ts` and add a couple of example test scenarios:

```typescript
// spec/mocha.spec.ts

import { strictEqual } from 'assert';
import { describe, it } from 'mocha'

describe('Mocha', () => {

    describe('reports a scenario that', () => {

        it('has no body as "pending"')

        it('has no errors as "passing"', () => {

        })

        it('has assertion errors as "failing"', () => {
            strictEqual(false, true, 'example assertion')
        })

        it('has any other errors as "failing" too', () => {
            throw new Error('Something went wrong')
        })
    })
})
```

When you run the tests again:
```shell-session
npm test
```
you should see results similar to the below:
```shell-session
  Mocha
    reports a scenario that
      - has no body as "pending"
      ✔ has no errors as "passing"
      1) has assertion errors as "failing"
      2) has any other errors as "failing" too


  1 passing (7ms)
  1 pending
  2 failing

  1) Mocha
       reports a scenario that
         has assertion errors as "failing":

      AssertionError [ERR_ASSERTION]: example assertion
      + expected - actual

      -false
      +true
      
      at Context.<anonymous> (spec/mocha.spec.ts:19:13)
      at processImmediate (internal/timers.js:461:21)

  2) Mocha
       reports a scenario that
         has any other errors as "failing" too:
     Error: Something went wrong
      at Context.<anonymous> (spec/mocha.spec.ts:23:19)
      at processImmediate (internal/timers.js:461:21)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
    <p><strong>Did you notice?</strong>
    In the example above, any test that throws an `Error` is marked as "failing", no matter the _kind_ of error it throws. 
    </p><p>
    This might not be a problem when it comes to unit tests, since the scope they operate on is small. However, in the context of high-level acceptance or integration tests, being able to differentiate between assertion failures, test errors and infrastructure-related issues can save you a lot of time when analysing the results.
    </p><p>
    This is where Serenity/JS reporting services come into play.  
    </p></div>
</div>

## Serenity/JS Mocha

So now is the time to replace Mocha's default test reporter with Serenity/JS reporting services.

To do that, we need to:
- configure Mocha to use the [`@serenity-js/mocha`](/modules/mocha) adapter instead of its regular reporters. This will give Serenity/JS visibility of tests being executed by Mocha and their results.
- configure Serenity/JS to use the appropriate [reporting services](/handbook/reporting/index.html), so that we see the output.

### Adapter

To integrate Mocha with Serenity/JS reporting services, modify the `.mocharc.yml` and instruct the runner to use the `@serenity-js/mocha` reporter:

```````yaml
# .mocharc.yml
require:
  - ts-node/register
reporter: '@serenity-js/mocha'
spec: 'spec/**/*.spec.ts'
timeout: 5000
```````

**Please note** that as soon as you specify the above reporter, your tests will stop to produce any output when they're executed. This happens because a typical Mocha test reporter is responsible for both translating the internal runner events into a format it can understand _and_ producing the output. 

In the case of Serenity/JS reporting services, the test runner adapter, such as [`@serenity-js/mocha`](/modules/mocha), [`@serenity-js/jasmine`](/modules/jasmine) or [`@serenity-js/cucumber`](/modules/cucumber) has a single responsibility to translate test runner-specific events to Serenity/JS [domain events](/modules/core/identifiers.html#events), and it is the responsibility of the "stage crew members" to produce the output. 

So as you might have guessed, the one step we're still missing is to configure Serenity/JS with the appropriate stage crew members.

### Reporting

Just like in the [previous chapter](/handbook/thinking-in-serenity-js/hello-serenity-js.html#reporting), we need to [`configure`](/modules/core/function/index.html#static-function-configure) Serenity/JS to use the [`ConsoleReporter`](/modules/console-reporter/class/src/stage/crew/console-reporter/ConsoleReporter.ts~ConsoleReporter.html).

To do that, create a file called `config.ts` and place it under `spec`:

```typescript
// spec/config.ts

import { configure } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';

configure({
    crew: [
        ConsoleReporter.forDarkTerminals(),
    ]
})
```

Here again the name of this file and its location is entirely up to you.

Next, instruct Mocha to load the configuration file by modifying `.mocharc.yml`
to add a new entry under `require`:

```````yaml
# .mocharc.yml
require:
  - ts-node/register
  - spec/config.ts
reporter: '@serenity-js/mocha'
spec: 'spec/**/*.spec.ts'
timeout: 5000
```````

And we're done!

Now, when you run the tests again:
```shell-session
npm test
```

you should see output similar to the below:

```shell-session
--------------------------------------------------------------------------------
/Users/jan/Projects/serenity-js/tutorial-test-runners/spec/mocha.spec.ts

Mocha: reports a scenario that has no body as "pending"


☕Implementation pending (2ms)

  ImplementationPendingError: Scenario not implemented
--------------------------------------------------------------------------------
/Users/jan/Projects/serenity-js/tutorial-test-runners/spec/mocha.spec.ts

Mocha: reports a scenario that has no errors as "passing"


✓ Execution successful (14ms)
--------------------------------------------------------------------------------
/Users/jan/Projects/serenity-js/tutorial-test-runners/spec/mocha.spec.ts

Mocha: reports a scenario that has assertion errors as "failing"


✗ Execution failed with assertion error (20ms)

  AssertionError [ERR_ASSERTION]: example assertion
      at Context.<anonymous> (spec/mocha.spec.ts:17:13)
      at processImmediate (internal/timers.js:461:21)
--------------------------------------------------------------------------------
/Users/jan/Projects/serenity-js/tutorial-test-runners/spec/mocha.spec.ts

Mocha: reports a scenario that has any other errors as "failing" too


✗ Execution failed with error (12ms)

  Error: Something went wrong
      at Context.<anonymous> (spec/mocha.spec.ts:21:19)
      at processImmediate (internal/timers.js:461:21)
================================================================================
Execution Summary

Mocha:      1 broken, 1 failed, 1 pending, 1 successful, 4 total (48ms)

Total time: 48ms
Scenarios:  4
================================================================================
```

There's a couple of interesting things about the output produced by [Serenity/JS Console Reporter](https://serenity-js.org/handbook/reporting/console-reporter.html) above:
- Serenity/JS differentiates between the various reasons a test might fail, so scenarios failing due to unmet assertions, those failing due to other `Error`s, and those failing because of infrastructure-related issues (more on this in the following chapters)
- Each entry in the log above mentions the file where the test is located. This makes it easier for you to quickly navigate to the scenario of interest.

### Screenplay Pattern

Another important thing about Serenity/JS reporting services is that they understand the Screenplay Pattern and can provide you with much more thorough reports on test scenarios that follow it.

To see how it works, add a new scenario just like the one from the previous chapter:

```typescript
// spec/mocha.spec.ts

import { strictEqual } from 'assert';
import { describe, it } from 'mocha'
import { actorCalled, Log } from '@serenity-js/core';

describe('Mocha', () => {

    describe('reports a scenario that', () => {
        
        it('follows the Screenplay Pattern', () => {
            return actorCalled('Alice').attemptsTo(
                Log.the('Hello Serenity/JS'),
            )
        })

        // ... previous scenarios omitted for brevity
    })
})
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you notice?</strong>
        The `return` statement in the code sample above ensures that the [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by `actorCalled(...).attemptsTo(...)`
        is handed over to Mocha. This is how a Serenity/JS scenario gets synchronised with the test runner.
    </p><p>
        We'll talk more about it in the next chapter.
    </p></div>
</div>

Next, run the tests again:

```shell-session
npm test
```

You should see output similar to the below, where apart from the location and result of a given test scenario, you'll also see all the activities that the actors have performed:

```shell-session
--------------------------------------------------------------------------------
/Users/jan/Projects/serenity-js/tutorial-test-runners/spec/mocha.spec.ts

Mocha: reports a scenario that follows the Screenplay Pattern

  ✓ Alice logs: 'Hello Serenity/JS' (1ms)
    'Hello Serenity/JS'


✓ Execution successful (26ms)
--------------------------------------------------------------------------------
```

## Exercises

Hungry for more? Try the below exercises to solidify what you've learnt:
1. Check out [Serenity/JS Mocha Template](https://github.com/serenity-js/serenity-js-mocha-template) and see if you can find the integration points where Serenity/JS Mocha adapter is registered and configured
2. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and [clone](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository) the [Serenity/JS Mocha Template](https://github.com/serenity-js/serenity-js-mocha-template)to your computer, run the tests, and have a look at the HTML reports it produces. Can you make the project we've been working produce such [HTML reports](https://serenity-js.org/handbook/reporting/serenity-bdd-reporter.html) as well?
3. Compare the integration architecture between [Mocha](/handbook/integration/serenityjs-and-mocha.html), [Cucumber](/handbook/integration/serenityjs-and-cucumber.html) and [Jasmine](/handbook/integration/serenityjs-and-jasmine.html) test runners. What differences and what similarities do you see?
4. Explore the [Serenity/JS Cucumber Template](https://github.com/serenity-js/serenity-js-cucumber-template) and see if you can find the integration points between Cucumber and Serenity/JS.

## Try it yourself

<iframe frameborder="0" width="100%" height="500px" src="https://replit.com/@jan_molak/tutorial-test-runners?embed=true&tab=code&theme=dark#spec/mocha.spec.ts"></iframe>

Check out the [finished project](https://github.com/serenity-js/tutorial-test-runners) on Serenity/JS GitHub or experiment with the [Repl.it sandbox](https://replit.com/@jan_molak/tutorial-test-runners) above.

## Summary

In this chapter, you've learnt how to integrate Serenity/JS with a test runner and created the foundation of a test framework.

If you've experimented with the exercises, you should now also have a good grasp of the steps you'd need to take to integrate Serenity/JS with other test runners such as Jasmine or Cucumber.

In the next chapter, we'll go back to the Screenplay Pattern and explore the Serenity/JS actors in depth. see extend our project to use multiple actors. I'll also show you how Serenity/JS embraces the asynchronous nature of JavaScript, and how it can make it easier for you and your team too!
