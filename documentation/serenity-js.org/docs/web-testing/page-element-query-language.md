---
sidebar_position: 2
---

# Page Element Query Language

**Page Element Query Language (PEQL)** is a portable, composable, and type-safe abstraction layer
around selectors and web element interaction methods provided by web integration tools like
[WebdriverIO](/api/webdriverio), [Playwright](/api/playwright), or [Protractor](/api/protractor).

**<abbr title="Page Element Query Language">PEQL</abbr>** leverages Serenity/JS [expectations library](/api/core/class/Expectation)
and [meta-questions](/api/core/interface/MetaQuestion) to give you
a standardised, consistent, and extensible way to identify elements in a web interface.

Key points:
- **Page Element Query Language (PEQL)** is a portable and type-safe abstraction around web interaction APIs provided by your web integration tools
- **[`PageElement`](/api/web/class/PageElement)** is a [question](/api/core/class/Question) that resolves to a [single web element](/handbook/web-testing/page-element-query-language#working-with-a-single-page-element), **[`PageElements`](/api/web/class/PageElements)** resolves to a [collection of elements](/handbook/web-testing/page-element-query-language#working-with-a-collection-of-page-elements)
- `PageElement` and `PageElements` are also [meta-questions](/api/core/interface/MetaQuestion), so can be resolved relatively to another `PageElement` to dynamically form a child-parent relationship
- **[`By` selectors](/api/web/class/By)** help to identify page elements of interest
- **[Partially-applied meta-questions](/handbook/web-testing/page-element-query-language#using-partially-applied-meta-questions)** can be chained together to enable code reuse
- [**<abbr title="Page Element Query Language">PEQL</abbr>**](/handbook/web-testing/page-element-query-language#querying-elements) leverages
  [expectations](/api/core/class/Expectation) and [meta-questions](/api/core/interface/MetaQuestion),
  just like [assertions](/handbook/design/assertions) and [synchronisation statements](/handbook/design/waiting-and-synchronisation) do.

## Working with a single page element

[`PageElement`](/api/web/class/PageElement) class is a [Screenplay Pattern](/handbook/design/screenplay-pattern)-compatible
abstraction that represents a single [element](https://developer.mozilla.org/en-US/docs/Glossary/Element) in a web interface.

To help you understand how to use this abstraction, consider the below article widget, which we'll use in the next few examples:

```html
<article>
    <h1 class="title">Serenity/JS</h1>
</article>
```

### Representing a page element

Use [`PageElement.located`](/api/web/class/PageElement#located) API to represent a single page element
and one of the built-in [`By` selectors](/api/web/class/By) to instruct the browser how to locate it.

For example, you could use the following construct to represent the article title element:

```typescript
import { By, PageElement } from '@serenity-js/web'

const articleTitle = PageElement.located(By.css('article > .title'))
```

However, while you certainly could define page elements in-line in your tests or assign them to variables like in the example above,
a more idiomatic way is to declare **reusable functions and methods** named after the element they represent:

```typescript
import { By, PageElement } from '@serenity-js/web'

const articleTitle = () =>
    PageElement.located(By.css('article > .title'))
```

Standardising on using functions or methods makes it easier for you to refactor them to accept parameters later on if needed.

:::info Pro tip
You can learn more about organising your page elements in the chapter on the "[Page Objects Pattern](/handbook/web-testing/page-objects-pattern)"
:::

### Customising page element description

[`PageElement`](/api/web/class/PageElement) is an implementation of a [`Question`](/api/core/class/Question), which means you can
customise its description to improve how Serenity/JS reports interactions with it:

```typescript
import { By, PageElement } from '@serenity-js/web'

const articleTitle = () =>
    PageElement.located(By.css('article > .title'))
        .describedAs('article title')
```

When a custom description is provided, Serenity/JS will use it instead of the default one:
```diff
- PageElement located by css (article > .title)     // default description
+ article title                                     // custom description
```

The practical advantage of using custom descriptions is that once Serenity/JS understands
what given element represents, it can offer much more human-friendly descriptions
in your test reports:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(articleTitle()), equals('Serenity/JS'))
)
```
For example, thanks to the custom description, the above interaction will be reported as follows:
```
Alice ensures that the text of article title does equal "Serenity/JS"
```
Of course, if the element is not found or can't be interacted with, Serenity/JS will also report
the selector used to locate the element to make debugging test failures easier.


### Composing `PageElement` with other web questions

Serenity/JS favours [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science))
to help your code achieve polymorphic behaviour and promote code reuse.
In practice, this means that in order to learn about a specific attribute of a page element, you'd compose the element
with an [appropriate web-specific question](/api/web).

For example, `articleTitle()` in the code sample below produces a question that will be resolved to a web element:
```typescript
import { By, PageElement, Text } from '@serenity-js/web'

const articleTitle = () =>
    PageElement.located(By.css('article > .title'))
```

To retrieve the text content of the `articleTitle()` element, compose it with the question about its [`Text`](/api/web/class/Text):

```typescript
import { Text } from '@serenity-js/web'

const articleTitleText = () =>
    Text.of(articleTitle())
```

To retrieve the CSS classes of the `articleTitle()` element, compose it with the question about its [`CssClasses`](/api/web/class/CssClasses):

```typescript
import { CssClasses } from '@serenity-js/web'

const articleTitleCssClasses = () =>
    CssClasses.of(articleTitle())
```

A chain of composed questions, such as `Text.of(articleTitle())` is resolved only when the actor needs to retrieve the underlying value.

For example, the text of the article title would be retrieved when performing an assertion:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(articleTitle()), equals('Serenity/JS'))
)
```

When composed questions are used with [synchronisation statements](/handbook/design/waiting-and-synchronisation),
the underlying value will be retrieved every polling interval:

```typescript
import { actorCalled, Duration, Wait } from '@serenity-js/core'
import { equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Wait.until(Text.of(articleTitle()), equals('Serenity/JS'))
        .pollingEvery(Duration.ofMilliseconds(250))
)
```


:::info Pro Tip
Note that the result of **composing questions** is also a **question**.
This design makes questions reusable and allows for them to be composed further, until they're finally resolved by an [_actor_](/handbook/design/screenplay-pattern).
:::

### Asserting on a page element

Serenity/JS web module provides [web-specific expectations](/api/core/class/Expectation) you use
to verify if the actual state of the given element is what you expect it to be.

For example, you might want to ensure that a given element [is visible](/api/web/function/isVisible), i.e. not obstructed by other elements:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure } from '@serenity-js/assertions'
import { isVisible } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(articleTitle(), isVisible()),
)
```

You can also assert that a specific property of the element, like its [text](/api/web/class/Text), to have a certain value:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(articleTitle()), equals('Serenity/JS')),
)
```

Note that you're not limited to web-first expectations and you can use
any other expectations from the [Serenity/JS assertions module](/api/assertions) or [write them yourself](/api/core/class/Expectation).

:::info Learn more
Learn more about asserting on page elements in chapter "[Web-first assertions](/handbook/design/assertions#web-assertions)".
:::

### Waiting for a page element

Serenity/JS web module provides [web-specific expectations](/api/core/class/Expectation) you use
to synchronise your test code with the system under test and wait until its state meets your expectations.

For example, you might want for your test scenario to wait until a given element [is visible](/api/web/function/isVisible):

```typescript
import { actorCalled, Duration, Wait } from '@serenity-js/core'
import { isVisible } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Wait.upTo(Duration.ofSeconds(2))
        .until(articleTitle(), isVisible()),
)
```

You can also wait for a specific property of the element, like its [text](/api/web/class/Text), to have a certain value:

```typescript
import { actorCalled, Wait } from '@serenity-js/core'
import { includes } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Wait.until(Text.of(articleTitle()), includes('Serenity/JS')),
)
```

Note that you're not limited to web-first expectations and you can use
any other expectations from the [Serenity/JS assertions module](/api/assertions) or [write them yourself](/api/core/class/Expectation).

:::info Learn more
Learn more about synchronising your web tests with the system under test in chapter "[Waiting and synchronisation](/handbook/design/waiting-and-synchronisation)".
:::

### Using selector aliases

In scenarios where different elements can be identified using a similar selector pattern you might want to implement
custom selector aliases to avoid code duplication.

For example, below function `byRole` helps to locate elements with
a desired [accessibility role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles):

```typescript
import { actorCalled } from '@serenity-js/core'
import { By, Click, PageElement } from '@serenity-js/web'

const byRole = (roleName: string) =>
    By.css(`[role="${ roleName }"]`)

await actorCalled('Alice').attemptsTo(
    Click.on(PageElement.located(byRole('button'))),
)
```

### Using dynamic selectors

In some scenarios, the exact value of the selector you need to use becomes known only at runtime.
This is typically the case when element attributes are calculated dynamically based on user actions.

To cater for that, all [`By` selectors](/api/web/class/By) let you define
selector value using an [`Answerable<string>`](/api/core#Answerable):

```typescript
import { Answerable, q } from '@serenity-js/core'
import { By, PageElement } from '@serenity-js/web'

const byTestId = (dataTestId: Answerable<string>) =>
    PageElement.located(By.css(q`[data-test-id="${ dataTestId }"]`))
```

Note that the example above uses [tag function `q`](/api/core/function/q) to concatenate a static string with an `Answerable<string>`.

### Using meta-questions

`PageElement` is a [`meta-question`](/api/core/interface/MetaQuestion) that can be resolved _in relation_ to another `Question`.

What this means in this context is that you can define a `PageElement` as having a child-parent relationship with another `PageElement`,
and do it either dynamically or statically using the [`PageElement#of`](/api/web/class/PageElement#of) API.

To better understand how to apply this in practice, consider the below widget, which describes an article and its summary:
```html
<article>
    <section class="summary">
        <h2 class="title">Key points:</h2>
    </section>

    <h1 class="title">Serenity/JS</h1>
</article>
```

Next, consider page elements describing those two parts of the widget:

```typescript
import { PageElement, By } from '@serenity-js/web'

const blogArticle = () =>
    PageElement.located(By.css('article'))
        .describedAs('blog article')

const summary = () =>
    PageElement.located(By.css('.summary'))
        .describedAs('summary')
```

Now, since both the article and its summary have a title identified by a CSS class called `.title`, we can define
a third page element to represent it:

```typescript
const title = () =>
    PageElement.located(By.css('.title'))
        .describedAs('title')
```

With the three page elements defined above, we can easily reuse function `title()` by composing it with either the `blogArticle()` or its `summary()`:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals, startsWith } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(title().of(blogArticle())), equals('Serenity/JS')),
    Ensure.that(Text.of(title().of(summary())), startsWith('Key points')),
)
```

:::info Pro tip
Using meta questions to enable page element reuse can be a great productivity boost that is most effective
when the system under test uses a consistent convention to name element identifiers and classes.
This is typically the case when you use a good web UI design system and a consistent UI component library.
:::

## Working with a collection of page elements

[`PageElements`](/api/web/class/PageElements) class is a [Screenplay Pattern](/handbook/design/screenplay-pattern)-compatible
abstraction that represents a collection of [elements](https://developer.mozilla.org/en-US/docs/Glossary/Element) in a web interface
that share some common characteristics.

To help you understand how to use this abstraction, consider the below shopping list widget, which we'll use in the next few examples:

```html
<ul>
    <li class="buy">oats</li>
    <li class="buy">coconut milk</li>
    <li class="bought">coffee</li>
</ul>
```

### Representing a collection of page elements

Use [`PageElements.located`](/api/web/class/PageElements#located) API to represent a collection of page elements
and one of the built-in [`By` selectors](/api/web/class/By) to instruct the browser how to locate them.

For example, to represent all the shopping list items from the [example above](#working-with-a-collection-of-page-elements),
you could use the following reusable function named after the elements it represents:

```typescript
import { By, PageElements } from '@serenity-js/web'

const shoppingListItems = () =>
    PageElements.located(By.css('li'))
```

### Retrieving a specific element from a collection

If you need to retrieve a specific element from a collection, and you know what position it occupies, you can use
[`PageElements#first()`](/api/web/class/PageElements#first), [`PageElements#last()`](/api/web/class/PageElements#last), and [`PageElements#nth(index)`](/api/web/class/PageElements#nth) APIs:

```typescript
import { By, PageElements } from '@serenity-js/web'

const firstItem = () =>
    PageElements.located(By.css('li'))
        .first()

const secondItem = () =>
    PageElements.located(By.css('li'))
        .nth(1) // notice zero-based indexing

const lastItem = () =>
    PageElements.located(By.css('li'))
        .last()
```

Above APIs are particularly useful when you need to retrieve elements from a sorted collection, e.g. the most recent comment, last order, nth position from a league table, and so on.

### Customising page elements description

Just like [`PageElement`](/api/web/class/PageElement), [`PageElements`](/api/web/class/PageElements) class is also an implementation of a [`Question`](/api/core/class/Question).
This means you can customise its description to improve how Serenity/JS reports interactions with the given collection of page elements:

```typescript
import { By, PageElements } from '@serenity-js/web'

const shoppingListItems = () =>
    PageElements.located(By.css('li'))
        .describedAs('shopping list items');
```

### Composing `PageElements` with other questions

Similarly to [`PageElement`](/api/web/class/PageElement), [`PageElements`](/api/web/class/PageElements) can be composed with other questions,
like [`Text.ofAll`](/api/web/class/Text), to retrieve aggregate information about all the elements in the collection:

```typescript
import { Text } from '@serenity-js/web'

const namesOfShoppingListItems = () =>
    Text.ofAll(shoppingListItems())
```

[`Text.ofAll`](/api/web/class/Text) API is particularly useful when you need to retrieve text content of multiple elements and assert on it all at once:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.ofAll(shoppingListItems()), equals([
        'oats',
        'coconut milk',
        'coffee'
    ]))
)
```

### Mapping page elements in a collection

Just like with using [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science))
and [meta-questions](/api/core/interface/MetaQuestion)
to map an individual element to [another type](#composing-questions) or [another element](#using-meta-questions),
you can map each element in a collection of page elements. To do that, use the [`PageElements#eachMappedTo`](/api/web/class/PageElements#eachMappedTo) API.

For example, you could map each [shopping list item element](#working-with-a-collection-of-page-elements) to its text content using the [`Text`](/api/web/class/Text) meta-question:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(
        shoppingListItems().eachMappedTo(Text),
        equals([
            'oats',
            'coconut milk',
            'coffee'
        ])
    )
)
```

You could also retrieve the [`CssClasses`](/api/web/class/CssClasses) of each element:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { CssClasses } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(
        shoppingListItems().eachMappedTo(CssClasses),
        equals([
            [ 'buy' ],
            [ 'buy' ],
            [ 'bought' ],
        ])
    )
)
```

You could also use any other of the built-in meta-questions, like [`Attribute.called('name')`](/api/web/class/Attribute) or [`Value`](/api/web/class/Value).
You could also create your own [meta-questions](/api/core/interface/MetaQuestion) if needed.

### Filtering page elements in a collection

While Serenity/JS [expectations](/api/core/class/Expectation) are most commonly used in [assertion](#asserting-on-a-page-element) and [synchronisation](#waiting-for-a-page-element) statements,
when used with [`PageElements#where`](/api/web/class/PageElements#where) API they can offer a great and reusable alternative to complex CSS selectors and XPath expressions.

For example, you could use the [meta-question](/api/core/interface/MetaQuestion) about the [`CssClasses`](/api/web/class/CssClasses) and an expectation to [`contain`](/api/assertions/function/contain)
to find only those items that still need to be bought:

```typescript
import { By, CssClasses, PageElements } from '@serenity-js/web'
import { contain } from '@serenity-js/assertions'

const boughtItems = () =>
    PageElements.located(By.css('li'))
        .where(CssClasses, contain('bought'))
        .describedAs('bought items')
```

Furthermore, you can chain multiple filter statements together. For example, you might want to retrieve only those
elements that [include](/api/assertions/function/includes) sub-string "co" ("coffee" and "coconut milk"), and of them only those that have already been marked as "bought":

```typescript
import { By, CssClasses, PageElements } from '@serenity-js/web'
import { contain, includes } from '@serenity-js/assertions'

const myItems = () =>
    PageElements.located(By.css('li'))
        .where(Text, includes('co'))
        .where(CssClasses, contain('bought'))
```

## Combining mapping, composition, and filtering

Serenity/JS mapping, composition, and filtering features become very useful when you learn how to use them together.

Consider the following, slightly more sophisticated shopping list widget, which we'll use to demonstrate
some more advanced <abbr title="Page Element Query Language">PEQL</abbr> features in the next few examples:

```html
<ul class="shopping-list">
    <li class="item buy">
        <input type="checkbox" class="toggle">
        <label>oats</label>
        <span class="quantity">1</span>
        <button class="destroy">X</button>
    </li>
    <li class="item buy">
        <input type="checkbox" class="toggle">
        <label>coconut milk</label>
        <span class="quantity">2</span>
        <button class="destroy">X</button>
    </li>
    <li class="item bought">
        <input type="checkbox" class="toggle">
        <label>coffee</label>
        <span class="quantity">1</span>
        <button class="destroy">X</button>
    </li>
</ul>
```

In contrast to the [original example](#working-with-a-collection-of-page-elements),
we can no longer verify what items are displayed by simply fetching the text content of each `li` node.
That's because doing so would also include the information about their quantity and the label of the "destroy" button, which means we'd end up with a result like this:
```
oats 1 X
coconu milk 2 X
coffee 1 X
```

A better approach is to introduce page elements representing:
- a collection of shopping list items
- interactive elements of each shopping list item, so:
    - a checkbox
    - a label
    - a quantity
    - a destroy button

```typescript
import { By, PageElements } from '@serenity-js/web'

const shoppingListItems = () =>
    PageElements.located(By.css('li.todo'))
        .describedAs('shopping list items')

const checkbox = () =>
    PageElement.located(By.css('input.checkbox')).describedAs('checkbox')

const label = () =>
    PageElement.located(By.css('label')).describedAs('label')

const quantity = () =>
    PageElement.located(By.css('span.quantity')).describedAs('quantity')

const destroyButton = () =>
    PageElement.located(By.css('button.destroy')).describedAs('destroy button')
```

### Mapping elements in a collection using meta-questions

To retrieve the text of all the labels of the displayed shopping list items, you could map a collection of shopping list items
to their labels:
```typescript
const labels = () =>
    shoppingListItems()
        .eachMappedTo(label())
```
Next, you could retrieve the text of all the labels:
```typescript
Text.ofAll(labels())
```

Full example would look like this:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Text } from '@serenity-js/web'
import { Ensure, equals } from '@serenity-js/assertions'

const labels = () =>
    shoppingListItems()
        .eachMappedTo(label())

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.ofAll(labels()), equals([
        'oats',
        'coconut milk',
        'coffee',
    ]))
)
```

### Using partially-applied meta-questions

A meta-question is any type that implements the [`MetaQuestion`](/api/core/interface/MetaQuestion) interface.
This means that either a [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), or an instance of a class,
could be a meta-question, as long as they provided a method called [`of`](/api/core/interface/MetaQuestion#of) that accepted
a single argument and returned a result of `Question<Result_Type>`.

For example, [`Text`](/api/web/class/Text) is a class-level meta-question. This means that the class has a static method [`Text.of`](/api/web/class/Text#of)
that accepts a single argument of `PageElement` and returns a `Question<Promise<string>>` that resolves to its text content:

```typescript
import { PageElement, By, Text } from '@serenity-js/web'

const label = () =>
    PageElement.located(By.css('label')).describedAs('label')

const textOfLabel = () =>
    Text.of(label())
```

However, the instance produced by calling `Text.of(label())` is _also_ a meta-question.
This means that this instance-level meta-question _also_ has a method called `of`  that accepts a single argument of `PageElement` and returns a `Question<Promise<string>>` that resolves to its text content:

```typescript
import { PageElement, By, Text } from '@serenity-js/web'

const label = () =>
    PageElement.located(By.css('label')).describedAs('label')

const shoppingListItem = () =>
    PageElement.located(By.css('li.todo'))

const textOfLabel = () =>
    Text.of(label())

const textOfShoppingListItemLabel = () =>
    textOfLabel().of(shoppingListItem())
```

This [double-dispatch mechanism](https://en.wikipedia.org/wiki/Double_dispatch) allows you to
define partially-applied meta-questions, like `Text.of(label())`, that can be chained again
to describe the relationship between the `label()` and its container.

This design is particularly handy when your
system under tests reuses a relatively small number of widgets to compose more complex elements of the interface.
For example, when a `label()` is always defined using the same HTML structure, but gets embedded in different containers
you could have `label().of(formField())`, `label().of(image())`, `label().of(searchResult())` and so on,
making it easier to reuse your test code.

This pattern is particularly important in mapping elements of a collection to properties of their child elements,
or in filtering a collection of page elements based on properties of their child-elements.

:::info Types of Meta-Questions
A **meta-question** is any type that implements the [`MetaQuestion`](/api/core/interface/MetaQuestion) interface,
such as `Text`.

An **applied meta-question** is a meta-question that's already bound to its argument question.
For example, the result of calling `Text.of(pageElement)` is an applied meta-question that, when resolved, returns
the text of that particular element.

A **partially-applied meta-question** is an applied meta-question that can be bound _again_ to describe a relationship
between the already bound argument and another one, e.g. its container.

For example, the result of calling `Text.of(pageElement)` is an applied meta-question, as it can be resolved by an `actor`
to return the text of that one specific element. However, it's also a partially-applied meta-question, as it can be
bound again to describe the relationship between `pageElement` and its container, i.e. `Text.of(pageElement).of(containerElement)`.
:::

### Mapping elements in a collection using partially-applied meta-questions

There's another way to retrieve the text of all the labels, apart from mapping each element in a collection to its label element, and then retrieving text content of all the results like we did in the [previous example](#mapping-elements-in-a-collection-using-meta-questions).

What you could do, is use [partially-applied meta-question](/handbook/web-testing/page-element-query-language#using-partially-applied-meta-questions) `Text.of(label())` to map each page element directly to text of its label:

```typescript
const labels = () =>
    shoppingListItems()
        .eachMappedTo(Text.of(label()))
```

Next, compare the result with expected values:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Text } from '@serenity-js/web'
import { Ensure, equals } from '@serenity-js/assertions'

const labels = () =>
    shoppingListItems()
        .eachMappedTo(Text.of(label()))

await actorCalled('Alice').attemptsTo(
    Ensure.that(labels(), equals([
        'oats',
        'coconut milk',
        'coffee',
    ]))
)
```

### Filtering a collection using partially-applied meta-questions

You can use [partially-applied meta-questions](/handbook/web-testing/page-element-query-language#using-partially-applied-meta-questions) like `Text.of(label())` to filter the list of shopping list items
to only those elements that meet your [expectations](/api/core/class/Expectation):

```typescript
import { actorCalled } from '@serenity-js/core'
import { CssClasses, Text } from '@serenity-js/web'
import { Ensure, equals, includes } from '@serenity-js/assertions'

const firstBought = () =>
    shoppingListItems()
        .where(Text.of(label()), includes('co'))    // 'coffee' and 'coconut milk'
        .where(CssClasses, contain('bought'))       // 'coffee'
        .first()

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(firstBought()), equals('coffee'))
)
```

### Iterating over elements

[`PageElements#forEach`](/api/web/class/PageElements#forEach) API allows you to perform a sequence of interactions
with each element of the collection.

For example, to remove every already bought item from the list:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Click, CssClasses } from '@serenity-js/web'

const boughtItems = () =>
    shoppingListItems()
        .where(CssClasses, contain('bought'))

await actorCalled('Alice').attemptsTo(
    boughtItems().forEach(({ item, actor }) =>  // note both `item` and `actor`
        actor.attemptsTo(
            Click.on(destroyButton().of(item)),
        )
    )
)
```
