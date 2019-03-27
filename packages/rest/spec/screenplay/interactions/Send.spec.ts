import 'mocha';

import { stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { ActivityFinished, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { HTTPRequestResponse, Name } from '@serenity-js/core/lib/model';
import { Clock, StageManager } from '@serenity-js/core/lib/stage';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import sinon = require('sinon');
import { GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance, APIActors } from '../../actors';
import { expect } from '../../expect';

/** @test {Send} */
describe('Send', () => {

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
            Ensure.that(LastResponse.body(), equals({ id: 2 })),
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
            Ensure.that(LastResponse.body(), equals({ id: 2 })),
        );
    });

    /**
     * @test {Send.a}
     * @test {HTTPRequest}
     * @test {GetRequest.to}
     */
    it('emits the events so that the details of the HTTP interaction can be reported', () => {
        const
            frozenClock = new Clock(() => new Date('1970-01-01')),

            axiosInstance = axios.create({
                url: 'https://myapp.com/api',
            }),
            mock        = new MockAdapter(axiosInstance),
            theStage    = stage(new APIActors(axiosInstance), frozenClock),
            actor       = theStage.theActorCalled('Apisitt');

        sinon.spy(theStage, 'announce');

        mock.onGet('/products/2').reply(200, {
            id: 2,
        }, {
            'Content-Type': 'application/json',
        });

        return actor.attemptsTo(
            Send.a(GetRequest.to('/products/2')),
        ).then(() => {
            const events = (theStage.announce as sinon.SinonSpy).getCalls().map(call => call.lastArg);

            expect(events).to.have.lengthOf(3);
            expect(events[ 0 ]).to.be.instanceOf(ActivityStarts);
            expect(events[ 1 ]).to.be.instanceOf(ArtifactGenerated);
            expect(events[ 2 ]).to.be.instanceOf(ActivityFinished);

            expect((events[ 1 ] as ArtifactGenerated).equals(
                new ArtifactGenerated(
                    new Name(`request get /products/2`),
                    HTTPRequestResponse.fromJSON({
                        request: {
                            method: 'get',
                            url: '/products/2',
                            headers: { Accept: 'application/json, text/plain, */*' },
                        },
                        response: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            data: { id: 2 },
                        },
                    }),
                    frozenClock.now(),
                ),
            )).to.equal(true, JSON.stringify(events[ 1 ].toJSON()));
        });
    });
});
