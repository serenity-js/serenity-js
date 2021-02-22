# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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
