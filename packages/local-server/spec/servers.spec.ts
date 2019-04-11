import 'mocha';

import { certificates, expect, stage } from '@integration/testing-tools';
import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Actor, DressingRoom } from '@serenity-js/core';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';
import * as https from 'https';
import { given } from 'mocha-testdata';
import { satisfies } from 'semver'; // tslint:disable-line:no-implicit-dependencies

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';
import servers = require('./servers');

/** @test {ManageALocalServer} */
describe('ManageALocalServer', () => {

    let Nadia: Actor;

    describe('when working with HTTP', () => {

        given(servers).
        it('allows the Actor to start, stop and access the location of a HTTP', function({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            class Actors implements DressingRoom {
                prepare(actor: Actor): Actor {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpListener(handler()),
                        CallAnApi.using(axios.create()),
                    );
                }
            }

            Nadia = stage(new Actors()).theActorCalled('Nadia');

            return expect(Nadia.attemptsTo(
                StartLocalServer.onRandomPort(),
                Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
                Send.a(GetRequest.to(LocalServer.url())),
                Ensure.that(LastResponse.status(), equals(200)),
                Ensure.that(LastResponse.body(), equals('Hello World!')),
            )).to.be.fulfilled;                                                  // tslint:disable-line:no-unused-expression
        });

    });

    // ---

    describe('when working with HTTPS', () => {

        const testHttpsServer = [
            StartLocalServer.onOneOfThePreferredPorts([ 8443, 9443 ]),
            Ensure.that(LocalServer.url(), startsWith('https://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body(), equals('Hello World!')),
        ];

        given(
            require('./servers/barebones'),
            require('./servers/express'),
            require('./servers/koa'),
        ).
        it('allows the Actor to start, stop and access the location of a HTTPS', function({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            class Actors implements DressingRoom {
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

            Nadia = stage(new Actors()).theActorCalled('Nadia');

            return expect(Nadia.attemptsTo(...testHttpsServer)).to.be.fulfilled;                                                  // tslint:disable-line:no-unused-expression
        });

        it('allows the Actor to start, stop and access the location of a HTTPS Hapi app', function() {
            const hapi = require('./servers/hapi');

            if (! satisfies(process.versions.node, hapi.node)) {
                return this.skip();
            }

            class Actors implements DressingRoom {
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

            Nadia = stage(new Actors()).theActorCalled('Nadia');

            return expect(Nadia.attemptsTo(...testHttpsServer)).to.be.fulfilled;                                                  // tslint:disable-line:no-unused-expression
        });

        it('allows the Actor to start, stop and access the location of a Restify app', function() {
            const restify = require('./servers/restify');

            if (! satisfies(process.versions.node, restify.node)) {
                return this.skip();
            }

            class Actors implements DressingRoom {
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

            Nadia = stage(new Actors()).theActorCalled('Nadia');

            return expect(Nadia.attemptsTo(...testHttpsServer)).to.be.fulfilled;                                                  // tslint:disable-line:no-unused-expression
        });
    });

    afterEach(() => Nadia.attemptsTo(
        StopLocalServer.ifRunning(),
    ));
});
