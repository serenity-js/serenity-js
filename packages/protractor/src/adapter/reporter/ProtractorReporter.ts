import { Stage } from '@serenity-js/core';
import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent, SceneFinished, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSkipped, Outcome, ProblemIndication, Timestamp } from '@serenity-js/core/lib/model';
import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { Runner } from 'protractor';
import { ProtractorReport } from './ProtractorReport';

/**
 * @private
 */
export class ProtractorReporter implements StageCrewMember {
    private readonly startTime: { [key: string ]: Timestamp } = {};

    constructor(
        private readonly runner: Runner,
        private readonly successThreshold: Outcome | { Code: number } = ExecutionSkipped,
        private readonly reported: ProtractorReport = { failedCount: 0, specResults: [] },
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new ProtractorReporter(this.runner, this.successThreshold, this.reported, stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            this.recordStart(event);
        }

        else if (event instanceof SceneFinishes) {
            this.afterEach();
        }

        else if (event instanceof SceneFinished && event.outcome.isWorseThan(this.successThreshold)) {
            this.recordFailure(event);

            this.runner.emit('testFail', {
                name: event.details.name.value,
                category: event.details.category.value,
            });
        }
        else if (event instanceof SceneFinished && ! event.outcome.isWorseThan(this.successThreshold)) {
            this.recordSuccess(event);

            this.runner.emit('testPass', {
                name:       event.details.name.value,
                category:   event.details.category.value,
            });
        }
    }

    report(): ProtractorReport {
        return this.reported;
    }

    private recordFailure(event: SceneFinished) {
        const outcome = (event.outcome as ProblemIndication);

        this.reported.failedCount++;

        this.reported.specResults.push({
            description: `${ event.details.category.value } ${ event.details.name.value }`,
            duration: event.timestamp.diff(this.startTime[event.details.toString()]).inMilliseconds(),
            assertions: [{
                passed: false,
                errorMsg: outcome.error.message,
                stackTrace: outcome.error.stack,
            }],
        });
    }

    private recordStart(event: SceneStarts) {
        this.startTime[event.details.toString()] = event.timestamp;
    }

    private recordSuccess(event: SceneFinished) {
        this.reported.specResults.push({
            description: `${ event.details.category.value } ${ event.details.name.value }`,
            duration: event.timestamp.diff(this.startTime[event.details.toString()]).inMilliseconds(),
            assertions: [{
                passed: true,
            }],
        });
    }

    private afterEach(): PromiseLike<void> {
        if (! this.runner.afterEach) {
            return Promise.resolve();
        }

        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Invoking ProtractorRunner.afterEach...`),
            id,
            this.stage.currentTime(),
        ));

        return Promise.resolve(this.runner.afterEach() as PromiseLike<void> | undefined)
            .then(
                () =>
                    this.stage.announce(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] ProtractorRunner.afterEach succeeded`),
                        id,
                        this.stage.currentTime(),
                    )),
                error =>
                    this.stage.announce(new AsyncOperationFailed(error, id, this.stage.currentTime())),
            );
    }
}
