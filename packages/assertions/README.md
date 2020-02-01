# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Assertions

An assertion library implementing the Screenplay Pattern.

### Performing verifications using `Ensure`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Ensure, endsWith } from '@serenity-js/assertions';
import { Website } from '@serenity-js/protractor';

const actor = actorCalled('Erica');

actor.attemptsTo(
    Ensure.that(Website.title(), endsWith('Serenity/JS'))
);
```

### Controlling execution flow using `Check`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Check } from '@serenity-js/assertions'; 
import { Click, isVisible } from '@serenity-js/protractor';

actorCalled('Erica').attemptsTo(
    Check.whether(NewsletterModal, isVisible())
        .andIfSo(Click.on(CloseModalButton)),
);
```

### Synchronising the test with the System Under Test using `Wait`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Click, isVisible, Wait } from '@serenity-js/protractor';

actorCalled('Erica').attemptsTo(
    Wait.until(CloseModalButton, isVisible()),
    Click.on(CloseModalButton)
);
```

### Defining custom expectations using `Expectation.thatActualShould`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Expectation, Ensure } from '@serenity-js/assertions';

function isDivisibleBy(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value divisible by', expected)
        .soThat((actualValue, expectedValue) => actualValue % expectedValue === 0);
}

actorCalled('Erica').attemptsTo(
    Ensure.that(4, isDivisibleBy(2)),
);
```

### Composing expectations using `Expectation.to`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Expectation, Ensure, and, or, isGreaterThan, isLessThan, equals  } from '@serenity-js/assertions';

function isWithin(lowerBound: number, upperBound: number) {
    return Expectation
        .to(`have value within ${ lowerBound } and ${ upperBound }`)
        .soThatActual(and(
           or(isGreaterThan(lowerBound), equals(lowerBound)),
           or(isLessThan(upperBound), equals(upperBound)),
        ));
}

actorCalled('Erica').attemptsTo(
    Ensure.that(5, isWithin(3, 6)),
);
```


