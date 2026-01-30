import {
    AssertionError,
    ErrorSerialiser,
    ImplementationPendingError,
    type Serenity,
    TestCompromisedError
} from '@serenity-js/core';
import {
    type DomainEvent,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events/index.js';
import type { RequirementsHierarchy } from '@serenity-js/core/lib/io/index.js';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io/index.js';
import {
    ActivityDetails,
    Category,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    type Outcome,
    type ProblemIndication,
    ScenarioDetails,
    type Tag,
    Tags,
    TestSuiteDetails,
} from '@serenity-js/core/lib/model/index.js';

import type {
    Expectation,
    JasmineDoneInfo,
    JasmineReporter,
    JasmineStartedInfo,
    Location,
    SpecResult,
    SuiteResult
} from './jasmine/index.js';

/**
 * [Jasmine reporter](https://jasmine.github.io/tutorials/custom_reporter) that translates Jasmine-specific test events
 * to Serenity/JS events.
 */
export class SerenityReporterForJasmine implements JasmineReporter {

    private static readonly errorMessagePattern = /^([^\s:]*Error):\s(.*)$/m;
    private describes: SuiteResult[] = [];

    private currentSceneId: CorrelationId = undefined;

    /**
     * @param serenity - The Serenity instance
     * @param requirementsHierarchy - The requirements hierarchy for tagging
     */
    constructor(
        private readonly serenity: Serenity,
        private readonly requirementsHierachy: RequirementsHierarchy,
    ) {
    }

    jasmineStarted(info: JasmineStartedInfo): void {
        this.emit(new TestRunStarts(this.serenity.currentTime()));
    }

    suiteStarted(result: SuiteResult): void {
        this.describes.push(result);

        this.emit(new TestSuiteStarts(this.testSuiteDetailsOf(result), this.serenity.currentTime()));
    }

    suiteDone(result: SuiteResult): void {
        this.describes = this.describes.filter(suite => suite.id !== result.id);

        this.emit(new TestSuiteFinished(this.testSuiteDetailsOf(result), this.outcomeFrom(result), this.serenity.currentTime()));
    }

    specStarted(result: SpecResult): void {
        this.currentSceneId = this.serenity.assignNewSceneId();

        const { scenarioDetails, scenarioTags } = this.scenarioDetailsOf(result);

        this.emit(
            new SceneStarts(this.currentSceneId, scenarioDetails, this.serenity.currentTime()),

            ... this.requirementsHierachy.requirementTagsFor(scenarioDetails.location.path, Tags.stripFrom(this.currentFeatureNameFor(result)))
                .map(tag => new SceneTagged(this.currentSceneId, tag, this.serenity.currentTime())),

            new TestRunnerDetected(this.currentSceneId, new Name('Jasmine'), this.serenity.currentTime()),

            ... scenarioTags.map(tag => new SceneTagged(this.currentSceneId, tag, this.serenity.currentTime()))
        );
    }

    specDone(result: SpecResult): Promise<void> {

        /**
         * Serenity doesn't allow for more than one failure per activity, but Jasmine does.
         * If there are multiple failures we wrap them up in fake activities so that they're all reported correctly.
         */
        if (result.failedExpectations.length > 1) {
            result.failedExpectations.forEach(failedExpectation => {
                const sceneId = this.serenity.currentSceneId();
                const location = this.locationOf(result);
                const activityDetails = new ActivityDetails(
                    new Name('Expectation'),
                    new FileSystemLocation(
                        Path.from(location.path),
                        location.line,
                        location.column,
                    ),
                );

                const activityId = this.serenity.assignNewActivityId(activityDetails);

                this.emit(
                    new TaskStarts(sceneId, activityId, activityDetails, this.serenity.currentTime()),
                    new TaskFinished(sceneId, activityId, activityDetails, this.failureOutcomeFrom(failedExpectation), this.serenity.currentTime()),
                );
            });
        }

        const
            { scenarioDetails } = this.scenarioDetailsOf(result),
            outcome = this.outcomeFrom(result);

        this.emit(new SceneFinishes(
            this.currentSceneId,
            outcome,
            this.serenity.currentTime(),
        ));

        return this.serenity.waitForNextCue()
            .then(() => {
                this.emit(new SceneFinished(
                    this.currentSceneId,
                    scenarioDetails,
                    outcome,
                    this.serenity.currentTime(),
                ));
            }, error => {
                const errorOutcome = new ExecutionFailedWithError(error);

                this.emit(new SceneFinished(
                    this.currentSceneId,
                    scenarioDetails,
                    errorOutcome.isWorseThan(outcome)
                        ? errorOutcome
                        : outcome,
                    this.serenity.currentTime(),
                ));

                throw error;
            });
    }

    jasmineDone(suiteInfo: JasmineDoneInfo): Promise<void> {
        this.emit(new TestRunFinishes(this.serenity.currentTime()));

        return this.serenity.waitForNextCue()
            .then(() => {
                this.emit(new TestRunFinished(new ExecutionSuccessful(), this.serenity.currentTime()));
            })
            .catch(error => {
                this.emit(new TestRunFinished(new ExecutionFailedWithError(error), this.serenity.currentTime()));
                throw error;
            });
    }

    /**
     * @private
     * @param {DomainEvent[]} events
     */
    private emit(...events: DomainEvent[]): void {
        events.forEach(event => this.serenity.announce(event));
    }

    /**
     * Extracts location information from a spec or suite result.
     * Supports both Jasmine 5.x and 6.x (location object from monkey-patching).
     *
     * @private
     * @param result - The spec or suite result
     * @returns Location object with path, line, and column
     */
    private locationOf(result: SpecResult | SuiteResult): Location {
        // Jasmine 5.x and 6.x with monkey-patching provides location object
        if (result.location) {
            return result.location;
        }

        // Fallback: use filename property if available (Jasmine 6.x without monkey-patching)
        if (result.filename) {
            return {
                path: result.filename,
                line: 0,
                column: 0,
            };
        }

        // Fallback for edge cases
        return {
            path: 'unknown',
            line: 0,
            column: 0,
        };
    }

    /**
     * @private
     * @param {SpecResult} spec
     * @returns {ScenarioDetails}
     */
    private scenarioDetailsOf(spec: SpecResult): { scenarioDetails: ScenarioDetails, scenarioTags: Tag[] } {
        const name = this.currentScenarioNameFor(spec.description);
        const featureName = this.currentFeatureNameFor(spec);
        const location = this.locationOf(spec);

        return {
            scenarioDetails: new ScenarioDetails(
                new Name(Tags.stripFrom(name)),
                new Category(Tags.stripFrom(featureName)),
                new FileSystemLocation(
                    Path.from(location.path),
                    location.line,
                    location.column,
                ),
            ),
            scenarioTags: Tags.from(`${ featureName } ${ name }`)
        };
    }

    /**
     * @private
     * @param {SuiteResult} result
     * @returns {TestSuiteDetails}
     */
    private testSuiteDetailsOf(result: SuiteResult): TestSuiteDetails {
        const location = this.locationOf(result);

        return new TestSuiteDetails(
            new Name(result.description),
            new FileSystemLocation(
                Path.from(location.path),
                location.line,
                location.column,
            ),
            new CorrelationId(result.id),
        );
    }

    /**
     * @private
     * @returns {string}
     */
    private currentFeatureNameFor(spec: SpecResult): string {
        const location = this.locationOf(spec);
        const path = new Path(location.path);

        return this.describes[0]
            ? this.describes[0].description
            : this.serenity.cwd().relative(path).value;
    }

    /**
     * @private
     * @param {string} itBlockDescription
     * @returns {string}
     */
    private currentScenarioNameFor(itBlockDescription: string): string {
        const [ topSuite_, ...rest ] = this.describes;

        return rest.reverse()
            .reduce((name, current) => `${ current.description } ${ name }`, itBlockDescription);
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

        if (error instanceof TestCompromisedError) {
            return new ExecutionCompromised(error);
        }

        if (failure.matcherName) {                       // the presence of a non-empty matcherName property indicates a Jasmine-specific assertion error
            return new ExecutionFailedWithAssertionError(
                this.serenity.createError(AssertionError, {
                    message: failure.message,
                    diff: {
                        expected: failure.expected,
                        actual: failure.actual,
                    },
                    cause: error,
                }),
            );
        }

        return new ExecutionFailedWithError(error);
    }

    private errorFrom(failure: Expectation): Error {
        if (this.containsCorrectlySerialisedError(failure)) {
            return ErrorSerialiser.deserialiseFromStackTrace(failure.stack);
        }

        if (this.containsIncorrectlySerialisedErrorWithErrorPropertiesInStack(failure)) {
            return ErrorSerialiser.deserialiseFromStackTrace(this.repairedStackTraceOf(failure));
        }

        if (this.containsIncorrectlySerialisedError(failure)) {
            return ErrorSerialiser.deserialiseFromStackTrace(this.repairedStackTraceOf(failure));
        }

        return new Error(failure.message);
    }

    private containsCorrectlySerialisedError(failure: Expectation): boolean {
        return !! failure.stack && SerenityReporterForJasmine.errorMessagePattern.test(failure.stack.split('\n')[0]);
    }

    private containsIncorrectlySerialisedErrorWithErrorPropertiesInStack(failure: Expectation): boolean {
        return !! failure.stack
            && failure.stack.startsWith('error properties: ')
            && SerenityReporterForJasmine.errorMessagePattern.test(failure.message);
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
        const lastLine = failure.message.split('\n').pop();
        const frames = failure.stack.split('\n').filter(line => ! line.startsWith('error properties:'))

        return [
            failure.message,
            ...frames.slice(frames.indexOf(lastLine) + 1),
        ].join('\n');
    }
}
