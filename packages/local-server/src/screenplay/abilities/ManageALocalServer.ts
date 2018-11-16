import { Ability, LogicError, UsesAbilities } from '@serenity-js/core';
import getPort = require('get-port');
import * as http from 'http';
import * as net from 'net';

/**
 * @desc
 *  An {@link Ability} that enables the {@link Actor} to manage a local Node.js server.
 *
 * @example <caption>Using a raw Node.js server</caption>
 * import { Actor } from '@serenity-js/core';
 * import { CallAnApi, GetRequest, Send } from '@serenity-js/rest';
 * import { ManageALocalTestServer, LocalTestServer, StartLocalTestServer, StopLocalTestServer } from '@serenity-js/local-test-server'
 * import { Ensure, equals } from '@serenity-js/assertions';
 *
 * import axios from 'axios';
 * import * as http from 'http';
 *
 * const server = http.createServer(function(request, response) {
 *     response.setHeader('Connection', 'close');
 *     response.end('Hello!');
 * })
 *
 * const actor = Actor.named('Apisit').whoCan(
 *     ManageALocalTestServer.using(server),
 *     CallAnApi.using(axios.create()),
 * );
 *
 * actor.attemptsTo(
 *     StartLocalTestServer.onRandomPort(),
 *     Send.a(GetRequest.to(LocalServer.url())),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.body(), equals('Hello!')),
 *     StopLocalTestServer.ifRunning(),
 * );
 *
 * @see https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
 * @see https://nodejs.org/api/http.html#http_class_http_server
 *
 * @public
 * @implements {Ability}
 */
export class ManageALocalServer implements Ability {

    /**
     * @desc
     *  Ability to manage a Node.js HTTP server using a given server requestListener.
     *
     * @returns {ManageALocalServer}
     */
    static using(listener: (request: http.IncomingMessage, response: http.ServerResponse) => void | net.Server) {
        const server = typeof listener === 'function'
            ? http.createServer(listener)
            : listener;

        return new ManageALocalServer(server);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link ManageALocalServer} from within the {@link Interaction} classes,
     *  such as {@link StartLocalServer}.
     *
     * @param {UsesAbilities} actor
     * @return {ManageALocalServer}
     */
    static as(actor: UsesAbilities): ManageALocalServer {
        return actor.abilityTo(ManageALocalServer);
    }

    /**
     * @param {net~Server} server
     *  A Node.js server requestListener
     */
    constructor(private readonly server: net.Server) {
    }

    /**
     * @desc
     *  Starts the server on the first available of the `preferredPorts`
     *
     * @param {number[]} preferredPorts - If the provided list is empty the server will be started on a random port
     * @returns {Promise<void>}
     */
    listen(preferredPorts: number[]): Promise<void> {
        return getPort(preferredPorts).then(port => new Promise((resolve, reject) => {
            this.server.listen(port, '127.0.0.1', (error: Error) => {
                if (!! error) {
                    return reject(error);
                }

                return resolve();
            });
        }));
    }

    /**
     * @desc
     *  Provides access to the server requestListener
     *
     * @param fn
     * @returns {T}
     */
    mapInstance<T>(fn: (server: net.Server) => T): T {
        return fn(this.server);
    }
}
