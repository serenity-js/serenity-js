import type { DomainEvent } from '../events/index.js';
import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed } from '../events/index.js';
import type { CorrelationId, Description, Name } from '../model/index.js';
import type { Clock, Duration, Timestamp } from '../screenplay/index.js';
import type { ListensToDomainEvents } from '../stage/index.js';

/**
 * @group Stage
 */
export class StageManager {
    private readonly subscribers: ListensToDomainEvents[] = [];
    private readonly wip: WIP;

    constructor(private cueTimeout: Duration, clock: Clock) {
        this.wip = new WIP(cueTimeout, clock);
    }

    configure(options: { cueTimeout: Duration }): void {
        this.cueTimeout = options.cueTimeout;
        this.wip.configure(options);
    }

    register(...subscribers: ListensToDomainEvents[]): void {
        this.subscribers.push(...subscribers);
    }

    deregister(subscriber: ListensToDomainEvents): void {
        this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
    }

    notifyOf(event: DomainEvent): void {
        this.wip.recordIfAsync(event);

        this.subscribers.forEach(crewMember => crewMember.notifyOf(event));
    }

    /**
     * Returns a promise that resolves when all the async operations in progress have completed,
     * or when the cue timeout expires, whichever happens first.
     *
     * Resolves immediately when there are no operations in progress.
     *
     * @param options
     * @param options.except
     *  Correlation ids of async operations not to wait for.
     *  Useful when the caller has registered async operations that can only complete after this wait is over,
     *  for example, when actors exiting the stage need to wait for any screenshots to be taken first.
     */
    waitForAsyncOperationsToComplete(options: { except: CorrelationId[] } = { except: [] }): Promise<void> {
        const excludedOperations = options.except;

        if (this.wip.hasAllOperationsCompletedExcept(excludedOperations)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                clearInterval(interval);

                return resolve();
            }, this.cueTimeout.inMilliseconds());

            const interval = setInterval(() => {
                if (this.wip.hasAllOperationsCompletedExcept(excludedOperations)) {
                    clearTimeout(timeout);
                    clearInterval(interval);

                    return resolve();
                }
            }, 10);
        });
    }

    async waitForNextCue(): Promise<void> {

        await this.waitForAsyncOperationsToComplete();

        if (this.wip.hasFailedOperations()) {
            const error = new Error(this.wip.descriptionOfFailedOperations());

            this.wip.resetFailedOperations();

            throw error;
        }

        if (this.wip.hasActiveOperations()) {
            throw new Error(this.wip.descriptionOfTimedOutOperations());
        }
    }
}

/**
 * @package
 */
class WIP {
    private readonly wip = new Map<CorrelationId, AsyncOperationDetails>();
    private readonly failedOperations: FailedAsyncOperationDetails[] = [];

    constructor(
        private cueTimeout: Duration,
        private readonly clock: Clock,
    ) {
    }

    configure(options: { cueTimeout: Duration }) {
        this.cueTimeout = options.cueTimeout;
    }

    recordIfAsync(event: DomainEvent): void {
        if (event instanceof AsyncOperationAttempted) {
            this.set(event.correlationId, {
                name:           event.name,
                description:    event.description,
                startedAt:      event.timestamp,
            });
        }

        if (event instanceof AsyncOperationCompleted) {
            this.delete(event.correlationId);
        }

        if (event instanceof AsyncOperationFailed) {
            const original = this.get(event.correlationId);

            this.failedOperations.push({
                name:           original.name,
                description:    original.description,
                startedAt:      original.startedAt,
                duration:       event.timestamp.diff(original.startedAt),
                error:          event.error,
            });

            this.delete(event.correlationId)
        }
    }

    hasAllOperationsCompletedExcept(excludedOperations: CorrelationId[]): boolean {
        for (const correlationId of this.wip.keys()) {
            if (! excludedOperations.some(excluded => excluded.equals(correlationId))) {
                return false;
            }
        }

        return true;
    }

    hasActiveOperations(): boolean {
        return this.wip.size > 0;
    }

    hasFailedOperations(): boolean {
        return this.failedOperations.length > 0;
    }

    descriptionOfTimedOutOperations(): string {
        const now = this.clock.now();

        return this.activeOperations().reduce(
            (acc, op) => acc.concat(`${ now.diff(op.startedAt) } - [${ op.name.value }] ${ op.description.value }`),
            [`${ this.header(this.wip.size) } within a ${ this.cueTimeout } cue timeout:`],
        ).join('\n');
    }

    descriptionOfFailedOperations() {
        let message = `${ this.header(this.failedOperations.length) }:\n`;

        this.failedOperations.forEach((op: FailedAsyncOperationDetails) => {
            message += `[${ op.name.value }] ${ op.description.value } - ${ op.error.stack }\n---\n`;
        });

        return message;
    }

    resetFailedOperations() {
        this.failedOperations.length = 0;
    }

    private activeOperations() {
        return Array.from(this.wip.values());
    }

    private header(numberOfFailures: number): string {
        return numberOfFailures === 1
            ? `1 async operation has failed to complete`
            : `${ numberOfFailures } async operations have failed to complete`;
    }

    private set(correlationId: CorrelationId, details: AsyncOperationDetails) {
        return this.wip.set(correlationId, details);
    }

    private get(correlationId: CorrelationId) {
        return this.wip.get(this.asReference(correlationId));
    }

    private delete(correlationId: CorrelationId) {
        this.wip.delete(this.asReference(correlationId))
    }

    private asReference(key: CorrelationId): CorrelationId | undefined {
        for (const [ k, v_ ] of this.wip.entries()) {
            if (k.equals(key)) {
                return k;
            }
        }

        return undefined;
    }
}

/**
 * @package
 */
interface AsyncOperationDetails {
    name:           Name;
    description:    Description;
    startedAt:      Timestamp;
    duration?:      Duration;
    error?:         Error;
}

/**
 * @package
 */
interface FailedAsyncOperationDetails {
    name:           Name;
    description:    Description;
    startedAt:      Timestamp;
    duration:       Duration;
    error:          Error;
}
