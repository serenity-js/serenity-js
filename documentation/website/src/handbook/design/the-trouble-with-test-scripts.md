---
title: The trouble with test scripts
layout: handbook.hbs
---

# The trouble with test scripts

Imagine for a moment that we wanted to write some automated acceptance tests
for the [TodoMVC app](http://todomvc.com/examples/angularjs/#/) -&nbsp;a&nbsp;simple web application
that allows its users to manage a to-do list.

To make things a bit more interesting, let's say that the [user story](https://en.wikipedia.org/wiki/User_story)
we want to write an acceptance test for looks as follows:

```plaintext
In order to focus on my outstanding tasks
As a forgetful person
I want to be able to filter my todos to see active items only
```

<img src="/handbook/thinking-in-serenity-js/images/todomvc.gif"
alt="TodoMVC Angular.js app by Christoph Burgdorf, Eric Bidelman, Jacob Mumm and Igor Minar"
style="display: block; margin:0 auto; width:640px;" />

You can probably already guess that to verify this scenario, a tester would need to:
- start with a to-do list containing several items,
- mark one of them as complete,
- filter the list to show active items only,
- ensure that the only items they see are the ones that are still outstanding.

Let's now look at two ways of approaching the task of automating a test scenario that does precisely that.

## A test script

The most common implementation follows what I like to call _the scripting approach_.

A test implemented in this style is characterised by numerous calls to low-level WebDriver or WebDriver-like APIs
and exhibit few or no business-focused abstractions.

Below is an example test following the scripting approach, implemented using raw [Protractor](https://www.protractortest.org/#) and [Jasmine](https://jasmine.github.io/).
Please note, however, that this style is by no means specific to those particular tools as you'll see it often being used with other similar libraries and frameworks:

```javascript
describe('Todo List App', function () {

    it('allows the user to show active items only', async function () {
        // low-level navigation and synchronisation code
        await protractor.browser.get('http://todomvc.com/examples/angularjs/#/');
        await protractor.browser.wait(
                protractor.ExpectedConditions.presenceOf(element(by.css('.new-todo'))),
                2000,
            );
        expect(await protractor.browser.getTitle()).toMatch(/.*TodoMVC$/);

        // duplicated code
        await element(by.css('.new-todo')).sendKeys('Play some guitar');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        await element(by.css('.new-todo')).sendKeys('Read a book');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        await element(by.css('.new-todo')).sendKeys('Write some code');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        // complex XPath locators
        await element(by.xpath(
                `//li[*[@class='view' and contains(.,'Write some code')]]//input[contains(@class,'toggle')]`)
            ).click();

        await element(by.linkText(`Active`))
            .click();

        // a mix of async/await style and Promises
        await element.all(by.css('.todo-list li')).getText()
            .then(items => {
                expect(items).toEqual([
                    'Play some guitar',
                    'Read a book',
                ]);
            });
    });

    afterEach(async () => {
        // clean up code required to avoid state leakage
        await browser.executeScript(`window.localStorage.clear()`);
    });
});
```

The code above "gets the job done" and automates the scenario we talked about.

However, this implementation is far from ideal for a  number of reasons, some of which I've highlighted in the comments in the code sample above:
- There's a lot of duplication.
- The setup and cleanup code is at the same level of abstraction and importance as the main scenario flow, cluttering the test.
- Complex [XPath](https://en.wikipedia.org/wiki/XPath) locators couple the test tightly to the UI and make it susceptible to any changes in its structure.
- Even small changes to the application structure or the user workflow tend to have [a big impact](https://sourcemaking.com/refactoring/smells/shotgun-surgery) on the test code, making it difficult for the tests to keep pace with the application.
- The low-level, detail-focused code makes it hard to see at a glance if the test is actually doing its job correctly. It also makes it impossible for a non-technical business person to read and verify its logic.
- When a test suite like this expands, developers need to spend more and more time tackling the widespread duplication and keeping the test suite up to date with the application. This makes it increasingly hard to add new tests for any new functionality.
- Not to mention that tests like the one above make it virtually impossible to [test-drive the development](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development) of a software system as they're too tightly coupled to the implementation.

As you can probably already tell, I'm not a fan of this approach as it tends to be **a recipe for a maintenance disaster**.

The creator of Selenium WebDriver, [Simon Stewart](https://blog.rocketpoweredjetpants.com/), holds the same view:

> If you have WebDriver APIs in your test methods, You're Doing It Wrong.
>
> Simon Stewart

So let's see what we can do about this sorry state of affairs and find a way to improve our test and encapsulate and reuse some of the common parts.

## The Page Object(s) Pattern

As Selenium WebDriver became more popular in the late 2000s, and test suites began to grow bigger,
developers and testers new to browser-based test automation needed a way to address issues with test scripts.

In response to this need, the [Selenium team](https://docs.seleniumhq.org/) proposed the [Page Object Pattern](https://selenium.dev/documentation/en/guidelines_and_recommendations/page_object_models/).
This simple pattern focuses on the user interface and models it in terms of pages, with each page being represented by a distinct class encapsulating both the definition of the page structure and the tasks that a user can perform on that page.

The original Page Object Pattern was later [refined by Martin Fowler](https://martinfowler.com/bliki/PageObject.html), who proposed that instead of thinking of the entire application as a set of pages, each page should be considered in terms of smaller page objects or "widgets" that the page contained. The implementation below uses that refined version, as it's more representative of what you'd find in the more modern codebases.

What you'll see in the code sample below is a by-the-book implementation of the Page Objects pattern.
For simplicity, I've implemented the page object representing the `TodoList` in the same file as the test using it, as well as the test-specific [teardown method](https://jasmine.github.io/api/3.5/global.html#afterEach)
that prevents the application state from leaking between the tests. I've also annotated the code to highlight the features and limitations of this implementation:

```javascript
describe('Todo List App', function () {

    // The page object representing the Todo list:
    class TodoList {

        constructor() {
            // Interactive elements represented as "private" fields of the page object
            // to encourage the developers to use the "public" methods instead
            this._whatNeedsToBeDoneInputBox = element(by.css('.new-todo'));
            this._recordedItems             = element.all(by.css('.todo-list li'));
        }

        // The methods of the page object represent the tasks that the user
        // can perform on a given page or using a given UI widget, such as:
        // - recordItemCalled(itemName)
        // - completeItemCalled(itemName)
        // - filterToShowActiveItemsOnly(), etc.

        // Each "task method" encapsulates the low-level interactions
        // like entering a value into a form field or clicking on a button:
        async recordItemCalled(itemName) {
            await this._whatNeedsToBeDoneInputBox.sendKeys(itemName);
            await this._whatNeedsToBeDoneInputBox.sendKeys(protractor.Key.ENTER);
        }

        async completeItemCalled(itemName) {
            // The dynamically-generated XPath locator is now encapsulated
            // within the page object. But, even though it's swept under the carpet,
            // it's still just as complex as it was before:

            await element(by.xpath(
                `//li[*[@class='view' and contains(.,'${ itemName }')]]//input[contains(@class,'toggle')]`)
            ).click();
        }

        async filterToShowActiveItemsOnly() {
            await element(by.linkText(`Active`))
                .click();
        },

        // A data retrieval method designed to make it easier to perform
        // an assertion in the test
        async textOfRecordedItems() {
            return this._recordedItems.getText();
        },
    };

    // The test where the TodoList page object is used:
    it('allows for the list to show active items only', async function () {

        // Operations that are not part of the page object's responsibilities
        // are still present in the test:
        await protractor.browser.get('http://todomvc.com/examples/angularjs/#/');
        await protractor.browser.wait(
                protractor.ExpectedConditions.presenceOf(element(by.css('.new-todo'))),
                2000,
            );
        expect(await protractor.browser.getTitle()).toMatch(/.*TodoMVC$/);

        // Page objects have to be explicitly instantiated in the test
        const todoList = new TodoList();

        // Repeated calls to `recordItemCalled`
        await todoList.recordItemCalled('Play some guitar');
        await todoList.recordItemCalled('Read a book');
        await todoList.recordItemCalled('Write some code');

        await todoList.completeItemCalled('Write some code');

        await todoList.filterToShowActiveItemsOnly();

        // Every now and then we might have to break the await/async style
        // and go back to chaining Promises using `.then`:
        await todoList.textOfRecordedItems().then(items => {
            expect(items).toEqual([
                'Play some guitar',
                'Read a book',
            ]);
        });
    });

    // Teardown method responsible for clearing any application state
    afterEach(async () => {
        // Since the cleanup method doesn't belong to the page object
        // representing the TodoList, it's left in the test:

        await browser.executeScript(`window.localStorage.clear()`);
    });
});
```

As you can see above, the clarity of our test has already improved:
- The constructor of the page objects introduces two [meaningful variables](https://refactoring.com/catalog/extractVariable.html)
  representing the elements of the `TodoList` that we'd like to interact with: `_whatNeedsToBeDoneInputBox` and `_recordedItems`.
  This helps to avoid duplicating the locators all over the test.
- The low-level Protractor API calls, such as `element` or `element.all`, have been extracted and encapsulated within "task methods" such as `recordItemCalled(name)`,
  `completeItemCalled(name)` and `filterToShowActiveItemsOnly()` available on the `TodoList` page object instance.
  Those methods not only encapsulate the interaction logic but also offer a much more business-focused API.
- Additionally, the `TodoList` page object also offers a way for us to retrieve the `textOfRecordedItems()`, which we use to perform the assertion.

However, some issues are still outstanding:
- Since opening the web browser doesn't, strictly speaking, belong to the responsibilities of the page object, the code doing it is still left in the test.
- Since the test requires three items to be added to the todo list, we call `recordItemCalled()` three times.
  That's some duplication that could be avoided by creating some sort of a helper method.
  However, adding helper methods like that to page objects can result in their API expanding quite significantly.
- Clean up code that doesn't belong to any page object in particular, in our case code that clears the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), is left in the test causing unnecessary noise and distraction.

Moreover, since a Page Object works with three distinct concepts, as it:
- describes the elements a user can interact with,
- the tasks they can perform on the page or using a widget,
- as well as data retrieval methods,

there are [three reasons](https://en.wikipedia.org/wiki/Single_responsibility_principle) why its implementation might need to be changed:
- the page structure may have changed,
- a test might need to describe a new user interaction with that page,
- the data retrieval method might have changed.

In all the above cases, deliberate or unintended changes to the page object carry a risk of having a negative impact on existing tests that use it. The more interactions and page elements a given page object describes, the higher the likelihood of the problem occurring.

Page Objects introduce another, much more subtle problem, though.

As the name implies, _Page Objects_ reason at the level of the user interface, in terms of fields, buttons and links that the user manipulates. This affects not only the way your test is structured but also the way _you think_ about the application.
Just as we shape our tools, they shape us too - instead of placing the primary focus on **what** the user needs to do with the application, Page Objects lead you to focus on **how** the user interacts with individual pages. As a result, the tests become tightly coupled to the structure of the user interface, making them more brittle and more likely to be affected by UI changes.

> Coupling the tests to the structure of the system they verify results in a test suite that's brittle and more likely to fail when the implementation of the system changes.

Even though Page Objects reduce code duplication and encourage reuse across tests within a single project and a single test suite, the design falls short if we need to enable code reuse across multiple projects and teams. This, of course, affects the scalability and accessibility of our solution.

Also, the fact that each page object is tightly coupled to Protractor APIs: `element` and `by` - global functions that are browser instance-specific - makes it impossible to use this design "as is" for multi-browser testing (chat systems, workflow systems, multi-player games, etc.).

Not to mention that even after [extracting](https://refactoring.com/catalog/extractClass.html) a Page Object from the original test script, there's still plenty of low-level Protractor/WebDriver API calls left in our test. They are necessary as they deal with managing the browser window and clearing the application state, but they also cloud the business logic of the implementation.

As you can see, even though Page Objects address some of the troubles with test scripts, they don't provide a complete solution.

Let's see if we can find the missing ingredients!

## Cucumber

At this point, you're probably wondering if adding [Cucumber](https://github.com/cucumber/cucumber-js) into the mix could introduce the layer of abstraction our example code so desperately needs?

What such a move would definitely help us with is to introduce a layer of domain-specific language we could use to capture the vernacular of the business stakeholders.
Additionally, expressing acceptance test scenarios in a human-readable language, such as English, makes it easier for non-technical stakeholders to work with and review.

At the business level, our test scenario could be expressed as follows:

```gherkin
Scenario: Filter the list to show active items

  Given James has a list containing: Play some guitar, Read a book, Write some code
   When he completes the item called Write some code
    And he filters the list to show only active items
   Then he should see: Play some guitar, Read a book
```

This looks better, doesn't it?

Let's look at the implementation of the [step library](https://cucumber.io/docs/gherkin/step-organization/) that powers this test, though:

```javascript
const { Given, Then, When, Before, After } = require('cucumber');

Before(async function () {
    await browser.get('http://todomvc.com/examples/angularjs/#/');
});

Given(/(.*) has a list containing: (.*)/, async function (actorName, commaSeparatedItems) {
    const todoList = new TodoList();

    itemsFrom(commaSeparatedItems)
        .forEach(itemName => {
            await todoList.recordItemCalled(itemName);
        });
});

When(/he completes the item called (.*)/, async function (itemName) {
    await todoList.completeItemCalled(itemName);
});

When(/he filters the list to show only active items/, function (itemName) {
    await todoList.filterToShowActiveItemsOnly();
});

Then(/he should see: (.*)/, function (commaSeparatedItems) {
    await todoList.textOfRecordedItems().then(items => {
                expect(items).toEqual(itemsFrom(commaSeparatedItems));
            });
});

After(function () {
    await browser.executeScript(`window.localStorage.clear()`);
});

function itemsFrom(commaSeparatedItems) {
    return commaSeparatedItems
               .split(',')
               .map(itemName => itemName.trim());
}
```

Even with a gold standard Cucumber scenario like the one above, the Cucumber step definitions suffer from the same issues
our previous Protractor/Jasmine scenario has experienced:
- low-level API calls are still left in the code, and now they're accompanied by additional data transformation functions responsible for mapping the plain-English scenario to the automation code (such as `itemsFrom(commaSeparatedItems)`),
- the low-level cleanup code is still present in the `After` hook,
- the step definitions have to switch between the `async/await` and Promises, depending on the context of the API call,
- and we haven't addressed any of the problems introduced with Page Objects!

Not to mention, that Cucumber, while an excellent collaboration and documentation tool, doesn't address concerns around
code re-usability: you can't call a Cucumber step from within another step, for example, and [neither should you](https://cucumber.io/docs/guides/anti-patterns/#support-for-conjunction-steps).

## Summary

As you can see, even though Protractor, WebDriver and other similar tools are excellent at automating low-level interactions with the system under test, their APIs are simply too low-level to express the business intent behind those interactions. Also, using tools like that directly in our tests leads to an implementation that's full of noise, distractions, and accidental detail.

The Page Object(s) Pattern addresses some of the problems but falls short if what you want is a test automation system that's easy to extend, maintain and scale to multiple projects and teams.

While adding Cucumber into the mix could help to capture the business language and slightly improve the reports our tests produce, it doesn't by itself address the code duplication or code structure issues. I'm afraid that even gold standard Cucumber scenarios can't address that because there's still something we're missing.

To find out what that is, we might need to change the way we think about our tests.
