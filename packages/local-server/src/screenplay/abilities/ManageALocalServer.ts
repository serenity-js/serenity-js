import { Ability, ConfigurationError, UsesAbilities } from '@serenity-js/core';
import * as http from 'http';
import withShutdownSupport = require('http-shutdown');
import * as https from 'https';
import * as net from 'net';
import { getPortPromise } from 'portfinder';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to manage a local [Node.js](https://nodejs.org/) server.
 *
 * @example <caption>Using a raw Node.js server</caption>
 * import { Actor } from '@serenity-js/core';
 * import { CallAnApi, GetRequest, Send } from '@serenity-js/rest';
 * import { ManageALocalServer, LocalTestServer, StartLocalTestServer, StopLocalTestServer } from '@serenity-js/local-server'
 * import { Ensure, equals } from '@serenity-js/assertions';
 *
 * import axios from 'axios';
 * import * as http from 'http';
 *
 * const server = http.createServer(function (request, response) {
 *     response.setHeader('Connection', 'close');
 *     response.end('Hello!');
 * })
 *
 * const actor = Actor.named('Apisit').whoCan(
 *     ManageALocalServer.using(server),
 *     CallAnApi.using(axios.create()),
 * );
 *
 * actor.attemptsTo(
 *     StartLocalTestServer.onRandomPort(),
 *     Send.a(GetRequest.to(LocalServer.url())),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.body<string>(), equals('Hello!')),
 *     StopLocalTestServer.ifRunning(),
 * );
 *
 * @see https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
 * @see https://nodejs.org/api/http.html#http_class_http_server
 *
 * @implements {@link @serenity-js/core/lib/screenplay~Ability}
 */
export class ManageALocalServer implements Ability {

    private readonly server: ServerWithShutdown;

    /**
     * @desc
     *  {@link @serenity-js/core/lib/screenplay~Ability} to manage a Node.js HTTP server using the provided `requestListener`.
     *
     * @param {RequestListener | net~Server} listener
     * @returns {ManageALocalServer}
     */
    static runningAHttpListener(listener: RequestListener | net.Server): ManageALocalServer {
        const server = typeof listener === 'function'
            ? http.createServer(listener)
            : listener;

        return new ManageALocalServer(SupportedProtocols.HTTP, server);
    }

    /**
     * @desc
     *  {@link @serenity-js/core/lib/screenplay~Ability} to manage a Node.js HTTPS server using the provided server `requestListener`.
     *
     * @param {RequestListener | https~Server} listener
     * @param {https~ServerOptions} options - Accepts options from `tls.createServer()`, `tls.createSecureContext()` and `http.createServer()`.
     * @returns {ManageALocalServer}
     *
     * @see https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
     */
    static runningAHttpsListener(listener: RequestListener | https.Server, options: https.ServerOptions = {}): ManageALocalServer {
        const server = typeof listener === 'function'
            ? https.createServer(options, listener)
            : listener;

        return new ManageALocalServer(SupportedProtocols.HTTPS, server);
    }

    /**
     * @desc
     *  Used to access the {@link @serenity-js/core/lib/screenplay/actor~Actor}'s {@link @serenity-js/core/lib/screenplay~Ability}  to {@link ManageALocalServer}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link StartLocalServer}.
     *
     * @param {@serenity-js/core/lib/screenplay~UsesAbilities} actor
     * @return {ManageALocalServer}
     */
    static as(actor: UsesAbilities): ManageALocalServer {
        return actor.abilityTo(ManageALocalServer);
    }

    /**
     * @param {string} protocol - Protocol to be used when communicating with the running server; `http` or `https`
     *
     * @param {net~Server} server - A Node.js server requestListener, with support for [server shutdown](https://www.npmjs.com/package/http-shutdown).
     *
     * @see https://www.npmjs.com/package/http-shutdown
     */
    constructor(private readonly protocol: SupportedProtocols, server: net.Server) {
        this.server = withShutdownSupport(server);
    }

    /**
     * @desc
     *  Starts the server on the first free port between `preferredPort` and `highestPort`, inclusive.
     *
     * @param {number} [preferredPort=8000]
     *  Lower bound of the preferred port range
     *
     * @param {number} [highestPort=65535] highestPort
     *  Upper bound of the preferred port range
     *
     * @returns {Promise<void>}
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
     * @desc
     *  Provides access to the server requestListener
     *
     * @param {function(server: ServerWithShutdown, protocol?: SupportedProtocols): T} fn
     * @returns {T}
     */
    mapInstance<T>(fn: (server: ServerWithShutdown, protocol?: SupportedProtocols) => T): T {
        return fn(this.server, this.protocol);
    }
}

/**
 * @desc
 *  A `requestListener` function that Node's
 *  [`http.createServer`](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener)
 *  or [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)
 *  would accept.
 *
 * @public
 *
 * @typedef {function(request: http.IncomingMessage, response: http.ServerResponse): void} RequestListener
 */
export type RequestListener = (request: http.IncomingMessage, response: http.ServerResponse) => void;

/**
 * @desc
 *  A {@link net~Server} with an added shutdown method.
 *
 * @see https://www.npmjs.com/package/http-shutdown
 *
 * @public
 *
 * @typedef {net~Server & { shutdown: (callback: (error?: Error) => void) => void }} ServerWithShutdown
 */
export type ServerWithShutdown = net.Server & {
    shutdown: (callback: (error?: Error) => void) => void,
    forceShutdown: (callback: (error?: Error) => void) => void,
};

/**
 * @desc
 *  The protocol supported by the instance of the {@link ServerWithShutdown},
 *  wrapped by the {@link ManageALocalServer} {@link @serenity-js/core/lib/screenplay~Ability}.
 *
 * @see {@link ManageALocalServer#mapInstance}
 *
 * @public
 *
 * @typedef {Object} SupportedProtocols
 * @property {string} HTTP
 * @property {string} HTTPS
 */
export enum SupportedProtocols {
    HTTP = 'http',
    HTTPS = 'https',
}
