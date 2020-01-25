import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Ensure, equals, startsWith } from '@serenity-js/assertions';
import { Actor, actorCalled, configure, DressingRoom } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/events';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';

describe('@serenity-js/local-server', () => {

    class Actors implements DressingRoom {
        prepare(actor: Actor): Actor {
            return actor.whoCan(
                ManageALocalServer.runningAHttpListener(function (request, response) {
                    response.setHeader('Connection', 'close');
                    response.end('Hello World!');
                }),
                CallAnApi.using(axios.create()),
            );
        }
    }

    let recorder: EventRecorder;

    beforeEach(() => {

        recorder = new EventRecorder();

        configure({
            actors: new Actors(),
            crew: [ recorder ],
        });
    });

    describe('when managing a local server', () => {

        /**
         * @test {ManageALocalServer}
         * @test {StartLocalServer}
         * @test {StopLocalServer}
         */
        it('correctly reports actor\'s activities', () => expect(actorCalled('Nadia').attemptsTo(
            StartLocalServer.onRandomPort(),
            Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body(), equals('Hello World!')),
            StopLocalServer.ifRunning(),
        )).to.be.fulfilled.then(() => {

            PickEvent.from(recorder.events)
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
