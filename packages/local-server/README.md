# Serenity/JS

[Serenity/JS](https://serenity-js.org) is a framework designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

Visit [serenity-js.org](https://serenity-js.org/) for the [latest tutorials](https://serenity-js.org/handbook/)
and [API docs](https://serenity-js.org/modules/), and follow [@SerenityJS](https://twitter.com/SerenityJS) and [@JanMolak](https://twitter.com/JanMolak) on Twitter for project updates.

### Learning Serenity/JS

To learn more about Serenity/JS, check out the video below, read the [tutorial](https://serenity-js.org/handbook/thinking-in-serenity-js/index.html), review the [examples](https://github.com/serenity-js/serenity-js/tree/master/examples), and create your own test suite with [Serenity/JS template projects](https://github.com/serenity-js).

If you have any questions, join us on [Serenity/JS Community Chat](https://gitter.im/serenity-js/Lobby).

[![Full-Stack Acceptance Testing with Serenity/JS and the Screenplay Pattern](https://img.youtube.com/vi/djPMf-n93Rw/0.jpg)](https://www.youtube.com/watch?v=djPMf-n93Rw)

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
