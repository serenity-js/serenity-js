# From Scripts to Serenity: Speaking the right language

As applications get more complex, it becomes a priority for test automation systems to capture and clearly express business intent, to ensure that the most important functionality of the system is sufficiently covered. They need to be easy to scale to multiple projects and teams, and all this while keeping maintenance costs to a minimum.

[Protractor](https://github.com/angular/protractor) is a leading test automation framework for [Angular](https://angularjs.org/) applications. However, the low-level APIs it provides are not in themselves sufficient to design test automation systems that could meet the requirements of a modern business. In this article, we look at the limitations of using Protractor APIs directly in your tests, and at Page Objects, a commonly-proposed way to address these limitations while introducing some new ones.

We will be illustrating this using the [TodoMVC app](http://www.todomvc.com/examples/angularjs/), a simple demo application that lets you manage a todo list in a number of JavaScript frameworks.

## Expressing test scenarios in business language

More and more teams nowadays are adopting a more collaborative approach to defining requirements, using tools like [Cucumber](https://github.com/cucumber/cucumber-js) to define executable acceptance criteria in a more human-readable form.

[Cucumber scenarios](https://github.com/cucumber/cucumber/wiki/Given-When-Then) are typically expressed using a high-level business language, so you won't see any mentions of clicking on buttons or entering values into fields. This helps the scenario play its role as a [collaboration and documentation tool](https://cucumber.io/blog/2014/03/03/the-worlds-most-misunderstood-collaboration-tool), without getting too tied down to how the application is implemented under the hood.

For example, imagine that you need to write an acceptance test
of the [TodoMVC app](http://todomvc.com/examples/angularjs/) that describes how a user might add a new task to the todo list. Using Cucumber, you might write something like this:

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

High-level scenarios like the one above tend to change less frequently than the screens, fields and buttons used to implement them. This separation helps to keep the scenarios stable and the maintenance costs lower.

For a Cucumber scenario to become an automated test, we need to implement the [Given/When/Then](https://github.com/cucumber/cucumber/wiki/Step-Definitions) steps in the scenario using a programming language such as JavaScript.

## A Test Script

The most common implementation would follow what we like to call "the scripting approach".

In this style of implementation, every Cucumber step is directly mapped to a series of calls
to low-level Protractor/WebDriver APIs:

One common approach would be to implement each step as a "test script" that makes a series of calls to low-level Protractor/WebDriver APIs:

```typescript
import { browser, by, element, protractor } from 'protractor';

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

The code shown here does separate the business steps defined in the Given/When/Then statements from the test automation code. But the implementation is not ideal, for a number of reasons:

- There is a lot of duplication - for example, we add tasks to the list in both the Given and the When step definitions.
- The low-level, detail-focused code makes it hard to see at a glance if the step definitions are actually doing their job correctly. It also makes it impossible for a non-technical business person to read and verify the logic.
- Even small changes to the screens tend to have [a big impact](https://sourcemaking.com/refactoring/smells/shotgun-surgery) on the test code, making it difficult for the tests to keep pace with the application.
- When a test suite like this expands, developers need to spend more and more time tackling the widespread duplication and keeping the test suite up to date with the application, which makes it harder and harder to add new tests for new functionality.

What we need is a way to encapsulate and reuse some of the common parts.

## First step in the journey: the Page Object(s) Pattern

As Selenium WebDriver became more popular in the late 2000s, and test suites began to grow bigger, developers and testers new to browser-based test automation needed a way to address these issues. In response to this, the [Selenium team](http://docs.seleniumhq.org/) proposed
the [Page Object Pattern](http://docs.seleniumhq.org/docs/06_test_design_considerations.jsp#page-object-design-pattern). This simple pattern models the user interface in terms of pages, where each page is represented by a distinct class encapsulating both the definition of the page structure and the interactions that a user can perform on that page.

_It is worth noting that the original Page Object Pattern was later
[refined by Martin Fowler](http://martinfowler.com/bliki/Page Object.html), who proposed that instead of thinking of
the entire application as a set of pages, each page should be considered in terms of smaller page objects or "widgets"
that the page contained. The implementation below uses that refined version, as it makes it slighted slightly simpler._

Let's refactor the code from the previous example using the Page Objects pattern:

```typescript
import { browser, by, element, protractor } from 'protractor';

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

As you can see above, some of the calls to the low-level Protractor APIs, such as `element` and `element.all`,
have been extracted into a Page Object representing the `TodoList`. This change brings a number of improvements in readability and ease of maintenance:
- We can start to implement the step definitions using business terms like `addATodoItemCalled` and `displayedItems`, rather than using Protractor calls like `sendKeys`.
- We've introduced two [meaningful variables](http://refactoring.com/catalog/extractVariable.html) representing
the elements of the `TodoList` we would like to interact with: `What_Needs_To_Be_Done` and `Items`.
- We've also avoided the duplication we saw previously between the `Given` and the `When` step definitions, as both of these now call the `addATodoItemCalled` method of the `TodoList` Page Object.

Since a Page Object works with two distinct concepts, there are two reasons why it might need to be changed. The page structure may have changed, or a test might need to describe a new user interaction with that page. In both cases, deliberate or unintended changes to the page object carry a risk of having a negative impact on existing tests that use it. The more interactions and page elements a given page object describes, the higher the likelihood of the problem occurring.

Page Objects also introduce a more subtle problem. As the name implies, Page Objects reason at the level of the user interface, in terms of fields, buttons and links that the user manipulates. This affects the way you think about the application too. Instead of placing the primary focus on **what** the user needs to do with the application, Page Objects lead you to focus on **how** the user interacts with individual pages. As a result, the tests become tightly coupled to the user interface, making them more brittle and more likely to be affected by UI changes.

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

Which leads us onto the next article.

## Next

[From Scripts to Serenity: Writing what you'd like to read](from-scripts-to-serenity-getting-started-writing-what-you-would-like-to-read.md)

---

### Your feedback matters!

Do you find Serenity/JS useful? Give it a star! &#9733;

Found a typo or a broken link? Raise [an issue](https://github.com/jan-molak/serenity-js/issues?state=open)
or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

If you're interested in a commercial license, training, support or bringing your team up to speed with modern software
development practices - [please get in touch](https://janmolak.com/about-the-author-e45e048661c#.kxqp57qn9).

[![Analytics](https://ga-beacon.appspot.com/UA-85788349-2/serenity-js/docs/from-scripts-to-serenity-introduction-speaking-the-right-language.md?pixel)](https://github.com/igrigorik/ga-beacon)