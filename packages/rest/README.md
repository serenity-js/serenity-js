# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS REST

[`@serenity-js/rest`](https://serenity-js.org/modules/rest/) module lets your actors interact with and test HTTP REST APIs.

### Installation

To install this module, as well as [`axios` HTTP client](https://github.com/axios/axios),
run the following command in your computer terminal:

```console
npm install --save-dev @serenity-js/{core,rest,assertions} axios
```

### Example test

```typescript
import { actorCalled } from '@serenity-js/core';
import { CallAnApi, DeleteRequest, GetRequest, LastResponse, PostRequest, Send } from '@serenity-js/rest'
import { Ensure, equals, startsWith } from '@serenity-js/assertions';

const actor = actorCalled('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));

actor.attemptsTo(
    // no users present in the system
    Send.a(GetRequest.to('/users')),
    Ensure.that(LastResponse.status(), equals(200)),
    Ensure.that(LastResponse.body(), equals([])),

    // create a new test user account
    Send.a(PostRequest.to('/users').with({
        login: 'tester',
        password: 'P@ssword1',
    }),
    Ensure.that(LastResponse.status(), equals(201)),
    Ensure.that(LastResponse.header('Location'), startsWith('/users')),

    // delete the test user account
    Send.a(DeleteRequest.to(LastResponse.header('Location'))),
    Ensure.that(LastResponse.status(), equals(200)),
);
```
