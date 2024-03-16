import type { Serenity } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import {
    RetryableSceneDetected,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path, type RequirementsHierarchy } from '@serenity-js/core/lib/io';
import {
    ArbitraryTag,
    CorrelationId,
    ExecutionFailedWithError,
    ExecutionRetriedTag,
    ExecutionSuccessful,
    Name,
    TestSuiteDetails
} from '@serenity-js/core/lib/model';
import type { MochaOptions, Runnable, Suite, Test } from 'mocha';
import { reporters, Runner } from 'mocha';

import { MochaOutcomeMapper, MochaTestMapper } from './mappers';
import { OutcomeRecorder } from './OutcomeRecorder';

/**
 * @package
 */
export class SerenityReporterForMocha extends reporters.Base {

    private readonly testMapper: MochaTestMapper;
    private readonly outcomeMapper: MochaOutcomeMapper = new MochaOutcomeMapper();

    private readonly recorder: OutcomeRecorder = new OutcomeRecorder();

    private suiteIds: CorrelationId[] = [];
    private currentSceneId: CorrelationId = undefined;

    /**
     * @param {Serenity} serenity
     * @param requirementsHierarchy
     * @param {mocha~Runner} runner
     * @param {mocha~MochaOptions} options
     */
    constructor(
        private readonly serenity: Serenity,
        private readonly requirementsHierarchy: RequirementsHierarchy,
        runner: Runner,
        options?: MochaOptions,
    ) {
        super(runner, options);

        this.testMapper = new MochaTestMapper(this.serenity.cwd())

        runner.on(Runner.constants.EVENT_RUN_BEGIN,
            () => {
                this.emit(
                    new TestRunStarts(this.serenity.currentTime())
                );
            },
        );

        runner.on(Runner.constants.EVENT_SUITE_BEGIN,
            (suite: Suite) => {
                if (suite.root === false) {
                    this.announceSuiteStartsFor(suite);
                }
            },
        );

        runner.on(Runner.constants.EVENT_SUITE_END,
            (suite: Suite) => {
                if (suite.root === false) {
                    this.announceSuiteFinishedFor(suite);
                }
            },
        );

        runner.on(Runner.constants.EVENT_TEST_BEGIN,
            (test: Test) => {
                this.recorder.started(test);

                this.announceSceneStartsFor(test);
            },
        );

        runner.on(Runner.constants.EVENT_TEST_PASS,
            (test: Test) => {
                this.announceRetryIfNeeded(test);

                this.recorder.finished(
                    test.ctx ? test.ctx.currentTest : test,
                    this.outcomeMapper.outcomeOf(test)
                );
            },
        );

        runner.on(Runner.constants.EVENT_TEST_FAIL,
            (test: Test, error: Error) => {
                this.announceRetryIfNeeded(test);

                this.recorder.finished(
                    test.ctx ? test.ctx.currentTest : test,
                    this.outcomeMapper.outcomeOf(test, error)
                );
            },
        );

        runner.on(Runner.constants.EVENT_TEST_RETRY,
            (test: Test, error: Error) => {
                this.announceRetryIfNeeded(test);

                this.recorder.finished(
                    !! test.ctx && test.ctx.currentTest ? test.ctx.currentTest : test,
                    this.outcomeMapper.outcomeOf(test, error),
                );
            },
        );

        const announceSceneFinishedFor = SerenityReporterForMocha.prototype.announceSceneFinishedFor.bind(this);

        runner.suite.afterEach('Serenity/JS', function () {
            return announceSceneFinishedFor(this.currentTest, this.test);
        });

        // https://github.com/cypress-io/cypress/issues/7562
        runner.on('test:after:run', (test: Test) => {
            return announceSceneFinishedFor(test, test);
        });

        // Tests without body don't trigger the above custom afterEach hook
        runner.on(Runner.constants.EVENT_TEST_PENDING,
            (test: Test) => {
                if (! test.fn) {
                    this.announceSceneSkippedFor(test);
                }
            },
        );
    }

    public done(failures: number, callback?: (failures: number) => void): void {
        this.emit(new TestRunFinishes(this.serenity.currentTime()));

        this.serenity.waitForNextCue()
            .then(() => {
                this.emit(new TestRunFinished(new ExecutionSuccessful(), this.serenity.currentTime()));
                return callback(failures);
            })
            .catch(error => {
                const numberOfFailures = failures === 0
                    ? 1
                    : failures;

                this.emit(new TestRunFinished(new ExecutionFailedWithError(error), this.serenity.currentTime()));
                return callback(numberOfFailures);
            })
    }

    private announceSuiteStartsFor(suite: Suite): void {
        const suiteId = CorrelationId.create();
        this.suiteIds.push(suiteId);

        const details = new TestSuiteDetails(
            new Name(suite.title),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new FileSystemLocation(Path.from(suite.file!)), // all suites except for the root suite should have .file property set
            suiteId,
        );

        this.emit(
            new TestSuiteStarts(details, this.serenity.currentTime())
        );
    }

    private announceSuiteFinishedFor(suite: Suite): void {
        const details = new TestSuiteDetails(
            new Name(suite.title),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new FileSystemLocation(Path.from(suite.file!)), // all suites except for the root suite should have .file property set
            this.suiteIds.pop(),
        );

        const outcomes = suite.tests.map(test =>
            this.recorder.outcomeOf(test) || this.outcomeMapper.outcomeOf(test)
        );

        const worstOutcome = outcomes.reduce(
            (worstSoFar, outcome) =>
                outcome.isWorseThan(worstSoFar)
                    ? outcome
                    : worstSoFar,
            new ExecutionSuccessful()
        );

        this.emit(
            new TestSuiteFinished(details, worstOutcome, this.serenity.currentTime())
        );
    }

    private announceSceneStartsFor(test: Test): void {
        this.currentSceneId = this.serenity.assignNewSceneId()

        const { scenarioDetails, scenarioTags } = this.testMapper.detailsOf(test);

        this.emit(
            new SceneStarts(this.currentSceneId, scenarioDetails, this.serenity.currentTime()),

            ... this.requirementsHierarchy.requirementTagsFor(scenarioDetails.location.path, scenarioDetails.category.value)
                .map(tag => new SceneTagged(this.currentSceneId, tag, this.serenity.currentTime())),

            new TestRunnerDetected(this.currentSceneId, new Name('Mocha'), this.serenity.currentTime()),

            ... scenarioTags.map(tag => new SceneTagged(this.currentSceneId, tag, this.serenity.currentTime())),
        );
    }

    private announceSceneFinishedFor(test: Test, runnable: Runnable): Promise<void> {
        const
            { scenarioDetails } = this.testMapper.detailsOf(test),
            outcome     = this.recorder.outcomeOf(test) || this.outcomeMapper.outcomeOf(test);

        this.emit(
            new SceneFinishes(
                this.currentSceneId,
                this.serenity.currentTime(),
            ),
        );

        return this.serenity.waitForNextCue()
            .then(() => {
                this.emit(new SceneFinished(
                    this.currentSceneId,
                    scenarioDetails,
                    outcome,
                    this.serenity.currentTime(),
                ));

                this.recorder.erase(test);
            }, error => {
                this.emit(new SceneFinished(
                    this.currentSceneId,
                    scenarioDetails,
                    new ExecutionFailedWithError(error),
                    this.serenity.currentTime(),
                ));

                this.recorder.erase(test);

                // re-throwing an error here would cause Mocha to halt test suite, which we don't want to do
                // https://github.com/mochajs/mocha/issues/1635
                (runnable as any).error(error);
            });
    }

    private announceSceneSkippedFor(test: Test): void {
        const
            { scenarioDetails } = this.testMapper.detailsOf(test),
            outcome     = this.outcomeMapper.outcomeOf(test);

        this.announceSceneStartsFor(test);

        this.emit(
            new SceneFinishes(
                this.currentSceneId,
                this.serenity.currentTime(),
            ),
            new SceneFinished(
                this.currentSceneId,
                scenarioDetails,
                outcome,
                this.serenity.currentTime(),
            )
        );
    }

    private announceRetryIfNeeded(test: Test): void {
        if (! this.isRetriable(test)) {
            return void 0;
        }

        // todo: RetryableSceneDetected(maxRetries) ?

        this.emit(
            new RetryableSceneDetected(
                this.currentSceneId,
                this.serenity.currentTime(),
            ),
            new SceneTagged(
                this.currentSceneId,
                new ArbitraryTag('retried'),        // todo: replace with a dedicated tag
                this.serenity.currentTime(),
            ),
        );

        if (this.currentRetryOf(test) > 0) {
            this.emit(
                new SceneTagged(
                    this.currentSceneId,
                    new ExecutionRetriedTag(this.currentRetryOf(test)),
                    this.serenity.currentTime(),
                ),
            );
        }
    }

    private isRetriable(test: Test): boolean {
        return (test as any).retries() >= 0;
    }

    private currentRetryOf(test: Test): number {
        return (test as any).currentRetry();
    }

    private emit(...events: DomainEvent[]): void {
        events.forEach(event => this.serenity.announce(event));
    }
}
