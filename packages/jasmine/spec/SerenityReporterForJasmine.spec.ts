/* eslint-disable unicorn/no-null */
import 'mocha';

import { expect, PickEvent } from '@integration/testing-tools';
import { AssertionError, Clock, ImplementationPendingError, Serenity, Stage, StageCrewMember, TestCompromisedError } from '@serenity-js/core';
import {
    DomainEvent,
    SceneFinished,
    SceneStarts,
    SceneTagged, TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunnerDetected, TestRunStarts,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation } from '@serenity-js/core/lib/io';
import {
    CorrelationId, ExecutionCompromised, ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    Name,
    TestSuiteDetails,
    Timestamp,
} from '@serenity-js/core/lib/model';

import { SerenityReporterForJasmine } from '../src/SerenityReporterForJasmine';

/** @test {SerenityReporterForJasmine} */
describe('SerenityReporterForJasmine', () => {

    let serenity: Serenity,
        reporter: SerenityReporterForJasmine,
        listener: Listener;

    const now = new Date('1970-01-01T00:00:00Z');

    beforeEach(() => {
        serenity = new Serenity(new Clock(() => now));
        reporter = new SerenityReporterForJasmine(serenity);
        listener = new Listener();

        serenity.configure({ crew: [ listener ] });
    });

    describe('notifies Serenity when', () => {

        describe('the test run', () => {
            /** @test {SerenityReporterForJasmine#jasmineStarted} */
            it('starts', async () => {
                await reporter.jasmineStarted({
                    totalSpecsDefined: 5,
                    order: {
                        random: true,
                        seed: '14552',
                        sort: () => void 0,
                    },
                });

                PickEvent.from(listener.events)
                    .next(TestRunStarts,    event => expect(event.timestamp).to.equal(new Timestamp(now)));
            });

            /** @test {SerenityReporterForJasmine#jasmineDone} */
            it('ends', async () => {
                await reporter.jasmineDone({
                    overallStatus: 'passed',
                    incompleteReason: undefined,
                    order: {
                        random: true,
                        seed: '14552',
                        sort: () => void 0,
                    },
                    failedExpectations: [],
                    deprecationWarnings: [],
                });

                PickEvent.from(listener.events)
                    .next(TestRunFinished,    event => expect(event.timestamp).to.equal(new Timestamp(now)));
            });
        });

        describe('the test suite', () => {

            /** @test {SerenityReporterForJasmine#suiteStarted} */
            it('starts', () => {

                const jasmineEvent = {
                    id: 'suite1',
                    description: 'Jasmine',
                    fullName: 'Jasmine',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 5,
                        column: 9,
                    },
                };

                reporter.suiteStarted(jasmineEvent);

                expect(listener.events.length).to.equal(1);
                expect(listener.events[0]).to.equal(
                    new TestSuiteStarts(
                        new TestSuiteDetails(
                            new Name('Jasmine'),
                            FileSystemLocation.fromJSON(jasmineEvent.location),
                            CorrelationId.fromJSON(jasmineEvent.id),
                        ),
                        new Timestamp(now),
                    ),
                );
            });

            /**
             * @test {SerenityReporterForJasmine#suiteStarted}
             * @test {SerenityReporterForJasmine#suiteDone}
             */
            it('ends', () => {

                reporter.suiteStarted({
                    id: 'suite1',
                    description: 'Jasmine',
                    fullName: 'Jasmine',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 1,
                        column: 1,
                    },
                });

                reporter.suiteDone({
                    id: 'suite1',
                    description: 'Jasmine',
                    fullName: 'Jasmine',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: 0,
                    location: {
                        path: '/path/to/spec.js',
                        line: 1,
                        column: 1,
                    },
                    status: 'passed',
                });

                PickEvent.from(listener.events)
                    .next(TestSuiteFinished,    event => expect(event).to.equal(
                        new TestSuiteFinished(
                            new TestSuiteDetails(
                                new Name('Jasmine'),
                                FileSystemLocation.fromJSON({
                                    path: '/path/to/spec.js',
                                    line: 1,
                                    column: 1,
                                }),
                                CorrelationId.fromJSON('suite1'),
                            ),
                            new ExecutionSuccessful(),
                            new Timestamp(now),
                        ),
                    ));
            });

            /**
             * @test {SerenityReporterForJasmine#suiteStarted}
             * @test {SerenityReporterForJasmine#suiteDone}
             */
            it('ends with an error, reporting the first error that has occurred', () => {
                /*
                 * A test suite will be marked as failing only when beforeAll or afterAll blocks are used.
                 */
                reporter.suiteStarted({
                    id: 'suite1',
                    description: 'a suite',
                    fullName: 'a suite',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 9,
                        column: 1,
                    },
                });

                reporter.suiteDone({
                    id: 'suite1',
                    description: 'a suite',
                    fullName: 'a suite',
                    failedExpectations: [
                        {
                            matcherName: '',
                            message: 'Failed: suite beforeAll',
                            stack:
                                'Error: Failed: suite beforeAll\n    at <Jasmine>\n    at UserContext.<anonymous> (/path/to/spec.js:11:9)\n    at <Jasmine>',
                            passed: false,
                            expected: '',
                            actual: '',
                        }, {
                            matcherName: '',
                            message: 'Failed: suite afterAll',
                            stack:
                                'Error: Failed: suite afterAll\n    at <Jasmine>\n    at UserContext.<anonymous> (/path/to/spec.js:15:9)\n    at <Jasmine>',
                            passed: false,
                            expected: '',
                            actual: '',
                        },
                    ],
                    deprecationWarnings: [],
                    duration: 0,
                    location:
                        {
                            path: '/path/to/spec.js',
                            line: 9,
                            column: 1,
                        },
                    status: 'failed',
                });

                PickEvent.from(listener.events)
                    .next(TestSuiteFinished,    event => {
                        const outcome = event.outcome as ExecutionFailedWithError;

                        expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                        expect(outcome.error.message).to.equal('Failed: suite beforeAll');
                    });
            });

            /**
             * @test {SerenityReporterForJasmine#suiteStarted}
             * @test {SerenityReporterForJasmine#suiteDone}
             */
            it('is pending', () => {
                reporter.suiteStarted({
                    id: 'suite3',
                    description: 'pending suite',
                    fullName: 'pending suite',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 8,
                        column: 5,
                    },
                });

                reporter.suiteDone({
                    id: 'suite3',
                    description: 'pending suite',
                    fullName: 'pending suite',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: 0,
                    location: {
                        path: '/path/to/spec.js',
                        line: 8,
                        column: 5,
                    },
                    status: 'pending',
                });

                PickEvent.from(listener.events)
                    .next(TestSuiteFinished,    event => {
                        const outcome = event.outcome as ImplementationPending;

                        expect(outcome).to.be.instanceOf(ImplementationPending);
                        expect(outcome.error).to.be.instanceOf(ImplementationPendingError);
                        expect(outcome.error.message).to.equal('');
                    });
            });
        });

        describe('the test spec', () => {

            describe('starts and', () => {

                beforeEach(async () => {
                    reporter.suiteStarted({
                        id: 'suite1',
                        description: 'Jasmine',
                        fullName: 'Jasmine',
                        failedExpectations: [],
                        deprecationWarnings: [],
                        duration: null,
                        location: {
                            path: '/path/to/spec.js',
                            line: 1,
                            column: 1,
                        },
                    });

                    reporter.suiteStarted({
                        id: 'suite2',
                        description: 'A scenario',
                        fullName: 'Jasmine A scenario',
                        failedExpectations: [],
                        deprecationWarnings: [],
                        duration: null,
                        location: {
                            path: '/path/to/spec.js',
                            line: 3,
                            column: 5,
                        },
                    });

                    reporter.specStarted({
                        id: 'spec0',
                        description: 'passes',
                        fullName: 'Jasmine A scenario passes',
                        failedExpectations: [],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: {
                            path: '/path/to/spec.js',
                            line: 5,
                            column: 9,
                        },
                    });

                    await reporter.specDone({
                        id: 'spec0',
                        description: 'passes',
                        fullName: 'Jasmine A scenario passes',
                        failedExpectations: [],
                        passedExpectations:
                            [{
                                matcherName: 'toBe',
                                message: 'Passed.',
                                stack: '',
                                passed: true,
                            }],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: {
                            path: '/path/to/spec.js',
                            line: 5,
                            column: 9,
                        },
                        status: 'passed',
                    });

                    reporter.suiteDone({
                        id: 'suite2',
                        description: 'A scenario',
                        fullName: 'Jasmine A scenario',
                        failedExpectations: [],
                        deprecationWarnings: [],
                        duration: 0,
                        location: {
                            path: '/path/to/spec.js',
                            line: 3,
                            column: 5,
                        },
                        status: 'passed',
                    });

                    reporter.suiteDone({
                        id: 'suite1',
                        description: 'Jasmine',
                        fullName: 'Jasmine',
                        failedExpectations: [],
                        deprecationWarnings: [],
                        duration: 0,
                        location: {
                            path: '/path/to/spec.js',
                            line: 1,
                            column: 1,
                        },
                        status: 'passed',
                    });
                });

                /**
                 * @test {SerenityReporterForJasmine#suiteStarted}
                 * @test {SerenityReporterForJasmine#suiteDone}
                 * @test {SerenityReporterForJasmine#specStarted}
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('derives the name of the scenario from the nested `describe` blocks', () => {
                    PickEvent.from(listener.events)
                        .next(SceneStarts,      event => expect(event.details.name.value).to.equal('A scenario passes'))
                        .next(SceneFinished,    event => expect(event.details.name.value).to.equal('A scenario passes'));
                });

                /**
                 * @test {SerenityReporterForJasmine#suiteStarted}
                 * @test {SerenityReporterForJasmine#suiteDone}
                 * @test {SerenityReporterForJasmine#specStarted}
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('derives the name of the feature from the outer-most `describe` block', () => {
                    PickEvent.from(listener.events)
                        .next(SceneTagged,      event => expect(event.tag).to.equal(new FeatureTag('Jasmine')));
                });

                /**
                 * @test {SerenityReporterForJasmine#suiteStarted}
                 * @test {SerenityReporterForJasmine#suiteDone}
                 * @test {SerenityReporterForJasmine#specStarted}
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('detects the test runner', () => {
                    PickEvent.from(listener.events)
                        .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')));
                });
            });

            describe('ends and', () => {

                beforeEach(() => {
                    reporter.specStarted({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations: [],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                    });
                });

                /**
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('has been excluded', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations: [],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'excluded',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()));
                });

                /**
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('is marked as pending', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations: [],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: 'Temporarily disabled with xit',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'pending',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ImplementationPending;
                            expect(outcome).to.be.instanceOf(ImplementationPending);
                            expect(outcome.error.message).to.equal('Temporarily disabled with xit');
                        });
                });

                /**
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('has failed with an error', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                         [ { matcherName: '',
                             message: 'Error: Something happened',
                             stack: 'Error: Something happened\n    at UserContext.it (/path/to/spec.js:6:19)\n',
                             passed: false,
                             expected: '',
                             actual: '' } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ExecutionFailedWithError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error).to.be.instanceOf(Error);
                            expect(outcome.error.message).to.equal('Something happened');
                        });
                });

                it('as compromised', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                            [ { matcherName: '',
                                message: 'TestCompromisedError: The API call has failed',
                                stack: 'error properties: TestCompromisedError: undefined\n    at <Jasmine>\n',
                                passed: false,
                                expected: '',
                                actual: '' } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ExecutionCompromised;
                            expect(outcome).to.be.instanceOf(ExecutionCompromised);
                            expect(outcome.error).to.be.instanceOf(TestCompromisedError);
                            expect(outcome.error.message).to.equal('The API call has failed');
                        });
                });

                /**
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('has failed with no stack trace', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                            [ { matcherName: '',
                                message: 'Someone throws a string just because they can...',
                                stack: null,
                                passed: false,
                                expected: '',
                                actual: '' } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ExecutionFailedWithError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error).to.be.instanceOf(Error);
                            expect(outcome.error.message).to.equal('Someone throws a string just because they can...');
                        });
                });

                /**
                 * @test {SerenityReporterForJasmine#specDone}
                 */
                it('has failed with an assertion error', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                            [ { matcherName: 'toEqual',
                                message: 'Expected false to equal true.',
                                stack: 'Error: Expected false to equal true.\n    at <Jasmine>\n    at UserContext.it (/path/to/spec.js:6:27)\n    at <Jasmine>',
                                passed: false,
                                expected: true,
                                actual: false } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal('Expected false to equal true.');
                            expect(error.actual).to.equal(false);
                            expect(error.expected).to.equal(true);
                        });
                });

                /** @test {SerenityReporterForJasmine#specDone} */
                it('has failed with multiple errors', async () => {
                    // The failure with multiple errors could only happen when someone has
                    // a bare-bones protractor/jasmine setup and uses Serenity/JS just for the reporting
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations: [ {
                            matcherName: 'toEqual',
                            message: 'Expected false to equal true.',
                            stack: 'Error: Expected false to equal true.\n    at <Jasmine>\n    at UserContext.it (/path/to/spec.js:6:27)\n    at <Jasmine>',
                            passed: false,
                            expected: true,
                            actual: false,
                        },  {
                            matcherName: 'toEqual',
                            message: 'Expected "hello" to equal "hey".',
                            stack: 'Error: Expected "hello" to equal "hey".\n    at <Jasmine>\n    at UserContext.it (/path/to/spec.js:6:27)\n    at <Jasmine>',
                            passed: false,
                            expected: 'hey',
                            actual: 'hello',
                        }],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/path/to/spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(TaskStarts,   event => expect(event.details.name).to.equal(new Name('Expectation')))
                        .next(TaskFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal('Expected false to equal true.');
                            expect(error.actual).to.equal(false);
                            expect(error.expected).to.equal(true);
                        })
                        .next(TaskStarts,   event => expect(event.details.name).to.equal(new Name('Expectation')))
                        .next(TaskFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal('Expected "hello" to equal "hey".');
                            expect(error.actual).to.equal('hello');
                            expect(error.expected).to.equal('hey');
                        })
                        .next(SceneFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal('Expected false to equal true.');
                            expect(error.actual).to.equal(false);
                            expect(error.expected).to.equal(true);
                        });
                });
            });
        });

        describe('the `it` block is not nested within a `describe` block and', () => {

            beforeEach(async () => {
                reporter.specStarted({
                    id: 'spec0',
                    description: 'A scenario passes',
                    fullName: 'A scenario passes',
                    failedExpectations: [],
                    passedExpectations: [],
                    deprecationWarnings: [],
                    pendingReason: '',
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 5,
                        column: 9,
                    },
                });

                await reporter.specDone({
                    id: 'spec0',
                    description: 'A scenario passes',
                    fullName: 'A scenario passes',
                    failedExpectations: [],
                    passedExpectations:
                        [{
                            matcherName: 'toBe',
                            message: 'Passed.',
                            stack: '',
                            passed: true,
                        }],
                    deprecationWarnings: [],
                    pendingReason: '',
                    duration: null,
                    location: {
                        path: '/path/to/spec.js',
                        line: 5,
                        column: 9,
                    },
                    status: 'passed',
                });
            });

            /**
             * @test {SerenityReporterForJasmine#specStarted}
             * @test {SerenityReporterForJasmine#specDone}
             */
            it('tags the feature as "unknown"', () => {
                PickEvent.from(listener.events)
                    .next(SceneTagged,      event => expect(event.tag).to.equal(new FeatureTag('Unknown feature')));
            });

            /**
             * @test {SerenityReporterForJasmine#specStarted}
             * @test {SerenityReporterForJasmine#specDone}
             */
            it('correctly derives the name of the spec', () => {
                PickEvent.from(listener.events)
                    .next(SceneStarts,      event => expect(event.details.name.value).to.equal('A scenario passes'))
                    .next(SceneFinished,    event => expect(event.details.name.value).to.equal('A scenario passes'));
            });
        });
    });

    class Listener implements StageCrewMember {
        public readonly events: DomainEvent[] = [];

        constructor(private stage: Stage = null) {
        }

        assignedTo(stage: Stage): StageCrewMember {
            this.stage = stage;
            return this;
        }

        notifyOf(event: DomainEvent): void {
            this.events.push(event);
        }
    }
});
