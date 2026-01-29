import { EventRecorder } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Cast, Clock, engage, Serenity } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    ActorEntersStage,
    SceneFinishes,
    SceneStarts
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, CorrelationId, ExecutionSuccessful, HTTPRequestResponse, Name, ScenarioDetails } from '@serenity-js/core/lib/model';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, it } from 'mocha';

import { CallAnApi, GetRequest, LastResponse, Send } from '../../../src';
import { actors } from '../../actors';
import { expect } from '../../expect';

describe('Send', () => {

    interface ExampleResponse {
        id: number;
    }

    let mock: MockAdapter;

    beforeEach(() => {
        const context = actors();

        engage(context.actors);

        mock = context.mock;
    });

    afterEach(() =>  mock.reset());

    it('correctly detects its invocation location', () => {
        const activity = Send.a(GetRequest.to('products/2'));
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Send.spec.ts');
        expect(location.line).to.equal(41);
        expect(location.column).to.equal(31);
    });

    it('enables the actor to send a HTTPRequest', async () => {
        mock.onGet('/products/2').reply(200, {
            id: 2,
        });

        await actorCalled('Apisitt').attemptsTo(
            Send.a(GetRequest.to('/products/2')),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<ExampleResponse>(), equals({ id: 2 })),
        );
    });

    it('enables the actor to send an Axios Request', async () => {
        mock.onGet('/products/2').reply(200, {
            id: 2,
        });

        await actorCalled('Apisitt').attemptsTo(
            Send.a({
                method: 'get',
                url: '/products/2',
            }),
            Ensure.that(LastResponse.status(), equals(200)),
            Ensure.that(LastResponse.body<ExampleResponse>(), equals({ id: 2 })),
        );
    });

    it('emits the events so that the details of the HTTP interaction can be reported', async () => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const axiosInstance = axios.create({
            baseURL: 'https://myapp.com/api/'
        });
        const mock     = new MockAdapter(axiosInstance);
        const serenity = new Serenity(frozenClock);
        const recorder = new EventRecorder();

        serenity.configure({
            actors: Cast.where(actor => actor.whoCan(CallAnApi.using(axiosInstance))),
            crew: [ recorder ],
        });

        mock.onGet('products/2').reply(200, {   // axios-mock-adapter doesn't resolve baseUrl; it should've really been mock.onGet('/api/products/2')
            id: 2,
        }, {
            'Content-Type': 'application/json',
        });

        const sceneId = CorrelationId.create();
        serenity.announce(new SceneStarts(
            sceneId,
            new ScenarioDetails(
                new Name('fake scenario'),
                new Category('fake category'),
                new FileSystemLocation(
                    Path.from('/fake/path.spec.ts'),
                    0,
                    0,
                ),
            ),
        ));

        await serenity.theActorCalled('Apisitt').attemptsTo(
            Send.a(GetRequest.to('products/2')),
        )

        serenity.announce(new SceneFinishes(sceneId, new ExecutionSuccessful()));
        await serenity.waitForNextCue();

        const events = recorder.events;

        expect(events).to.have.length.greaterThan(5);
        expect(events[ 0 ]).to.be.instanceOf(SceneStarts);
        expect(events[ 1 ]).to.be.instanceOf(ActorEntersStage);
        expect(events[ 2 ]).to.be.instanceOf(ActivityStarts);
        expect(events[ 3 ]).to.be.instanceOf(ActivityRelatedArtifactGenerated);
        expect(events[ 4 ]).to.be.instanceOf(ActivityFinished);

        const artifactGenerated = events[ 3 ] as ActivityRelatedArtifactGenerated;

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
