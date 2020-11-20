import { TinyType } from 'tiny-types';

import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../events';
import { CorrelationId, Description, Duration, Timestamp } from '../model';
import { ListensToDomainEvents } from '../screenplay';
import { Clock } from './Clock';

interface AsyncOperationDetails {
    taskDescription:    Description;
    startedAt:          Timestamp;
}

interface FailedAsyncOperationDetails {
    taskDescription:    Description;
    startedAt:          Timestamp;
    duration:           Duration;
    error:              Error;
}

export class StageManager {
    private readonly subscribers: ListensToDomainEvents[] = [];
    private readonly wip = new WIP<CorrelationId, AsyncOperationDetails>();
    private readonly failedOperations: FailedAsyncOperationDetails[] = [];

    constructor(private readonly cueTimeout: Duration,
                private readonly clock: Clock) {
    }

    register(...subscribers: ListensToDomainEvents[]) {
        this.subscribers.push(...subscribers);
    }

    deregister(subscriber: ListensToDomainEvents) {
        this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
    }

    notifyOf(event: DomainEvent): void {
        this.handleAsyncOperation(event);

        this.subscribers.forEach(crewMember => crewMember.notifyOf(event));
    }

    waitForNextCue(): Promise<void> {
        function header(numberOfFailures: number) {
            return numberOfFailures === 1
                ? `1 async operation has failed to complete`
                : `${ numberOfFailures } async operations have failed to complete`;
        }

        return new Promise((resolve, reject) => {

            let interval: NodeJS.Timer,
                timeout: NodeJS.Timer;

            timeout = setTimeout(() => {
                clearInterval(interval);

                const now = this.clock.now();

                if (this.wip.size() > 0) {
                    const timedOutOperations = this.wip.filter(op => now.diff(op.startedAt).isGreaterThanOrEqualTo(this.cueTimeout));

                    const message = timedOutOperations.reduce(
                        (acc, op) =>
                            acc.concat(`${ now.diff(op.startedAt) } - ${ op.taskDescription.value }`),
                        [ `${ header(timedOutOperations.length) } within a ${ this.cueTimeout } cue timeout:` ],
                    ).join('\n');

                    return reject(new Error(message));
                }

                if (this.failedOperations.length > 0) {
                    let message = `${ header(this.failedOperations.length) }:\n`;

                    this.failedOperations.forEach((op: FailedAsyncOperationDetails) => {
                        message += `${ op.taskDescription.value } - ${ op.error.stack }\n---\n`;
                    });

                    return reject(new Error(message));
                }

                // "else" can't happen because this case is covered by the interval check below

            }, this.cueTimeout.inMilliseconds());

            interval = setInterval(() => {
                if (this.wip.size() === 0 && this.failedOperations.length === 0) {
                    clearTimeout(timeout);
                    clearInterval(interval);

                    return resolve();
                }
            }, 10);
        });
    }

    currentTime(): Timestamp {
        return this.clock.now();
    }

    private handleAsyncOperation(event: DomainEvent): void {
        if (event instanceof AsyncOperationAttempted) {
            this.wip.set(event.correlationId, {
                taskDescription: event.taskDescription,
                startedAt: event.timestamp,
            });
        }
        else if (event instanceof AsyncOperationCompleted) {
            this.wip.delete(event.correlationId);
        }
        else if (event instanceof AsyncOperationFailed) {
            const original = this.wip.get(event.correlationId);
            this.failedOperations.push({
                taskDescription:    original.taskDescription,
                startedAt:          original.startedAt,
                duration:           event.timestamp.diff(original.startedAt),
                error:              event.error,
            });
            this.wip.delete(event.correlationId);
        }
    }
}

/**
 * @package
 */
class WIP<Key extends TinyType, Value> {
    private wip = new Map<Key, Value>();

    set(key: Key, value: Value) {
        this.wip.set(key, value);
    }

    get(key: Key): Value {
        return this.wip.get(this.asReference(key));
    }

    delete(key: Key): boolean {
        return this.wip.delete(this.asReference(key));
    }

    has(key): boolean {
        return !! this.asReference(key);
    }

    size(): number {
        return this.wip.size;
    }

    forEach(callback: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any) {
        return this.wip.forEach(callback);
    }

    filter(callback: (value: Value, index: number, array: Value[]) => boolean): Value[] {
        return Array.from(this.wip.values()).filter(callback);
    }

    private asReference(key: Key) {
        for (const [ k, v ] of this.wip.entries()) {
            if (k.equals(key)) {
                return k;
            }
        }

        return undefined;
    }
}
