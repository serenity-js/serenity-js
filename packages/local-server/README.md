# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

To get started, check out the comprehensive [Serenity/JS Handbook](https://serenity-js.org/handbook), [API documentation](https://serenity-js.org/api/core), and [Serenity/JS project templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates).

If you have any questions or just want to say hello, join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im).

## Serenity/JS Local Server

[`@serenity-js/local-server`](https://serenity-js.org/modules/local-server/) enables Serenity/JS Actors to manage local HTTP or HTTPS test servers powered by [Express](https://expressjs.com/),
[Hapi](https://hapijs.com/),
[Koa](https://koajs.com/),
[Restify](http://restify.com/)
or raw [Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

### Installation

To install this module, run the following command in your computer terminal:
```console
npm install --save-dev @serenity-js/{core,local-server}
```

### Example test

```
import { actorCalled } from '@serenity-js/core';
import {
    ManageALocalServer, StartLocalTestServer, StopLocalTestServer
} from '@serenity-js/local-server'
import { CallAnApi, GetRequest, Send } from '@serenity-js/rest';
import { Ensure, equals } from '@serenity-js/assertions';
import axios from 'axios';

import { requestListener } from './listener';                           (1)

const actor = actorCalled('Apisit').whoCan(
    ManageALocalServer.using(requestListener),                          (2)
    CallAnApi.using(axios.create()),
);

actor.attemptsTo(
    StartLocalTestServer.onRandomPort(),                                (3)
    Send.a(GetRequest.to(LocalServer.url())),                           (4)
    Ensure.that(LastResponse.status(), equals(200)),
    Ensure.that(LastResponse.body(), equals('Hello!')),
    StopLocalTestServer.ifRunning(),                                    (5)
);
```

In the above example:

1. A `requestListener` to be tested is imported.
2. The `Actor` is given an `Ability` to `ManageALocalServer`. This enables the `Interaction` to `StartLocalTestServer` and `StopLocalTestServer`, as well as the `LocalServer` `Question`.
3. The local server is started on a random port, although you can specify a port range if you prefer.
4. The url of the local server is retrieved and used to test an interaction with its HTTP API.
5. The local server is stopped when the test is complete. Please note that you probably want to `StopLocalTestServer` in an `afterEach` block of your test (or something equivalent) to make sure that the server is correctly shut down even when the test fails.

### Creating a server

Any `requestListener` that Node's
[`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
or [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)
would accept can be used with `ManageALocalServer`.

Below are example implementations of a simple HTTP server that would
satisfy the above test.

#### Raw Node.js

```javascript
// listener.js
module.exports.requestListener = (request, response) => {
  response.setHeader('Connection', 'close');
  response.end('Hello World!');
}
```

[Learn more about Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

#### Express

```javascript
// listener.js
const express = require('express');

module.exports.requestListener = express().
    get('/', (req: express.Request, res: express.Response) => {
        res.status(200).send('Hello World!');
    });
```

[Learn more about Express](https://expressjs.com/).

#### HAPI

```javascript
// listener.js
const hapi = require('@hapi/hapi');

const server = new hapi.Server();
server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' })

module.exports.requestListener = server.listener;
```

[Learn more about HAPI](https://hapijs.com/).

#### Koa

```javascript
// listener.js
const Koa = require('koa');

module.exports.requestListener = new Koa()
    .use(ctx => Promise.resolve(ctx.body = 'Hello World!'))
    .callback();
```

[Learn more about Koa](https://koajs.com/).

#### Restify

```javascript
// listener.js
const restify = require('restify');

const server = restify.createServer(options);

server.get('/', (req, res, next) => {
    res.send('Hello World!');
});

module.exports.requestListener = server;
```

[Learn more about Restify](http://restify.com/).
