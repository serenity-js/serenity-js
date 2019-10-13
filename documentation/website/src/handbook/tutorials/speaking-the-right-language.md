---
title: Speaking the right language
layout: handbook.hbs
---

# Speaking the right language

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

<img src="/handbook/tutorials/images/todomvc.gif"
alt="TodoMVC Angular.js app by Christoph Burgdorf, Eric Bidelman, Jacob Mumm and Igor Minar"
style="display: block; margin:0 auto; width:640px;" />

You can probably already guess that to demonstrate this scenario, a user would need to:
- start with a to-do list containing several items,
- mark one of them as complete,
- filter the list to show active items only,
- check if the only items they see are the ones that are still outstanding.

Let's now look at several ways of approaching the task of automating a test scenario that does exactly that.

## A test script

The most common implementation follows what I like to call _the scripting approach_.

A test implemented in this style is characterised by numerous calls to low-level WebDriver or WebDriver-like APIs
and exhibit few or no business-focused abstractions.

Below is an example test following the scripting approach, implemented using raw [Protractor](https://www.protractortest.org/#) and [Jasmine](https://jasmine.github.io/).
Please note, however, that this style is by no means specific to those particular tools as it's often seen with other similar libraries and frameworks:

```javascript
describe('Todo List App', function () {

    it('allows for the list to show active items only', async function () {
        await browser.get('http://todomvc.com/examples/angularjs/#/');

        await element(by.css('.new-todo')).sendKeys('Play some guitar');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        await element(by.css('.new-todo')).sendKeys('Read a book');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        await element(by.css('.new-todo')).sendKeys('Write some code');
        await element(by.css('.new-todo')).sendKeys(protractor.Key.ENTER);

        await element(
                by.xpath(`//li[*[@class='view' and contains(.,'Write some code')]]//input[contains(@class,'toggle')]`)
            )
            .click();

        await element(by.linkText(`Active`))
            .click();

        await element.all(by.css('.todo-list li')).getText().then(items => {
            expect(items).toEqual([
                'Play some guitar',
                'Read a book',
            ]);
        });
    });

    afterEach(async () => {
        await browser.executeScript(`window.localStorage.clear()`);
    });
});
```

The code above "gets the job done" and automates the scenario we talked about.

However, this implementation is far from ideal for a  number of reasons:
- There's a lot of duplication.
- The low-level, detail-focused code makes it hard to see at a glance if the test is actually doing its job correctly. It also makes it impossible for a non-technical business person to read and verify its logic.
- Even small changes to the application structure or the user workflow tend to have [a big impact](https://sourcemaking.com/refactoring/smells/shotgun-surgery) on the test code, making it difficult for the tests to keep pace with the application.
- When a test suite like this expands, developers need to spend more and more time tackling the widespread duplication and keeping the test suite up to date with the application. This makes it increasingly hard to add new tests for any new functionality.
- Not to mention that tests like the one above make it virtually impossible to [test-drive the development](https://en.wikipedia.org/wiki/Acceptance_test%E2%80%93driven_development) of a software system as they're too tightly coupled to the implementation.

As you can probably already tell, I'm not a fan of this approach as it tends to be a recipe for a disaster.

The creator of Selenium WebDriver, [Simon Stewart](https://blog.rocketpoweredjetpants.com/), holds the same view:

> If you have WebDriver APIs in your test methods, You're Doing It Wrong.
>
> Simon Stewart

So let's see what we can do about this sorry state of affairs and find a way to encapsulate and reuse some of the common parts.

## The Page Object(s) Pattern

As Selenium WebDriver became more popular in the late 2000s, and test suites began to grow bigger,
developers and testers new to browser-based test automation needed a way to address these issues.

In response to this, the [Selenium team](https://docs.seleniumhq.org/) proposed the [Page Object Pattern](https://docs.seleniumhq.org/docs/06_test_design_considerations.jsp#page-object-design-pattern).
This simple pattern focuses on the user interface and models it in terms of pages, with each page being represented by a distinct class encapsulating both the definition of the page structure and the tasks that a user can perform on that page.

_It is worth noting that the original Page Object Pattern was later [refined by Martin Fowler](https://martinfowler.com/bliki/PageObject.html), who proposed that instead of thinking of the entire application as a set of pages, each page should be considered in terms of smaller page objects or "widgets" that the page contained. The implementation below uses that refined version, as it's more representative of what you'd find in the more modern codebases._

For simplicity, I've implemented the page object representing the TodoList **(I)** in the same file as the test **(II)**, and any test-specific hooks **(III)**:

```javascript
describe('Todo List App', function () {

    // (I)
    class TodoList {

        // (I.a)
        constructor() {
            this._whatNeedsToBeDoneInputBox = element(by.css('.new-todo'));
            this._recordedItems             = element.all(by.css('.todo-list li'));
        }

        // (I.b)

        async recordItemCalled(itemName: string) {
            await this._whatNeedsToBeDoneInputBox.sendKeys(itemName);
            await this._whatNeedsToBeDoneInputBox.sendKeys(protractor.Key.ENTER);
        }

        async completeItemCalled(itemName: string) {
            await element(
                    by.xpath(`//li[*[@class='view' and contains(.,'${ itemName }')]]//input[contains(@class,'toggle')]`)
                )
                .click();
        }

        async textOfRecordedItems() {
            return this._recordedItems.getText();
        },

        async filterToShowActiveItemsOnly() {
            await element(by.linkText(`Active`))
                .click();
        },
    };

    // (II)
    it('allows for the list to show active items only', async function () {
        // (II.a)
        await browser.get('http://todomvc.com/examples/angularjs/#/');

        // (II.b)
        const todoList = new TodoList();

        // (II.c)
        await todoList.recordItemCalled('Play some guitar');
        await todoList.recordItemCalled('Read a book');
        await todoList.recordItemCalled('Write some code');

        await todoList.completeItemCalled('Write some code');

        await todoList.filterToShowActiveItemsOnly();

        // (II.d)
        await todoList.textOfRecordedItems().then(items => {
            expect(items).toEqual([
                'Play some guitar',
                'Read a book',
            ]);
        });
    });

    // (III)
    afterEach(async () => {
        // (III.a)
        await browser.executeScript(`window.localStorage.clear()`);
    });
});
```

As you can see above, the clarity of our test has already improved:
- **(I.a)** - We've introduced two [meaningful variables](https://refactoring.com/catalog/extractVariable.html) representing the elements of the `TodoList`
  we'd like to interact with: `_whatNeedsToBeDoneInputBox` and `_recordedItems`, which helped us to avoid some of the code duplication.
- **(I.b)** - The low-level Protractor API calls, such as `element` or `element.all`, have been extracted and encapsulated within methods such as `recordItemCalled(name)`, `completeItemCalled(name)` and `filterToShowActiveItemsOnly()` available on the `TodoList` page object instance **(II.b)**. Those methods not only encapsulate the interaction logic, but also offer a much more business-focused API.
- **(II.d))** - The `TodoList` page object also offers a way for us to retrieve the `textOfRecordedItems()`, which we use to perform the assertion.

However, some issues are still outstanding:
- **(II.a)** - Since opening the web browser doesn't, strictly speaking, belong to the responsibilities of the page object, the code doing it is still left in the test.
- **(II.c)** - Since the test requires three items to be added to the todo list, we call `recordItemCalled()` three times. That's some duplication that could be avoided by creating some sort of a helper method. However, adding helper methods like that to page objects can result in their API expanding quite significantly.
- **(III.a)** - Clean up code that doesn't belong to any page object in particular, in our case code that clears the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), is left in the test causing unnecessary noise and distraction.

Moreover, since a Page Object works with two distinct concepts, there are [two reasons](https://en.wikipedia.org/wiki/Single_responsibility_principle) why it might need to be changed. The page structure may have changed, or a test might need to describe a new user interaction with that page. In both cases, deliberate or unintended changes to the page object carry a risk of having a negative impact on existing tests that use it. The more interactions and page elements a given page object describes, the higher the likelihood of the problem occurring.

Page Objects introduce another, more subtle problem. As the name implies, _Page_ Objects reason at the level of the user interface, in terms of fields, buttons and links that the user manipulates. This affects the way _you_ think about the application too. Instead of placing the primary focus on **what** the user needs to do with the application, Page Objects lead you to focus on **how** the user interacts with individual pages. As a result, the tests become tightly coupled to the structure of the user interface, making them more brittle and more likely to be affected by UI changes.

> Coupling the tests to the structure of the system they verify results in a test suite that's brittle and more likely to fail when the implementation of the system changes.

Even though Page Objects reduce code duplication and encourage reuse across tests within a single project and a single test suite, the design falls short if we need to enable code reuse across multiple projects and teams. This of course affects the scalability of our solution.

Also, the fact that each page object is tightly coupled to Protractor APIs: `element` and `by` - global functions that are browser instance-specific - makes it impossible to use this design "as is" for multi-browser testing (chat systems, workflow systems, multi-player games, etc.).

Not to mention that even after [extracting](https://refactoring.com/catalog/extractClass.html) a Page Object from the original test script, there's still plenty of low-level Protractor/WebDriver API calls left in our test. They are necessary as they deal with managing the browser window and clearing the application state, but they also cloud the business logic of the implementation.

## Cucumber

At this point you're probably wondering if adding [Cucumber](https://github.com/cucumber/cucumber-js) into the mix could introduce the layer of abstraction our example code so desperately needs?

What such move would definitely help us with is to introduce a layer of domain-specific language we could use to capture the vernacular of the business stakeholders.
Additionally, expressing acceptance test scenarios in a human-readable language, such as English, makes it easier for non-technical stakeholders to work with and review.Cucumber

At the business level, our test scenario could be expressed as follows:

```gherkin
Scenario: Filter the list to show active items

  Given James has a list containing: Play some guitar, Read a book, Write some code
   When he completes the item called Write some code
    And he filters the list to show only active items
   Then he should see: Play some guitar, Read a book
```

But even with a gold standard Cucumber scenario like the one above, the Cucumber step definitions suffer from the same issues
our previous Protractor/Jasmine scenario has experienced: some low-level API calls are still left in the code, now accompanied by additional
data transformation functions helping us map the plain-English scenario to the automation code (such as `itemsFrom(commaSeparatedItems)`):

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

Not to mention, that Cucumber, while an excellent collaboration and documentation tool, doesn't address concerns around
code re-usability: you can't call a Cucumber step from within another step, for example, and [neither should you](https://cucumber.io/docs/guides/anti-patterns/#support-for-conjunction-steps).

## Summary

As you can see, even though Protractor and WebDriver are excellent test automation tools, their APIs are simply too low-level to express intent of the interactions with the system in business terms and free of implementation noise.

The Page Object(s) Pattern addresses some of the problems, but it falls short if what you want is a test automation system that's easy to extend, maintain and scale to multiple projects and teams.

Adding Cucumber into the mix without introducing any other abstractions can help to improve collaboration between the business and developers,
but doesn't address the code duplication or code structure issues.

So far it looks like the acceptance tests are not speaking the right language and there's an abstraction missing.

Which leads us onto the next article :-)
