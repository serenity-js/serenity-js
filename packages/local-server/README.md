# Serenity/JS

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)

[Serenity/JS](https://serenity-js.org) is an innovative open-source framework designed to make acceptance and regression testing
of complex software systems faster, more collaborative and easier to scale.

⭐️ Get started with Serenity/JS!
- [Serenity/JS web testing tutorial](https://serenity-js.org/handbook/web-testing/your-first-web-scenario)
- [Serenity/JS Handbook](https://serenity-js.org/handbook)
- [API documentation](https://serenity-js.org/api/)
- [Serenity/JS Project Templates](https://serenity-js.org/handbook/project-templates/)

👋 Join the Serenity/JS Community!
- Meet other Serenity/JS developers and maintainers on the [Serenity/JS Community chat channel](https://matrix.to/#/#serenity-js:gitter.im),
- Find answers to your Serenity/JS questions on the [Serenity/JS Forum](https://github.com/orgs/serenity-js/discussions/categories/how-do-i),
- Learn how to [contribute to Serenity/JS](https://serenity-js.org/community/contributing/),
- Support the project and gain access to [Serenity/JS Playbooks](https://github.com/serenity-js/playbooks) by becoming a [Serenity/JS GitHub Sponsor](https://github.com/sponsors/serenity-js)!

## Serenity/JS Local Server

[`@serenity-js/local-server`](https://serenity-js.org/api/local-server/) enables Serenity/JS Actors to manage local HTTP or HTTPS test servers powered by [Express](https://expressjs.com/),
[Hapi](https://hapijs.com/),
[Koa](https://koajs.com/),
[Restify](http://restify.com/),
or raw [Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

### Installation

To install this module, run the following command in your computer terminal:

```sh
npm install --save-dev @serenity-js/core @serenity-js/local-server
```


### Example test

```typescript
import { actorCalled } from '@serenity-js/core'
import {
    ManageALocalServer, StartLocalServer, StopLocalServer
} from '@serenity-js/local-server'
import { CallAnApi, GetRequest, Send } from '@serenity-js/rest'
import { Ensure, equals } from '@serenity-js/assertions'
import axios from 'axios'

import { requestListener } from './listener'                    // (1)

const actor = actorCalled('Apisit').whoCan(
    ManageALocalServer.runningAHttpListener(requestListener),   // (2)
    CallAnApi.using(axios.create()),
)

await actor.attemptsTo(
    StartLocalServer.onRandomPort(),                            // (3)
    Send.a(GetRequest.to(LocalServer.url())),                   // (4)
    Ensure.that(LastResponse.status(), equals(200)),
    Ensure.that(LastResponse.body(), equals('Hello!')),
    StopLocalServer.ifRunning(),                                // (5)
)
```

In the above example:

1. Import a [`requestListener`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener) you want to use in your test.
2. Give the [actor](https://serenity-js.org/handbook/design/screenplay-pattern/#actors) an [ability](https://serenity-js.org/handbook/design/screenplay-pattern/#abilities)
   to [`ManageALocalServer`](https://serenity-js.org/api/local-server/class/ManageALocalServer/).
   This enables the interactions to [`StartLocalServer`](https://serenity-js.org/api/local-server/class/StartLocalServer/)
   and [`StopLocalServer`](https://serenity-js.org/api/local-server/class/StopLocalServer/),
   as well as the [`LocalServer`](https://serenity-js.org/api/local-server/class/LocalServer/) question.
3. Start the local server on a [random port](https://serenity-js.org/api/local-server/class/StartLocalServer/#onRandomPort),
   [specific port](https://serenity-js.org/api/local-server/class/StartLocalServer/#onPort),
   or a random port within your [preferred port range](https://serenity-js.org/api/local-server/class/StartLocalServer/#onRandomPortBetween).
4. Use the `LocalServer.url()` question to retrieve the url of the local server and interact with its HTTP API.
5. Stop the local server is when the test is complete.
   Please note that you probably want to [`StopLocalServer`](https://serenity-js.org/api/local-server/class/StopLocalServer/)
   in an `afterEach` block of your test (or something equivalent) 
   to make sure that the server is correctly shut down even when the test fails.

### Creating a server

Any `requestListener` accepted by Node's
[`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
or [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)
can be used with `ManageALocalServer`.

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
