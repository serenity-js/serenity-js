import 'mocha';

import { EventRecorder } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Serenity } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts } from '@serenity-js/core/lib/events';
import { HTTPRequestResponse } from '@serenity-js/core/lib/model';
import { Clock } from '@serenity-js/core/lib/stage';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance, APIActors } from '../../actors';
import { expect } from '../../expect';

/** @test {Send} */
describe('Send', () => {

    interface ExampleResponse {
        id: number;
    }

    /**
     * @test {Send.a}
     * @test {HTTPRequest}
     * @test {GetRequest.to}
     * @test {LastResponse.status}
     * @test {LastResponse.body}
     */
    it('enables the actor to send a HTTPRequest', () => {
        const { actor, mock } = actorUsingAMockedAxiosInstance();

        mock.onGet('/products/2').reply(200, {
            id: 2,
        });

        return actor.attemptsTo(
            Send.a(GetRequest.to('/products/2')),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<ExampleResponse>(), equals({ id: 2 })),
        );
    });

    /**
     * @test {Send.a}
     * @test {HTTPRequest}
     * @test {GetRequest.to}
     * @test {LastResponse.status}
     * @test {LastResponse.body}
     */
    it('enables the actor to send an Axios Request', () => {
        const { actor, mock } = actorUsingAMockedAxiosInstance();

        mock.onGet('/products/2').reply(200, {
            id: 2,
        });

        return actor.attemptsTo(
            Send.a({
                method: 'get',
                url: '/products/2',
            }),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<ExampleResponse>(), equals({ id: 2 })),
        );
    });

    /**
     * @test {Send.a}
     * @test {HTTPRequest}
     * @test {GetRequest.to}
     */
    it('emits the events so that the details of the HTTP interaction can be reported', () => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const axiosInstance = axios.create({
            baseURL: 'https://myapp.com/api'
        });
        const mock     = new MockAdapter(axiosInstance);
        const serenity = new Serenity(frozenClock);
        const recorder = new EventRecorder();

        serenity.configure({
            actors: new APIActors(axiosInstance),
            crew: [ recorder ],
        });

        mock.onGet('products/2').reply(200, {   // axios-mock-adapter doesn't resolve baseUrl; it should've really been mock.onGet('/api/products/2')
            id: 2,
        }, {
            'Content-Type': 'application/json',
        });

        return serenity.theActorCalled('Apisitt').attemptsTo(
            Send.a(GetRequest.to('products/2')),
        ).then(() => {
            const events = recorder.events;

            expect(events).to.have.lengthOf(3);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ActivityRelatedArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            const artifactGenerated = events[ 1 ] as ActivityRelatedArtifactGenerated;

            expect(artifactGenerated.name.value).to.equal(`GET https://myapp.com/api/products/2`);
            expect(artifactGenerated.artifact.equals(HTTPRequestResponse.fromJSON({
                request: {
                    method: 'get',
                    url: 'https://myapp.com/api/products/2',
                    headers: { Accept: 'application/json, text/plain, */*' },
                },
                response: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: { id: 2 },
                },
            }))).to.equal(true, JSON.stringify(artifactGenerated.artifact.toJSON()));

            expect(artifactGenerated.timestamp.equals(frozenClock.now()))
                .to.equal(true, artifactGenerated.timestamp.toString());
        });
    });
});
