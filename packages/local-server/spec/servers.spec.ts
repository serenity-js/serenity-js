import { certificates, expect } from '@integration/testing-tools';
import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import type { Actor, Cast} from '@serenity-js/core';
import { actorCalled, actorInTheSpotlight, configure, LogicError } from '@serenity-js/core';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';
import * as https from 'https';
import { afterEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { satisfies } from 'semver';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src/index.js';
import barebones from './servers/barebones.js';
import expressServer from './servers/express.js';
import hapiServer from './servers/hapi.js';
import servers from './servers/index.js';
import koaServer from './servers/koa.js';
import restifyServer from './servers/restify.js';

describe('ManageALocalServer', () => {

    describe('when working with HTTP', () => {

        given(servers).
        it('allows the Actor to start, stop and access the location of a HTTP', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpListener(handler()),
                        CallAnApi.using(axios.create()),
                    );
                }
            }

            configure({
                actors: new Actors(),
            });

            return expect(actorCalled('Nadia-HTTP').attemptsTo(
                StartLocalServer.onRandomPort(),
                Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
                Send.a(GetRequest.to(LocalServer.url())),
                Ensure.that(LastResponse.status(), equals(200)),
                Ensure.that(LastResponse.body<string>(), equals('Hello World!')),
            )).to.be.fulfilled;
        });

        given(servers).
        it('complains when the actor tries to access a URL of a server that is not running', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpListener(handler()),
                    );
                }
            }

            configure({
                actors: new Actors(),
            });

            return expect(actorCalled('Nadia-HTTP-error').attemptsTo(
                Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
            )).to.be.rejectedWith(LogicError, 'The server has not been started yet');
        });
    });

    // ---

    describe('when working with HTTPS', () => {

        const testHttpsServer = [
            StartLocalServer.onPort(8443),
            Ensure.that(LocalServer.url(), startsWith('https://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<string>(), equals('Hello World!')),
        ];

        given(
            barebones,
            expressServer,
            koaServer,
        ).
        it('allows the Actor to start, stop and access the location of a HTTPS', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpsListener(handler(), {
                            cert:           certificates.cert,
                            key:            certificates.key,
                            requestCert:    true,
                            rejectUnauthorized: false,
                        }),
                        CallAnApi.using(axios.create({
                            proxy: false,
                            httpsAgent: new https.Agent({
                                cert: certificates.cert,
                                key: certificates.key,
                                rejectUnauthorized: false,
                            }),
                        })),
                    );
                }
            }

            configure({
                actors: new Actors(),
            });

            return expect(actorCalled('Nadia-HTTPS').attemptsTo(...testHttpsServer)).to.be.fulfilled;
        });

        it('allows the Actor to start, stop and access the location of a HTTPS Hapi app', function () {
            if (! satisfies(process.versions.node, hapiServer.node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpsListener(hapiServer.handler({
                            tls: {
                                cert:           certificates.cert,
                                key:            certificates.key,
                                requestCert:    true,
                                rejectUnauthorized: false,
                            },
                        })),
                        CallAnApi.using(axios.create({
                            proxy: false,
                            httpsAgent: new https.Agent({
                                cert: certificates.cert,
                                key: certificates.key,
                                rejectUnauthorized: false,
                            }),
                        })),
                    );
                }
            }

            configure({
                actors: new Actors(),
            });

            return expect(actorCalled('Nadia-HTTPS-Hapi').attemptsTo(...testHttpsServer)).to.be.fulfilled;
        });

        it('allows the Actor to start, stop and access the location of a Restify app', function () {
            if (! satisfies(process.versions.node, restifyServer.node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpsListener(restifyServer.handler({
                            certificate:    certificates.cert,
                            key:            certificates.key,
                        })),
                        CallAnApi.using(axios.create({
                            proxy: false,
                            httpsAgent: new https.Agent({
                                cert: certificates.cert,
                                key: certificates.key,
                                rejectUnauthorized: false,
                            }),
                        })),
                    );
                }
            }

            configure({
                actors: new Actors(),
            });

            return expect(actorCalled('Nadia-HTTPS-Restify').attemptsTo(...testHttpsServer)).to.be.fulfilled;
        });
    });

    afterEach(async function () {
        if (! this.currentTest.pending) {
            await actorInTheSpotlight().attemptsTo(
                StopLocalServer.ifRunning(),
            )
        }
    });
});
