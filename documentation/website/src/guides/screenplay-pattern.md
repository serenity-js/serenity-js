---
title: The Screenplay Pattern
layout: default.hbs
---
# The Screenplay Pattern

The Screenplay Pattern is a [user-centred](https://en.wikipedia.org/wiki/User-centered_design) model,
which helps you shift the focus of automated acceptance tests from low-level interactions with the system
to thinking about who the users of your system are,
what is that they want to achieve by their interaction with your system
and how exactly they're going to do it.

The Serenity/JS implementation of the Pattern focuses on making developers and testers more productive,
by making acceptance test faster to write, cheaper to maintain and easier to scale to multiple projects and teams.

The Screenplay pattern is new to JavaScript but has been around for a while in various forms.
It was originally proposed by Antony Marcano in 2007. You can learn more about the origin and history of this model
in ["Page Objects Refactored: SOLID Steps to the Screenplay Pattern"](https://dzone.com/articles/page-objects-refactored-solid-steps-to-the-screenp)
(by Antony Marcano, Andy Palmer, John Ferguson Smart and Jan Molak) and [at the end of this article](#the-history).

## Background

## Screenplay by example

_Examples presented in this section are based on the project described in [Beyond Page Objects: Next Generation Test Automation with Serenity and the Screenplay Pattern](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay)._

The best way to illustrate the Screenplay pattern is through a practical example.
Suppose we are writing some tests for a Todo application like the one you can find
on the [TodoMVC site](http://todomvc.com/examples/angularjs/#/).
Consider the following scenario:

```gherkin
Feature: Add new items to the todo list

  As James (the just-in-time kinda guy)
  I want to capture the most important things I need to do
  So that I don’t leave so many things until the last minute

  Scenario: Adding the first todo item

    Given that James has an empty todo list
     When he adds Buy some milk to his list
     Then his todo list should contain Buy some milk
```

Let's think about this scenario from a couple of different angles:

* **Who** is this for? What **Role** do they play?
* **Why** are they here and what outcome do they hope for? What is their **Goal**?
* **What** will they need to do to achieve their goal? What **Tasks** do they need to perform?
* **How** will they complete each task? How will their specific **Interactions** with the system look like?

### Role

We believe that the feature described in the above scenario will be useful to a "just-in-time kinda guy". "James" is a [persona](https://articles.uie.com/goodwin_interview/) that we are using to understand this specific role.

### Actor

Each [Role](#role) we discover needs an Actor to play it.
In Serenity/JS, an Actor is defined as follows:

``` typescript
let james = Actor.named('James');
```

Such Actor can perform [Tasks](#task):

``` typescript
james.attemptsTo(
    Start.withAnEmptyTodoList(),
    AddATodoItem.called('Buy some milk')
)
```

and ask [Questions](#question) about the state of the application in order to verify its correctness:

``` typescript
expect(james.toSee(TodoListItems.Displayed)).eventually.equal([ 'Buy some milk' ]);
```

### Goal

The Goal of an Actor is represented by the subject of the scenario:

```gherkin
Scenario: Adding the first todo item
```

Here, James should be able to add the first todo item to his list.

### Task

Tasks represent high-level activities that an Actor needs to perform in order to achieve their Goal.

Tasks are named using the vocabulary of
the [Problem Domain](http://blog.mattwynne.net/2013/01/17/the-problem-with-solutions/), such as:
"Pay with a default credit card", "Book a plane ticket" or "Add item to the basket".

A good example of a Task in our scenario could be to `AddATodoItem.called('Buy some milk')`,
which mapped to a Cucumber.js step definition would look like this:

```typescript
this.When(/^he adds (.*?) to his list$/, (name: string) => {
    return james.attemptsTo(
        AddATodoItem.called(itemName)
    );
});
```

### Interaction

An Interaction is a low-level activity directly exercising the [Actor](#actor)'s [Ability](#ability) to interact
with a specific external interface of the system - such as a website, a mobile app or a web service.

Interactions are named using the vocabulary of the
[Solution Domain](http://blog.mattwynne.net/2013/01/17/the-problem-with-solutions/), such as:
"Click a button", "Enter password into a form field" or "Submit JSON request".

Actors should not exercise Interactions directly in the Cucumber step definitions. Instead, a group of one of more
Interactions should be encapsulated and represented as a [Task](#task). For example:

```typescript

export class Login implements Task {

    performAs(actor: PerformsTasks) {

        // The Login Task is composed of three Interactions:

        return actor.attemptsTo(
            Enter.theValue('James').into(LoginForm.Username_Field),
            Enter.theValue('correct-horse-battery-staple').into(LoginForm.Password_Field),
            Click.on(LoginForm.Submit_Button)
        );
    }
}

```

### Question

Similarly to an [Interaction](#interaction), a Question directly exercises [Actor](#actor)'s [Ability](#ability) to interact
with a specific external interface of the system - such as a website, a mobile app or a web service.

Asking a Question results in a [promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that is eventually resolved to a specific value or a list of values.

Consider a "web question" used in the example scenario:

``` typescript
export class TodoListItems {
    static Displayed = Text.ofAll(TodoList.Items);
}
```

Calling `Text.ofAll(...)` returns a Question implementing the `Question<string[]>` interface.

When such question is applied to `TodoList.Items` defined as:

``` typescript
export class TodoList {
    static Items = Target.the('List of Items').located(by.repeater('todo in todos'));
}
```

it eventually resolves to a list of strings, representing the text of the web elements matched by the `TodoList.Items`
Target.

All this means that we can have a Cucumber step defined as follows:

``` typescript
this.Then(/^.* todo list should contain (.*?)$/, (expectedItems: string) => {
    let answer = james.toSee(TodoListItems.Displayed);

    return expect(answer).to.eventually.equal(expectedItems);
});
```

or simply:

``` typescript
this.Then(/^.* todo list should contain (.*?)$/, (expectedItems: string) => {
    return expect(james.toSee(TodoListItems.Displayed)).eventually.equal(expectedItems);
});
```

### Ability

In order to interact with the system, an Actor needs Abilities, which encapsulate interface-specific clients.

Those clients could be a web browser, a web service client, a mobile device driver and so on.

`BrowseTheWeb` is a good example of an Ability that ships with Serenity/JS. To assign the Ability to an Actor:

``` typescript
let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser);
```

Once the Actor has the Ability, it can be used in an [Interaction](#interaction),
such as `Click.on(LoginForm.Submit_Button)`:

``` typescript
export class Click implements Interaction {
    public static on(target: Target): Click {
        return new Click(target);
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).click();
    }

    constructor(private target: Target) { }
}
```

or a [Question](#question), such as `Text.of(Address.Post_Code)`:

``` typescript
export class Text implements Question<string> {

    public static of(target: Target): Text {
        return new Text(target);
    }

    answeredBy(actor: UsesAbilities): PromiseLike<string[]> {
        return BrowseTheWeb.as(actor).locate(this.target).getText();
    }

    constructor(private target: Target) {
    }
}
```

## The Model

![Serenity BDD Scenario Report with Interactions only](images/screenplay_pattern_model.png)
_The Screenplay Pattern domain model,
from ["Designing SOLID Actors"](https://janmolak.com/serenity-bdd-and-the-screenplay-pattern-27819d0db780#.j25mfpfxn)
by Jan Molak_

## The History

It all started at the Agile Alliance Functional Testing Tools workshop (AAFTT) back in 2007.

["In praise of abstraction"](http://www.developertesting.com/archives/month200710/20071013-In%20Praise%20of%20Abstraction.html), a talk given by Kevin Lawrence, inspired [Antony Marcano](http://antonymarcano.com/Site/Home.html)
to implement a fluent DSL based on Kevin's idea to use the language of Interaction Designers
to model the layers of abstraction in an acceptance test.
With the help of [Andy Palmer](http://andypalmer.com), this fluent DSL is what became
[JNarrate](https://bitbucket.org/testingreflections/jnarrate/wiki/Home) a year later (2008).

In the late 2012, Antony and Andy joined forces with [Jan Molak](https://janmolak.com/).
Their experiments with Kevin's model, combined with a desire to address problems with shortcomings of
the [PageObject Pattern](https://github.com/SeleniumHQ/selenium/wiki/PageObjects)
and apply [SOLID design principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design))
to acceptance testing is what [became known in 2013](http://www.slideshare.net/RiverGlide/a-journey-beyond-the-page-object-pattern)
as [screenplay-jvm](https://github.com/screenplay/screenplay-jvm).

In 2015, when Antony, Andy and Jan started working with [John Ferguson Smart](http://johnfergusonsmart.com/),
what became known as the Screenplay Pattern found its way into [Serenity BDD](http://serenity-bdd.info),
a popular acceptance testing library written in Java.

It's 2016 now and you can use both the Screenplay Pattern and the powerful Serenity BDD reports on JavaScript
projects thanks to Serenity/JS.

---

### Your feedback matters!

Do you find Serenity/JS useful? Give it a star! &#9733;

Found a typo or a broken link? Raise [an issue](https://github.com/jan-molak/serenity-js/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

[![Analytics](https://ga-beacon.appspot.com/UA-85788349-2/serenity-js/docs/screenplay-pattern.md?pixel)](https://github.com/igrigorik/ga-beacon)