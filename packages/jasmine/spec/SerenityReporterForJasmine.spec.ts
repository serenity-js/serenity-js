
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage, StageCrewMember } from '@serenity-js/core';
import {
    AssertionError,
    Clock,
    ImplementationPendingError,
    Serenity,
    TestCompromisedError,
    Timestamp
} from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import {
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TaskFinished,
    TaskStarts,
    TestRunFinished,
    TestRunnerDetected,
    TestRunStarts,
    TestSuiteFinished,
    TestSuiteStarts,
} from '@serenity-js/core/lib/events/index.js';
import {
    FileSystem,
    FileSystemLocation,
    Path,
    RequirementsHierarchy,
    trimmed
} from '@serenity-js/core/lib/io/index.js';
import {
    CapabilityTag,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    Name,
    TestSuiteDetails,
} from '@serenity-js/core/lib/model/index.js';
import { beforeEach, describe, it } from 'mocha';

import { SerenityReporterForJasmine } from '../src/SerenityReporterForJasmine.js';

describe('SerenityReporterForJasmine', () => {

    let serenity: Serenity,
        reporter: SerenityReporterForJasmine,
        listener: Listener;

    const now = new Date('1970-01-01T00:00:00Z');

    beforeEach(() => {
        serenity = new Serenity(new Clock(() => now), '/path/to');
        reporter = new SerenityReporterForJasmine(serenity, new RequirementsHierarchy(new FileSystem(Path.from(process.cwd()))));
        listener = new Listener();

        serenity.configure({ crew: [ listener ] });
    });

    describe('notifies Serenity when', () => {

        describe('the test run', () => {
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

            it('starts', () => {

                const jasmineEvent = {
                    id: 'suite1',
                    description: 'Jasmine',
                    fullName: 'Jasmine',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/examples/feature.spec.js',
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

            it('ends', () => {

                reporter.suiteStarted({
                    id: 'suite1',
                    description: 'Jasmine',
                    fullName: 'Jasmine',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/examples/feature.spec.js',
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
                        path: '/examples/feature.spec.js',
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
                                    path: '/examples/feature.spec.js',
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
                        path: '/examples/feature.spec.js',
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
                                'Error: Failed: suite beforeAll\n    at <Jasmine>\n    at UserContext.<anonymous> (/examples/feature.spec.js:11:9)\n    at <Jasmine>',
                            passed: false,
                            expected: '',
                            actual: '',
                        }, {
                            matcherName: '',
                            message: 'Failed: suite afterAll',
                            stack:
                                'Error: Failed: suite afterAll\n    at <Jasmine>\n    at UserContext.<anonymous> (/examples/feature.spec.js:15:9)\n    at <Jasmine>',
                            passed: false,
                            expected: '',
                            actual: '',
                        },
                    ],
                    deprecationWarnings: [],
                    duration: 0,
                    location:
                        {
                            path: '/examples/feature.spec.js',
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

            it('is pending', () => {
                reporter.suiteStarted({
                    id: 'suite3',
                    description: 'pending suite',
                    fullName: 'pending suite',
                    failedExpectations: [],
                    deprecationWarnings: [],
                    duration: null,
                    location: {
                        path: '/examples/feature.spec.js',
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
                        path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
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
                            path: '/examples/feature.spec.js',
                            line: 1,
                            column: 1,
                        },
                        status: 'passed',
                    });
                });

                it('derives the name of the scenario from the nested `describe` blocks', () => {
                    PickEvent.from(listener.events)
                        .next(SceneStarts,      event => expect(event.details.name.value).to.equal('A scenario passes'))
                        .next(SceneFinished,    event => expect(event.details.name.value).to.equal('A scenario passes'));
                });

                it('derives the name of the feature from the outer-most `describe` block', () => {
                    PickEvent.from(listener.events)
                        .next(SceneTagged,      event => expect(event.tag).to.equal(new CapabilityTag('Examples')))
                        .next(SceneTagged,      event => expect(event.tag).to.equal(new FeatureTag('Jasmine')));
                });

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
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
                    });
                });

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
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
                        status: 'excluded',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()));
                });

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
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
                        status: 'pending',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ImplementationPending;
                            expect(outcome).to.be.instanceOf(ImplementationPending);
                            expect(outcome.error.message).to.equal('Temporarily disabled with xit');
                        });
                });

                it('has failed with an error', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                         [ { matcherName: '',
                             message: 'Error: Something happened',
                             stack: 'Error: Something happened\n    at UserContext.it (/examples/feature.spec.js:6:19)\n',
                             passed: false,
                             expected: '',
                             actual: '' } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
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
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
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
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
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

                it('has failed with an assertion error', async () => {
                    await reporter.specDone({
                        id: 'spec0',
                        description: 'scenario',
                        fullName: 'scenario',
                        failedExpectations:
                            [ { matcherName: 'toEqual',
                                message: 'Expected false to equal true.',
                                stack: 'Error: Expected false to equal true.\n    at <Jasmine>\n    at UserContext.it (/examples/feature.spec.js:6:27)\n    at <Jasmine>',
                                passed: false,
                                expected: true,
                                actual: false } ],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(SceneFinished,    event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal(trimmed`
                                | Expected false to equal true.
                                |
                                | Expected boolean: true
                                | Received boolean: false
                                |`);
                        });
                });

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
                            stack: 'Error: Expected false to equal true.\n    at <Jasmine>\n    at UserContext.it (/examples/feature.spec.js:6:27)\n    at <Jasmine>',
                            passed: false,
                            expected: true,
                            actual: false,
                        },  {
                            matcherName: 'toEqual',
                            message: 'Expected "hello" to equal "hey".',
                            stack: 'Error: Expected "hello" to equal "hey".\n    at <Jasmine>\n    at UserContext.it (/examples/feature.spec.js:6:27)\n    at <Jasmine>',
                            passed: false,
                            expected: 'hey',
                            actual: 'hello',
                        }],
                        passedExpectations: [],
                        deprecationWarnings: [],
                        pendingReason: '',
                        duration: null,
                        location: { path: '/examples/feature.spec.js', line: 5, column: 9 },
                        status: 'failed',
                    });

                    PickEvent.from(listener.events)
                        .next(TaskStarts,   event => expect(event.details.name).to.equal(new Name('Expectation')))
                        .next(TaskFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal(trimmed`
                                | Expected false to equal true.
                                |
                                | Expected boolean: true
                                | Received boolean: false
                                |
                                |     at /examples/feature.spec.js:5:9
                            `);
                        })
                        .next(TaskStarts,   event => expect(event.details.name).to.equal(new Name('Expectation')))
                        .next(TaskFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal(trimmed`
                                | Expected "hello" to equal "hey".
                                |
                                | Expected string: hey
                                | Received string: hello
                                |
                                |     at /examples/feature.spec.js:5:9
                            `);
                        })
                        .next(SceneFinished, event => {
                            const outcome = event.outcome as ExecutionFailedWithAssertionError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                            const error = outcome.error as AssertionError;
                            expect(error).to.be.instanceOf(AssertionError);
                            expect(error.message).to.equal(trimmed`
                                | Expected false to equal true.
                                |
                                | Expected boolean: true
                                | Received boolean: false
                                |
                                |     at /examples/feature.spec.js:5:9
                            `);
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
                        path: '/examples/feature.spec.js',
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
                        path: '/examples/feature.spec.js',
                        line: 5,
                        column: 9,
                    },
                    status: 'passed',
                });
            });

            it('tags the feature using a relative path', () => {
                PickEvent.from(listener.events)
                    .next(SceneTagged,      event => expect(event.tag).to.equal(new CapabilityTag('Examples')))
                    .next(SceneTagged,      event => expect(event.tag).to.equal(new FeatureTag('../../examples/feature.spec.js')));
            });

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
