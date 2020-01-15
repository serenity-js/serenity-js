---
title: The Screenplay Pattern
layout: handbook.hbs
---
# The Screenplay Pattern

The Screenplay Pattern is a [user-centred](https://en.wikipedia.org/wiki/User-centered_design) approach to writing high-quality automated acceptance tests. It steers you towards an effective use of layers of abstraction, helps your tests capture the business vernacular, and encourages good testing and software engineering habits.

Instead of focusing on low-level, interface-centric interactions, you describe your test scenarios in a similar way you'd describe them to a human being, an _actor_ in Screenplay-speak. You write simple, readable and highly-reusable code that instructs the _actors_ what activities to perform and what things to check. The domain-specific test language you create is used to express _screenplays_ - the activities for the actors to perform.

In this chapter, we'll look into how this works in practice.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>Did you know?</strong>
    The Screenplay Pattern uses the [system metaphor](https://wiki.c2.com/?SystemMetaphor) of a stage performance, where each test scenario is
    like a little [screenplay](https://en.wikipedia.org/wiki/Screenplay)
    describing how the actors should go about performing their activities
    while interacting with the system under test.</p>
    <p>
    The "screen" in "screenplay" has nothing to do with the computer screen.
    On the contrary, the Screenplay Pattern is a general method of modelling acceptance tests interacting with _any_ external interface. In fact, the Serenity/JS implementation of the Screenplay Pattern can help you break free from UI-only-based testing!
    </p></div>
</div>

## Screenplay by example

The best way to illustrate the Screenplay Pattern is through a practical example.
So suppose we wanted to write some tests for a to-do list application, like the one you can find
on the [TodoMVC site](http://todomvc.com/examples/angularjs/#/).

Let's also assume that, just like many other teams practising
[BDD](https://en.wikipedia.org/wiki/Behavior-driven_development),
we decided to use Serenity/JS together with [Cucumber.js](https://github.com/cucumber/cucumber-js).

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    Although Serenity/JS supports [different test runners](/modules/), teams practising
    [Behaviour-Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development)
    tend to use it with [Cucumber.js](https://github.com/cucumber/cucumber-js) to help turn the executable specifications
    of their software into its living documentation.
    </p></div>
</div>

In such context, we might have written the following scenario to illustrate the feature of adding items to the to-do list:

```gherkin
Feature: Add new items to the todo list

  As James (the just-in-time kinda guy)
  I want to capture the most important things I need to do
  So that I don’t forget about them

  Scenario: Adding the first todo item

    Given that James has an empty todo list
     When he adds "buy some milk" to his list
     Then his todo list should contain "buy some milk"
```

Let's think about this scenario from a couple of different angles:

* **Who** is this feature for? What **Role** do they play?
* **Why** are they here and what outcome do they hope for? What is their **Goal**?
* **What** will they need to do to achieve their goal? What **Tasks** do they need to perform?
* **How** will they complete each task? How will their specific **Interactions** with the system look like?

### Role

Let's say that we believe that the feature described in the above scenario will be useful to a "just-in-time kinda guy", who we'll call "James".
"James" is a [persona](https://articles.uie.com/goodwin_interview/) that we are using to understand the context, constraints and affordances of this specific role.

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

### Actor

Each [role](/handbook/design/screenplay-pattern.html#role) we discover needs an actor to play it.
In Serenity/JS, an `Actor` is defined as follows:

``` typescript
import { Actor } from '@serenity-js/core';

const james = Actor.named('James');
```

[Learn more about actors](/handbook/design/actors.html).

### Abilities

In order to interact with the system under test, an actor needs abilities - adapters of interface-specific clients,
such as a web browser driver or a REST API client. Those abilities enable [interactions](/handbook/design/screenplay-pattern.html#interactions) that an actor performs in order to change the state of the system.

Here's how we give James an ability to browse the Web and interact with the Web UI of the to-do list app:

``` typescript
import { Actor } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

const james = Actor.named('James')
    .whoCan(BrowseTheWeb.using(protractor.browser));
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    [Serenity/JS modules](/modules/) provide abilities that enable your actors to interact with the various interfaces of your system.
    If there's an ability you need that the framework doesn't provide out of the box, you can always write your own
    and perhaps [contribute it back](/handbook/contributing.html) to the community &#x1F60A;
    </p>
    </div>
</div>

[Learn more about abilities](/handbook/design/abilities.html).

### Interactions

Having abilities enables the actor to attempt to perform interactions with the system under test, such as clicking on buttons, entering values in text fields, or sending HTTP requests:

```typescript
import { Enter, Press } from '@serenity-js/protractor';
import { TodoList } from './ui'; // <- that's a "lean page object", more about those later

james.attemptsTo(
    Enter.theValue('buy some milk').into(TodoList.newTodoField),
    Press.the(Keys.Enter).into(TodoList.newTodoField),
)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    [Serenity/JS modules](/modules/) provide interactions your actors can use to interact with the most common interfaces
    of a modern software system.
    If there's an interaction that the framework doesn't provide out of the box, you can always write it yourself
    and perhaps [contribute back](/handbook/contributing.html) to the community &#x1F60A;
    </p>
    </div>
</div>

[Learn more about interactions](/handbook/design/abilities.html).

### Tasks

However, expressing test scenarios as long lists of low-level "clicks" and "enters" leads to duplicated code, fragile tests, and disheartened developers.

That's why we need tasks - the higher-level abstractions that model the activities an actor needs to perform in order to achieve their goal.

Here's how we ["chunk up"](https://dannorth.net/2011/01/31/whose-domain-is-it-anyway/) the low-level interactions and turn them
into a business domain-specific task:

```typescript
import { Task } from '@serenity-js/core';
import { Enter, Press } from '@serenity-js/protractor';
import { TodoList } from './ui';

const AddAnItem = {
    called: (itemName: string) =>
        Task.where(`#actor adds an item called ${ itemName }`,
            Enter.theValue(itemName).into(TodoList.newTodoField),
            Press.the(protractor.Keys.Enter).into(TodoList.newTodoField),
        )
}
```

An actor attempts to perform the task in the same way they'd attempt to perform an interaction:

```typescript
james.attemptsTo(
    AddAnItem.called('Buy some milk')
)
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        You can compose higher-level tasks of lower-level tasks too!
    </p>
    </p>
        Serenity/JS is designed to make your life easier by not only making your test automation code easier to write,
        understand and maintain, but also much easier to reuse.
    </p>
    </div>
</div>

[Learn more about tasks](/handbook/design/tasks.html).

### Questions

When the actor is done performing their activities, they typically have one more thing to do,
which is to answer some questions about the state of the system their interactions have left it in.

Serenity/JS questions are a convenient way of retrieving the data about the state of the system, and similar to the interactions,
the questions also rely on the actor's ability to interact with the system.

For example, to get the text of a Web element, you'd use the [`Text.of`](/modules/protractor/class/src/screenplay/questions/text/Text.ts~Text.html) question:

```typescript
Text.of(TodoList.topmostItem);
```

Which you can combine with [Serenity/JS assertions](modules/assertions/), like [`Ensure.that`](modules/assertions/class/src/Ensure.ts~Ensure.html#static-method-that):

```typescript
import { Ensure, equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/protractor';
import { TodoList } from './ui';

james.attemptsTo(
    Ensure.that(Text.of(TodoList.topmostItem), equals('buy some milk')),
)
```

But that's not the only use case!

You can use the exact same questions in synchronisation methods, like [`Wait.until`](modules/protractor/class/src/screenplay/interactions/Wait.ts~Wait.html#static-method-until):

```typescript
import { equals } from '@serenity-js/assertions';
import { Wait, Text } from '@serenity-js/protractor';
import { TodoList } from './ui';

james.attemptsTo(
    Wait.until(Text.of(TodoList.topmostItem), equals('buy some milk')),
    // and then remove the item from the list, for example
)
```

or even with other interactions, like [`Log`](modules/core/class/src/screenplay/interactions/Log.ts~Log.html):

```typescript
import { Log } from '@serenity-js/core';
import { Text } from '@serenity-js/protractor';
import { TodoList } from './ui';

james.attemptsTo(
    Log.the(Text.of(TodoList.topmostItem)),
)
```

[Learn more about questions](/handbook/design/questions.html).

## The Model

The model described above lies at the heart of Serenity/JS and can be visualised as follows:

<figure>
![The Screenplay Pattern](/handbook/design/images/the-screenplay-pattern.png)
    <figcaption><span>The Screenplay Pattern</span></figcaption>
</figure>

We'll dive into all the five core elements of the Screenplay Pattern, as well as the lean page objects pattern, assertion patterns
 and full-stack acceptance testing patterns in the rest of this book to give you a good understanding of the Serenity/JS pattern language.

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
            Their experiments with Kevin's model, combined with a desire to address problems with shortcomings of the [PageObject Pattern](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) and apply [SOLID design principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design))
            to acceptance testing is what [became known in 2013](http://www.slideshare.net/RiverGlide/a-journey-beyond-the-page-object-pattern)
            as [screenplay-jvm](https://github.com/screenplay/screenplay-jvm).
        </p>
        <p>
            In 2015, when Antony, Andy and Jan started working with [John Ferguson Smart](http://johnfergusonsmart.com/), what became known as the Screenplay Pattern found its way into [Serenity BDD](http://serenity-bdd.info), a popular acceptance testing library written in Java.
        </p>
        <p>
            Since 2016, you can use both the Screenplay Pattern and the powerful Serenity BDD reports on JavaScript projects thanks to Serenity/JS!
        </p>
    </div>
</div>

_Examples presented in this article are loosely based on ["Beyond Page Objects: Next Generation Test Automation with Serenity and the Screenplay Pattern"](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay) by Antony Marcano, Andy Palmer, John Ferguson Smart and Jan Molak, InfoQ, 2016._

_You can learn more about the ideas behind the Screenplay Pattern in ["Page Objects Refactored: SOLID Steps to the Screenplay Pattern"](https://dzone.com/articles/page-objects-refactored-solid-steps-to-the-screenp) by Antony Marcano, Andy Palmer, John Ferguson Smart and Jan Molak, DZone, 2016._
