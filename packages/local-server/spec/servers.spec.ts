import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';
import { given } from 'mocha-testdata';
import { satisfies } from 'semver'; // tslint:disable-line:no-implicit-dependencies
import servers = require('./servers');

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';

/** @test {ManageALocalServer} */
describe('ManageALocalServer', () => {

    let Nadia: Actor;

    given(servers).
    it('allows the Actor to start, stop and access the location of a', function({ handler, node }) {
        if (! satisfies(process.versions.node, node)) {
            return this.skip();
        }

        Nadia = Actor.named('Nadia').whoCan(
            ManageALocalServer.running(handler()),
            CallAnApi.using(axios.create()),
        );

        return expect(Nadia.attemptsTo(
            StartLocalServer.onRandomPort(),
            Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body(), equals('Hello World!')),
        )).to.be.fulfilled;                                                  // tslint:disable-line:no-unused-expression
    });

    afterEach(() => Nadia.attemptsTo(
        StopLocalServer.ifRunning(),
    ));
});
