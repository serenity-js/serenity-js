import { LogicError, Stage, StageCrewMember } from '@serenity-js/core';
import { DomainEvent, SceneFinished, SceneStarts, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events';
import {
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ImplementationPending,
    Outcome,
    ProblemIndication,
    TestSuiteDetails,
} from '@serenity-js/core/lib/model';
import { Suite } from '@wdio/reporter/build/stats/suite';
import { Test } from '@wdio/reporter/build/stats/test';
import type { EventEmitter } from 'events';
import { match } from 'tiny-types';

/**
 * @package
 */
export class WebdriverIONotifier implements StageCrewMember {

    private readonly events = new EventLog();
    private readonly suites: TestSuiteDetails[] = [];

    constructor(
        private readonly reporter: EventEmitter,
        private readonly successThreshold: Outcome | { Code: number },
        private readonly cid: string,
        private readonly specs: string[],
        private failures: number = 0,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        return match<DomainEvent, void>(event)
            .when(TestSuiteStarts,          WebdriverIONotifier.prototype.onTestSuiteStarts.bind(this))
            .when(TestSuiteFinished,        WebdriverIONotifier.prototype.onTestSuiteFinished.bind(this))
            .when(SceneStarts,              WebdriverIONotifier.prototype.onSceneStarts.bind(this))
            .when(SceneFinished,            WebdriverIONotifier.prototype.onSceneFinished.bind(this))
            .else(() => void 0);
    }

    failureCount(): number {
        return this.failures;
    }

    private onTestSuiteStarts(started: TestSuiteStarts) {
        this.events.record(started.details.correlationId, started);
        this.reporter.emit('suite:start', this.suiteStartEventFrom(started));

        this.suites.push(started.details);
    }

    private onTestSuiteFinished(finished: TestSuiteFinished) {
        this.suites.pop();

        const started = this.events.getByCorrelationId<TestSuiteStarts>(finished.details.correlationId);
        this.reporter.emit('suite:end', this.suiteEndEventFrom(started, finished));
    }

    private suiteStartEventFrom(started: TestSuiteStarts): Suite {
        return {
            type:       'suite:start',
            uid:        started.details.correlationId.value,
            cid:        this.cid,
            title:      started.details.name.value,
            fullTitle:  this.suiteNamesConcatenatedWith(started.details.name.value),
            parent:     this.parentSuiteName(),
            file:       started.details.location.path.value,
            specs:      this.specs,
            pending:    false,
        }
    }

    private suiteNamesConcatenatedWith(name: string): string {
        return this.suites.map(suite => suite.name.value).concat(name).join(' ');
    }

    private suiteEndEventFrom(started: TestSuiteStarts, finished: TestSuiteFinished): Suite {
        return {
            ...this.suiteStartEventFrom(started),
            type:       'suite:end',
            duration:   finished.timestamp.diff(started.timestamp).inMilliseconds()
        }
    }

    private onSceneStarts(started: SceneStarts) {
        const test = this.testStartEventFrom(started);

        this.events.record(started.sceneId, started);

        this.reporter.emit(test.type, test);
    }

    private onSceneFinished(finished: SceneFinished) {

        if (finished.outcome.isWorseThan(this.successThreshold)) {
            this.failures++;
        }

        const started     = this.events.getByCorrelationId<SceneStarts>(finished.sceneId);

        if (this.willBeRetried(finished.outcome)) {
            const testResult  = this.testEndEventFrom(started, finished);

            const type = 'test:retry';

            this.reporter.emit(type, {
                ...testResult,
                type,
                error:  this.errorFrom(finished.outcome),
            });

        } else {

            const testResult  = this.testResultEventFrom(started, finished);
            this.reporter.emit(testResult.type, testResult);

            const testEnd     = this.testEndEventFrom(started, finished);
            this.reporter.emit(testEnd.type, testEnd);
        }
    }

    private willBeRetried(outcome: Outcome): outcome is ExecutionIgnored {
        return outcome instanceof ExecutionIgnored;
    }

    private testStartEventFrom(started: SceneStarts): Test {
        const title = started.details.name.value
            .replace(new RegExp(`^.*?(${ this.parentSuiteName() })`), '')
            .trim();

        return {
            type:       'test:start',
            title,
            fullTitle:  this.suiteNamesConcatenatedWith(title),
            parent:     this.parentSuiteName(),
            file:       started.details.location.path.value,
            pending:    false,
            cid:        this.cid,
            uid:        started.sceneId.value,
            specs:      this.specs,
        }
    }

    private parentSuiteName() {
        return this.suites[this.suites.length - 1]?.name.value || '';
    }

    private testEndEventFrom(started: SceneStarts, finished: SceneFinished): Test {
        const duration = finished.timestamp.diff(started.timestamp).inMilliseconds();
        return {
            ...this.testStartEventFrom(started),
            type: 'test:end',
            duration
        };
    }

    private testResultEventFrom(started: SceneStarts, finished: SceneFinished): Test {
        const test = this.testEndEventFrom(started, finished)

        const unlessSuccessful = (outcome: Outcome, type: Test['type']) =>
            ! outcome.isWorseThan(this.successThreshold) && (outcome instanceof ProblemIndication)
                ? 'test:pass'
                : type;

        return match<Outcome, Test>(finished.outcome)
            .when(ExecutionCompromised, (outcome: ExecutionCompromised) => ({
                ...test,
                type:   unlessSuccessful(outcome, 'test:fail'),
                error:  this.errorFrom(outcome),
            }))
            .when(ExecutionFailedWithError, (outcome: ExecutionFailedWithError) => ({
                ...test,
                type:   unlessSuccessful(outcome, 'test:fail'),
                error:  this.errorFrom(outcome),
            }))
            .when(ExecutionFailedWithAssertionError, (outcome: ExecutionFailedWithAssertionError) => ({
                ...test,
                type:   unlessSuccessful(outcome, 'test:fail'),
                error:  this.errorFrom(outcome),
            }))
            .when(ImplementationPending, (outcome: ImplementationPending) => ({
                ...test,
                type:           unlessSuccessful(outcome, 'test:pending'),
                error:          this.errorFrom(outcome),
                pending:        true,
                pendingReason:  outcome.error.message
            }))
            .when(ExecutionIgnored, (outcome: ExecutionIgnored) => ({
                ...test,
                // In WebdriverIO, skipped == pending == ignored
                // https://github.com/webdriverio/webdriverio/blob/a1830046f367be7737af2c00561796c3ae5dd85b/packages/wdio-reporter/src/index.ts#L162
                type:           unlessSuccessful(outcome, 'test:pending'),
                error:          this.errorFrom(outcome),
                pending:        true,
                pendingReason:  outcome.error.message
            }))
            .when(ExecutionSkipped, (outcome: ExecutionSkipped) => ({
                ...test,
                // In WebdriverIO, skipped == pending == ignored
                // https://github.com/webdriverio/webdriverio/blob/a1830046f367be7737af2c00561796c3ae5dd85b/packages/wdio-reporter/src/index.ts#L162
                type:           unlessSuccessful(outcome, 'test:pending'),
                pending:        true,
            }))
            .else(() => ({
                ...test,
                type: 'test:pass',
            }));
    }

    private errorFrom(outcome: ProblemIndication) {
        const error: Error & { type?: string, expected?: string, actual?: string } = outcome.error;

        // https://github.com/webdriverio/webdriverio/blob/7ec2c60a7623de431d60bb3605957e6e4bdf057b/packages/wdio-mocha-framework/src/index.ts#L233
        return {
            name:       error.name,
            message:    error.message,
            stack:      error.stack,
            type:       error.type || error.name,
            expected:   error.expected,
            actual:     error.actual
        }
    }
}

class EventLog {
    private readonly events = new Map<string, DomainEvent>();

    record(correlationId: CorrelationId, event: DomainEvent) {
        this.events.set(correlationId.value, event)
    }

    getByCorrelationId<T extends DomainEvent>(correlationId: CorrelationId): T {
        if (! this.events.has(correlationId.value)) {
            throw new LogicError(`Event with correlation id ${ correlationId } has never been recorded`);
        }

        return this.events.get(correlationId.value) as T;
    }
}
