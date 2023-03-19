/* eslint-disable unicorn/filename-case */
import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { AssertionError, Duration, ImplementationPendingError, Stage, TestCompromisedError, Timestamp } from '@serenity-js/core';
import { ArtifactGenerated, AsyncOperationAttempted, AsyncOperationCompleted, SceneFinished, SceneStarts, TestRunFinishes, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    Category,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    ScenarioDetails,
    TestReport,
} from '@serenity-js/core/lib/model';
import { beforeEach, describe, it } from 'mocha';

import { SerenityBDDReport } from '../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { create } from './create';

describe('SerenityBDDReporter', () => {

    const
        startTime = Timestamp.fromJSON('2018-05-25T00:00:00.123Z'),
        scenarioDuration = Duration.ofMilliseconds(142);

    const
        aSceneId = new CorrelationId('a-scene-id'),
        anotherSceneId = new CorrelationId('another-scene-id');

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

    const jasmineScenario = new ScenarioDetails(
        new Name('Paying with a default card'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            new Path(`spec/checkout.spec.ts`),
        ),
    );

    let stage: Stage,
        recorder: EventRecorder;

    beforeEach(() => {
        const env = create();

        stage       = env.stage;
        recorder    = env.recorder;
    });

    describe('generates a SerenityBDDReport Artifact that', () => {

        it('is a valid artifact', () => {
            stage.announce(
                new SceneStarts(aSceneId, defaultCardScenario),
                new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    expect(event.artifact).to.be.instanceOf(TestReport);
                });
        });

        // counter-example covered implicitly in `error handling` suite below
        it('is produced asynchronously', () => {
            stage.announce(
                new SceneStarts(aSceneId, defaultCardScenario),
                new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            expect(recorder.events).to.have.lengthOf(6);

            const eventTypes = recorder.events.map(event => event.constructor);

            expect(eventTypes).to.deep.equal([
                SceneStarts,
                SceneFinished,
                AsyncOperationAttempted,
                ArtifactGenerated,
                AsyncOperationCompleted,
                TestRunFinishes
            ]);
        });
    });

    describe('emits an ArtifactGenerated event that', () => {

        it('is separate for each scenario', () => {
            stage.announce(
                new SceneStarts(aSceneId, defaultCardScenario),
                new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                new SceneStarts(anotherSceneId, voucherScenario),
                new SceneFinished(anotherSceneId, voucherScenario, new ExecutionSkipped()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    expect(event.artifact.map(_ => _).name).to.equal(defaultCardScenario.name.value);
                })
                .next(ArtifactGenerated, event => {
                    expect(event.artifact.map(_ => _).name).to.equal(voucherScenario.name.value);
                })
            ;
        });
    });

    describe('produces a SerenityBDDReport that', () => {

        let report: SerenityBDDReport;

        describe('at the scenario level', () => {

            beforeEach(() => {
                stage.announce(
                    new SceneStarts(aSceneId, defaultCardScenario, startTime),
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful(), startTime.plus(scenarioDuration)),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);
                    })
                ;
            });

            it('contains the id of the scenario', () => {
                expect(report.id).to.equal('online-checkout;paying-with-a-default-card');
            });

            it('contains the name of the scenario', () => {
                expect(report.name).to.equal(defaultCardScenario.name.value);
                expect(report.title).to.equal(defaultCardScenario.name.value);
            });

            it('contains the start time of the scenario', () => {
                expect(report.startTime).to.equal(startTime.toMilliseconds());
            });

            it('contains the duration of the scenario', () => {
                expect(report.duration).to.equal(scenarioDuration.inMilliseconds());
            });
        });

        describe('describes the result of scenario execution that', () => {

            beforeEach(() => {
                stage.announce(
                    new SceneStarts(aSceneId, defaultCardScenario),
                );
            });

            it('has finished with success', () => {

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);
                        expect(report.result).to.equal('SUCCESS');
                    })
                ;
            });

            it(`hasn't been implemented yet`, () => {

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ImplementationPending(new ImplementationPendingError('method missing'))),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);
                        expect(report.result).to.equal('PENDING');
                    })
                ;
            });

            it('has been ignored', () => {

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionIgnored(new Error(`Failed, retrying`))),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);
                        expect(report.result).to.equal('IGNORED');
                    })
                ;
            });

            it('has been skipped', () => {

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSkipped()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);
                        expect(report.result).to.equal('SKIPPED');
                    })
                ;
            });

            it('has failed with an assertion error', () => {

                const assertionError = new AssertionError('expected true to equal false');

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionFailedWithAssertionError(assertionError)),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.result).to.equal('FAILURE');
                        expect(report.testFailureCause.errorType).to.equal('AssertionError');
                        expect(report.testFailureCause.message).to.equal('expected true to equal false');
                        expect(report.testFailureCause.stackTrace).to.be.an('array');
                    })
                ;
            });

            it('has failed with a non-assertion error', () => {
                const error = new Error("We're sorry, something happened");

                error.stack = [
                    "Error: We're sorry, something happened",
                    '    at callFn (/fake/path/node_modules/mocha/lib/runnable.js:326:21)',
                    '    at Test.Runnable.run (/fake/path/node_modules/mocha/lib/runnable.js:319:7)',
                    // and so on
                ].join('\n');

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionFailedWithError(error)),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

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
                    })
                ;
            });

            it('has been compromised', () => {
                const databaseError = new Error(`Could not connect to the database`);
                databaseError.stack = [
                    'Error: Could not connect to the database',
                    '    at callFn (/fake/path/node_modules/db-module/index.js:56:78)',
                    // and so on
                ].join('\n');

                const error = new TestCompromisedError(`Test database not deployed, no point running the test`, databaseError);
                error.stack = [
                    'TestCompromisedError: Test database not deployed, no point running the test',
                    '    at callFn (/fake/path/my-test/index.js:12:34)',
                    // and so on
                ].join('\n');

                stage.announce(
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionCompromised(error)),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

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
                    })
                ;
            });
        });

        describe('indicates its execution context', () => {

            it('specifies the test runner', () => {
                stage.announce(
                    new SceneStarts(aSceneId, defaultCardScenario),
                    new TestRunnerDetected(aSceneId, new Name('Cucumber')),
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.testSource).to.equal('Cucumber');
                    })
                ;
            });

            it('specifies the user story covered', () => {
                stage.announce(
                    new SceneStarts(aSceneId, defaultCardScenario),
                    new SceneFinished(aSceneId, defaultCardScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.userStory).to.deep.equal({
                            id: 'online-checkout',
                            storyName: 'Online Checkout',           // category name, a.k.a. feature name
                            path: 'payments/checkout.feature',
                            type: 'feature',
                        });
                    })
                ;
            });

            it('does not mention the user story path for non-Cucumber scenarios (as it breaks the Serenity BDD HTML report)', () => {
                stage.announce(
                    new SceneStarts(aSceneId, jasmineScenario),
                    new SceneFinished(aSceneId, jasmineScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.userStory).to.deep.equal({
                            id: 'online-checkout',
                            storyName: 'Online Checkout',           // category name, a.k.a. feature name
                            path: '',
                            type: 'feature',
                        });
                    })
                ;
            });
        });
    });

    describe('error handling', () => {

        describe('complains when ScenarioDetails', () => {

            it('does not mention the scenario name (as this breaks the Serenity BDD HTML report)', async () => {
                const scenarioWithEmptyName = new ScenarioDetails(
                    new Name(''),
                    new Category('Online Checkout'),
                    new FileSystemLocation(
                        new Path(`payments/checkout.feature`),
                    ),
                );

                stage.announce(
                    new SceneStarts(aSceneId, scenarioWithEmptyName),
                    new SceneFinished(aSceneId, scenarioWithEmptyName, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                await expect(stage.waitForNextCue()).to.be.rejectedWith(Error, `[SerenityBDDReporter] Generating Serenity BDD JSON reports... - Error: scenario name should not be blank`);
            });

            it('does not mention the category name (as it breaks the Serenity BDD HTML report)', async () => {
                const scenarioWithEmptyCategory = new ScenarioDetails(
                    new Name('Paying with a default card'),
                    new Category(''),
                    new FileSystemLocation(
                        new Path(`payments/checkout.feature`),
                    ),
                );

                stage.announce(
                    new SceneStarts(aSceneId, scenarioWithEmptyCategory),
                    new SceneFinished(aSceneId, scenarioWithEmptyCategory, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                await expect(stage.waitForNextCue()).to.be.rejectedWith(Error, `[SerenityBDDReporter] Generating Serenity BDD JSON reports... - Error: scenario category should not be blank`);
            });
        });
    });
});
