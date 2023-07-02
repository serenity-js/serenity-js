import type { Stage, StageCrewMember } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent} from '@serenity-js/core/lib/events/index.js';
import { AsyncOperationAttempted, AsyncOperationCompleted, SceneFinished, SceneStarts, TestRunFinishes, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events/index.js';
import type {
    Outcome,
    TestSuiteDetails} from '@serenity-js/core/lib/model/index.js';
import {
    CorrelationId,
    Description,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ImplementationPending, Name,
    ProblemIndication
} from '@serenity-js/core/lib/model/index.js';
import type { Test as testStats } from '@wdio/reporter';
import type { Capabilities, Frameworks } from '@wdio/types';
import type { EventEmitter } from 'events';
import { match } from 'tiny-types';

import type { WebdriverIOConfig } from '../config/index.js';

// interface Argument {
//     rows?: {
//         cells: string[];
//     }[];
// }
//
// export interface testStats {
//     type: 'test:start' | 'test:pass' | 'test:fail' | 'test:retry' | 'test:pending' | 'test:end' | 'test:skip';
//     title: string;
//     parent: string;
//     fullTitle: string;
//     pending: boolean;
//     file?: string;
//     duration?: number;
//     cid: string;
//     specs: string[];
//     uid: string;
//     pendingReason?: string;
//     error?: Error;
//     errors?: Error[];
//     retries?: number;
//     argument?: string | Argument;
// }
//

/**
 * @package
 */
export class WebdriverIONotifier implements StageCrewMember {

    /**
     * We don't have access to the "context" object produced by Mocha,
     * and can't assume that other test runners have a similar concept.
     * Since, at the time of writing, none of the WebdriverIO rely on this parameter
     * using a dummy seems to be sufficient.
     * @private
     */
    private static dummmyContext = {};

    private readonly events = new EventLog();
    private readonly suites: TestSuiteDetails[] = [];

    constructor(
        private readonly config: WebdriverIOConfig,
        private readonly capabilities: Capabilities.RemoteCapability,
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
            .when(TestRunFinishes,          WebdriverIONotifier.prototype.onTestRunFinishes.bind(this))
            .else(() => void 0);
    }

    private onTestRunFinishes(): Promise<any> {
        return this.invokeHooks('after', this.config.after, [this.failures, this.capabilities, this.specs]);
    }

    failureCount(): number {
        return this.failures;
    }

    private onTestSuiteStarts(started: TestSuiteStarts): Promise<any> {
        this.events.record(started.details.correlationId, started);

        const suite = this.suiteStartEventFrom(started);

        this.reporter.emit('suite:start', suite);

        this.suites.push(started.details);

        return this.invokeHooks('beforeSuite', this.config.beforeSuite, [suite as any]);    // todo: correct types
    }

    private onTestSuiteFinished(finished: TestSuiteFinished): Promise<any> {
        this.suites.pop();

        const started = this.events.getByCorrelationId<TestSuiteStarts>(finished.details.correlationId);
        const suite = this.suiteEndEventFrom(started, finished);

        this.reporter.emit('suite:end', suite);

        return this.invokeHooks('afterSuite', this.config.afterSuite, [suite as any]);  // todo: correct types
    }

    private suiteStartEventFrom(started: TestSuiteStarts): { uid: string, cid: string, specs: string[] } & Frameworks.Suite {
        return {
            type:       'suite:start',
            uid:        started.details.correlationId.value,
            cid:        this.cid,
            title:      started.details.name.value,
            fullTitle:  this.suiteNamesConcatenatedWith(started.details.name.value),
            parent:     this.parentSuiteName(),
            file:        started.details.location.path.value,
            specs:      this.specs,
            pending:    false,
        }
    }

    private suiteNamesConcatenatedWith(name: string): string {
        return this.suites.map(suite => suite.name.value).concat(name).join(' ');
    }

    private suiteEndEventFrom(started: TestSuiteStarts, finished: TestSuiteFinished): Frameworks.Suite {
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

        return this.invokeHooks('beforeTest', this.config.beforeTest, [ this.testFrom(started), WebdriverIONotifier.dummmyContext ]);
    }

    private onSceneFinished(finished: SceneFinished) {

        if (finished.outcome.isWorseThan(this.successThreshold)) {
            this.failures++;
        }

        const started     = this.events.getByCorrelationId<SceneStarts>(finished.sceneId);
        let testEnd: testStats;

        if (this.willBeRetried(finished.outcome)) {
            testEnd  = this.testEndEventFrom(started, finished);

            const type = 'test:retry';

            this.reporter.emit(type, {
                ...testEnd,
                type,
                error:  this.errorFrom(finished.outcome),
            });

        } else {

            const testResultEvent  = this.testResultEventFrom(started, finished);
            this.reporter.emit(testResultEvent.type, testResultEvent);

            testEnd     = this.testEndEventFrom(started, finished);
            this.reporter.emit(testEnd.type, testEnd);
        }

        return this.invokeHooks('afterTest', this.config.afterTest, [ this.testFrom(started), WebdriverIONotifier.dummmyContext, this.testResultFrom(started, finished) ]);
    }

    private willBeRetried(outcome: Outcome): outcome is ExecutionIgnored {
        return outcome instanceof ExecutionIgnored;
    }

    private testShortTitleFrom(started: SceneStarts): string {
        return started.details.name.value
            .replace(new RegExp(`^.*?(${ this.parentSuiteName() })`), '')
            .trim();
    }

    private testFrom(started: SceneStarts): Frameworks.Test {
        const
            title           = this.testShortTitleFrom(started);

        return {
            ctx:        WebdriverIONotifier.dummmyContext,
            file:       started.details.location.path.value,
            fullName:   this.suiteNamesConcatenatedWith(title),
            fullTitle:  this.suiteNamesConcatenatedWith(title),
            parent:     this.parentSuiteName(),
            pending:    false,
            title,
            type:       'test'  // I _think_ it's either 'test' or 'hook' - https://github.com/mochajs/mocha/blob/0ea732c1169c678ef116c3eb452cc94758fff150/lib/test.js#L31
        }
    }

    private testStartEventFrom(started: SceneStarts): testStats {
        const title = this.testShortTitleFrom(started);
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
        return this.suites.at(-1)?.name.value || '';
    }

    /**
     * test status is 'passed' | 'pending' | 'skipped' | 'failed' | 'broken' | 'canceled'
     * Since this is not documented, we're mimicking other WebdriverIO reporters, for example:
     *   https://github.com/webdriverio/webdriverio/blob/7415f3126e15a733b51721492e4995ceafae6046/packages/wdio-allure-reporter/src/constants.ts#L3-L9
     *
     * @param started
     * @param finished
     * @private
     */
    private testResultFrom(started: SceneStarts, finished: SceneFinished): Frameworks.TestResult {
        const duration = finished.timestamp.diff(started.timestamp).inMilliseconds();
        const defaultRetries = { attempts: 0, limit: 0 };

        const passedOrFailed = (outcome: Outcome): boolean =>
            this.whenSuccessful<boolean>(outcome, true, false);

        return match<Outcome, Frameworks.TestResult>(finished.outcome)
            .when(ExecutionCompromised, (outcome: ExecutionCompromised) => {
                const error = this.errorFrom(outcome);
                return {
                    duration,
                    error,
                    exception: error.message,
                    passed: passedOrFailed(outcome),
                    status: 'broken',
                    retries: defaultRetries
                }
            })
            .when(ExecutionFailedWithError, (outcome: ExecutionFailedWithError) => {
                const error = this.errorFrom(outcome);
                return {
                    duration,
                    error,
                    exception: error.message,
                    passed: passedOrFailed(outcome),
                    status: 'broken',
                    retries: defaultRetries
                }
            })
            .when(ExecutionFailedWithAssertionError, (outcome: ExecutionFailedWithAssertionError) => {
                const error = this.errorFrom(outcome);
                return {
                    duration,
                    error,
                    exception: error.message,
                    passed: passedOrFailed(outcome),
                    status: 'failed',
                    retries: defaultRetries
                }
            })
            .when(ImplementationPending, (outcome: ImplementationPending) => {
                const error = this.errorFrom(outcome);
                return {
                    duration,
                    error,
                    exception: error.message,
                    passed: passedOrFailed(outcome),
                    status: 'pending',
                    retries: defaultRetries
                }
            })
            .when(ExecutionIgnored, (outcome: ExecutionIgnored) => {
                const error = this.errorFrom(outcome);
                return {
                    duration,
                    error,
                    exception: error.message,
                    passed: passedOrFailed(outcome),
                    status: 'canceled',         // fixme: mark as canceled for now for the lack of a better alternative;
                    retries: defaultRetries     //  consider capturing info about retries from Mocha and putting it on the ExecutionIgnored event so we can pass it on
                }
            })
            .when(ExecutionSkipped, (outcome: ExecutionSkipped) => ({
                duration,
                exception: '',
                passed: passedOrFailed(outcome),
                status: 'skipped',
                retries: defaultRetries
            }))
            .else(() => ({
                duration,
                exception: '',
                passed: true,
                status: 'passed',
                retries: defaultRetries
            }));
    }

    private testEndEventFrom(started: SceneStarts, finished: SceneFinished): testStats {
        const duration = finished.timestamp.diff(started.timestamp).inMilliseconds();
        return {
            ...this.testStartEventFrom(started),
            type: 'test:end',
            duration
        };
    }

    private whenSuccessful<O>(outcome: Outcome, resultWhenSuccessful: O, resultWhenNotSuccessful: O): O {
        return ! outcome.isWorseThan(this.successThreshold) && (outcome instanceof ProblemIndication)
            ? resultWhenSuccessful
            : resultWhenNotSuccessful
    }

    private testResultEventFrom(started: SceneStarts, finished: SceneFinished): testStats {
        const test = this.testEndEventFrom(started, finished)

        const unlessSuccessful = (outcome: Outcome, type: testStats['type']) =>
            this.whenSuccessful<testStats['type']>(outcome, 'test:pass', type);

        return match<Outcome, testStats>(finished.outcome)
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

    /**
     * @see https://github.com/webdriverio/webdriverio/blob/main/packages/wdio-utils/src/shim.ts
     * @param hookName
     * @param hookFunctions
     * @param args
     * @private
     */
    private invokeHooks<Result, InnerArguments extends any[]>(
        hookName: string,
        hookFunctions: ((...parameters: InnerArguments) => Promise<Result> | Result) | Array<((...parameters: InnerArguments) => Result)>,
        args: InnerArguments
    ): Promise<Array<Result | Error>> {

        const hooks = Array.isArray(hookFunctions)
            ? hookFunctions
            : [ hookFunctions ];

        const asyncOperationId = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(`WebdriverIONotifier#invokeHooks`),
            new Description(`Invoking ${ hookName } hook`),
            asyncOperationId,
            this.stage.currentTime(),
        ));

        return Promise.all(hooks.map((hook) => new Promise<Result | Error>((resolve) => {
            let result

            try {
                result = hook(...args);
            } catch (error) {
                return resolve(error);
            }

            /**
             * if a promise is returned make sure we don't have a catch handler
             * so in case of a rejection it won't cause the hook to fail
             */
            if (result && typeof result.then === 'function') {
                return result.then(resolve, (error: Error) => {
                    resolve(error);
                })
            }

            resolve(result);
        }))).
        then(results => {

            this.stage.announce(new AsyncOperationCompleted(
                asyncOperationId,
                this.stage.currentTime(),
            ));

            return results;
        });
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
