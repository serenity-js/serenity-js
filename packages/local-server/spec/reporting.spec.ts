import 'mocha';

import { expect, Pick } from '@integration/testing-tools';
import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/events';
import { Clock, StageManager } from '@serenity-js/core/lib/stage';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';
import { createStubInstance } from 'sinon';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';

describe('@serenity-js/local-server', () => {

    const
        frozenClock     = new Clock(() => new Date('1970-01-01')),
        stageManager    = createStubInstance(StageManager);

    const nadia = new Actor('Nadia', stageManager as any, frozenClock).whoCan(
            ManageALocalServer.using(function(request, response) {
                response.setHeader('Connection', 'close');
                response.end('Hello World!');
            }),
            CallAnApi.using(axios.create()),
        );

    describe('when managing a local server', () => {

        /**
         * @test {ManageALocalServer}
         * @test {StartLocalServer}
         * @test {StopLocalServer}
         */
        it(`correctly reports actor's activities`, () => expect(nadia.attemptsTo(
            StartLocalServer.onRandomPort(),
            Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body(), equals('Hello World!')),
            StopLocalServer.ifRunning(),
        )).to.be.fulfilled.then(() => {
            const events = stageManager.notifyOf.getCalls().map(call => call.lastArg);

            Pick.from(events)
                .next(ActivityStarts,   hasName(`Nadia starts the local server`))
                .next(ActivityFinished, hasName(`Nadia starts the local server`))
                .next(ActivityFinished, hasName(`Nadia ensures that the URL of the local server does start with 'http://127.0.0.1'`))
                .next(ActivityFinished, hasName(`Nadia sends a GET request to the URL of the local server`))
                .next(ActivityFinished, hasName(`Nadia ensures that the status of the last response does equal 200`))
                .next(ActivityFinished, hasName(`Nadia ensures that the body of the last response does equal 'Hello World!'`))
                .next(ActivityStarts,   hasName(`Nadia stops the local server`))
                .next(ActivityFinished, hasName(`Nadia stops the local server`))
            ;
        }));
    });

    function hasName(expectedName: string) {
        return (e: ActivityStarts | ActivityFinished) => expect(e.value.name.value).equals(expectedName);
    }
});
