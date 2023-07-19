---
sidebar_position: 3
---

# Page Element Query Patterns

Serenity/JS **Page Element Query Language (PEQL)** is a [Screenplay Pattern](/handbook/design/screenplay-pattern)-compatible **abstraction layer**
offering a **flexible**, **composable**, and **extensible** way to identify web elements in even the most complex web interfaces.

PEQL is designed to help you create **portable web automation code** optimised for **ease of comprehension**, **reuse**,
and **reducing test maintenance costs** across your organisation.

Serenity/JS Page Element Query Language uses **3 simple, composable abstractions** based on Screenplay [questions](/handbook/design/screenplay-pattern/#questions)
that help you identify and interact with web elements of interest:
- **[`PageElement`](/api/web/class/PageElement)** - models a **single web element**,
- **[`PageElements`](/api/web/class/PageElements)** - models a **collection of web elements**,
- **[`By`](/api/web/class/By)** - represents **portable locators** used by your browser to identify web elements of interest.

In this section, you'll how to use them together to find the exact elements your tests should interact with. 

## Working with individual page elements

To show you how to work with **individual page elements**, 
I'll use an example shopping basket widget and demonstrate locating its various parts.
The widget is simple enough to help us focus on the important aspects of PEQL, 
yet sophisticated enough to be representative of other widgets you're likely to come across in the wild:

```html
<div id="basket">
  <ul>
    <li class="item">
      <span class="name">apples</span>
      <span class="price">£2.25</span>
    </li>
    <li class="item">
      <span class="name">bananas</span>
      <span class="price">£1.50</span>
    </li>
  </ul>
  <div class="total">£3.75</div>
</div>
```

### Identifying individual page elements

One of the most common things to implement in a web-based test scenario is an interaction with a web element, like clicking on an button, entering a value into a form field, or asserting on some message
presented to the end-user.

Of course, to interact with an element you need to tell your test how to find it.
In Serenity/JS, you can define an **individual page element** like this:

```typescript
import { By, PageElement } from '@serenity-js/web'

export const basketTotal = () =>                // <- Function representing a domain concept
  PageElement.located(By.css('#basket .total')) // <- The way to locate the element, e.g. a CSS selector
    .describedAs('basket total')                // <- Description for reporting purposes
```

To define a page element:
- Create a [function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) named after the **domain concept** represented by the UI widget, such as `basketTotal`.
- Make the function return a [`PageElement`](/api/web/class/PageElement#located), configured to locate the element using one of the built-in [`By` selectors](/api/web/class/By).
- Give your page element a **human-readable description** to be used when [reporting interactions](/handbook/reporting/) with the element.


:::tip Writing portable test code
Note how giving your test functions **meaningful names**, such as `basketTotal`, helps to make your code **easier to read** and **understand**. Also note how using the `PageElement` and `By` APIs
helps your code remain **declarative**, **portable**, and agnostic of low-level integration tool-specific method calls, further improving its **reusability**.
:::

### Retrieving attributes of a page element

Serenity/JS favours [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science))
to help your code achieve polymorphic behaviour and promote code reuse.
In practice, this means that in order to retrieve a specific attribute of a `PageElement`, you compose the element
with an [appropriate web question](/api/web).

For example, to retrieve the text value of a `PageElement` returned by `Basket.total()`, compose it with a question about its [`Text`](/api/web/class/Text):

```typescript
import { By, PageElement } from '@serenity-js/web'

export const basketTotal = () =>
  PageElement.located(By.css('#basket .total'))
    .describedAs('basket total')

export const basketTotalAmount = () =>
  Text.of(basketTotal())                    // <- Compose PageElement with question about Text
    .describedAs('basket total price')      // <- Custom description (optional) 
```

Serenity/JS [web module](/api/web) offers several web-specific questions you can compose with `PageElement`, such as
[`Attribute`](/api/web/class/Attribute/), [`CssClasses`](/api/web/class/CssClasses/), [`Value`](/api/web/class/Value/),
and others.

### Transforming answers to questions

Serenity/JS questions offer not just a way to retrieve information, but also a powerful [adapter mechanism](/api/core/#QuestionAdapter) that gives you a consistent API to proxy the methods and fields of the underlying answer type,
allowing you to transform the value before it's returned.

For example, `Text.of(pageElement)` returns a `QuestionAdapter<string>`, which proxies methods available on the [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) type,
such as [`trim`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim) or [`replace`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace).
Additionally, [`Question.as`](/api/core/class/Question/#as) API offers a way to transform the answer to a question to another type.

Those two mechanisms combined give you a unique and flexible way to retrieve and transform information about the system under test and get it in the exact format you need.

For example, instead of retrieving the basket total amount as `string` you might want to clean it up and transform into a [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number):

```typescript
import { By, PageElement } from '@serenity-js/web'

export const basketTotal = () =>
  PageElement.located(By.css('#basket .total'))
    .describedAs('basket total')

export const basketTotalAmount = () =>
  Text.of(basketTotal())                // <- Compose PageElement with question about Text
    .trim()                             // <-   Compose with a question that trims the result
    .replace('£', '')                   // <-   Compose with a question that removes the currency symbol
    .as(Number)                         // <-   Compose with a question that converts the result to Number
    .describedAs('basket total price')  // <- Custom description (optional)
```

### Performing assertions

Serenity/JS web module provides [web-specific expectations](/api/core/class/Expectation) you use
to verify if the actual state of the given element is what you expect it to be.

For example, you might want to ensure that a given element [is visible](/api/web/function/isVisible), i.e. not obstructed by other elements:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure } from '@serenity-js/assertions'
import { isVisible } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
  Ensure.that(basketTotal(), isVisible()),
)
```

You can also assert that a specific property of the element, like its [text](/api/web/class/Text), has a certain value:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'

await actorCalled('Alice').attemptsTo(
  Ensure.that(Text.of(basketTotal()), equals('£3.75')),
)
```


Note that Serenity/JS expectations are **type-safe** and **portable**.
This means that you're not limited to using just the web-specific expectations in your web tests,
and you can use any other expectations from the [Serenity/JS assertions module](/api/assertions)
or even [write them yourself](/api/core/class/Expectation).

:::info Learn more
Learn more about asserting on page elements in chapter "[Web assertions](/handbook/design/assertions#web-assertions)".
:::

### Waiting for condition

Serenity/JS web module provides [web-specific expectations](/api/core/class/Expectation) you use
to synchronise your test code with the system under test and wait until its state meets your expectations.

For example, you might want for your test scenario to wait until a given element [is present](/api/web/function/isPresent) in the DOM tree:

```typescript
import { actorCalled, Duration, Wait } from '@serenity-js/core'
import { isPresent } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
  Wait.upTo(Duration.ofSeconds(2))
    .until(basketTotal(), isPresent()),
)
```

You can also wait for a specific property of the element, like its [text](/api/web/class/Text), to have a certain value:

```typescript
import { actorCalled, Wait } from '@serenity-js/core'
import { startsWith } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
  Wait.until(Text.of(basketTotal()), startsWith('£')),
)
```

Note that just like with performing the assertions, your web scenarios can use all the expectations from the [Serenity/JS assertions module](/api/assertions)
or you can [write some them yourself](/api/core/class/Expectation).

:::info Learn more
Learn more about synchronising your web tests with the system under test in chapter "[Waiting and synchronisation](/handbook/design/waiting-and-synchronisation)".
:::

### Just-in-time evaluation of questions

Serenity/JS questions, like the [`PageElement`](/api/web/class/PageElement/) returned by calling `basketTotal()`,
or a chain of composed questions like `Text.of(basketTotal()).trim().replace('£', '').as(Number)`, represent a **mechanism for the actor to retrieve the value**, and **not the value itself**.

As such, questions are evaluated **just-in-time** and only when the actor needs to retrieve the underlying value.

For example, the text of the basket total is retrieved only when an actor performs an assertion:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

export const basketTotalAmount = () =>  //     
  Text.of(basketTotal())                // <- A question describes a way for an actor
    .describedAs('basket total price')  //    to retrieve some information

await actorCalled('Alice').attemptsTo(
  Ensure.that(                          // <- A task like `Ensure` makes the actor "answer"
    basketTotalAmount(),                //    the question and retrieve the value 
    equals('£3.75')
  )
)
```

This just-in-time evaluation mechanism also has another benefit.
It allows Serenity/JS questions to be used in tool- and interface-agnostic [synchronisation tasks](/handbook/design/waiting-and-synchronisation),
where it might take several attempts until the question returns the desired result:

```typescript
import { actorCalled, Duration, Wait } from '@serenity-js/core'
import { equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
  Wait.until(basketTotalAmount(), equals('£3.75'))
    .pollingEvery(Duration.ofMilliseconds(500))
)
```

:::info Pro Tip
Note that the result of **composing questions** is also a **question**.
This design makes questions reusable and allows for them to be composed further, until they're finally resolved by an [_actor_](/handbook/design/screenplay-pattern).
:::

## Working with a collection of page elements

[`PageElements`](/api/web/class/PageElements) class is a [Screenplay Pattern](/handbook/design/screenplay-pattern)-compatible
abstraction that represents a collection of [elements](https://developer.mozilla.org/en-US/docs/Glossary/Element) in a web interface
that share some common characteristic.

To help you understand how to use this abstraction, remember the shopping basket widget I showed you earlier:

```html
<div id="basket">
  <ul>
    <li class="item">
      <span class="name">apples</span>
      <span class="price">£2.25</span>
    </li>
    <li class="item">
      <span class="name">bananas</span>
      <span class="price">£1.50</span>
    </li>
  </ul>
  <div class="total">£3.75</div>
</div>
```

### Modelling a collection of page elements

Similarly to how you model a [single page element](/handbook/web-testing/page-element-query-language/#modelling-a-single-page-element), to model a **collection of page elements**:
- Create a function that captures the name of the concept they represent, like `basketItems`.
- Make the function return a [PageElements](/api/web/class/PageElements/#located) object.
- Define a custom description to be used for reporting purposes.

For example, you could represent the items displayed in the shopping basket as follows:

```typescript
import { By, PageElements } from '@serenity-js/web'

const basketItems = () =>
  PageElements.located(By.css('#basket .item')) // <- Note plural `PageElements` 
    .describedAs('basket items')                //    instead of `PageElement`
```

Note that in the code sample above, selector `By.css('#basket .item')` makes the collection target **both** the `<li class="item" />` elements,
each of which containing two descendant elements: `<span class="name" />` and `<span class="price" />` .

In a moment, I'll show you [how to make your queries more precise](/handbook/web-testing/page-element-query-language/#querying-page-elements)
and retrieve only those elements you need.

### Retrieving element from a collection

If you need to retrieve a specific element from a collection, and you know what position it occupies, you can use
[`PageElements#first()`](/api/web/class/PageElements#first), 
[`PageElements#last()`](/api/web/class/PageElements#last), 
and [`PageElements#nth(index)`](/api/web/class/PageElements#nth) APIs:

```typescript
import { By, PageElements } from '@serenity-js/web'

const firstItem = () =>
  PageElements.located(By.css('#basket .item'))
    .first()

const secondItem = () =>
  PageElements.located(By.css('#basket .item'))
    .nth(1)                                         // <- Note the zero-based indexing

const lastItem = () =>
  PageElements.located(By.css('#basket .item'))
    .last()
```

Above APIs are particularly useful when you need to retrieve elements from a sorted collection, 
such as the most recent comment under an article, the last customer order in a CRM system,
nth position from a league table, and so on.

### Retrieving text of multiple elements

Similarly to [`PageElement`](/api/web/class/PageElement), [`PageElements`](/api/web/class/PageElements) can be composed with other questions,
like [`Text.ofAll`](/api/web/class/Text):

```typescript
import { Text, PageElements } from '@serenity-js/web'

const basketItemNameElements = () =>
  PageElements.located(By.css('#basket .item .name'))
    .describedAs('basket item names')

const basketItemNameElementNames = () =>
    Text.ofAll(basketItemsNames())
```

[`Text.ofAll`](/api/web/class/Text) API is useful when you need to retrieve text content of multiple elements and assert on it all at once:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Ensure, equals } from '@serenity-js/assertions'
import { Text } from '@serenity-js/web'

await actorCalled('Alice').attemptsTo(
    Ensure.that(Text.ofAll(basketItemNameElements()), equals([
        'apples',
        'bananas',
    ]))
)
```

However, note how in the above code sample we had to introduce a new function `basketItemNameElements`, which is almost the same
as `basketItems` you saw earlier.
The only real difference is that the new function makes the selector _a bit_ more precise
and helps us to return just the item name, and not the price:

```typescript
const basketItems = () =>
  PageElements.located(By.css('#basket .item'))       // <- 
    .describedAs('basket items')                      //    Selectors are
                                                      //    _almost_  
const basketItemNameElements = () =>                  //    identical
  PageElements.located(By.css('#basket .item .name')) // <-
    .describedAs('basket item names')
```

:::warning duplicate selectors increase maintenance costs
Having multiple _almost identical_ but _slightly different_ selector definitions in the same test suite (or even the same test!)
is typically tolerated by software delivery teams due to poor support for code reuse offered by most test automation tooling.

However, this **duplication** also leads to **increased maintenance costs**.
That's because even a small change to the structure of the UI might require you
to fix multiple selectors in your test automation code. Not to mention the issue gets worse the more complex selectors you use.
:::

To help you avoid duplicate selectors like the ones above, Serenity/JS page elements are designed to be **composable** and **reusable**
through a mechanism called "meta-questions", which I'm about to show you.

### Composing page elements using meta-questions

[Meta-questions](/api/core/interface/MetaQuestion) are "questions about questions",
so ones that can be composed with other questions and answered in their context.

Conveniently, [`PageElement`](/api/web/class/PageElement/) is a meta-question that can be 
composed with another `PageElement` using a declarative [`childElement.of(parentElement)`](/api/web/class/PageElement/#of) API
to dynamically model a descendant/ancestor (a.k.a. child/parent) relationship between the elements.

To avoid duplicating element selectors, we can introduce functions called `basketItem()` and `itemName()`
and compose them together as `itemName().of(basketItem())`:

```typescript
import { actorCalled } from '@serenity-js/core'
import { By, PageElement } from '@serenity-js/web'
import { Ensure, equals } from '@serenity-js/assertions'

const basketItem = () =>
  PageElement.located(By.css('#basket .item')) // <- Note singular `PageElement` 
    .describedAs('basket item')

const itemName = () =>                         
  PageElement.located(By.css('.name'))         // <- Locator targeting  
    .describedAs('name')                       //    just the .name element

await actorCalled('Alice').attemptsTo(
  Ensure.that(
    Text.of(                                   // <- retrieve text of
        itemName().of(basketItem())            //    composed page elements   
    ),      
    equals('apples')    
  ),
)
```

Serenity/JS lets you compose not just the page elements, but also their **descriptions**.
In our example, description of `Text.of(itemName().of(basketItem()))` will be **derived from individual descriptions** of 
questions in the chain and reported as `text of name of basket item`. 
Of course, you can [set your own description](/handbook/web-testing/page-element-query-language/#customising-page-element-description)
if you prefer, too.

:::tip Serenity/JS PEQL helps you avoid code duplication
Serenity/JS PEQL lets you **compose** and **reuse** page element definitions,
helping you to avoid code duplication and reduce maintenance costs.

Using **meta questions** to enable page element reuse can be a great productivity boost,
especially when the system under test uses a consistent convention to name element identifiers and classes.
:::

You might have noticed that [`childElement.of(parentElement)`](/api/web/class/PageElement/#of) API
works only with **individual elements**.
To map **multiple elements** we need to use `PageElements` [mapping API](/handbook/web-testing/page-element-query-language/#mapping-page-elements-in-a-collection) we'll talk about next.


## ~~ REVIEW ~~




 

























### Mapping page elements in a collection

Similarly to how you [transform answers to individual questions](/handbook/web-testing/page-element-query-language/#transforming-answers-to-questions),
you can also map each element in a collection to transform its value or type. To do that, use the [`PageElements#eachMappedTo`](/api/web/class/PageElements#eachMappedTo) API.

using the [`PageElements#eachMappedTo`](/api/web/class/PageElements#eachMappedTo) API

:::info Meta-questions
/api/core/interface/MetaQuestion/
:::

Just like with using [functional composition](https://en.wikipedia.org/wiki/Function_composition_(computer_science))
and [meta-questions](/api/core/interface/MetaQuestion)
to map an individual element to [another type](#composing-questions) or [another element](#using-meta-questions),
you can map each element in a collection of page elements. 

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

## Querying Page Elements

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


### Filtering page elements in a collection - REVIEW

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



---

## Other stuff

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
