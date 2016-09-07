# From Scripts to Serenity: Writing what you'd like to read

In the [previous article](from-scripts-to-serenity-introduction-speaking-the-right-language.md)
we looked at how taking
[the scripting approach](from-scripts-to-serenity-speaking-the-right-language.md#a-test-script)
to test automation can result in a codebase that's brittle and difficult to maintain.
We've also talked about how the
[Page Object(s) pattern](from-scripts-to-serenity-speaking-the-right-language.md#first-step-in-the-journey-the-page-objects-pattern)
succeeded in addressing some of those problems, but also introduced some new ones.

In this article we'll look at how Serenity/JS and the [Screenplay Pattern](screenplay-pattern.md) can help
us design test systems that are easier to extend, maintain and scale to meet the requirements of a modern business.

## Something practical

Let's look again at the Cucumber scenario we know
from the [previous article](from-scripts-to-serenity-introduction-speaking-the-right-language.md).
This time we'll automate it from
[outside-in](https://en.wikipedia.org/wiki/Outside%E2%80%93in_software_development), while gradually introducing
the concepts of the [Screenplay Pattern](screenplay-pattern.md).

:bulb: **PRO TIP:** If you like learning by doing, clone the [tutorial project](https://github.com/jan-molak/serenity-js-getting-started) and code along!

```gherkin
# features/add_new_items.feature

Feature: Add new items to the todo list

  In order to avoid having to remember things that need doing
  As a forgetful person
  I want to be able to record what I need to do in a place where I won't forget about them

  Scenario: Adding an item to a list with other items

    Given that James has a todo list containing Buy some cookies, Walk the dog
     When he adds Buy some cereal to his list
     Then his todo list should contain Buy some cookies, Walk the dog, Buy some cereal
```

## Getting started

First, let's add [Serenity/JS library](https://www.npmjs.com/package/serenity-js) to the project:

```
λ ~/serenity-js-getting-started/ npm install serenity-js --save
```

Now have a look at the Cucumber steps defined in `features/step_definitions/todo_user.steps.ts`,
which should look like this:

```typescript
// features/step_definitions/todo_user.steps.ts

export = function todoUserSteps() {

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string, callback) => {
        callback(null, 'pending');
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, (itemName: string, callback) => {
        callback(null, 'pending');
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items: string, callback) => {
        callback(null, 'pending');
    });
};
```

The [Screenplay Pattern](screenplay-pattern.md)
is a [user-centered model](https://en.wikipedia.org/wiki/User-centered_design),
which puts an emphasis on [Actors](screenplay-pattern.md#Actor) - the external parties interacting with our system,
their [Goals](screenplay-pattern.md#Goal) and [Tasks](screenplay-pattern.md#Task) they perform to achieve them.

To automate a Cucumber scenario using the [Screenplay Pattern](screenplay-pattern.md),
we first need an [Actor](screenplay-pattern.md#Actor):

```typescript
// features/step_definitions/todo_user.steps.ts

import { Actor } from 'serenity-js/lib/screenplay';

export = function todoUserSteps() {

    let actor: Actor;

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string, callback) => {
        actor = Actor.named(name);

        callback();
    });

    // ...
};
```

The job of an Actor is to perform Tasks needed to meet the Goals of a test scenario.

The goal of the first step of our scenario is for the Actor to start with a Todo List containing two items:
"Buy some cookies" and "Walk the dog":

```gherkin
Given that James has a todo list containing Buy some cookies, Walk the dog
```

Let's make the implementation reflect this:

```typescript
// features/step_definitions/todo_user.steps.ts

import { Start } from '../../src/screenplay/tasks/start';
import { listOf } from '../../src/text';

// ...

    let actor: Actor;

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (actorName: string, items: string, callback) => {
        actor = Actor.named(actorName);

        actor.attemptsTo(
            Start.withATodoListContaining(listOf(items))
        );

        callback();
    });

// ...
```

You've probably already noticed that the name of the method we used
to instantiate the Task - `Start.withATodoListContaining(items)`
uses the language specific to the domain of our application.
This helps you write code that's easy to read and understand.

## The first Task

Any custom Task class we define needs to implement the `Task` interface, so that it can be performed by an Actor:

```typescript
// src/screenplay/tasks/start.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';

export class Start implements Task {

    static withATodoListContaining(items: string[]) {       // static method to improve the readability
        return new Start(items);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {    // required by the Task interface
        return actor.attemptsTo(                            // delegates the work to lower-level tasks
            // todo: add each item to the Todo List
        );
    }

    constructor(private items: string[]) {                  // constructor assigning the list of items
    }                                                       // to a private field
}
```

## Never `callback`

Since the `performAs` method is required to return
a [`PromiseLike`, `thenable` object](https://promisesaplus.com/#point-7), we can remove the `callback` from the
Cucumber step definition and make the code a bit simpler and cleaner:

```typescript
// features/step_definitions/todo_user.steps.ts

// ...

    let actor: Actor;

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (actorName: string, items: string) => {
        actor = Actor.named(actorName);

        return actor.attemptsTo(
            Start.withATodoListContaining(listOf(items));
        );
    });

// ...
```

## Don't Repeat Yourself

The fact that all the Tasks implement a common interface - `Task`, makes it easy for them to be reused
and composed with each other.
This in turn allows you to build high-level Tasks from the lower-level ones.

That's exactly what we'll do next as it seems that both the first and the second step of our Cucumber scenario
require James to add items to his Todo List:

```gherkin
Given that James has a todo list containing Buy some cookies, Walk the dog
 When he adds Buy some cereal to his list
```

Let's expand our vocabulary of custom Tasks then. First, define the API you'd like to use in the Cucumber step:

```typescript
// features/step_definitions/todo_user.steps.ts

import { AddATodoItem } from '../../src/screenplay/tasks/add_a_todo_item';
import { listOf } from '../../src/text';

// ...

    let actor: Actor;

    // ...

    this.When(/^he adds (.*?) to his list$/, (itemName: string) => {
        return actor.attemptsTo(
            AddATodoItem.called(itemName)
        )
    });

// ...
```

Then define the Task:

```typescript
// src/screenplay/tasks/add_a_todo_item.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';

export class AddATodoItem implements Task {

    static called(itemName: string) {                       // static method to improve the readability
        return new AddATodoItem(itemName);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {    // required by the Task interface
        return actor.attemptsTo(                            // delegates the work to lower-level tasks
            // todo: interact with the UI
        );
    }

    constructor(private itemName: string) {                 // constructor assigning the name of the item
    }                                                       // to a private field
}
```

and reuse it in the original `Start` Task as well:

```typescript
// src/screenplay/tasks/start.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { AddATodoItem } from './add_a_todo_item';

export class Start implements Task {

    static withATodoListContaining(items: string[]) {
        return new Start(items);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            ...this.addAll(this.items)                          // ``...` is a spread operator,
        );                                                      // which converts a list to vararg
    }

    constructor(private items: string[]) {
    }

    private addAll(items: string[]): Task[] {                   // transforms a list of item names
        return items.map(item => AddATodoItem.called(item));    // into a list of Tasks
    }
}
```

Now that we have a seed of a nice and readable [Domain-Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language),
it's time to make our acceptance test interact with the application.

## Interacting with the system

In order for James to be able to interact with the [TodoMVC app](http://todomvc.com/examples/angularjs/),
we need to give him the ability to use a web browser:

```typescript
Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));
```

In the example above, `BrowseTheWeb` is an [Ability](screenplay-pattern.md#Ability), which enables [Interacting](screenplay-pattern.md#Interaction)
with `protractor.browser` object and therefore with the web interface of the application.

Why do we need this indirection here? Why not use the global `protractor.browser` object directly
in our code? First of all, making the dependency on `protractor.browser` explicit makes our code obvious to the reader,
secondly - it enables multi-browser testing of applications like chat systems, workflow systems or multi-player games.
We'll talk about it more in future articles.

:bulb: **PRO TIP:** Thanks to the Abilities, you can teach the Actors to use different interfaces of your system. For example,
you could imagine using a REST API to set up the test data,
web UI to perform the test and maybe then FTP to a server to see if the image was correctly uploaded.

Let's update the Cucumber step definitions to include our new code:

```typescript
// features/step_definitions/todo_user.steps.ts

import { Actor } from 'serenity-js/lib/screenplay';
import { BrowseTheWeb } from 'serenity-js/lib/screenplay-protractor';

import { protractor } from 'protractor/globals';

// ...

export = function todoUserSteps() {

    let actor: Actor;

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string) => {

        actor = Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));

        return actor.attemptsTo(
            Start.withATodoListContaining(listOf(items))
        );
    });

    // ...
};
```

Now that James has the Ability to interact with the application, it's time to use it.

Let's wire up the `Start` Task first and make it do something useful, opening the browser and navigating
to the application could be a good start:

```typescript
// ...

import { Open } from 'serenity-js/lib/screenplay-protractor';

export class Start implements Task {

    // ...

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Open.browserOn('/examples/angularjs/'),
            ...this.addAll(this.items)                          // ``...` is a spread operator,
        );                                                      // which converts a list to vararg
    }

    // ...
}
```

If you've been coding along, you can see for yourself that the browser is really being used here
to navigate to the TodoMVC app by running `npm test`:

```
λ ~/serenity-js-getting-started/ npm test
```

How did that work?

`Open` is an [`Interaction`](screenplay-pattern.md#Interaction), which means that is uses an `Ability`,
in this case to `BrowseTheWeb`, to interact with the system.

`Open` is one of the
[Interactions that ship with Serenity/JS](https://github.com/jan-molak/serenity-js/tree/master/src/serenity-protractor/screenplay/interactions).

## Adding items

Now that we can open the browser and navigate to the application it's time to add some items to the list.

As this interaction requires us to enter some text into the text field and hit the enter key,
we can use another built-in Interaction - `Enter`:

```typescript
// src/screenplay/tasks/add_a_todo_item.ts

import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Enter } from 'serenity-js/lib/screenplay-protractor';

import { protractor } from 'protractor/globals';

import { TodoList } from '../ui/todo_list';

export class AddATodoItem implements Task {

    static called(itemName: string) {
        return new AddATodoItem(itemName);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Enter.theValue(this.name)                       // enter the value of the item name
                .into(TodoList.What_Needs_To_Be_Done)       // into a "What needs to be done" field
                .thenHit(protractor.Key.ENTER)              // then hit enter...
        );
    }                                                       // see? we didn't even need this explanation!

    constructor(private itemName: string) {
    }
}
```

There's one thing missing though, we haven't defined what `TodoList.What_Needs_To_Be_Done` means. Let's do this next:

```typescript
// src/screenplay/ui/todo_list.ts

import { Target } from 'serenity-js/lib/screenplay-protractor';
import { by } from 'protractor/globals';

export class TodoList {
    static What_Needs_To_Be_Done = Target.the('"What needs to be done?" input box')
                                         .located(by.id('new-todo'));
}

```

The code above is a prime example of how simple "page objects" will get when you start using the Screenplay Pattern!

Another thing that you've probably noticed is the `Target` object.
A `Target` is a light-weight wrapper around Protractor and WebDriver `Locators`.
`by.id('new-todo')` represents such a locator, identifying an input field by its `id` attribute:

```html
<input id="new-todo" placeholder="What needs to be done?" ng-model="newTodo" ng-disabled="saving" autofocus="" />
```

The difference between a `Target` and a `Locator` is that a `Target` can be given a meaningful description,
such as `"What needs to be done?" input box` or `Default payment method` etc.
This helps to generate narrative reports we'll talk about in the next tutorial. It also helps with diagnosing application
failures.

If you run the test now you'll notice that both the first and the second step of our original scenario
have now started to work and interact with the application, adding items to the Todo List:

```
λ ~/serenity-js-getting-started/ npm test
```

:bulb: Because we've designed our test system from outside-in,
composing high-level Tasks such as `Start` from lower-level ones,
such as `AddATodoItem`, we only had to implement the change in one place.

## Asking the right Questions

Our test scenario will be much more useful when we add an assertion to it.
What we'll do next is check if the items are getting added correctly to the list.

In order to verify the state of the application, an Actor can ask [Questions](screenplay-pattern.md#Question):

```typescript
// features/step_definitions/todo_user.steps.ts

export = function todoUserSteps() {

    let actor: Actor;

    // ...

    this.Then(/^.* todo list should contain (.*?)$/, (items: string) => {
        return expect(actor.toSee(TodoListItems.Displayed)).eventually.deep.equal(listOf(items));
    });
};
```

A [Question](screenplay-pattern.md#Question) is similar to an [Interaction](screenplay-pattern.md#Interaction),
as it uses the Actor's Ability to interact with the system.

When the Actor answers a Question, it returns a [Promise](https://promisesaplus.com/),
which resolves to a value, such as a string of text or a number, which then can be asserted on.
That's why in the example above we could use `Actor.toSee(question)` together with [chai.js](http://chaijs.com/)
and [chai-as-promised](https://github.com/domenic/chai-as-promised).

There are several [Questions that ship with Serenity/JS](https://github.com/jan-molak/serenity-js/tree/master/src/serenity-protractor/screenplay/questions)
which you can use in your test scenarios.

Right now we'll use `Text`,
which returns the text value of an element - `Text.of()` or elements - `Text.ofAll()`
identified by a `Target`:

```typescript
// src/screenplay/questions/todo_list_items.ts

import { Text } from 'serenity-js/lib/screenplay-protractor';

import { TodoList } from '../ui/todo_list';

export class TodoListItems {
    static Displayed = Text.ofAll(TodoList.Items);
}
```

And the Target:

```typescript
// src/screenplay/ui/todo_list.ts

import { Target } from 'serenity-js/lib/screenplay-protractor';
import { by } from 'protractor/globals';

export class TodoList {
    static What_Needs_To_Be_Done = Target.the('"What needs to be done?" input box')
                                         .located(by.id('new-todo'));

    static Items                 = Target.the('List of Items')
                                          .located(by.repeater('todo in todos'));
}
```

Same as with the Abilities, Tasks and Interactions, you can also define custom Questions
and we'll talk about the ways to do that in future articles.

## Getting WebDriver and Cucumber in sync

There's one more thing we need to cover.

WebDriver's JavaScript API is entirely asynchronous.
However, in an effort to make working with asynchronous calls easier for developers,
WebDriver implements its own [Promise Manager](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs#understanding-the-promise-manager),
also known as the [Control Flow](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html).

What this means is that any interaction with a WebDriver JavaScript API (such as clicking a button or opening a website)
schedules an asynchronous operation using WebDriver's internal mechanism and returns a `webdriver.Promise`,
rather than the standard [ES6 Promise](https://promisesaplus.com/). Since Cucumber.js and many other tools such as
[Chai.js](https://github.com/domenic/chai-as-promised/issues/160) are not WebDriver-aware (nor they should be),
we need to reconcile the two worlds.

To do this, call the Serenity/JS WebDriver Synchroniser in your `cucumber_hooks.ts` file:

```typescript
// features/cucumber_hooks.ts

import { protractor } from 'protractor/globals';
import * as serenity from 'serenity-js/lib/serenity-cucumber';

export = function () {

    serenity.synchronise(this, protractor.browser.driver.controlFlow());
};
```

You can run the test again and see the scenario succeed:

```
λ ~/serenity-js-getting-started/ npm test
```

## Before you go

To see what happens when a scenario fails, you can add a new one to the feature file and call `npm test` again:

```gherkin
# features/add_new_items.feature

# ...

  Scenario: Adding an item and failing
    Given that James has a todo list containing Walk the dog
     When he adds Buy some cereal to his list
     Then his todo list should contain Herd the cats, Buy a cake
```

This execution should result with a message notifying you that the test has failed, accompanied by a lengthy stack trace.

As reading through stack traces is not necessarily the most efficient way to diagnose failures,
the next tutorial will focus on generating narrative, illustrated and meaningful reports of our interaction with the app.

## Next

[From Scripts to Serenity: Making the reports speak for themselves](from-scripts-to-serenity-reporting-making-the-tests-speak-for-themselves.md)

---

### Your feedback matters!

Do you find Serenity/JS useful? Give it a star! &#9733;

Found a typo or a broken link? Raise [an issue](https://github.com/jan-molak/serenity-js/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

If you're interested in a commercial license, training, support or bringing your team up to speed with modern software
development practices - [please get in touch](https://janmolak.com/about-the-author-e45e048661c#.kxqp57qn9).
