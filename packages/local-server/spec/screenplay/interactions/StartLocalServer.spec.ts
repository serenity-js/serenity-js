import 'mocha';

import { expect } from '@integration/testing-tools';
import { and, Ensure, equals, isGreaterThan, isLessThan, or } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Cast, configure } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { Server } from 'net';
import { satisfies } from 'semver';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../../../src';
import { RequestListener } from '../../../src/screenplay/abilities';
import servers = require('../../servers');

/** @test {StartALocalServer} */
/** @test {LocalServer.url} */
/** @test {LocalServer.port} */
describe('StartALocalServer', () => {

    class Actors implements Cast {
        constructor(private readonly listener: () => RequestListener | Server) {
        }

        prepare(actor: Actor): Actor {
            return actor.whoCan(ManageALocalServer.runningAHttpListener(this.listener()));
        }
    }

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

    afterEach(() => actorInTheSpotlight().attemptsTo(
        StopLocalServer.ifRunning(),
    ));
});
