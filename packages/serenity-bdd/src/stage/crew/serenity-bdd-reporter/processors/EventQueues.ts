import { DomainEvent, SceneSequenceDetected, SceneStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, ScenarioDetails } from '@serenity-js/core/lib/model';
import { EventQueue } from './EventQueue';

/**
 * @package
 */
export class EventQueues {

    private readonly queueIndex: Array<{ sceneId: CorrelationId, details: ScenarioDetails, queueId: symbol }> = [];

    private readonly queues: Map<symbol, EventQueue> = new Map();
    private readonly holdingBay = new EventQueue();

    enqueue(event: DomainEvent & { sceneId: CorrelationId }) {

        if (this.shouldStartNewQueueFor(event)) {
            this.queues.set(this.queueIdFor(event), new EventQueue(event, ...this.holdingBay.drain()));
        }

        else if (this.hasNoQueuesReadyFor(event)) {
            this.holdingBay.enqueue(event);
        }

        else {
            this.queues.get(this.queueIdFor(event)).enqueue(event);
        }
    }

    forEach<T>(callback: (queue: EventQueue) => void): void {
        this.queues.forEach(callback);
    }

    private shouldStartNewQueueFor(event: DomainEvent & { sceneId: CorrelationId }) {
        return (event instanceof SceneSequenceDetected || event instanceof SceneStarts)
            && ! this.queues.has(this.queueIdFor(event));
    }

    private hasNoQueuesReadyFor(event: DomainEvent & { sceneId: CorrelationId }) {
        return this.queues.size === 0
            || ! this.queues.has(this.queueIdFor(event));
    }

    private queueIdFor(event: DomainEvent & { sceneId: CorrelationId, details?: ScenarioDetails }): symbol {
        const exactMatch = this.queueIndex.find(entry => entry.sceneId.equals(event.sceneId));

        if (exactMatch) {
            return exactMatch.queueId;
        }

        const sameScenarioMatch = this.queueIndex.find(entry => entry.details.equals(event.details));

        if (sameScenarioMatch) {
            this.queueIndex.push({
                sceneId: event.sceneId,
                details: event.details || sameScenarioMatch.details,
                queueId: sameScenarioMatch.queueId,
            });

            return sameScenarioMatch.queueId;
        }

        const newQueueId = Symbol();

        this.queueIndex.push({
            sceneId: event.sceneId,
            details: event.details,
            queueId: newQueueId,
        });

        return newQueueId;
    }
}
