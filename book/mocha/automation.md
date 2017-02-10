# Automation

Let's see how Serenity/JS can be plugged into a Mocha test scenario, and how to use 
the [`describe` and `it` blocks](https://mochajs.org/#bdd) effectively so that both the scenarios and the reports
capture the domain knowledge and vocabulary. 

## Name of the feature

Serenity/JS interprets the outer-most describe block of a Mocha test scenario as the **name of the feature**:
 
```typescript
describe('Earning Frequent Flyer points on domestic flights', () => {
    
});
```
 
## Title of the scenario

The title of the `it` block becomes the title of the test scenario.

```typescript
describe('Earning Frequent Flyer points on domestic flights', () => {
    
    it('Flying in Economy class earns standard points', () => {
        
    });
});
```

### Nesting scenarios

In fact, any nested `describe` blocks, together with the final `it` contribute to the title of the scenario.
This means that you can neatly group scenarios together:

```typescript
describe('Earning Frequent Flyer points on domestic flights', () => {
    describe('Flying in', () => {
        describe('Economy class', () => {
            it('earns standard points');
            it('earns 1.5x when travelling 8 times per month or more');
        });
        
        describe('Business class', () => {
            it('earns double points');
        });
    });                
});
```

Which will be then reported as follows:
 
![Mocha feature coverage](./images/feature-coverage-pending.png)
 

:bulb: **PRO TIP**: Leaving out the test scenario body marks it as _pending implementation_ rather than _passing_: 
```typescript
it('has just the title');           // reported as pending
it('has the body too', () => {});   // reported as passing
``` 
 
## The stage call

To make the actors interact with the system under test, 
we [again](../cucumber/automation.md#all-the-worlds-a-stage) need the [`Stage`](../design/stage.md).

With Mocha, however, the setup is much simpler than with Cucumber, so an instance of the `stage` can be a simple 
constant, defined in the scope of one of the `describe` blocks:

```typescript
// features/frequent_flyer_points-domestic_flights.ts

import { serenity } from 'serenity-js';
import { Travellers } from '../spec/screenplay/travellers.ts';

describe('Earning Frequent Flyer points on domestic flights', () => {
    
    const stage = serenity.callToStageFor(new Travellers());

    describe('Flying in', () => {
        describe('Economy class', () => {
            it('earns standard points');
            it('earns 1.5x when travelling 8 times per month or more');
        });
        
        describe('Business class', () => {
            it('earns double points');
        });
    });                
});
```

Where the `Travellers` are our domain-specific cast of actors:

```typescript
// spec/screenplay/travellers.ts

import { protractor } from 'protractor';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

class Travellers implements Cast {
    actor(name: string): Actor {
        return Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
```

To learn more about how to define the custom cast of actors, [find out more about the `Stage`](../design/stage.md).

## The actors

With the stage in place, you can now put an actor into the spotlight.

You can do this by either creating an actor within the scope of an `it` block:

```typescript
// features/frequent_flyer_points-domestic_flights.ts

import { serenity } from 'serenity-js';
import { Travellers } from '../spec/screenplay/travellers.ts';

describe('Earning Frequent Flyer points on domestic flights', () => {
    
    const stage = serenity.callToStageFor(new Travellers());
    
    describe('Flying in Economy class', () => {
        
        it('earns standard points', () => stage.theActorCalled('James').attemptsTo(
              /* perform tasks */
        ));
        
        // etc.
    });                
});
```

Or, if there are some common tasks that need to be repeated for before or after several scenarios, you
could use Mocha's [hooks](https://mochajs.org/#hooks), such as `before`, `after`, `beforeEach` and `afterEach`:

```typescript
// features/frequent_flyer_points-domestic_flights.ts

import { serenity } from 'serenity-js';
import { Travellers } from '../spec/screenplay/travellers.ts';

describe('Earning Frequent Flyer points on domestic flights', () => {
    
    const stage = serenity.callToStageFor(new Travellers());
    
    describe('Flying in Economy class', () => {
        
        beforeEach(() => stage.theActorCalled('James').attemptsTo(
            /* perform setup tasks */
        ));
        
        it('earns standard points', () => stage.theActorInTheSpotlight().attemptsTo(
              /* perform tasks */
        ));
        
        afterEach(() => stage.theActorInTheSpotlight().attemptsTo(
            /* perform teardown tasks */
        ));
        
        // etc.
    });                
});
```


## Synchronisation

An important thing to note here is that a call to `actor.attemptsTo(...)` 
always returns a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Since Mocha is Promise-aware, we can return a promise from the function that defined the body of the test scenario,
and Mocha will wait for it to be resolved:

```typescript
it('earns standard points', function () {
    return stage.theActorCalled('James').attemptsTo(
        /* perform tasks */
    );
});
```

We can also use a convenient [fat arrow notation](https://basarat.gitbooks.io/typescript/content/docs/arrow-functions.html)
to make it more compact:

```typescript
it('earns standard points', () => stage.theActorCalled('James').attemptsTo(
    /* perform tasks */
));
```

With the `attempsTo` in place you can now give the actor some [Tasks](../design/screenplay-pattern.md#task) 
or [assertions](../design/assertions.md) to perform!

{% include "../_partials/feedback.md" %}
