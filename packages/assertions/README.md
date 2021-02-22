# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/assertions), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

## Serenity/JS Assertions

[`@serenity-js/assertions`](https://serenity-js.org/modules/rest/) is an assertions library implementing the [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html).

### Installation

To install this module, run the following command in your computer terminal:
```console
npm install --save-dev @serenity-js/{core,assertions}
```

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


