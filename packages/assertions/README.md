# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Assertions

[`@serenity-js/assertions`](https://serenity-js.org/modules/rest/) is an assertions library implementing the [Screenplay Pattern](https://serenity-js.org/handbook/thinking-in-serenity-js/screenplay-pattern.html).

### Installation

To install this module, run the following command in your computer terminal:
```console
npm install --save-dev @serenity-js/{core,assertions}
```

### Performing verifications using `Ensure`

```typescript
import { Ensure, endsWith } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

await actorCalled('Erica').attemptsTo(
    Navigate.to('https://serenity-js.org'),
    Ensure.that(
        Page.current().title(), 
        endsWith('Serenity/JS')
    ),
);
```

### Controlling execution flow using `Check`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Check } from '@serenity-js/assertions'; 
import { Click, isVisible } from '@serenity-js/protractor';

await actorCalled('Erica').attemptsTo(
    Check.whether(NewsletterModal, isVisible())
        .andIfSo(Click.on(CloseModalButton)),
);
```

### Synchronising the test with the System Under Test using `Wait`

```typescript
import { actorCalled } from '@serenity-js/core';
import { Click, isVisible, Wait } from '@serenity-js/protractor';

await actorCalled('Erica').attemptsTo(
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

await actorCalled('Erica').attemptsTo(
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

await actorCalled('Erica').attemptsTo(
    Ensure.that(5, isWithin(3, 6)),
);
```


