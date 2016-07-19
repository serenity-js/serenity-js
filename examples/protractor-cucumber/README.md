# Exploration by Example: Serenity.js, Protractor and Cucumber.js

## The big picture

The goal of this tutorial is to demonstrate how Serenity.js and the Screenplay Pattern
can help you create high quality executable specifications, reduce the maintenance overhead and improve code reuse
in the context of a Cucumber.js/Protractor test suite exercising a deployed, browser-based application such as the popular
[TodoMVC angular.js app](http://todomvc.com/examples/angularjs/).

This tutorial comes in two flavours:
- [A Guided Tour](#a-guided-tour) - shows you around the structure of an existing project. Good if you're in a hurry and want a general understanding of what's where and why.
- [Do It Yourself](#do-it-yourself) - a deep dive into the code so expect to get your hands dirty! Great if you like learning by doing, and a good next step after taking [the Guided Tour](#a-guided-tour)

## A Guided Tour

### Capabilities and Features

The most prominent thing you'll notice on any [Cucumber](https://github.com/cucumber/cucumber-js) project
is the `.feature` files written using the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin).
They're typically located under the `features` directory, with each `.feature` file containing a number of Scenarios
describing a given Feature of your application.

```
├── features        <- here's where all the .feature files would typically go
├── ...
└── ...
```

A popular way of organising those files is to put them all directly under the `features` directory.
This strategy however can quickly become unwieldy when the project grows and more `.feature` files are added.

For this reason, Serenity.js allows you to optionally organise `.feature` files by _Business Capability_ they enable.

> Within a project, we deliver the stakeholder’s goals by providing people and the system with different _capabilities_.
> The capabilities show us how we will achieve the goals within the scope of a particular project, but aren't concrete;
> it still doesn't matter how we achieve the capabilities.
> The word “capability” means to be able to do something really well. - _Liz Keogh, [Goals vs. Capabilities](https://lizkeogh.com/2014/06/06/goals-vs-capabilities/)_

Other than improving the maintainability of the codebase and making it easier to navigate,
grouping features by capability has one more advantage. It helps Serenity produce more meaningful test reports
telling you not only what tests have been executed, but more importantly, what requirements have been tested.

To organise Features by Capability, we group them into Capability-specific directories:

```
├── features
│   ├── record_todos                <- a Business Capability
│   │   ├── add_new_items.feature       <- a Feature enabling the Capability
│   │   └── ...
│   └── maintain_my_todo_list
└── ...
```

### Features and Steps

A [typical Cucumber feature file](features/record_todos/add_new_items.feature) looks more or less like this:

```gherkin
Feature: Add new items to the todo list                             <- Name of the feature

  In order to avoid having to remember things that need doing       <- Narrative, often in a form
  As a forgetful person                                                of a User Story
  I want to be able to record what I need to do
  in a place where I won't forget about them

  Scenario: Adding an item to an empty list                         <- Scenario, describing the expected
    Given that James has an empty todo list                            behaviour of the system once
    When he adds 'Buy some milk' to his list                           the feature is implemented
    Then 'Buy some milk' should be recorded in his list             <- Steps such as this one make up a Scenario
```

Of course, simply writing Gherkin Scenarios in plain English is not enough to make them executable.
We need Cucumber to map the Given/When/Then Steps to [Step Definitions](https://github.com/cucumber/cucumber/wiki/Step-Definitions),
such as the ones below written in [TypeScript](https://www.typescriptlang.org/) with [`cucumber-tsflow`](https://github.com/timjroberts/cucumber-js-tsflow):

```typescript
// features/todo_user.steps.ts

@binding()
class TodoUserSteps {

    @given(/^.*that (.*) has an empty todo list$/)              // matches "Given that James has an empty todo list"
    starts_with_an_empty_list (name: string) {
        // [...]
    };

    @when(/^s?he adds '(.*?)' to (?:his|her) list$/)            // matches "When he adds 'Buy some milk' to his list"
    adds (itemName: string) {
        // [...]
    }

    @then(/^'(.*?)' should be recorded in his list$/)           // matches "Then 'Buy some milk' should be recorded in his list"
    should_see_todo_list_with_just_one (item: string) {         // and delegates to should_see_todo_list_with_following
        return this.should_see_todo_list_with_following(item);
    }

    @then(/^.* todo list should contain (.*?)$/)
    should_see_todo_list_with_following (items: string) {
        // [...]
    }

    // [...]
}

```

As you have probably noticed, the step definitions are stored
in the [`features/todo_user.steps.ts`](features/todo_user.steps.ts) file.

Again, it helps to improve the maintainability of your codebase if steps specific to a given type of user
are kept together. This means that we could have `admin.steps.ts`, `moderator.steps.ts`, and so on.

### Steps and Activities


## Do It Yourself