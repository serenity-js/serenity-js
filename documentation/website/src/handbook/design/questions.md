---
title: Questions
layout: handbook.hbs
---
# Questions

A "question" in one of the five building blocks of the [Screenplay Pattern](/handbook/design/screenplay-pattern.html). 

Answering a question enables the [actor](/handbook/design/actors.html) to retrieve information about the state of the system under test or its execution environment. 

Such information can then be passed to an [interaction](/handbook/design.interactions.html), [asserted on](/modules/assertions/class/src/Ensure.ts~Ensure.html), or used to [control flow](/modules/assertions/class/src/Check.ts~Check.html) of the scenario.

<figure>
![The Screenplay Pattern](/handbook/design/images/the-screenplay-pattern.png)
    <figcaption><span>The Screenplay Pattern</span></figcaption>
</figure>

## Implementing Questions

Serenity/JS modules provide you with [dozens of questions](/modules)
you can use in your acceptance tests. You'll find the ones you'll need in your Web-based tests in the [`@serenity-js/protractor`](/modules/protractor/identifiers.html#screenplay-questions) module, and the ones dedicated to REST API-based tests in [`@serenity-js/rest`](/modules/rest/identifiers.html#screenplay-questions).

### A `Question.about`...

The [`Question.about`](/modules/core/class/src/screenplay/Question.ts~Question.html#static-method-about) [factory method](https://en.wikipedia.org/wiki/Factory_method_pattern) is the easiest way to define a custom question.

Let's say that we wanted to define a question called `NameOfTheActor()` that returned the name of the [actor](/handbook/design/actors.html) who answers it. 

Here's how we could go about it:

```typescript
import { Actor, Question } from '@serenity-js/core';

const NameOfTheActor = () => 
    Question.about('the name of the actor', (actor: Actor) => actor.name);
```

As you can see above, there are only three things you need to define a custom question:
- the name of the function that will create the question, in this case `NameOfTheActor()`,
- a description of the question's subject, here `'the name of the actor'`, which will be used when [reporting](/handbook/reporting/) on the actor answering this question,
- a question body, which is a function that receives an [`Actor`](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html) and returns an answer to the question - here: `(actor: Actor) => actor.name`.

While in the above example we return the answer to the question directly, a much more common and idiomatic approach is to use the actor's [abilities](/handbook/design/abilities.html) to produce it.

For example, a question to retrieve the title of the current page could be designed to use the ability to [`BrowseTheWeb`](/modules/protractor/class/src/screenplay/abilities/BrowseTheWeb.ts~BrowseTheWeb.html):

```typescript
import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';

const WebsiteTitle = () =>
    Question.about('the title of the website', actor => 
        BrowseTheWeb.as(actor).getTitle() // returns Promise<string>
    );
```

In the above example we retrieve actor's ability to `BrowseTheWeb` and then use that to perform the lower-level call.

**Please note**: Instead of implementing your own custom question to retrieve the title of the website it's better to  use [`Website.title()`](/modules/protractor/class/src/screenplay/questions/Website.ts~Website.html#static-method-title) Serenity/JS already ships with.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The function provided as a question body can return an answer either synchronously or asynchronously using a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
    </p></div>
</div>

## Questions and Interactions

Most Serenity/JS [interactions](/handbook/design/interactions.html) can be parameterised, and those that can be parameterised will accept both synchronous and asynchronous questions, as well as regular static and `Promise`d values - referred to collectively as [`Answerable`s](/modules/core/typedef/index.html#static-typedef-Answerable<T>).

This design gives you an incredibly flexible and powerful mechanism to form the foundation of your tests. It also means
that you don't need to worry if a given interaction is synchronous or asynchronous, or if a given question returns a static value or a `Promise` -  Serenity/JS will synchronise them all for you and help you keep your code free of callback mess.

To illustrate how questions and interactions work together, let's look at [`Target`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html) - a question we use to identify interactive elements on a website.

Consider the below [HTML form](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) component, allowing readers to add a comment to an article on an imaginary website:

```markup
    <form id="new-comment">
        <div>
            <label for="comment">Comment:</label>
            <textarea id="comment"></textarea>
        </div>
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" />
        </div>
        <div>
            <input type="submit" />
        </div>
    </form>
```

To interact with the component, we define a [Lean Page Object](/handbook/thinking-in-serenity-js/lean-page-objects.html) called `NewComment`:

```typescript
import { Target } from '@serenity-js/core';
import { by } from 'protractor';

class NewComment {
    static Form =
        Target.the('"new comment" form')
            .located(by.id('new-comment'));
    
    static NameField =
        Target.the('name field')
            .located(by.id('name'));
    
    static CommentField =
        Target.the('comment field')
            .located(by.id('comment'));
    
    static SubmitButton =
        Target.the('submit button')
            .of(NewComment.Form)            // <- a nested Target
            .located(by.css('input[type="submit"]'));
}
```

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
        All those [`Target.the`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html#static-method-the) 
        statements above create questions that, when [answered](/modules/core/class/src/screenplay/actor/Actor.ts~Actor.html#instance-method-answer) by the actor,
        resolve to [`ElementFinder`](https://www.protractortest.org/#/api?view=ElementFinder) objects (or in case of
        [`Target.all`](/modules/protractor/class/src/screenplay/questions/targets/Target.ts~Target.html#static-method-all) -
        [`ElementArrayFinder`](https://www.protractortest.org/#/api?view=ElementArrayFinder) objects),
        which are Protractor's extensions of the regular
        [`WebElement`](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html)
        class coming from the [`selenium-webdriver`](https://www.npmjs.com/package/selenium-webdriver) module.
    </p></div>
</div>

Now, to fill out the form, we define a sequence of parameterised interactions and give them to an actor to perform:  

```typescript
import { actorCalled } from '@serenity-js/core';
import { BrowseTheWeb, Enter, Click } from '@serenity-js/protractor';
import { protractor } from 'protractor';

actorCalled('Alice')
    .whoCan(BrowseTheWeb.using(protractor.browser))
    .attemptsTo(
        Enter.theValue('Nice website!')     // <- a static value
            .into(NewComment.CommentField), // <- a Target passed to an interaction to Enter

        Enter.theValue(NameOfTheActor())    // <- our custom question
            .into(NewComment.NameField),    //    returning a static value

        Click.on(NewComment.SubmitButton),  // <- a Target passed to an interaction to Click
    );
```

There are several interesting things about the code samples above:
- the interaction to [`Enter.theValue`](/modules/protractor/class/src/screenplay/interactions/Enter.ts~Enter.html) accepts both a regular string (`'Nice website!'`) and the custom question `NameOfTheActor()` we implemented earlier; most Serenity/JS interactions have this capability,
- the `NewComment.SubmitButton` is defined as a "nested target", so a `Target` relative to another `Target`. You can see more examples of this design in [unit tests](/modules/protractor/test-file/spec/screenplay/questions/Target.spec.ts.html).

### Mapping the answers

So now you know how to retrieve information about the system under test and its execution environment, but what if this information needs some processing before it can be used further?

Let's say for example that we have the following widget, describing a discount a customer would get on our website:

```markup
<div id="order-summary">
    <!-- other entries of the order summary --> 

    <span data-test="percentage-discount">7.5%</span>
</div>
```

We can, of course, get its text using the [`Text.of`](/modules/protractor/class/src/screenplay/questions/text/Text.ts~Text.html#static-method-of) question and then pass it to an interaction like [`Ensure`](/modules/assertions/class/src/Ensure.ts~Ensure.html) (responsible for performing [assertions](/handbook/design/assertions.html)):

```typescript
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Target, Text } from '@serenity-js/protractor';
import { by } from 'protractor';

class OrderSummary {
    static DiscountWidget =
        Target.the('discount widget')
           .located(by.css('[data-test="percentage-discount"]'));
}

actorCalled('Alice').attemptsTo(
    Ensure.that(Text.of(OrderSummary.DiscountWidget), equals('7.5%')),
);
```

In many cases, asserting on a text value of an element is perfectly fine, but what if our test needed to check if the discount applied is **less than 10%**?

We'd have to first convert the text value to a number, wouldn't we?

That's where [`Question#map`](/modules/core/class/src/screenplay/Question.ts~Question.html#instance-method-map) comes into play!

```typescript
import { Ensure, isLessThan } from '@serenity-js/assertions';
import { actorCalled, trim, replace, toNumber } from '@serenity-js/core';
import { Target, Text } from '@serenity-js/protractor';
import { by } from 'protractor';

class OrderSummary {
    static DiscountWidget =
        Target.the('discount widget')
            .located(by.css('[data-test="percentage-discount"]'));

    static DiscountPercentage =
        Text.of(OrderSummary.DiscountWidget)
            .map(trim())                        // <- remove leading and trailing whitespace
            .map(replace('%', ''))              // <- remove the '%' character
            .map(toNumber())                    // <- map what's left to a `number`
}

actorCalled('Alice').attemptsTo(
    Ensure.that(OrderSummary.DiscountPercentage, isLessThan(10)), // compare as number rather than string
);
```

There are several interesting things demonstrated in the code sample above:
- `trim()`, `replace()`, `toNumber()` and [other mapping functions](/modules/core/identifiers.html#screenplay-questions-mappings-string) come from the `@serenity-js/core` module, which means they're applicable to _any question_, and not just the Web-specific ones,
- `.map()` calls can be chained.

There's more to `.map()` method, though:
- it accepts custom functions, which can be either:
    - synchronous: `.map(actor => value => value.replace('%', ''))`,
    - or asynchronous: `.map(actor => value => Promise.resolve(value.replace('%', ''))`,
- it works on _any question_, including the custom ones, i.e. `NameOfTheActor().map(toUpperCase())`
- you can use the same technique to map both a question returning a single value, but also a question returning a list of values. This is particularly useful when you need to apply the same transformation to all the rows in an HTML table, or all entries returned in an [API response](modules/rest/class/src/screenplay/questions/LastResponse.ts~LastResponse.html)
- all the parameterised mapping functions accept [`Answerable`s](/modules/core/typedef/index.html#static-typedef-Answerable<T>) too.

<div class="pro-tip">
    <div class="icon"><i class="fas fa-lightbulb"></i></div>
    <div class="text"><p><strong>PRO TIP:</strong>
    The interaction to [`Ensure`](/modules/assertions/class/src/Ensure.ts~Ensure.html) is responsible for performing assertions and comes from the `@serenity-js/assertions` module.
    You'll learn more about them in the [next chapter](/handbook/design/assertions.html).
    </p></div>
</div>


### Changing the subject

One of the great things about Serenity/JS is how it reports the activities performed by the actors.

For example:
- `OrderSummary.DiscountWidget` gets reported as `"the discount widget"`,
- `Text.of(OrderSummary.DiscountWidget)` becomes `"text of the discount widget"`, and so on.

However, this also means that in more complex cases this description can become quite a mouthful.

Consider the below example that uses [nested targets](/modules/protractor/test-file/spec/screenplay/questions/Target.spec.ts.html):

```typescript
import { trim, replace, toNumber } from '@serenity-js/core';
import { Target, Text } from '@serenity-js/protractor';
import { by } from 'protractor';

class OrderSummary {
    static Widget =
        Target.the('order summary')
            .located(by.id('order-summary'));

    static DiscountWidget =
        Target.the('discount widget')
            .of(OrderSummary.Widget)            // <- nested Target
            .located(by.css('[data-test="percentage-discount"]'));

    static DiscountPercentage =
        Text.of(OrderSummary.DiscountWidget)
            .map(trim())                        // <- mappings
            .map(replace('%', ''))
            .map(toNumber())
}
```

In this case, `OrderSummary.DiscountPercentage` would get reported as `"text of the discount widget of the order summary"`. 

To override this automatically-generated description of the question's subject with a custom one, use [`Question#describedAs()`](/modules/core/class/src/screenplay/Question.ts~Question.html#instance-method-describedAs): 

```typescript
class OrderSummary {
    // other fields omitted for brevity

    static DiscountPercentage =
        Text.of(OrderSummary.DiscountWidget)
            .map(trim())                        
            .map(replace('%', ''))
            .map(toNumber())
            .describedAs('discount percentage') // <- subject name override
}
```

