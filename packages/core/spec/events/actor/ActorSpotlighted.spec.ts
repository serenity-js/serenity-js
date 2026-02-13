import { describe, it } from 'mocha';

import { ActorSpotlighted } from '../../../src/events';
import { CorrelationId } from '../../../src/model';
import { Timestamp } from '../../../src/screenplay';
import { expect } from '../../expect';

describe('ActorSpotlighted', () => {

    const sceneId = new CorrelationId('example-scene-id');
    const actor = { name: 'Alice', abilities: [] };

    describe('constructor', () => {

        it('sets sceneId, actor, and timestamp correctly', () => {
            const timestamp = new Timestamp(new Date('2024-01-15T10:30:00Z'));

            const event = new ActorSpotlighted(sceneId, actor, timestamp);

            expect(event.sceneId).to.equal(sceneId);
            expect(event.actor).to.deep.equal(actor);
            expect(event.timestamp).to.equal(timestamp);
        });
    });

    describe('fromJSON', () => {

        it('deserializes the event correctly', () => {
            const timestamp = new Timestamp(new Date('2024-01-15T10:30:00Z'));

            const json = {
                sceneId: 'example-scene-id',
                actor: { name: 'Alice', abilities: [] },
                timestamp: timestamp.toJSON(),
            };

            const event = ActorSpotlighted.fromJSON(json);

            expect(event.sceneId.value).to.equal('example-scene-id');
            expect(event.actor).to.deep.equal({ name: 'Alice', abilities: [] });
            expect(event.timestamp).to.equal(timestamp);
        });
    });

    describe('validation', () => {

        it('rejects undefined sceneId', () => {
            expect(() => new ActorSpotlighted(undefined, actor))
                .to.throw(Error, 'sceneId should be defined');
        });

        it('rejects undefined actor', () => {
            expect(() => new ActorSpotlighted(sceneId, undefined))
                .to.throw(Error, 'actor should be defined');
        });
    });
});
