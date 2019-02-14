import 'mocha';

import * as sinon from 'sinon';

import { AssertionError, TestCompromisedError } from '../../../../src/errors';
import {
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TestRunFinished,
    TestRunnerDetected,
} from '../../../../src/events';
import { FileSystemLocation, Path } from '../../../../src/io';
import {
    Category,
    Duration,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending, JSONData,
    Name,
    ScenarioDetails,
    Timestamp,
} from '../../../../src/model';
import { SerenityBDDReporter, StageManager } from '../../../../src/stage';
import { SerenityBDDReport } from '../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { expect } from '../../../expect';
import { given } from '../given';

describe('SerenityBDDReporter', () => {

    const
        startTime = Timestamp.fromJSON('2018-05-25T00:00:00.123Z'),
        scenarioDuration = Duration.ofMillis(142);

    const defaultCardScenario = new ScenarioDetails(
        new Name('Paying with a default card'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            new Path(`payments/checkout.feature`),
        ),
    );

    const voucherScenario = new ScenarioDetails(
        new Name('Paying with a voucher'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            new Path(`payments/checkout.feature`),
        ),
    );

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        reporter = new SerenityBDDReporter();
        reporter.assignTo(stageManager as any);
    });

    describe('generates a SerenityBDDReport Artifact that', () => {

        let artifact: JSONData;

        beforeEach(() => {
            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            expect(stageManager.notifyOf.callCount).to.equal(1);

            artifact = stageManager.notifyOf.firstCall.lastArg.artifact;
        });

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {SceneFinished}
         * @test {ExecutionSuccessful}
         * @test {TestRunFinished}
         */
        it('is a JSONData', () => {
            expect(artifact).to.be.instanceOf(JSONData);
        });
    });

    describe('emits an ArtifactGenerated event that', () => {

        /**
         * @test {SerenityBDDReporter}
         * @test {SceneStarts}
         * @test {SceneFinished}
         * @test {TestRunFinished}
         * @test {ExecutionSuccessful}
         * @test {ExecutionIgnored}
         */
        it('is separate for each scenario', () => {
            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new SceneStarts(voucherScenario),
                new SceneFinished(voucherScenario, new ExecutionIgnored()),
                new TestRunFinished(),
            );

            expect(stageManager.notifyOf.callCount).to.equal(2);

            const
                event1: ArtifactGenerated = stageManager.notifyOf.firstCall.lastArg,
                event2: ArtifactGenerated = stageManager.notifyOf.secondCall.lastArg;

            expect(event1.artifact.map(_ => _).name).to.equal(defaultCardScenario.name.value);

            expect(event2.artifact.map(_ => _).name).to.equal(voucherScenario.name.value);
        });
    });

    describe('produces a SerenityBDDReport that', () => {

        let report: SerenityBDDReport;

        describe('at the scenario level', () => {

            beforeEach(() => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneStarts(defaultCardScenario, startTime),
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful(), startTime.plus(scenarioDuration)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('contains the id of the scenario', () => {
                expect(report.id).to.equal('online-checkout;paying-with-a-default-card');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('contains the name of the scenario', () => {
                expect(report.name).to.equal(defaultCardScenario.name.value);
                expect(report.title).to.equal(defaultCardScenario.name.value);
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('contains the start time of the scenario', () => {
                expect(report.startTime).to.equal(startTime.toMillisecondTimestamp());
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('contains the duration of the scenario', () => {
                expect(report.duration).to.equal(scenarioDuration.milliseconds);
            });
        });

        describe('describes the result of scenario execution that', () => {

            beforeEach(() => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneStarts(defaultCardScenario),
                );
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('has finished with success', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('SUCCESS');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ImplementationPending}
             */
            it(`hasn't been implemented yet`, () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ImplementationPending()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('PENDING');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionIgnored}
             */
            it('has been ignored', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionIgnored()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('IGNORED');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSkipped}
             */
            it('has been skipped', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSkipped()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('SKIPPED');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionFailedWithAssertionError}
             */
            it('has failed with an assertion error', () => {

                const assertionError = new AssertionError('expected true to equal false', false, true);

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionFailedWithAssertionError(assertionError)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('FAILURE');
                expect(report.testFailureCause.errorType).to.equal('AssertionError');
                expect(report.testFailureCause.message).to.equal('expected true to equal false');
                expect(report.testFailureCause.stackTrace).to.be.an('array');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {TestCompromisedError}
             * @test {ExecutionCompromised}
             */
            it('has been compromised', () => {

                // const assertionError = new AssertionError('expected true to equal false', false, true);
                const assertionError = new TestCompromisedError('expected true to equal false');

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionCompromised(assertionError)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('COMPROMISED');
                expect(report.testFailureCause.errorType).to.equal('TestCompromisedError');
                expect(report.testFailureCause.message).to.equal('expected true to equal false');
                expect(report.testFailureCause.stackTrace).to.be.an('array');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionFailedWithError}
             */
            it('has failed with a non-assertion error', () => {
                const error = new Error("We're sorry, something happened");

                error.stack = [
                    "Error: We're sorry, something happened",
                    '    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)',
                    '    at Test.Runnable.run (/fake/path/node_modules/mocha/lib/runnable.js:319:7)',
                    // and so on
                ].join('\n');

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionFailedWithError(error)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('ERROR');
                expect(report.testFailureCause).to.deep.equal({
                    errorType: 'Error',
                    message: `We're sorry, something happened`,
                    stackTrace: [ {
                        declaringClass: '',
                        fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                        lineNumber: 326,
                        methodName: 'callFn()',
                    }, {
                        declaringClass: '',
                        fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                        lineNumber: 319,
                        methodName: 'Test.Runnable.run()',
                    } ],
                });
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionCompromised}
             */
            it('has been compromised', () => {
                const dbError = new Error(`Could not connect to the database`);
                dbError.stack = [
                    'Error: Could not connect to the database',
                    '    at callFn (/fake/path/node_modules/db-module/index.js:56:78)',
                    // and so on
                ].join('\n');

                const error = new TestCompromisedError(`Test database not deployed, no point running the test`, dbError);
                error.stack = [
                    'TestCompromisedError: Test database not deployed, no point running the test',
                    '    at callFn (/fake/path/my-test/index.js:12:34)',
                    // and so on
                ].join('\n');

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionCompromised(error)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.result).to.equal('COMPROMISED');
                expect(report.testFailureCause).to.deep.equal({
                    errorType: 'TestCompromisedError',
                    message: `Test database not deployed, no point running the test`,
                    stackTrace: [
                        {
                            declaringClass: '',
                            fileName: '/fake/path/my-test/index.js',
                            lineNumber: 12,
                            methodName: 'callFn()',
                        },
                    ],
                    rootCause: {
                        errorType: `Error`,
                        message: `Could not connect to the database`,
                        stackTrace: [
                            {
                                declaringClass: '',
                                fileName: '/fake/path/node_modules/db-module/index.js',
                                lineNumber: 56,
                                methodName: 'callFn()',
                            },
                        ],
                    },
                });
            });
        });

        describe('indicates its execution context', () => {

            beforeEach(() => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneStarts(defaultCardScenario),
                );
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {TestRunnerDetected}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('specifies the test runner', () => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new TestRunnerDetected(new Name('Cucumber')),
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.testSource).to.equal('Cucumber');
            });

            /**
             * @test {SerenityBDDReporter}
             * @test {SceneStarts}
             * @test {SceneFinished}
             * @test {TestRunFinished}
             * @test {ExecutionSuccessful}
             */
            it('specifies the user story covered', () => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

                expect(report.userStory).to.deep.equal({
                    id: 'online-checkout',
                    storyName: 'Online Checkout',           // category name, a.k.a. feature name
                    path: 'payments/checkout.feature',
                    type: 'feature',
                });
            });

            describe('reports information from the cucumber feature file', () => {

                /** @test {SerenityBDDReporter} */
                it('reports the scenario-level narrative');

                /** @test {SerenityBDDReporter} */
                it('reports the scenario-level background title');

                /** @test {SerenityBDDReporter} */
                it('reports the scenario-level background description');
            });
        });
    });

    describe('attachements', () => {
        it('todo');
        // todo:
        // - screenshots
        // - html source
        // - http request/responses
        // - arbitrary text data
    });

    describe('Error handling', () => {

        // todo: node-cleanup
        it('generates the report even when the test runner has crashed');
    });
});

// todo: Does the scene need a correlation ID?
// todo: 'ParametrisedSceneStarts'(scenedetails, parameters)
