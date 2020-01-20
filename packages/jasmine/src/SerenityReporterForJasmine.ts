import { AssertionError, ImplementationPendingError, Serenity } from '@serenity-js/core';
import {
    DomainEvent,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunnerDetected,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events';
import { ErrorSerialiser, FileSystemLocation } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    Name,
    Outcome,
    ProblemIndication,
    ScenarioDetails,
    TestSuiteDetails,
} from '@serenity-js/core/lib/model';
import { Expectation, JasmineDoneInfo, SpecResult, SuiteResult } from './jasmine';

/**
 * @desc
 *  [Jasmine reporter](https://jasmine.github.io/tutorials/custom_reporter) that translates Jasmine-specific test events
 *  to Serenity/JS events.
 *
 * @see {@link bootstrap}
 */
export class SerenityReporterForJasmine {

    private static readonly errorMessagePattern = /^([^\s:]*Error):\s(.*)$/;
    private describes: SuiteResult[] = [];

    constructor(private readonly serenity: Serenity) {
    }

    suiteStarted(result: SuiteResult) {
        this.describes.push(result);

        this.emit(new TestSuiteStarts(this.testSuiteDetailsOf(result), this.serenity.currentTime()));
    }

    suiteDone(result: SuiteResult) {
        this.describes = this.describes.filter(suite => suite.id !== result.id);

        this.emit(new TestSuiteFinished(this.testSuiteDetailsOf(result), this.outcomeFrom(result), this.serenity.currentTime()));
    }

    specStarted(result: SpecResult) {
        const details = this.scenarioDetailsOf(result);

        this.emit(
            new SceneStarts(details, this.serenity.currentTime()),
            new SceneTagged(details, new FeatureTag(this.currentFeatureName()), this.serenity.currentTime()),
            new TestRunnerDetected(new Name('Jasmine'), this.serenity.currentTime()),
        );
    }

    specDone(result: SpecResult) {

        /**
         * Serenity doesn't allow for more than one failure per activity, but Jasmine does.
         * If there are multiple failures we wrap them up in fake activities so that they're all reported correctly.
         */
        if (result.failedExpectations.length > 1) {
            result.failedExpectations.forEach(failedExpectation => {
                const details = new ActivityDetails(new Name('Expectation'), CorrelationId.create());

                this.emit(
                    new TaskStarts(details, this.serenity.currentTime()),
                    new TaskFinished(details, this.failureOutcomeFrom(failedExpectation), this.serenity.currentTime()),
                );
            });
        }

        this.emit(new SceneFinished(
            this.scenarioDetailsOf(result),
            this.outcomeFrom(result),
        ));
    }

    /**
     * @param {JasmineDoneInfo} suiteInfo
     */
    jasmineDone(suiteInfo: JasmineDoneInfo) {
        this.emit(new TestRunFinished(this.serenity.currentTime()));

        return this.serenity.waitForNextCue();
    }

    /**
     * @private
     * @param {DomainEvent[]} events
     */
    private emit(...events: DomainEvent[]): void {
        events.forEach(event => this.serenity.announce(event));
    }

    /**
     * @private
     * @param {SpecResult} spec
     * @returns {ScenarioDetails}
     */
    private scenarioDetailsOf(spec: SpecResult): ScenarioDetails {
        return new ScenarioDetails(
            new Name(this.currentScenarioNameFor(spec.description)),
            new Category(this.currentFeatureName()),
            FileSystemLocation.fromJSON(spec.location as any),
        );
    }

    /**
     * @private
     * @param {SuiteResult} result
     * @returns {TestSuiteDetails}
     */
    private testSuiteDetailsOf(result: SuiteResult): TestSuiteDetails {
        return new TestSuiteDetails(
            new Name(result.description),
            FileSystemLocation.fromJSON(result.location as any),
            new CorrelationId(result.id),
        );
    }

    /**
     * @private
     * @returns {string}
     */
    private currentFeatureName(): string {
        return !! this.describes[0]
            ? this.describes[0].description
            : 'Unknown feature';
    }

    /**
     * @private
     * @param {string} itBlockDescription
     * @returns {string}
     */
    private currentScenarioNameFor(itBlockDescription: string): string {
        const [ topSuite, ...rest ] = this.describes;

        return rest.reverse().reduce((acc, current) => `${ current.description } ${ acc }`, itBlockDescription);
    }

    /**
     * @private
     * @param {SpecResult | SuiteResult} result
     * @returns {Outcome}
     */
    private outcomeFrom(result: SpecResult | SuiteResult): Outcome {
        switch (result.status) {
            case 'failed':
                return this.failureOutcomeFrom(result.failedExpectations[0]);
            case 'pending':
                return new ImplementationPending(new ImplementationPendingError((result as any).pendingReason || ''));
            case 'excluded':
                return new ExecutionSkipped();
            case 'passed':
            default:
                return new ExecutionSuccessful();
        }
    }

    /**
     * @private
     * @param {Expectation} failure
     * @returns {ProblemIndication}
     */
    private failureOutcomeFrom(failure: Expectation): ProblemIndication {
        const error = this.errorFrom(failure);

        if (error instanceof AssertionError) {
            // sadly, Jasmine error propagation mechanism is rather basic
            // and unable to serialise the expected/actual properties of the AssertionError object
            return new ExecutionFailedWithAssertionError(error);
        }

        if (!! failure.matcherName) {                       // the presence of a non-empty matcherName property indicates a Jasmine-specific assertion error
            return new ExecutionFailedWithAssertionError(
                new AssertionError(failure.message, failure.expected, failure.actual, error),
            );
        }

        return new ExecutionFailedWithError(error);
    }

    private errorFrom(failure: Expectation): Error {
        if (this.containsCorrectlySerialisedError(failure)) {
            return ErrorSerialiser.deserialiseFromStackTrace(failure.stack);
        }

        if (this.containsIncorrectlySerialisedError(failure)) {
            return ErrorSerialiser.deserialiseFromStackTrace(this.repairedStackTraceOf(failure));
        }

        return new Error(failure.message);
    }

    private containsCorrectlySerialisedError(failure: Expectation): boolean {
        return !! failure.stack && SerenityReporterForJasmine.errorMessagePattern.test(failure.stack.split('\n')[0]);
    }

    private containsIncorrectlySerialisedError(failure: Expectation): boolean {
        return !! failure.stack && SerenityReporterForJasmine.errorMessagePattern.test(failure.message);
    }

    /**
     * It seems like Jasmine mixes up serialisation and display logic,
     * which means that its "failure.stack" is not really an Error stacktrace,
     * but rather something along the lines of:
     * "error properties: AssertionError: undefined"
     * where the error message is lost, and there's an "error properties:" prefix present.
     *
     * Probably caused by this:
     * https://github.com/jasmine/jasmine/blob/b4cbe9850fbe192eaffeae450669f96e79a574ed/src/core/ExceptionFormatter.js#L93
     *
     * @param {Expectation} failure
     */
    private repairedStackTraceOf(failure: Expectation): string {
        return [
            failure.message,
            ...failure.stack.split('\n').slice(1),
        ].join('\n');
    }
}
