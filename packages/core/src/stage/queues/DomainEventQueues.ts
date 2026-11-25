import { LogicError } from '../../errors/index.js';
import type { DomainEvent} from '../../events/index.js';
import { SceneSequenceDetected, SceneStarts } from '../../events/index.js';
import { d } from '../../io/format.js';
import type { CorrelationId, ScenarioDetails } from '../../model/index.js';
import { DomainEventQueue } from './DomainEventQueue.js';

/**
 * @group Stage
 */
export class DomainEventQueues {

    /**
     * Queue ids indexed by the value of the scene id, so that finding the queue for an event
     * takes the same time no matter how many scenes have been received so far.
     */
    private readonly queueIdsBySceneId: Map<string, symbol> = new Map();

    /**
     * Queue ids indexed by the scenario details of the scenes they hold,
     * so that the scenes of a scene sequence, like retries, end up in the same queue.
     */
    private readonly queueIdsByScenario: Map<string, symbol> = new Map();

    private readonly queues: Map<symbol, DomainEventQueue> = new Map();
    private readonly holdingBay = new DomainEventQueue();

    enqueue(event: DomainEvent & { sceneId: CorrelationId }): void {

        if (this.shouldStartNewQueueFor(event)) {
            this.queues.set(this.queueIdFor(event), new DomainEventQueue(event, ...this.holdingBay.drain()));
        } else if (this.hasNoQueuesReadyFor(event)) {
            this.holdingBay.enqueue(event);
        } else {
            this.queues.get(this.queueIdFor(event)).enqueue(event);
        }
    }

    forEach(callback: (queue: DomainEventQueue) => void): void {
        this.queues.forEach(callback);
    }

    drainQueueFor(sceneId: CorrelationId): Array<DomainEvent & { sceneId: CorrelationId }> {
        for (const [key, queue] of this.queues) {
            if (sceneId.equals(queue.sceneId)) {
                const events = queue.drain();
                this.queues.delete(key);
                this.removeFromIndex(key);

                return events;
            }
        }
        throw new LogicError(d`No domain event queue found for scene ${ sceneId }`);
    }

    private shouldStartNewQueueFor(event: DomainEvent & { sceneId: CorrelationId }) {
        return (event instanceof SceneSequenceDetected || event instanceof SceneStarts)
            && !this.queues.has(this.queueIdFor(event));
    }

    private hasNoQueuesReadyFor(event: DomainEvent & { sceneId: CorrelationId }) {
        return this.queues.size === 0
            || !this.queues.has(this.queueIdFor(event));
    }

    private queueIdFor(event: DomainEvent & { sceneId: CorrelationId, details?: ScenarioDetails }): symbol {
        const exactMatch = this.queueIdsBySceneId.get(event.sceneId.value);

        if (exactMatch) {
            return exactMatch;
        }

        if (! (event instanceof SceneStarts) && event.details) {
            const sameScenarioMatch = this.queueIdsByScenario.get(scenarioKeyOf(event.details));

            if (sameScenarioMatch) {
                this.queueIdsBySceneId.set(event.sceneId.value, sameScenarioMatch);

                return sameScenarioMatch;
            }
        }

        const newQueueId = Symbol();

        this.queueIdsBySceneId.set(event.sceneId.value, newQueueId);

        if (event.details) {
            const scenarioKey = scenarioKeyOf(event.details);

            if (! this.queueIdsByScenario.has(scenarioKey)) {
                this.queueIdsByScenario.set(scenarioKey, newQueueId);
            }
        }

        return newQueueId;
    }

    private removeFromIndex(queueId: symbol): void {
        for (const index of [ this.queueIdsBySceneId, this.queueIdsByScenario ]) {
            for (const [ key, indexedQueueId ] of index) {
                if (indexedQueueId === queueId) {
                    index.delete(key);
                }
            }
        }
    }
}

function scenarioKeyOf(details: ScenarioDetails): string {
    return JSON.stringify(details.toJSON());
}
