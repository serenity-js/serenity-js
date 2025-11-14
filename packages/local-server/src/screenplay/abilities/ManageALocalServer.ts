import { Ability, ConfigurationError } from '@serenity-js/core';
import * as http from 'http';
import withShutdownSupport = require('http-shutdown');
import * as https from 'https';
import type * as net from 'net';
import { getPortPromise } from 'portfinder';

/**
 * An [`Ability`](https://serenity-js.org/api/core/class/Ability/) that enables an [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 * to manage a local [Node.js](https://nodejs.org/) server.
 *
 * ## Managing a raw Node.js server
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, Send } from '@serenity-js/rest'
 * import { ManageALocalServer, LocalTestServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * import * as axios from 'axios'
 * import * as http from 'http'
 *
 * const server = http.createServer(function (request, response) {
 *   response.setHeader('Connection', 'close');
 *   response.end('Hello!');
 * })
 *
 * await actorCalled('Apisit')
 *   .whoCan(
 *     ManageALocalServer.runningAHttpListener(server),
 *     CallAnApi.using(axios.create()),
 *   )
 *   .attemptsTo(
 *     StartLocalServer.onRandomPort(),
 *     Send.a(GetRequest.to(LocalServer.url())),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.body<string>(), equals('Hello!')),
 *     StopLocalServer.ifRunning(),
 *   )
 * ```
 *
 * ## Learn more
 * - [Anatomy of an HTTP transaction](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/)
 * - [Node.js HTTP server](https://nodejs.org/api/http.html#http_class_http_server)
 *
 * @group Abilities
 */
export class ManageALocalServer extends Ability {

    private readonly server: ServerWithShutdown;

    /**
     * An [`Ability`](https://serenity-js.org/api/core/class/Ability/) to manage a Node.js HTTP server using the provided `requestListener`.
     *
     * @param listener
     */
    static runningAHttpListener(listener: RequestListener | net.Server): ManageALocalServer {
        const server = typeof listener === 'function'
            ? http.createServer(listener)
            : listener;

        return new ManageALocalServer(SupportedProtocols.HTTP, server);
    }

    /**
     * An [`Ability`](https://serenity-js.org/api/core/class/Ability/) to manage a Node.js HTTPS server
     * using the provided [`requestListener`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
     *
     * @param listener
     * @param options
     *  Accepts an options object from `tls.createServer()`, `tls.createSecureContext()` and `http.createServer()`.
     */
    static runningAHttpsListener(listener: RequestListener | https.Server, options: https.ServerOptions = {}): ManageALocalServer {
        const server = typeof listener === 'function'
            ? https.createServer(options, listener)
            : listener;

        return new ManageALocalServer(SupportedProtocols.HTTPS, server);
    }

    /**
     * @param protocol
     *  Protocol to be used when communicating with the running server; `http` or `https`
     *
     * @param server
     *  A Node.js server requestListener, with support for [server shutdown](https://www.npmjs.com/package/http-shutdown).
     */
    constructor(private readonly protocol: SupportedProtocols, server: net.Server) {
        super();
        this.server = withShutdownSupport(server);
    }

    /**
     * Starts the server on the first free port between `preferredPort` and `highestPort`, inclusive.
     *
     * @param [preferredPort=8000]
     *  Lower bound of the preferred port range
     *
     * @param [highestPort=65535] highestPort
     *  Upper bound of the preferred port range
     */
    listen(preferredPort = 8000, highestPort = 65535): Promise<void> {
        return getPortPromise({ port: preferredPort, stopPort: highestPort })
            .then(port => new Promise<void>((resolve, reject) => {
                function errorHandler(error: Error & {code: string}) {
                    if (error.code === 'EADDRINUSE') {
                        return reject(new ConfigurationError(`Server address is in use. Is there another server running on port ${ port }?`, error));
                    }

                    return reject(error);
                }

                this.server.once('error', errorHandler);

                this.server.listen(port, '127.0.0.1', () => {
                    this.server.removeListener('error', errorHandler);

                    resolve();
                });
            }));
    }

    /**
     * Provides access to the server `requestListener`
     *
     * @param {function(server: ServerWithShutdown, protocol?: SupportedProtocols): T} fn
     */
    mapInstance<T>(fn: (server: ServerWithShutdown, protocol?: SupportedProtocols) => T): T {
        return fn(this.server, this.protocol);
    }
}

/**
 * A `requestListener` function accepted by Node's
 * [`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
 * or [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
 */
export type RequestListener = (request: http.IncomingMessage, response: http.ServerResponse) => void;

/**
 * A [`net.Server`](https://nodejs.org/api/net.html#class-netserver) with
 * an additional [`shutdown`](https://www.npmjs.com/package/http-shutdown) method.
 */
export type ServerWithShutdown = net.Server & {
    shutdown: (callback: (error?: Error) => void) => void,
    forceShutdown: (callback: (error?: Error) => void) => void,
};

/**
 * The protocol supported by the instance of the [`ServerWithShutdown`](https://serenity-js.org/api/local-server/#ServerWithShutdown),
 * wrapped by the [ability](https://serenity-js.org/api/core/class/Ability/)
 * to [`ManageALocalServer`](https://serenity-js.org/api/local-server/class/ManageALocalServer/).
 *
 * @group Models
 */
export enum SupportedProtocols {
    HTTP = 'http',
    HTTPS = 'https',
}
