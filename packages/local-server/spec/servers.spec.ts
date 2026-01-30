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

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';
import servers = require('./servers');

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

            return expect(actorCalled('Nadia').attemptsTo(
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

            return expect(actorCalled('Nadia').attemptsTo(
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
            require('./servers/barebones'),
            require('./servers/express'),
            require('./servers/koa'),
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

            return expect(actorCalled('Nadia').attemptsTo(...testHttpsServer)).to.be.fulfilled;
        });

        it('allows the Actor to start, stop and access the location of a HTTPS Hapi app', function () {
            const hapi = require('./servers/hapi');

            if (! satisfies(process.versions.node, hapi.node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpsListener(hapi.handler({
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

            return expect(actorCalled('Nadia').attemptsTo(...testHttpsServer)).to.be.fulfilled;
        });

        it('allows the Actor to start, stop and access the location of a Restify app', function () {
            const restify = require('./servers/restify');

            if (! satisfies(process.versions.node, restify.node)) {
                return this.skip();
            }

            class Actors implements Cast {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpsListener(restify.handler({
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

            return expect(actorCalled('Nadia').attemptsTo(...testHttpsServer)).to.be.fulfilled;
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
