# Assertions

Serenity/JS does not force you to use any particular assertion library, so you can use any that supports promises.

The examples below assume that you're using [chai](http://chaijs.com/) 
with [chai-as-promised](https://github.com/domenic/chai-as-promised).

```typescript
import chai = require('chai');
chai.use(require('chai-as-promised'));

const expect = chai.expect;
```

## Go with the flow

To execute an assertion as part of the actor's flow, we need to wrap it into a [Task](screenplay-pattern.md#task),
such as the built-in one - to `See`:

```typescript
import { See } from 'serenity-js/lib/screenplay';

See.if<T>(question: Question<T>, assertion: Assertion<T>);
```

For example, if we wanted to check if a specific item is present in a list of items displayed on the screen, defines as:

```typescript
export class TodoList {
    static Items_Available = Text.ofAll(Target.the('items on the list').located(by.repeater('todo in todos')));
}
```

We could instruct the actor:

```typescript
actor.attemptsTo(
    See.if(TodoList.Items_Available, items => expect(items).to.eventually.include('some item of interest')),
)
```

This works, but is not particularly readable. Let's improve it.

## Aliasing

The name of the expected element from the above example:

```typescript
items => expect(items).to.eventually.include.('some item of interest');
```

could be made configurable:

```typescript
epected => actual => expect(items).to.eventually.include(epected);
```

We could also give the above function a name, and store it in our project as, say `assertions.ts`, so that
it can be reused in other scenarios:
  
```typescript
// assertions.ts
export include = epected => actual => expect(items).to.eventually.include(epected);
```  

With this one-liner in place, we could improve the task definition from the previous example:

```typescript
import { include } from './assertions.ts';

actor.attemptsTo(
    See.if(TodoList.Items_Available, include('some item of interest')),
)
```

## Domain-specific assertions

The scenario where aliasing and domain-specific assertion can be very useful is in more complex domains,
where you implement domain-specific questions. For example:

```typescript
See.if(TradeConfirmation.Last_Trade, wasExecutedWithin(4, 'millis'))
```

## Retaining semantic meaning

A regular chai assertion, such as this one:

```typescript
expect(1 + 1).to.equal(2);
```

does not retain any semantic meaning at runtime. If it fails - it throws an error, but it it passes, you won't notice it.

However, audit or compliance reasons might require our tests to report 
that a given assertion has been performed. 

In those scenarios, the task to `See` can be wrapped in any regular task, [annotated](../overview/reporting.md) 
with `@step`, so that it gets reported. For example:


```typescript
class AccountILocked implements Task {

    @step('{0} ensures that \'#account\' is locked and can no longer be modified')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.if(AccountStatus.of(this.account), isMarkedAs('locked')),
        );
    }

    constructor(private account: string) {
    }
}
```

:bulb: **PRO TIP**: Wrapping an assertion into a task lets you execute it as part of any other task, 
for example as a precondition.
 
## Delayed assertions

Sometimes an assertion needs to be performed against something that occured earlier on in the scenario
and is no longer available.

For example, an actor is shown a popup with a voucher code that will be applied to their shopping basket
should they choose to subscribe to a newsletter. When the actor is ready for checkout, we'd like to assert that
the voucher they've been shown has been applied.

This scenario requires an actor, stateless by nature, to take note of what they've seen.
For this reason, we need to give the actor the following ability:

```typescript
import { TakeNotes } from 'serenity-js/lib/screenplay';

Actor.named('Benjamin').whoCan(TakeNotes.usingAnEmptyNotepad());
```

An actor, of course, can have many abilities:

```typescript
Actor.named('Benjamin').whoCan(TakeNotes.usingAnEmptyNotepad(), BrowseTheWeb.using(protractor.browser), /* etc */);
```

With the ability to `TakeNotes` in place, and some questions they can ask defined:

```typescript
export class MarketingPopup {
    static Voucher_Code = Text.of(Target.the('voucher code').located(by.id('newsletter-voucher')));
}

export class Checkout {
    static Applied_Vouchers = Text.ofAll(Target.the('applied vouchers').located(by.repeater('voucher in vouchers')))
}
```

and an `include` assertion like in the previous example, an actor can:

```typescript
actor.attemptsTo(
    TakeNote.of(MarketingPopup.Voucher),
    
    /* ... perform other tasks */
    
    CompareNotes.toSeeIf(Checkout.Applied_Vouchers, include, MarketingPopup.Voucher),
);
```

{% include "../feedback.md" %}