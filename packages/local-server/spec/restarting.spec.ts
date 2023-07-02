import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import type { Actor, Cast} from '@serenity-js/core';
import { actorCalled, actorInTheSpotlight, configure, Log } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { afterEach, describe } from 'mocha';
import { given } from 'mocha-testdata';
import { satisfies } from 'semver';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';
import servers = require('./servers');

describe('ManageALocalServer', () => {

    describe('restarting', () => {

        given(servers).
        it('allows the Actor to restart a server on the same port multiple times', async function ({ handler, node }) {
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

            await expect(actorCalled('Nadia').attemptsTo(
                StartLocalServer.onPort(30000),
                Ensure.that(LocalServer.url(), equals('http://127.0.0.1:30000')),
                StopLocalServer.ifRunning(),
                StartLocalServer.onPort(30000),
                Log.the(LocalServer.url()),
                Ensure.that(LocalServer.url(), equals('http://127.0.0.1:30000')),
            )).to.be.fulfilled;
        });

        afterEach(async function () {
            if (! this.currentTest.pending) {
                await actorInTheSpotlight()
                    .attemptsTo(
                        StopLocalServer.ifRunning(),
                    )
            }
        });
    });
});
