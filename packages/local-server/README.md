# Serenity/JS Local Server

[![NPM Version](https://badge.fury.io/js/%40serenity-js%2Flocal-server.svg)](https://badge.fury.io/js/%40serenity-js%2Flocal-server)
[![Build Status](https://github.com/serenity-js/serenity-js/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/serenity-js/serenity-js/actions)
[![Maintainability](https://qlty.sh/gh/serenity-js/projects/serenity-js/maintainability.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Code Coverage](https://qlty.sh/gh/serenity-js/projects/serenity-js/coverage.svg)](https://qlty.sh/gh/serenity-js/projects/serenity-js)
[![Contributors](https://img.shields.io/github/contributors/serenity-js/serenity-js.svg)](https://github.com/serenity-js/serenity-js/graphs/contributors)
[![Known Vulnerabilities](https://snyk.io/test/npm/@serenity-js/local-server/badge.svg)](https://snyk.io/test/npm/@serenity-js/local-server)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?style=flat)](https://github.com/serenity-js/serenity-js)

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![Support Serenity/JS on GitHub](https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github)](https://github.com/sponsors/serenity-js)


[`@serenity-js/local-server`](https://serenity-js.org/api/local-server/) enables Serenity/JS actors to manage local HTTP or HTTPS test servers.

## Features

- Supports local servers based on [Express](https://expressjs.com/),
  [Hapi](https://hapijs.com/),
  [Koa](https://koajs.com/),
  [Restify](http://restify.com/),
  or raw [Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).
- Use it to manage test doubles, mock APIs, or simulate backend services.
- Works seamlessly with all Serenity/JS test runners

## Installation

```sh
npm install --save-dev @serenity-js/core @serenity-js/local-server
```

See the [Serenity/JS Installation Guide](https://serenity-js.org/handbook/installation/).

## Quick Start

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

1. Import a [`requestListener`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener) to use in your test.
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

Explore practical examples and in-depth explanations in the [Serenity/JS Handbook](https://serenity-js.org/handbook/).

## Creating a server

`ManageALocalServer` supports any `requestListener` accepted by Node's
[`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
or [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).

Below are example implementations of a simple HTTP server that would
satisfy the above test.

### Raw Node.js

```javascript
// listener.js
module.exports.requestListener = (request, response) => {
  response.setHeader('Connection', 'close')
  response.end('Hello World!')
}
```

[Learn more about Node.js](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/).

### Express

```javascript
// listener.js
const express = require('express')

module.exports.requestListener = express().
    get('/', (req: express.Request, res: express.Response) => {
        res.status(200).send('Hello World!')
    })
```

[Learn more about Express](https://expressjs.com/).

### HAPI

```javascript
// listener.js
const hapi = require('@hapi/hapi')

const server = new hapi.Server()
server.route({ method: 'GET', path: '/', handler: (req, h) => 'Hello World!' })

module.exports.requestListener = server.listener
```

[Learn more about HAPI](https://hapijs.com/).

### Koa

```javascript
// listener.js
const Koa = require('koa')

module.exports.requestListener = new Koa()
    .use(ctx => Promise.resolve(ctx.body = 'Hello World!'))
    .callback()
```

[Learn more about Koa](https://koajs.com/).

### Restify

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
