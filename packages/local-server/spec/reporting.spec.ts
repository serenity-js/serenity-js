import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { endsWith, Ensure, equals, not, startsWith } from '@serenity-js/assertions';
import { Actor, actorCalled, Cast, configure } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts } from '@serenity-js/core/lib/events';
import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
import axios from 'axios';

import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '../src';

describe('@serenity-js/local-server', () => {

    class Actors implements Cast {
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
        it(`correctly reports actor's activities`, () => expect(actorCalled('Nadia').attemptsTo(
            StartLocalServer.onRandomPort(),
            Ensure.that(LocalServer.url(), startsWith('http://127.0.0.1')),
            Send.a(GetRequest.to(LocalServer.url())),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<string>(), equals('Hello World!')),
            StopLocalServer.ifRunning(),
        )).to.be.fulfilled.then(() => {

            PickEvent.from(recorder.events)
                .next(ActivityStarts,   hasName(`Nadia starts local server on a random port`))
                .next(ActivityFinished, hasName(`Nadia starts local server on a random port`))
                .next(ActivityFinished, hasName(`Nadia ensures that the URL of the local server does start with 'http://127.0.0.1'`))
                .next(ActivityFinished, hasName(`Nadia sends a GET request to the URL of the local server`))
                .next(ActivityFinished, hasName(`Nadia ensures that the status of the last response does equal 200`))
                .next(ActivityFinished, hasName(`Nadia ensures that the body of the last response does equal 'Hello World!'`))
                .next(ActivityStarts,   hasName(`Nadia stops the local server`))
                .next(ActivityFinished, hasName(`Nadia stops the local server`))
            ;
        }));
    });

    describe('when managing a local server', () => {

        let Nadia: Actor, Phillip: Actor;

        const port = 5000;

        beforeEach(() =>  {
            Nadia = actorCalled('Nadia');
            Phillip = actorCalled('Phillip');
        });

        it(`it falls back to a random port if the preferred one is taken`, () =>
            expect(Nadia.attemptsTo(
                StartLocalServer.onOneOfThePreferredPorts([port]),
                Ensure.that(LocalServer.url(), endsWith(`${ port }`)),
            ).then(() => Phillip.attemptsTo(
                StartLocalServer.onOneOfThePreferredPorts([port]),
                Ensure.that(LocalServer.url(), not(endsWith(`${ port }`))),
            ))).to.be.fulfilled);

        afterEach(() => Promise.all([
            Nadia.attemptsTo(StopLocalServer.ifRunning()),
            Phillip.attemptsTo(StopLocalServer.ifRunning()),
        ]));
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function hasName(expectedName: string) {
        return (e: ActivityStarts | ActivityFinished) => expect(e.details.name.value).equals(expectedName);
    }
});
