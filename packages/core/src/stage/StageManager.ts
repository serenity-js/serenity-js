import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../events';
import { CorrelationId, Description, Duration, Timestamp } from '../model';
import { ListensToDomainEvents } from '../screenplay';

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
    private readonly wip: Map<CorrelationId, AsyncOperationDetails> = new Map();
    private readonly failedOperations: FailedAsyncOperationDetails[] = [];

    constructor(private readonly cueTimeout: Duration,
                private readonly clock) {
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
        return new Promise((resolve, reject) => {

            let interval: NodeJS.Timer,
                timeout: NodeJS.Timer;

            timeout = setTimeout(() => {
                clearInterval(interval);

                if (this.wip.size > 0) {
                    let message = `Some of the ${ this.wip.size } async operations have failed to complete within ${ this.cueTimeout.toString()}:\n`;

                    this.wip.forEach((op: AsyncOperationDetails) => {
                        message += `${ this.clock.now().diff(op.startedAt) } - ${ op.taskDescription.value }\n`;
                    });

                    return reject(new Error(message));
                }

                if (this.failedOperations.length > 0) {
                    let message = `Some of the async operations have failed:\n`;

                    this.failedOperations.forEach((op: FailedAsyncOperationDetails) => {
                        message += `${ op.taskDescription.value } - ${ op.error.stack }\n---\n`;
                    });

                    return reject(new Error(message));
                }

                // "else" can't happen because this case is covered by the interval check below

            }, this.cueTimeout.inMilliseconds());

            interval = setInterval(() => {
                if (this.wip.size === 0 && this.failedOperations.length === 0) {
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
