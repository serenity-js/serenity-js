import { match } from 'tiny-types';

import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../events';
import { CorrelationId, Description, Duration, Timestamp } from '../model';
import { Clock } from './Clock';
import { StageCrewMember } from './StageCrewMember';

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
    private readonly subscribers: StageCrewMember[] = [];
    private readonly wip: Map<CorrelationId, AsyncOperationDetails> = new Map();
    private readonly failedOperations: FailedAsyncOperationDetails[] = [];

    constructor(private readonly cueTimeout: Duration = Duration.ofSeconds(3),
                private readonly clock = new Clock()) {
    }

    register(...stageCrewMembers: StageCrewMember[]) {
        stageCrewMembers.forEach(stageCrewMember => {
            stageCrewMember.assignTo(this);
            this.subscribers.push(stageCrewMember);
        });
    }

    notifyOf(event: DomainEvent): void {
        match<DomainEvent, void>(event)
            .when(AsyncOperationAttempted, (evt: AsyncOperationAttempted) => {
                this.wip.set(evt.correlationId, {
                    taskDescription: evt.taskDescription,
                    startedAt: evt.timestamp,
                });
            })
            .when(AsyncOperationCompleted, (evt: AsyncOperationCompleted) => {
                this.wip.delete(evt.correlationId);
            })
            .when(AsyncOperationFailed, (evt: AsyncOperationFailed) => {
                const original = this.wip.get(evt.correlationId);
                this.failedOperations.push({
                    taskDescription:    original.taskDescription,
                    startedAt:          original.startedAt,
                    duration:           evt.timestamp.diff(original.startedAt),
                    error:              evt.error,
                });
                this.wip.delete(evt.correlationId);
            })
            .else(_ => void 0);

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
                        message += `${ op.taskDescription.value } - ${ op.error.toString() }\n`;
                    });

                    return reject(new Error(message));
                }

                // "else" can't happen because this case is covered by the interval check below

            }, this.cueTimeout.milliseconds);

            interval = setInterval(() => {
                if (this.wip.size === 0 && this.failedOperations.length === 0) {
                    clearTimeout(timeout);
                    clearInterval(interval);

                    return resolve();
                }
            }, 10);
        });
    }
}
