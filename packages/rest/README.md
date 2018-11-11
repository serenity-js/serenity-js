# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS REST

The `@serenity-js/rest` module let's you interact with and test HTTP REST APIs.

Learn more at [serenity-js.org](https://serenity-js.org/modules/rest/)!

### Example test

```typescript
import { Actor } from '@serenity-js/core';
import { CallAnApi, DeleteRequest, GetRequest, LastResponse, PostRequest, Send } from '@serenity-js/rest'
import { Ensure, equals, startsWith } from '@serenity-js/assertions';

const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));

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
