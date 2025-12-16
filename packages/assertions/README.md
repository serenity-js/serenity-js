# Serenity/JS Assertions

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Fassertions.svg)](https://badge.fury.io/js/%40serenity-js%2Fassertions)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/assertions/badge.svg)](https://snyk.io/test/npm/@serenity-js/assertions)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[`@serenity-js/assertions`](https://serenity-js.org/api/assertions/) 
provides a rich set of [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/)-compatible assertions and expectations for verifying the system under test and synchronising the test flow.

## Features

- **Fluent, expressive assertions** following the [Screenplay Pattern](https://serenity-js.org/handbook/design/screenplay-pattern/) for readable and maintainable tests.
- **Seamless integration** with all [supported test runners](https://serenity-js.org/handbook/test-runners/).
- **Rich set of built-in matchers** for common scenarios, with easy support for custom matchers.
- **TypeScript-first design** with strong typing for safer, more predictable test code.

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/assertions
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).


## Quick Start

```typescript
import { actorCalled } from '@serenity-js/core';
import { Ensure, equals } from '@serenity-js/assertions';

await actorCalled('Alice').attemptsTo(
    Ensure.that(2 + 2, equals(4))
)
```

Explore practical examples and in-depth explanations in the [Serenity/JS Handbook](https://serenity-js.org/handbook/).

## Usage Examples

### Performing assertion

To perform an assertion, use the [`Ensure.that`](https://serenity-js.org/api/assertions/class/Ensure/)
or [`Ensure.eventually`](https://serenity-js.org/api/assertions/class/Ensure/#eventually) tasks,
along with an appropriate [expectation](https://serenity-js.org/api/assertions/):

```typescript
import { Ensure, endsWith } from '@serenity-js/assertions'
import { actorCalled } from '@serenity-js/core'
import { Navigate, Page } from '@serenity-js/web'

await actorCalled('Erica').attemptsTo(
    Navigate.to('https://serenity-js.org'),
    Ensure.that(
        Page.current().title(), 
        endsWith('Serenity/JS')
    ),
)
```

### Controlling execution flow

To control the execution flow based on certain conditions, use the [`Check.whether`](https://serenity-js.org/api/core/class/Check/) task:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Check } from '@serenity-js/assertions' 
import { Click, isVisible } from '@serenity-js/web'

await actorCalled('Erica').attemptsTo(
    Check.whether(NewsletterModal, isVisible())
        .andIfSo(Click.on(CloseModalButton)),
)
```

### Synchronising execution with the System Under Test

To synchronise the test flow with the state of the System Under Test,
use the [`Wait.until`](https://serenity-js.org/api/core/class/Wait/) task:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Click, isVisible, Wait } from '@serenity-js/web'

await actorCalled('Erica').attemptsTo(
    Wait.until(CloseModalButton, isVisible()),
    Click.on(CloseModalButton)
)
```

### Defining custom expectations

To define a custom expectation,
use the [`Expectation.thatActualShould`](https://serenity-js.org/api/assertions/#defining-custom-expectations-using-expectationthatactualshould) method:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Expectation, Ensure } from '@serenity-js/assertions'

function isDivisibleBy(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value divisible by', expected)
        .soThat((actualValue, expectedValue) => actualValue % expectedValue === 0)
}

await actorCalled('Erica').attemptsTo(
    Ensure.that(4, isDivisibleBy(2)),
)
```

### Composing expectations

To compose complex expectations, use the [`Expectation.to`](https://serenity-js.org/api/assertions/#composing-expectations-using-expectationto) method:

```typescript
import { actorCalled } from '@serenity-js/core'
import { Expectation, Ensure, and, or, isGreaterThan, isLessThan, equals  } from '@serenity-js/assertions'

function isWithin(lowerBound: number, upperBound: number) {
    return Expectation
        .to(`have value within ${ lowerBound } and ${ upperBound }`)
        .soThatActual(and(
           or(isGreaterThan(lowerBound), equals(lowerBound)),
           or(isLessThan(upperBound), equals(upperBound)),
        ))
}

await actorCalled('Erica').attemptsTo(
    Ensure.that(5, isWithin(3, 6)),
)
```

## Documentation

- [API Reference](https://serenity-js.org/api/)
- [Screenplay Pattern Guide](https://serenity-js.org/handbook/design/screenplay-pattern/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)
- [Tutorial: First Web Scenario](https://serenity-js.org/handbook/tutorials/your-first-web-scenario/)
- [Tutorial: First API Scenario](https://serenity-js.org/handbook/tutorials/your-first-api-scenario/)

## Contributing

Contributions of all kinds are welcome! Get started with the [Contributing Guide](https://serenity-js.org/community/contributing/).

## Community

- [Community Chat](https://matrix.to/#/#serenity-js:gitter.im)
- [Discussions Forum](https://github.com/orgs/serenity-js/discussions)
    - Visit the [💡How to... ?](https://github.com/orgs/serenity-js/discussions/categories/how-to) section for answers to common questions

If you enjoy using Serenity/JS, make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

## License

The Serenity/JS code base is licensed under the [Apache-2.0](https://opensource.org/license/apache-2-0) license,
while its documentation and the [Serenity/JS Handbook](https://serenity-js.org/handbook/) are licensed under the [Creative Commons BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the [Serenity/JS License](https://serenity-js.org/legal/license/).

## Support

Support ongoing development through [GitHub Sponsors](https://github.com/sponsors/serenity-js). Sponsors gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks)
and priority help in the [Discussions Forum](https://github.com/orgs/serenity-js/discussions).

For corporate sponsorship or commercial support, please contact [Jan Molak](https://www.linkedin.com/in/janmolak/).

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
