import 'mocha';

import * as sinon from 'sinon';

import { TestCompromisedError } from '../../../../src/errors';
import {
    ArtifactGenerated,
    SceneFinished,
    SceneStarts,
    TestRunFinished,
    TestRunnerDetected
} from '../../../../src/events';
import { Artifact, FileSystemLocation, FileType, Path } from '../../../../src/io';
import {
    ExecutionFailedWithAssertionError,
    Category,
    Duration,
    ExecutionFailedWithError,
    ExecutionCompromised,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
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

        let artifact: Artifact<SerenityBDDReport>;

        beforeEach(() => {
            given(reporter).isNotifiedOfFollowingEvents(
                new SceneStarts(defaultCardScenario),
                new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinished(),
            );

            expect(stageManager.notifyOf.callCount).to.equal(1);

            artifact = stageManager.notifyOf.firstCall.lastArg.artifact;
        });

        it('is a JSON', () => {
            expect(artifact.type).to.equal(FileType.JSON);
        });

        it('has a unique file name (MD5)', () => {
            expect(artifact.name.value.length).to.equal(32);
            expect(artifact.name.value).to.match(/[0-9a-e]+/);
        });
    });

    describe('emits an ArtifactGenerated event that', () => {

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
                event1: ArtifactGenerated<SerenityBDDReport> = stageManager.notifyOf.firstCall.lastArg,
                event2: ArtifactGenerated<SerenityBDDReport> = stageManager.notifyOf.secondCall.lastArg;

            expect(event1.artifact.contents.name).to.equal(defaultCardScenario.name.value);

            expect(event2.artifact.contents.name).to.equal(voucherScenario.name.value);
            expect(event2.artifact.contents.name).to.equal(voucherScenario.name.value);
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

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;
            });

            it('contains the id of the scenario', () => {
                expect(report.id).to.equal('online-checkout;paying-with-a-default-card');
            });

            it('contains the name of the scenario', () => {
                expect(report.name).to.equal(defaultCardScenario.name.value);
                expect(report.title).to.equal(defaultCardScenario.name.value);
            });

            it('contains the start time of the scenario', () => {
                expect(report.startTime).to.equal(startTime.toMillisecondTimestamp());
            });

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

            it('has finished with success', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.result).to.equal('SUCCESS');
            });

            it(`hasn't been implemented yet`, () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ImplementationPending()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.result).to.equal('PENDING');
            });

            it('has been ignored', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionIgnored()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.result).to.equal('IGNORED');
            });

            it('has been skipped', () => {

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSkipped()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.result).to.equal('SKIPPED');
            });

            it('has failed with an assertion error', () => {

                try {
                    expect(true).to.equal(false);
                } catch (assertionError) {

                    given(reporter).isNotifiedOfFollowingEvents(
                        new SceneFinished(defaultCardScenario, new ExecutionFailedWithAssertionError(assertionError)),
                        new TestRunFinished(),
                    );

                    report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                    expect(report.result).to.equal('FAILURE');
                    expect(report.testFailureCause.errorType).to.equal('AssertionError');
                    expect(report.testFailureCause.message).to.equal('expected true to equal false');
                    expect(report.testFailureCause.stackTrace).to.be.an('array');
                }
            });

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

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

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

            it('has been compromised', () => {
                const error = new TestCompromisedError(`Test database not deployed, no point running the test`);
                error.stack = [
                    'Error: Test database not deployed, no point running the test',
                    '    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)',
                    // and so on
                ].join('\n');

                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionCompromised(error)),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.result).to.equal('COMPROMISED');
                expect(report.testFailureCause).to.deep.equal({
                    errorType: 'Error',
                    message: `Test database not deployed, no point running the test`,
                    stackTrace: [
                        {
                            declaringClass: '',
                            fileName: '/fake/path/node_modules/mocha/lib/runnable.js',
                            lineNumber: 326,
                            methodName: 'callFn()',
                        },
                    ],
                });
            });
        });

        describe('indicates its execution context', () => {

            beforeEach(() => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneStarts(defaultCardScenario),
                );
            });

            it('specifies the test runner', () => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new TestRunnerDetected(new Name('Cucumber')),
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.testSource).to.equal('Cucumber');
            });

            it('specifies the user story covered', () => {
                given(reporter).isNotifiedOfFollowingEvents(
                    new SceneFinished(defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinished(),
                );

                report = stageManager.notifyOf.firstCall.lastArg.artifact.contents;

                expect(report.userStory).to.deep.equal({
                    id: 'online-checkout',
                    storyName: 'Online Checkout',           // category name, a.k.a. feature name
                    path: 'payments/checkout.feature',
                    type: 'feature',
                });
            });

            describe('reports information from the cucumber feature file', () => {

                it('reports the scenario-level narrative');
                it('reports the scenario-level background title');
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
