import { expect } from '@integration/testing-tools';
import { and, Ensure, equals, isGreaterThan, isLessThan, or } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Cast, configure } from '@serenity-js/core';
import { afterEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import { Server } from 'net';
import { satisfies } from 'semver';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../../../src';
import { RequestListener } from '../../../src/screenplay/abilities';
import servers = require('../../servers');

describe('StartALocalServer', () => {

    class Actors implements Cast {
        constructor(private readonly listener: () => RequestListener | Server) {
        }

        prepare(actor: Actor): Actor {
            return actor.whoCan(ManageALocalServer.runningAHttpListener(this.listener()));
        }
    }

    describe('when managing a local server', () => {

        given(servers).
        it('allows the Actor to start the server on a preferred port', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            configure({ actors: new Actors(handler) });

            return expect(actorCalled('Nadia').attemptsTo(
                StartLocalServer.onPort(30000),
                Ensure.that(LocalServer.port(), equals(30000)),
            )).to.be.fulfilled;
        });

        given(servers).
        it('allows the Actor to start the server on a random port', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            configure({ actors: new Actors(handler) });

            return expect(actorCalled('Nadia').attemptsTo(
                StartLocalServer.onRandomPort(),
                Ensure.that(LocalServer.port(), and(or(equals(8000), isGreaterThan(8000)), or(isLessThan(65535), equals(65535)))),
            )).to.be.fulfilled;
        });

        given(servers).
        it('allows the Actor to start the server on a random port within a range', function ({ handler, node }) {
            if (! satisfies(process.versions.node, node)) {
                return this.skip();
            }

            configure({ actors: new Actors(handler) });

            return expect(actorCalled('Nadia').attemptsTo(
                StartLocalServer.onRandomPortBetween(8080, 9090),
                Ensure.that(LocalServer.port(), and(or(equals(8080), isGreaterThan(8080)), or(isLessThan(9090), equals(9090)))),
            )).to.be.fulfilled;
        });

        afterEach(async function () {
            if (! this.currentTest.pending) {
                await actorInTheSpotlight().attemptsTo(
                    StopLocalServer.ifRunning(),
                )
            }
        });
    });

    describe('when detecting invocation location', () => {
        it('correctly detects its invocation location when configured with a specific port', () => {
            const activity = StartLocalServer.onPort(30000);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('StartLocalServer.spec.ts');
            expect(location.line).to.equal(79);
            expect(location.column).to.equal(47);
        });

        it('correctly detects its invocation location when configured with a random port', () => {
            const activity = StartLocalServer.onRandomPort();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('StartLocalServer.spec.ts');
            expect(location.line).to.equal(88);
            expect(location.column).to.equal(47);
        });

        it('correctly detects its invocation location when configured with a random port within a range', () => {
            const activity = StartLocalServer.onRandomPortBetween(8080, 9090);
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('StartLocalServer.spec.ts');
            expect(location.line).to.equal(97);
            expect(location.column).to.equal(47);
        });

        it('correctly detects its invocation location when stopping the server', () => {
            const activity = StopLocalServer.ifRunning();
            const location = activity.instantiationLocation();

            expect(location.path.basename()).to.equal('StartLocalServer.spec.ts');
            expect(location.line).to.equal(106);
            expect(location.column).to.equal(46);
        });
    });
});
