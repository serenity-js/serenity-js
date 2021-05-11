import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Cast, configure, Log } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { given } from 'mocha-testdata';
import { satisfies } from 'semver';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';
import servers = require('./servers');

describe('ManageALocalServer', () => {

    /** @test {ManageALocalServer} */
    describe('restarting', () => {

        given(servers).
        it('allows the Actor to restart a server on the same port multiple times', function ({ handler, node }) {
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
                StartLocalServer.onPort(30000),
                Ensure.that(LocalServer.url(), equals('http://127.0.0.1:30000')),
                StopLocalServer.ifRunning(),
                StartLocalServer.onPort(30000),
                Log.the(LocalServer.url()),
                Ensure.that(LocalServer.url(), equals('http://127.0.0.1:30000')),
            )).to.be.fulfilled;
        });

        afterEach(() => actorInTheSpotlight().attemptsTo(
            StopLocalServer.ifRunning(),
        ));
    });
});
