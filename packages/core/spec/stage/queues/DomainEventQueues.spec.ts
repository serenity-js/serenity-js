import { afterEach, beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import { TinyType } from 'tiny-types';

import { LogicError } from '../../../src/errors';
import type { DomainEvent } from '../../../src/events';
import { SceneFinished, SceneSequenceDetected, SceneStarts, SceneTagged } from '../../../src/events';
import { FileSystemLocation, Path } from '../../../src/io';
import { Category, CorrelationId, ExecutionSuccessful, FeatureTag, Name, ScenarioDetails } from '../../../src/model';
import type { DomainEventQueue } from '../../../src/stage';
import { DomainEventQueues } from '../../../src/stage';
import { expect } from '../../expect';

describe('DomainEventQueues', () => {

    const
        firstScenario = scenario('Paying with a default card'),
        secondScenario = scenario('Paying with a voucher'),
        tag = new FeatureTag('Checkout');

    let queues: DomainEventQueues;

    beforeEach(() => {
        queues = new DomainEventQueues();
    });

    describe('when receiving events', () => {

        it('groups the events of a scene in a queue, in the order they arrived', () => {
            const sceneId = new CorrelationId('scene-1');

            const events = [
                new SceneStarts(sceneId, firstScenario),
                new SceneTagged(sceneId, tag),
                new SceneFinished(sceneId, firstScenario, new ExecutionSuccessful()),
            ];

            events.forEach(event => queues.enqueue(event));

            expect(eventsIn(queues)).to.deep.equal([ events ]);
        });

        it('keeps the events of different scenes in separate queues', () => {
            const
                firstSceneId = new CorrelationId('scene-1'),
                secondSceneId = new CorrelationId('scene-2');

            const
                firstSceneStarts = new SceneStarts(firstSceneId, firstScenario),
                secondSceneStarts = new SceneStarts(secondSceneId, secondScenario),
                firstSceneTagged = new SceneTagged(firstSceneId, tag),
                secondSceneTagged = new SceneTagged(secondSceneId, tag);

            queues.enqueue(firstSceneStarts);
            queues.enqueue(secondSceneStarts);
            queues.enqueue(firstSceneTagged);
            queues.enqueue(secondSceneTagged);

            expect(eventsIn(queues)).to.deep.equal([
                [ firstSceneStarts, firstSceneTagged ],
                [ secondSceneStarts, secondSceneTagged ],
            ]);
        });

        it('adds the events that arrived before any scene started to the queue of the next scene that starts', () => {
            const
                earlySceneId = new CorrelationId('scene-0'),
                sceneId = new CorrelationId('scene-1');

            const
                earlySceneTagged = new SceneTagged(earlySceneId, tag),
                sceneStarts = new SceneStarts(sceneId, firstScenario);

            queues.enqueue(earlySceneTagged);
            queues.enqueue(sceneStarts);

            expect(eventsIn(queues)).to.deep.equal([
                [ sceneStarts, earlySceneTagged ],
            ]);
        });

        it('groups the scenes of a scene sequence in one queue', () => {
            const
                firstSceneId = new CorrelationId('scene-1'),
                secondSceneId = new CorrelationId('scene-2');

            const events = [
                new SceneSequenceDetected(firstSceneId, firstScenario),
                new SceneStarts(firstSceneId, firstScenario),
                new SceneFinished(firstSceneId, firstScenario, new ExecutionSuccessful()),
                new SceneSequenceDetected(secondSceneId, firstScenario),
                new SceneStarts(secondSceneId, firstScenario),
                new SceneFinished(secondSceneId, firstScenario, new ExecutionSuccessful()),
            ];

            events.forEach(event => queues.enqueue(event));

            expect(eventsIn(queues)).to.deep.equal([ events ]);
        });

        it('starts a new queue when a scene that is not part of a sequence starts with the details of an earlier scene', () => {
            const
                firstSceneId = new CorrelationId('scene-1'),
                secondSceneId = new CorrelationId('scene-2');

            const
                firstSceneStarts = new SceneStarts(firstSceneId, firstScenario),
                secondSceneStarts = new SceneStarts(secondSceneId, firstScenario);

            queues.enqueue(firstSceneStarts);
            queues.enqueue(secondSceneStarts);

            expect(eventsIn(queues)).to.deep.equal([
                [ firstSceneStarts ],
                [ secondSceneStarts ],
            ]);
        });
    });

    describe('when draining a queue', () => {

        it('returns the events of the scene and removes its queue', () => {
            const
                firstSceneId = new CorrelationId('scene-1'),
                secondSceneId = new CorrelationId('scene-2');

            const
                firstSceneStarts = new SceneStarts(firstSceneId, firstScenario),
                secondSceneStarts = new SceneStarts(secondSceneId, secondScenario),
                firstSceneFinished = new SceneFinished(firstSceneId, firstScenario, new ExecutionSuccessful());

            queues.enqueue(firstSceneStarts);
            queues.enqueue(secondSceneStarts);
            queues.enqueue(firstSceneFinished);

            const events = queues.drainQueueFor(firstSceneId);

            expect(events).to.deep.equal([ firstSceneStarts, firstSceneFinished ]);

            expect(eventsIn(queues)).to.deep.equal([
                [ secondSceneStarts ],
            ]);
        });

        it('complains when there is no queue for the scene', () => {
            const sceneId = new CorrelationId('scene-1');

            expect(() => queues.drainQueueFor(sceneId))
                .to.throw(LogicError, 'No domain event queue found for scene CorrelationId(value=scene-1)');
        });

        it('complains when the queue of the scene has already been drained', () => {
            const sceneId = new CorrelationId('scene-1');

            queues.enqueue(new SceneStarts(sceneId, firstScenario));
            queues.drainQueueFor(sceneId);

            expect(() => queues.drainQueueFor(sceneId))
                .to.throw(LogicError, 'No domain event queue found for scene CorrelationId(value=scene-1)');
        });

        it('starts a new queue for the next scene of a sequence whose queue has been drained', () => {
            const
                firstSceneId = new CorrelationId('scene-1'),
                secondSceneId = new CorrelationId('scene-2');

            queues.enqueue(new SceneSequenceDetected(firstSceneId, firstScenario));
            queues.enqueue(new SceneStarts(firstSceneId, firstScenario));
            queues.drainQueueFor(firstSceneId);

            const
                secondSceneSequenceDetected = new SceneSequenceDetected(secondSceneId, firstScenario),
                secondSceneStarts = new SceneStarts(secondSceneId, firstScenario);

            queues.enqueue(secondSceneSequenceDetected);
            queues.enqueue(secondSceneStarts);

            expect(eventsIn(queues)).to.deep.equal([
                [ secondSceneSequenceDetected, secondSceneStarts ],
            ]);
        });
    });

    describe('performance', () => {

        let equals: sinon.SinonSpy;

        beforeEach(() => {
            equals = sinon.spy(TinyType.prototype, 'equals');
        });

        afterEach(() => {
            equals.restore();
        });

        it('finds the queue for an event without comparing it with every scene received so far', () => {
            const numberOfScenes = 100;

            const comparisonsPerScene = Array.from({ length: numberOfScenes }, (_, index) => {
                const sceneId = new CorrelationId(`scene-${ index }`);
                const details = scenario(`Scenario ${ index }`);

                equals.resetHistory();

                queues.enqueue(new SceneStarts(sceneId, details));
                queues.enqueue(new SceneTagged(sceneId, tag));
                queues.enqueue(new SceneFinished(sceneId, details, new ExecutionSuccessful()));

                return equals.callCount;
            });

            expect(comparisonsPerScene.at(-1)).to.equal(comparisonsPerScene[0]);
        });
    });

    function scenario(name: string): ScenarioDetails {
        return new ScenarioDetails(
            new Name(name),
            new Category('Online Checkout'),
            new FileSystemLocation(new Path('payments/checkout.feature')),
        );
    }

    function eventsIn(domainEventQueues: DomainEventQueues): DomainEvent[][] {
        const result: DomainEvent[][] = [];

        domainEventQueues.forEach((queue: DomainEventQueue) => {
            result.push(queue.reduce((events, event) => [ ...events, event ], []));
        });

        return result;
    }
});
