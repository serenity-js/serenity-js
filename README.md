# screenplay-js demo

This project demonstrates example implementation of the [Screenplay Pattern](dzone.com/articles/page-objects-refactored-solid-steps-to-the-screenp) using [Typescript](https://www.typescriptlang.org/), as well as integration of the following libraries:
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [Cucumber-tsflow](https://github.com/timjroberts/cucumber-js-tsflow)
- [Protractor](http://www.protractortest.org/#/)
- [Chai](http://chaijs.com/)

It executes the tests against an Angular 1.x application located at [todomvc.com/examples/angularjs/](http://todomvc.com/examples/angularjs/), but can as well work with Angular 2.

## Setting up

First, please make sure that you have the Chrome browser, as well as [node.js and npm](https://nodejs.org/en/) installed:

```
$> node --version
v4.4.5

$> npm --version
2.15.5
```

Install the required dependencies (you only need to do this once):

```
npm install
```

## Running the project

To run the cucumber/protractor tests, execute:

```
npm test
```

It should produce a result similar to the below:

```
[03:03:09] I/direct - Using ChromeDriver directly...
[03:03:09] I/launcher - Running 1 instances of WebDriver
Feature: Add new items to the todo list


  In order to avoid having to remember things that need doing
  As a forgetful person
  I want to be able to record what I need to do in a place where I won't forget about them

  Scenario: Adding an item to an empty list             # acceptance/features/record_todos/add_new_items.feature:7
    Given that James has an empty todo list             # node_modules/cucumber-tsflow/dist/BindingDecorator.js:127
    When he adds 'Buy some milk' to his list            # node_modules/cucumber-tsflow/dist/BindingDecorator.js:135
    Then 'Buy some milk' should be recorded in his list # node_modules/cucumber-tsflow/dist/BindingDecorator.js:143

  Scenario: Adding an item to a list with other items                                 # acceptance/features/record_todos/add_new_items.feature:12
    Given that James has a todo list containing Buy some cookies, Walk the dog        # node_modules/cucumber-tsflow/dist/BindingDecorator.js:127
    When he adds 'Buy some cereal' to her list                                        # node_modules/cucumber-tsflow/dist/BindingDecorator.js:135
    Then his todo list should contain Buy some cookies, Walk the dog, Buy some cereal # node_modules/cucumber-tsflow/dist/BindingDecorator.js:143

2 scenarios (2 passed)
6 steps (6 passed)
0m04.803s
[03:03:19] I/launcher - 0 instance(s) of WebDriver still running
[03:03:19] I/launcher - chrome #01 passed
```

## Project structure

This example is loosely based on the [Serenity Web TodoMVC](https://github.com/serenity-bdd/serenity-web-todomvc-journey/) Java implementation, follows similar package structure and provides similar examples.

Here's what you'll find in this repository:

```
acceptance
├── features
│   ├── record_todos                  <= feature related to recording things we need to remember
│   │   ├── add_new_items.feature       <- example feature file
│   │   └── todo_user.steps.ts          <- cucumber.js glue
│   └── screenplay                    <= project-specific Screenplay Pattern components
│       ├── questions                   <- questions we can ask about the state of the system
│       │   └── todo_list_items.ts
│       ├── tasks                       <- high-level, business-focused Tasks
│       │   ├── add_a_todo_item.ts
│       │   ├── add_todo_items.ts
│       │   └── start.ts
│       └── user_interface              <- UI structure definition
│           └── todo_list.ts
├── serenity_screenplay                 <- example, basic implementation of the Screenplay Pattern
│   ├── abilities
│   │   └── ability.ts
│   ├── actions                         <- low-level, interface-focused Actions
│   │   ├── click.ts
│   │   ├── enter.ts
│   │   └── open.ts
│   ├── actor.ts
│   ├── index.ts
│   ├── performable.ts
│   └── performs_tasks.ts
└── text_functions.ts
```

## Where to next?

Have a look at the `todo_user.steps.ts`, you'll notice that they're defined as follows:

```typescript
  @when(/^s?he adds '(.*?)' to (?:his|her) list$/)    <- that's the cucumber-tsflow annotation 
                                                          that binds a gherkin step with a Typescript method
  public adds (item_name: string) {
  
      this.james.attemptsTo(                          <- and that's the Screenplay pattern in practice:
          AddATodoItem.called(item_name)                 James (the Actor) attempts to perform a Task and AddATodoItem
      );
  }
```

And here's an example assertion:

```typescript
  @then(/^.* todo list should contain (.*?)$/)
  public should_see_todo_list_with_following (items: string) : Promise<void> {      <- it returns a promise, so that cucumber 
                                                                                       can synchronise it
      
      return expect(TodoListItems.displayed()).to.eventually.eql(listOf(items));    <- and uses chai-js to ensure that the list
                                                                                       of displayed items is what we expected to see
  }
```

---

Hope that you found it useful!

Jan
