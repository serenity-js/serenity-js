import { Stage } from '@serenity-js/core';
import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent, SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSuccessful, Outcome, ProblemIndication, Timestamp } from '@serenity-js/core/lib/model';
import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { Runner } from 'protractor';
import { match } from 'tiny-types';
import { ProtractorReport } from './ProtractorReport';

export class ProtractorReporter implements StageCrewMember {
    private readonly startTime: { [key: string ]: Timestamp } = {};

    constructor(
        private readonly runner: Runner,
        private readonly reported: ProtractorReport = { failedCount: 0, specResults: [] },
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new ProtractorReporter(this.runner, this.reported, stage);
    }

    notifyOf(event: DomainEvent): void {
        return match<DomainEvent, void>(event)
            .when(SceneStarts, (e: SceneStarts) => {
                this.startTime[e.value.toString()] = e.timestamp;
            })
            .when(SceneFinished, (e: SceneFinished) => match<Outcome, void>(e.outcome)
                .when(ExecutionSuccessful, (o: ExecutionSuccessful) => {

                    this.reported.specResults.push({
                        description:    `${ e.value.category.value } ${ e.value.name.value }`,
                        duration:       e.timestamp.diff(this.startTime[e.value.toString()]).inMilliseconds(),
                        assertions: [{
                            passed: true,
                        }],
                    });

                    this.runner.emit('testPass', {
                        name:       e.value.name.value,
                        category:   e.value.category.value,
                    });

                    this.afterEach();
                })
                .when(ProblemIndication, (o: ProblemIndication) => {

                    this.reported.failedCount++;

                    this.reported.specResults.push({
                        description:    `${ e.value.category.value } ${ e.value.name.value }`,
                        duration:       e.timestamp.diff(this.startTime[e.value.toString()]).inMilliseconds(),
                        assertions: [{
                            passed:     false,
                            errorMsg:   o.error.message,
                            stackTrace: o.error.stack,
                        }],
                    });

                    this.runner.emit('testFail', {
                        name:       e.value.name.value,
                        category:   e.value.category.value,
                    });

                    this.afterEach();
                })
                .else(() => /* ignore */ void 0),
            )
            .else(() => /* ignore */ void 0);
    }

    report(): ProtractorReport {
        return this.reported;
    }

    private afterEach(): void {
        if (this.runner.afterEach) {

            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Description(`[${ this.constructor.name }] Invoking ProtractorRunner.afterEach...`),
                id,
            ));

            Promise.resolve(this.runner.afterEach() as PromiseLike<void>)
                .then(
                    () => this.stage.announce(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] ProtractorRunner.afterEach succeeded`),
                        id,
                    )),
                    error => this.stage.announce(new AsyncOperationFailed(error, id)),
                );
        }
    }
}
