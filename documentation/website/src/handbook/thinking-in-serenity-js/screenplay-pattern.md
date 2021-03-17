---
title: The Screenplay Pattern
layout: handbook.hbs
---

# The Screenplay Pattern

The Screenplay Pattern is a [user-centred](https://en.wikipedia.org/wiki/User-centered_design) approach to writing high-quality automated acceptance tests. It steers you towards an effective use of layers of abstraction, helps your tests capture the business vernacular, and encourages good testing and software engineering habits.

Instead of focusing on low-level, interface-centric interactions, you describe your test scenarios in a similar way you'd describe them to a human being - an _actor_ in Screenplay-speak. You write simple, readable and highly-reusable code that instructs the _actors_ what activities to perform and what things to check. The domain-specific test language you create is used to express _screenplays_ - the activities for the actors to perform in a given test scenario.

The Screenplay Pattern is one of the core design patterns behind Serenity/JS and in this chapter we'll look into how to apply it in practice.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    The Screenplay Pattern uses the [system metaphor](https://wiki.c2.com/?SystemMetaphor) of a stage performance where each test scenario is
    like a little [screenplay](https://en.wikipedia.org/wiki/Screenplay)
    describing how the actors should go about performing their activities
    while interacting with the system under test.</p>
    <p>
    The "screen" in "screenplay" has nothing to do with the computer screen.
    On the contrary, the Screenplay Pattern is a general method of modelling acceptance tests interacting with _any_ external interface of your system. In fact, the Serenity/JS implementation of the Screenplay Pattern can help you break free from UI-only-based testing!
    </p></div>
</div>

## The Five Elements

The Screenplay Pattern is beautiful in its simplicity. It's made up of five elements, five types of building blocks that Serenity/JS gives you to design any functional acceptance test you need, no matter how sophisticated or how simple. 

The key elements of the pattern are: actors, abilities, interactions, questions, and tasks.

<figure>
![The Screenplay Pattern](/handbook/design/images/the-screenplay-pattern.png)
    <figcaption><span>The Screenplay Pattern</span></figcaption>
</figure>

## Screenplay by example

The best way to illustrate the Screenplay Pattern is through a practical example, so let's continue experimenting with the [TodoMVC application](http://todomvc.com/examples/angularjs/#/) we've introduced in the [previous chapter](handbook/thinking-in-serenity-js/the-trouble-with-test-scripts.html). And while Serenity/JS supports [several test runners](http://todomvc.com/examples/angularjs/#/) (including [Cucumber.js](/modules/cucumber/), which we'll look into later on in the book), we'll use [Jasmine](https://serenity-js.org/modules/jasmine/) for now to keep things simple.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-laptop-code"></i></div>
    <div class="text"><p>
        If you'd like to follow along with the coding, please use the [Serenity/JS-Jasmine-Protractor template](https://github.com/serenity-js/serenity-js-jasmine-protractor-template).
    </p></div>
</div>

## Actors

The Screenplay Pattern is a user-centric model with users and external systems interacting with the system under test represented as _actors_. 
Actors are a key element of the pattern as they are the ones performing the test scenarios.

In Serenity/JS, an [`Actor`](/modules/core/function/index.html#static-function-actorCalled) is defined using an [`actorCalled`](/modules/core/function/index.html#static-function-actorCalled) convenience method:

```typescript
// spec/todo.spec.ts

import { Actor, actorCalled } from '@serenity-js/core';

const James: Actor = actorCalled('James');
```

You'll notice that in the code sample above I called the actor `James`. While you can give your actors whatever names you like,
a good pattern to follow is to give them names indicating the [personae](https://articles.uie.com/goodwin_interview/) they represent or the role they play in the system. This way you can help people working on the tests quickly recall the context, constraints and affordances of a given actor by associating the name of the actor with a persona they're already familiar with. 

In this case, let's say that our actor represents the persona of "James", a "just-in-time kinda guy", who's trying to get himself organised with our to-do list app.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    Just like the five core elements of the Screenplay Pattern, the term "role" comes from the [system metaphor](https://wiki.c2.com/?SystemMetaphor) of a stage performance. It should be interpreted as the role a given actor plays in the performance,
    the role they play in the system - "a doctor", "a trader", "a writer" are all good examples of actor roles.
    </p>
    <p>
    While a "role" often implies the _permissions_ a given actor has in the system they interact with (i.e. a "writer" writes articles, a "publisher" publishes articles), this is not a mechanism to _prevent_ the actor from performing activities inconsistent with their role.
    In particular, Serenity/JS will not prevent you from writing scenarios where a "writer" tries to impersonate a "publisher"
    and publish an article. If it did, you would not be able to test if your system correctly implemented its access control mechanisms!
    </p>
    </div>
</div>

Check out the [Design Guide](/handbook/design) to [learn more about actors](/handbook/design/actors.html).

## Interactions

The job of an actor is to _attempt to perform_ a series of interactions with the system under test, such as navigating to websites, clicking on buttons, entering values into form fields, or sending HTTP requests to a REST API. 

This series of interactions, provided as arguments to the [`actor.attemptsTo(..)`](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html#instance-method-attemptsTo) method, constitutes a test scenario (also referred to as an _actor flow_):

```typescript
// spec/todo.spec.ts

import 'jasmine';

import { actorCalled } from '@serenity-js/core';
import { Navigate } from '@serenity-js/protractor';

describe('Todo List App', () => {
    
    it('helps engineers learn Serenity/JS', () =>
        actorCalled('James').attemptsTo(
            Navigate.to('http://todomvc.com/examples/angularjs/')
        ));
});
```

In the example above, you see an actor performing an [`Interaction`](/modules/core/class/src/screenplay/Interaction.ts~Interaction.html) to [`Navigate.to`](/modules/protractor/class/src/screenplay/interactions/Navigate.ts~Navigate.html#static-method-to)
the [TodoMVC app]('http://todomvc.com/examples/angularjs/').

<div class="pro-tip">
    <div class="icon"><i class="fas fa-laptop-code"></i></div>
    <div class="text"><p>
        If you're following along with the coding, you can implement the above scenario under `spec/todo.spec.ts`.
    </p></div>
</div>

There are two interesting points about the scenario above that I'd like to draw your attention to:
1. The [`actor.attemptsTo(..)`](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html#instance-method-attemptsTo) method returns a standard JavaScript [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which allows Jasmine to [synchronise](https://jasmine.github.io/tutorials/async#promises) the chain of actor's interactions with the test runner. Serenity/JS does not try to pretend that the world of JavaScript is not asynchronous. Instead, it gives you patterns and tools to deal with this in an elegant way.
2. The interaction to [`Navigate`](/modules/protractor/class/src/screenplay/interactions/Navigate.ts~Navigate.html), just like many other common interactions you'll need to write your Web tests, ships as part of the [`@serenity-js/protractor`](/modules/protractor/) module. Serenity/JS [modules](/modules) provide dozens of interactions to cover most of your test automation needs, and if there are any missing you can [easily create them yourself](/handbook/design/interactions.html) and [contribute back](/contributing.html) to the community &#x1F60A;

Check out the [Design Guide](/handbook/design) to [learn more about interactions](/handbook/design/interactions.html). 

## Abilities 

If Serenity/JS is a full-stack acceptance testing framework that allows you to interact with any interface of the system, how does it know what interfaces you _actually need_ to exercise in your test? How does it know how to connect your actors to those interfaces? 
Well, it doesn't unless you tell it, and that's where _abilities_ come into play.

You can think of an [`Ability`](/modules/core/class/src/screenplay/Ability.ts~Ability.html) as a thin wrapper around a client of a specific interface you'd like the actor to use.
Those abilities is what the interactions use under the hood and what enables the actor to perform interactions with the system under test.

For example, here's an ability that enables the actor to browse the Web using `protractor.browser` and enables Web-specific interactions such as `Navigate`:

```typescript
import { Ability } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

const browseTheWeb: Ability = BrowseTheWeb.using(protractor.browser);
```

Now, you _could_ give an actor this ability directly, using the [`actor.whoCan(..)`](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html#instance-method-whoCan) API:

```typescript
// spec/todo.spec.ts

import 'jasmine';

import { actorCalled } from '@serenity-js/core';
import { BrowseTheWeb, Navigate } from '@serenity-js/protractor';
import { protractor } from 'protractor';

describe('Todo List App', () => {
    
    it('helps engineers learn Serenity/JS', () =>
        actorCalled('James')
            .whoCan(BrowseTheWeb.using(protractor.browser))
            .attemptsTo(
                Navigate.to('http://todomvc.com/examples/angularjs/')
            ));
});
```

However, there's a more elegant way to do it that doesn't require you to [repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) in every test you write.

The alternative is to [`engage(..)`](/modules/core/function/index.html#static-function-engage) a [`Cast`](/modules/core/class/src/stage/Cast.ts~Cast.html) of actors, who gain their abilities when they prepare for the performance before the scenario starts:

```typescript
// spec/todo.spec.ts

import { Actor, actorCalled, Cast, engage } from '@serenity-js/core';
import { BrowseTheWeb, Navigate } from '@serenity-js/protractor';
import { protractor } from 'protractor';

class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
        );
    }
}

describe('Todo List App', () => {

    beforeEach(() => engage(new Actors()));
    
    it('helps engineers learn Serenity/JS', () =>
        actorCalled('James').attemptsTo(
            Navigate.to('http://todomvc.com/examples/angularjs/')
        ));
});
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-laptop-code"></i></div>
    <div class="text"><p>
        If you're following along with the coding, you can execute the test you've just implemented by running `npm test` in your terminal.
    </p></div>
</div>

Check out the [Design Guide](/handbook/design) to [learn more about abilities](/handbook/design/abilities.html).

## Questions

The fourth building block of the Screenplay Pattern is _questions_, and just like with interactions, questions are interface-specific and enabled by abilities.
Answering a [`Question`](/modules/core/class/src/screenplay/Question.ts~Question.html) provides actor with information about the state of the system under test.

For example, you have a question that retrieves the [title of the website](/modules/protractor/class/src/screenplay/questions/Website.ts~Website.html#static-method-title): 

```typescript
import { Question } from '@serenity-js/core';
import { Website } from '@serenity-js/protractor';

const title: Question<Promise<string>> = Website.title()
```

Or the one that [retrieves a web element](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html) for the actor's interactions to target:

```typescript
import { Question } from '@serenity-js/core';
import { Target } from '@serenity-js/protractor';
import { by, ElementFinder } from 'protractor';

const header: Question<ElementFinder> = Target.the('header').located(by.css('h1'));
```

You also have higher-order questions that can be passed other questions as arguments.

For example, this is how you retrieve the text of the header web element from the sample above:

```typescript
import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/protractor';

const headerText: Question<Promise<string>> = Text.of(header);
```

So what can you do with those questions? A great many things!

You can use them with most Serenity/JS interactions, such as the one that [logs the answer](/modules/core/class/src/screenplay/interactions/Log.ts~Log.html) to the question so that it can be [printed to the terminal](/modules/console-reporter/) (useful when debugging your test scenarios):

```typescript
import { Log } from '@serenity-js/core';

Log.the(headerText)
```

More importantly, you can also use them with [assertions](/modules/assertions/):

```typescript
import { Ensure, equals } from '@serenity-js/assertions';

Ensure.that(headerText, equals('todos'))
```

As well as for [synchronising your tests with the UI](/modules/protractor/class/src/screenplay/interactions/Wait.ts~Wait.html):

```typescript
import { Wait, isPresent } from '@serenity-js/protractor';
import { equals } from '@serenity-js/assertions';

Wait.until(header, isPresent())
Wait.until(headerText, equals('todos'))
```

If you wanted to experiment with some of the above questions, you could expand the original test scenario as follows:

```typescript
// spec/todo.spec.ts
import 'jasmine';

import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, actorCalled, Cast, engage } from '@serenity-js/core';
import { BrowseTheWeb, isVisible, Navigate, Target, Text, Wait } from '@serenity-js/protractor';
import { by, protractor } from 'protractor';

class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
        );
    }
}

// this is what I call a Lean Page Object, more on those later on in the book
class TodoListApp {
    static header = Target.the('header').located(by.css('h1'));
}

describe('Todo List App', () => {

    beforeEach(() => engage(new Actors()));

    it('helps engineers learn Serenity/JS', () =>
        actorCalled('James').attemptsTo(
            Navigate.to('http://todomvc.com/examples/angularjs/'),
            Wait.until(TodoListApp.header, isVisible()),
            Ensure.that(Text.of(TodoListApp.header), equals('todos')),
        ));
});
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-laptop-code"></i></div>
    <div class="text"><p>
        If you'd like to see the above scenario in action, paste the code above in `spec/todo.spec.ts` and run `npm test` in your terminal.
    </p></div>
</div>

Check out the [Design Guide](/handbook/design) to [learn more about questions](/handbook/design/questions.html).

## Tasks

The final piece of the puzzle is _tasks_. [`Tasks`](/modules/core/class/src/screenplay/Task.ts~Task.html) are the [higher-level abstractions](https://janmolak.com/user-centred-design-how-a-50-year-old-technique-became-the-key-to-scalable-test-automation-66a658a36555) that model the activities an actor needs to perform in business domain terms.

For example, the three interactions we've just discussed could be modelled as a task to "launch the app":

```typescript
// spec/todo.spec.ts
import 'jasmine';


import { Ensure, equals } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { isVisible, Navigate, Text, Wait } from '@serenity-js/protractor';

const LaunchTheApp = () =>
    Task.where(`#actor launches the app`, 
        Navigate.to('http://todomvc.com/examples/angularjs/'),
        Wait.until(TodoListApp.header, isVisible()),
        Ensure.that(Text.of(TodoListApp.header), equals('todos')),
    )
```

To make an actor perform a task, you pass it to the `attemptsTo(..)` method, just like we did with the interactions.

```typescript
// spec/todo.spec.ts
import 'jasmine';

import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, actorCalled, Cast, engage, Task } from '@serenity-js/core';
import { BrowseTheWeb, isVisible, Navigate, Target, Text, Wait } from '@serenity-js/protractor';
import { by, protractor } from 'protractor';

class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
        );
    }
}

// this is what I call a Lean Page Object, more on those later on in the book
class TodoListApp {
    static header = Target.the('header').located(by.css('h1'));
}

const LaunchTheApp = () =>
    Task.where(`#actor launches the app`,
        Navigate.to('http://todomvc.com/examples/angularjs/'),
        Wait.until(TodoListApp.header, isVisible()),
        Ensure.that(Text.of(TodoListApp.header), equals('todos')),
    )

fdescribe('Todo List App', () => {

    beforeEach(() => engage(new Actors()));

    it('helps engineers learn Serenity/JS', () =>
        actorCalled('James').attemptsTo(
            LaunchTheApp(),
            // perform other tasks, like adding items to the list
        ));
});
```

The great thing about Serenity/JS tasks is that you can use them to compose not just the interactions, but other tasks too! I'll show you how to do it later on in the book.

For now, you can paste the code above in `spec/todo.spec.ts` and run `npm test` in your terminal to see output similar to the below:

```
/Users/jan/serenity-js-experiments/spec/todo.spec.ts:32

Todo List App: helps engineers learn Serenity/JS

  James launches the app
    ✓ James navigates to 'http://todomvc.com/examples/angularjs/' (840ms)
    ✓ James waits up to 5s until the header does become visible (155ms)
    ✓ James ensures that the text of the header does equal 'todos' (18ms)

✓ Execution successful (1s 39ms)
```

Check out the [Design Guide](/handbook/design) to [learn more about tasks](/handbook/design/tasks.html).

---

Now that you understand one of the core patterns behind Serenity/JS it's time to move on to the next one, the [Lean Page Objects](/handbook/thinking-in-serenity-js/lean-page-objects.html).

In this [next article](/handbook/thinking-in-serenity-js/lean-page-objects.html) we'll improve the test we've just written and look at ways to structure our code better.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text">
        <h4>The origins of the Screenplay Pattern</h4>
        <p>
            Serenity/JS introduced the Screenplay Pattern to the JavaScript world back in 2016,
            but the ideas behind it have been around for a while in various forms.
        </p>
        <p>
            It all started at the Agile Alliance Functional Testing Tools workshop (AAFTT) back in 2007.
        </p>
        <p>
            ["In praise of abstraction"](http://www.developertesting.com/archives/month200710/20071013-In%20Praise%20of%20Abstraction.html), a talk given by Kevin Lawrence, inspired [Antony Marcano](http://antonymarcano.com/Site/Home.html)
            to implement a fluent DSL based on Kevin's idea to use the language of Interaction Designers to model the layers of abstraction in an acceptance test.
            With the help of [Andy Palmer](http://andypalmer.com), this fluent DSL is what became
            [JNarrate](https://bitbucket.org/testingreflections/jnarrate/wiki/Home) a year later (2008).
        </p>
        <p>
            In the late 2012, Antony and Andy joined forces with [Jan Molak](https://janmolak.com/).
            Their experiments with Kevin's model, combined with a desire to address problems with shortcomings of the [PageObject Pattern](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) and apply [SOLID design principles](https://en.wikipedia.org/wiki/SOLID_&#40;object-oriented_design&#41;)
            to acceptance testing is what [became known in 2013](http://www.slideshare.net/RiverGlide/a-journey-beyond-the-page-object-pattern)
            as [screenplay-jvm](https://github.com/screenplay/screenplay-jvm).
        </p>
        <p>
            In 2015, when Antony, Andy and Jan started working with [John Ferguson Smart](http://johnfergusonsmart.com/), what became known as the Screenplay Pattern found its way into [Serenity BDD](http://serenity-bdd.info), a popular acceptance testing and reporting library written in Java.
        </p>
        <p>
            In 2016, you can use both the Screenplay Pattern and the powerful Serenity BDD reports on JavaScript projects thanks to Serenity/JS!
        </p>
        <p>
            If you'd like to find out more about the thought process behind the Screenplay Pattern, check out:
            <ul>
                <li>["Beyond Page Objects: Next Generation Test Automation with Serenity and the Screenplay Pattern"](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay) by Antony Marcano, Andy Palmer, John Ferguson Smart and Jan Molak, InfoQ, 2016.</li>
                <li>["Page Objects Refactored: SOLID Steps to the Screenplay Pattern"](https://dzone.com/articles/page-objects-refactored-solid-steps-to-the-screenp) by Antony Marcano, Andy Palmer, John Ferguson Smart and Jan Molak, DZone, 2016.</li>
             </ul>
        </p>
    </div>
</div>
