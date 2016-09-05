# From Scripts to Screenplay: Speaking the right language

Imagine that you need to write an acceptance test
of the [TodoMVC app](http://todomvc.com/examples/angularjs/) and verify the following scenario:

```gherkin
Feature: Add new items to the todo list

  In order to avoid having to remember things that need doing
  As a forgetful person
  I want to be able to record what I need to do in a place where I won't forget about them

  Scenario: Adding an item to a list with other items

    Given that James has a todo list containing Buy some cookies, Walk the dog
     When he adds Buy some cereal to his list
     Then his todo list should contain Buy some cookies, Walk the dog, Buy some cereal
```

This is a perfectly valid [cucumber scenario](https://github.com/cucumber/cucumber/wiki/Given-When-Then)
that clearly expresses the intent using
a business-friendly, [Domain-Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language).

Before we talk about how this scenario could be implemented using the Screenplay Pattern,
let's have a quick look at some of the more typical implementations.

## A Test Script

The most common implementation would follow what I like to call "the scripting approach".

In this style of implementation, every Cucumber step is directly mapped to a series of calls
to low-level Protractor/WebDriver APIs:

```typescript
import { browser, by, element, protractor } from 'protractor/globals';

export = function todoUserSteps() {

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string, callback: Function) => {

        browser.get('http://todomvc.com/examples/angularjs/');
        browser.driver.manage().window().maximize();

        listOf(items).forEach(item => {
            element(by.id('new-todo')).sendKeys(item, protractor.Key.ENTER);
        });

        browser.driver.controlFlow().execute(callback);
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, (itemName: string, callback: Function) => {
        element(by.id('new-todo'))
            .sendKeys(itemName, protractor.Key.ENTER)
            .then(callback);
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items: string, callback: Function) => {
        expect(element.all(by.repeater('todo in todos')).getText())
            .to.eventually.eql(listOf(items))
            .and.notify(callback);
    });
};
```
_In the above listing, `expect` is a reference to the [`chai-as-promised`](https://github.com/domenic/chai-as-promised)
[`expect` interface](http://chaijs.com/guide/styles/#expect) and `listOf` is a helper function
that converts a comma-separated string coming from cucumber into a list of strings.
The example is implemented in [TypeScript](https://www.typescriptlang.org/), so if you're not familiar
with it, you might want to watch
Anders Hejlsberg's ["Introducing TypeScript"](https://channel9.msdn.com/posts/Anders-Hejlsberg-Introducing-TypeScript)._


As you can see above, the code resulting from the "test script" style of implementation is not much different
to what a so called
"script-less" or a ["record/replay" test tool](https://en.wikipedia.org/wiki/Graphical_user_interface_testing) would generate.

It has the same shortcomings too:
- there's **no Domain-Specific Language present** past the Cucumber layer. This makes it difficult to understand
what business functionality is being tested and impossible for a non-technical business person to verify
the correctness of the implementation logic.
- **very high code duplication** - as there's no [abstraction](https://en.wikipedia.org/wiki/Abstraction_layer)
to encapsulate the interactions with the [System Under Test](https://en.wikipedia.org/wiki/System_under_test),
the low-level API calls get duplicated across the Cucumber steps.
- **tight coupling** - every Cucumber step is [tightly coupled](https://en.wikipedia.org/wiki/Coupling_(computer_programming))
to the implementation of the System Under Test - both in terms of how the User Interface is structured (the `by.*` selectors)
and how the test interacts with it - `sendKeys`, `click`, etc.
Imagine what would happen if the user journey changed and it was now required to click a button instead of pressing `[Enter]`? How many steps would be affected?
- **impossible to maintain effectively** - all the above points contribute to a huge maintenance overhead,
making it impossible for a code base structured using the "test script" style to be maintained effectively
- **impossible to scale** - because such code base is impossible to maintain even with a handful of developers,
it's also impossible to scale horizontally (by adding more people to the team).

## The training wheels of the Page Object(s) Pattern

In order to help developers and testers new to browser-based test automation address some of the above problems,
the [Selenium team](http://docs.seleniumhq.org/) proposed
the [Page Object Pattern](http://docs.seleniumhq.org/docs/06_test_design_considerations.jsp#page-object-design-pattern).
This simple pattern recommends to think of the System Under Test as a set of "pages" and to model those pages
as distinct classes, encapsulating both the locators representing elements on such page as well as the actions that
a user can perform there.

_It's worth noting that the original Page Object Pattern was later
[refined by Martin Fowler](http://martinfowler.com/bliki/Page Object.html) to propose that instead of thinking of
the entire application as a set of pages, each page should be considered in terms of smaller page objects or "widgets"
that it's composed of._

_The below implementation follows Martin Fowler's version of the Page Objects Pattern.
An implementation following the original would result in a more complex page object, also defining the address of the page
and an associated [getter](https://en.wikipedia.org/wiki/Mutator_method)._

_However, even the simpler implementation is enough to demonstrate the shortcomings of using the Page Object(s) pattern
on its own._

Let's refactor the Test Script implementation to follow the Page Objects pattern:

```typescript
import { browser, by, element, protractor } from 'protractor/globals';

class TodoList {
    What_Needs_To_Be_Done = element(by.id('new-todo'));
    Items = element.all(by.repeater('todo in todos'));

    addATodoItemCalled(itemName: string): PromiseLike<void> {
        return this.What_Needs_To_Be_Done.sendKeys(itemName, protractor.Key.ENTER);
    }

    displayedItems(): PromiseLike<string[]> {
        return this.Items.getText();
    }
}

export = function todoUserSteps() {

    let todoList = new TodoList();

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string, callback: Function) => {

        browser.get('http://todomvc.com/examples/angularjs/');
        browser.driver.manage().window().maximize();

        listOf(items).forEach(item => {
            todoList.addATodoItemCalled(item);
        });

        browser.driver.controlFlow().execute(callback);
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, (itemName: string, callback: Function) => {
        todoList.addATodoItemCalled(itemName).then(() => callback());
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items: string, callback: Function) => {
        expect(todoList.displayedItems())
            .to.eventually.eql(listOf(items))
            .and.notify(callback);
    });
};

```

As you can see above, some of the calls to the low-level Protractor APIs, such as `element` and `element.all`
have been extracted into a Page Object representing the `TodoList`.

This allowed to address some of the problems of the Test Script approach, namely:
- we now have a seed of a Domain-Specific Language (`addATodoItemCalled` and `displayedItems` express business intent
better than calling the Protractor API directly)
- we've introduced two [meaningful variables](http://refactoring.com/catalog/extractVariable.html) representing
elements of the `TodoList` we'd like to interact with - `What_Needs_To_Be_Done` and `Items`
- we avoided duplicating the interaction logic between the `Given` and the `When` -
both steps now call the `addATodoItemCalled` method of the TodoList Page Object

However, introduction of the `TodoList` page object caused **four new problems** to appear. The Page Object:
- breaks the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle),
as it describes both the structure of the widget (the locators) as well as the interactions that the widget allows
the user to perform.
- breaks the [Open/Closed Principle](https://en.wikipedia.org/wiki/Open/closed_principle): If we wanted
to handle a new type of interaction, say marking items as complete, we'd have to modify the Page Object class and
change its public api (add new public methods and fields).
- breaks the [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle), as it
defines every single interaction that the widget allows the user to perform, which means that a Cucumber step
has to interact with an object with much richer API than it needs
- breaks the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
as it still depends on Protractor's global variables, such as `element` and `by` (and `browser` if we opted for the
original Page Object Pattern implementation).

The consequence of the Page Objects violating the principles of
[SOLID design](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design))
is that they tend to grow significantly as new functionality gets added, which over time makes them
 **difficult to maintain**.

Even though Page Objects reduce code duplication and encourage reuse across tests within a single project
and a single test suite, the design falls short if we need to enable code reuse across multiple projects and teams.
This of course **affects the scalability**.

Also, the fact that the page object is tightly coupled to Protractor APIs: `element` and `by` -
global functions that are browser instance-specific - makes it impossible to use this design "as is" for multi-browser
testing (chat systems, workflow systems, multi-player games, etc.).

Not to mention that even after [extracting](http://refactoring.com/catalog/extractClass.html) a Page Object,
there's still plenty of low-level Protractor/WebDriver API calls left in the Cucumber steps. They are important as they
deal with managing the browser window and synchronising
WebDriver [Control Flow](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html),
with Cucumber callbacks, but which also cloud the business logic of the implementation.

## Summary

As you can see, even though Protractor and WebDriver are excellent test automation tools, their APIs
are simply too low-level to express intent of the interactions with the system in business terms
and free of implementation noise.

The Page Object(s) Pattern addresses some of the problems, but it falls short if what you want is a test automation
system that's easy to extend, maintain and scale to multiple projects and teams.

So far it looks like the acceptance tests are not speaking the right language and there's an abstraction missing.

Which leads us onto the **next article**:
[Finding the right abstraction](from-scripts-to-serenity-finding-the-right-abstraction.md)

---


### Your feedback matters!

Do you find Serenity/JS useful? Give it a star! &#9733;

Found a typo or a broken link? Raise [an issue](https://github.com/jan-molak/serenity-js/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)
