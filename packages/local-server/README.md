# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative open-source framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

⭐️ Get started with Serenity/JS!
- [Serenity/JS web testing tutorial](https://serenity-js.org/handbook/web-testing/your-first-web-scenario)
- [Serenity/JS Handbook](https://serenity-js.org/handbook) and [Getting Started guides](https://serenity-js.org/handbook/getting-started/)
- [API documentation](https://serenity-js.org/api/core)
- [Serenity/JS Project Templates on GitHub](https://serenity-js.org/handbook/getting-started#serenityjs-project-templates)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/contributing),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Local Server

[`@serenity-js/local-server`](https://serenity-js.org/api/local-server/) enables Serenity/JS Actors to manage local HTTP or HTTPS test servers powered by [Express](https://expressjs.com/),
[Hapi](https://hapijs.com/),
[Koa](https://koajs.com/),
[Restify](http://restify.com/)
or raw [Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

### Installation

To install this module, run the following command in your computer terminal:

```sh
npm install --save-dev @serenity-js/core @serenity-js/local-server
```

To learn more about Serenity/JS and how to use it on your project, follow the [Serenity/JS Getting Started guide](https://serenity-js.org/handbook/getting-started/).

### Example test

```typescript
import { actorCalled } from '@serenity-js/core'
import {
    ManageALocalServer, StartLocalTestServer, StopLocalTestServer
} from '@serenity-js/local-server'
import { CallAnApi, GetRequest, Send } from '@serenity-js/rest'
import { Ensure, equals } from '@serenity-js/assertions'
import axios from 'axios'

import { requestListener } from './listener'                            (1)

const actor = actorCalled('Apisit').whoCan(
    ManageALocalServer.using(requestListener),                          (2)
    CallAnApi.using(axios.create()),
)

await actor.attemptsTo(
    StartLocalTestServer.onRandomPort(),                                (3)
    Send.a(GetRequest.to(LocalServer.url())),                           (4)
    Ensure.that(LastResponse.status(), equals(200)),
    Ensure.that(LastResponse.body(), equals('Hello!')),
    StopLocalTestServer.ifRunning(),                                    (5)
)
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
  response.setHeader('Connection', 'close')
  response.end('Hello World!')
}
```

[Learn more about Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

#### Express

```javascript
// listener.js
const express = require('express')

module.exports.requestListener = express().
    get('/', (req: express.Request, res: express.Response) => {
        res.status(200).send('Hello World!')
    })
```

[Learn more about Express](https://expressjs.com/).

#### HAPI

```javascript
// listener.js
const hapi = require('@hapi/hapi')

const server = new hapi.Server()
server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' })

module.exports.requestListener = server.listener
```

[Learn more about HAPI](https://hapijs.com/).

#### Koa

```javascript
// listener.js
const Koa = require('koa')

module.exports.requestListener = new Koa()
    .use(ctx => Promise.resolve(ctx.body = 'Hello World!'))
    .callback()
```

[Learn more about Koa](https://koajs.com/).

#### Restify

```javascript
// listener.js
const restify = require('restify')

const server = restify.createServer(options)

server.get('/', (req, res, next) => {
    res.send('Hello World!')
})

module.exports.requestListener = server
```

[Learn more about Restify](http://restify.com/).

## 📣 Stay up to date

New features, tutorials, and demos are coming soon!
Follow [Serenity/JS on LinkedIn](https://www.linkedin.com/company/serenity-js),
subscribe to [Serenity/JS channel on YouTube](https://www.youtube.com/@serenity-js) and join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
Please also make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?label=Serenity%2FJS&logo=github&style=badge)](https://github.com/serenity-js/serenity-js)

## 💛 Support Serenity/JS

If you appreciate all the effort that goes into making sophisticated tools easy to work with, please support our work and become a Serenity/JS GitHub Sponsor today!

[![GitHub Sponsors](https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/serenity-js)
