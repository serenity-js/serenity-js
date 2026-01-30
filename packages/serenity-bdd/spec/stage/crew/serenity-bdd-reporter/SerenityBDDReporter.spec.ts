
import type { EventRecorder } from '@integration/testing-tools';
import { expect, PickEvent } from '@integration/testing-tools';
import type { Stage } from '@serenity-js/core';
import { AssertionError, Duration, ImplementationPendingError, TestCompromisedError, Timestamp } from '@serenity-js/core';
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

import type { SerenityBDD4ReportSchema } from '../../../../src/stage/crew/serenity-bdd-reporter/serenity-bdd-report-schema';
import { create } from './create';

describe('SerenityBDDReporter', () => {

    const
        startTime = Timestamp.fromJSON('2018-05-25T00:00:00.123Z'),
        scenarioDuration = Duration.ofMilliseconds(142),
        cwd = Path.from(`/home/alice/projects/example`);

    const
        aSceneId = new CorrelationId('a-scene-id'),
        anotherSceneId = new CorrelationId('another-scene-id');

    const cucumberWorkspace = {
        [`${ cwd.value }`]: {
            'features': {
                'checkout.feature': 'Feature: Checkout',
                'payments': {
                    'vouchers.feature': 'Feature: Vouchers',
                }
            }
        }
    }

    const playwrightWorkspace = {
        [`${ cwd.value }`]: {
            'spec': {
                'payments': {
                    'express_checkout': {
                        'default_card.spec.ts': 'describe("Default card", () => { /* ... */ })'
                    },
                }
            }
        }
    }

    /**
     * Cucumber test scenarios in a flat directory structure
     *
     * ```gherkin
     * Feature: Online Checkout
     *
     *   Scenario: Paying with a default card
     * ```
     *
     * Feature:     Online Checkout
     * Capability:  NONE
     * Theme:       NONE
     */
    const simpleCucumberScenario = new ScenarioDetails(
        new Name('Paying with a default card'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            cwd.resolve(Path.from(`features/checkout.feature`)),
        ),
    );

    /**
     * Cucumber test scenarios in a nested directory structure
     *
     * ```gherkin
     * Feature: Vouchers
     *
     *   Scenario: Paying with a voucher
     * ```
     *
     * Feature:     Online Checkout
     * Capability:  Payments
     * Theme:       NONE
     */
    const nestedCucumberScenario = new ScenarioDetails(
        new Name('Paying with a voucher'),
        new Category('Vouchers'),
        new FileSystemLocation(
            cwd.resolve(Path.from(`features/payments/vouchers.feature`)),
        ),
    );

    /**
     * Playwright Test scenario in a nested directory structure
     *
     * ```ts
     * describe('Default card', () => {
     *     it('Paying with a default card')
     * })
     * ```
     *
     * Feature:     Default card
     * Capability:  Express checkout
     * Theme:       Payments
     */
    const nestedPlaywrightScenario = new ScenarioDetails(
        new Name('Paying with a default card'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            cwd.resolve(Path.from(`spec/payments/express_checkout/default_card.spec.ts`)),
        ),
    );

    describe('generates a SerenityBDDReport Artifact that', () => {

        it('is a valid artifact', () => {
            const { stage, recorder } = create({ specDirectory: 'features' }, cucumberWorkspace);

            stage.announce(
                new SceneStarts(aSceneId, simpleCucumberScenario),
                new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    expect(event.artifact).to.be.instanceOf(TestReport);
                });
        });

        // counter-example covered implicitly in `error handling` suite below
        it('is produced asynchronously', () => {
            const { stage, recorder } = create({ specDirectory: 'features' }, cucumberWorkspace);

            stage.announce(
                new SceneStarts(aSceneId, simpleCucumberScenario),
                new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful()),
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
            const { stage, recorder } = create({ specDirectory: 'features' }, cucumberWorkspace);

            stage.announce(
                new SceneStarts(aSceneId, simpleCucumberScenario),
                new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful()),
                new SceneStarts(anotherSceneId, nestedCucumberScenario),
                new SceneFinished(anotherSceneId, nestedCucumberScenario, new ExecutionSkipped()),
                new TestRunFinishes(),
            );

            PickEvent.from(recorder.events)
                .next(ArtifactGenerated, event => {
                    expect(event.artifact.map(_ => _).name).to.equal(simpleCucumberScenario.name.value);
                })
                .next(ArtifactGenerated, event => {
                    expect(event.artifact.map(_ => _).name).to.equal(nestedCucumberScenario.name.value);
                })
            ;
        });
    });

    describe('produces a SerenityBDDReport that', () => {

        let report: SerenityBDD4ReportSchema;

        describe('at the scenario level', () => {

            let stage: Stage,
                recorder: EventRecorder;

            beforeEach(() => {
                const env = create({ specDirectory: 'features' }, cucumberWorkspace);
                stage = env.stage;
                recorder = env.recorder;

                stage.announce(
                    new SceneStarts(aSceneId, simpleCucumberScenario, startTime),
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful(), startTime.plus(scenarioDuration)),
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
                expect(report.name).to.equal(simpleCucumberScenario.name.value);
                expect(report.title).to.equal(simpleCucumberScenario.name.value);
            });

            it('contains the start time of the scenario', () => {
                expect(report.startTime).to.equal(startTime.toISOString());
            });

            it('contains the duration of the scenario', () => {
                expect(report.duration).to.equal(scenarioDuration.inMilliseconds());
            });
        });

        describe('describes the result of scenario execution that', () => {

            let stage: Stage,
                recorder: EventRecorder;

            beforeEach(() => {
                const env = create({ specDirectory: 'features' }, cucumberWorkspace);
                stage = env.stage;
                recorder = env.recorder;

                stage.announce(
                    new SceneStarts(aSceneId, simpleCucumberScenario),
                );
            });

            it('has finished with success', () => {

                stage.announce(
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful()),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ImplementationPending(new ImplementationPendingError('method missing'))),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionIgnored(new Error(`Failed, retrying`))),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSkipped()),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionFailedWithAssertionError(assertionError)),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionFailedWithError(error)),
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
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionCompromised(error)),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.result).to.equal('COMPROMISED');
                        expect(report.testFailureCause).to.deep.equal({
                            errorType: 'TestCompromisedError',
                            message: `Test database not deployed, no point running the test; Could not connect to the database`,
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

            it('specifies "Cucumber" test runner for Cucumber scenarios', () => {

                const { stage, recorder } = create({ specDirectory: 'features' }, cucumberWorkspace);

                stage.announce(
                    new SceneStarts(aSceneId, simpleCucumberScenario),
                    new TestRunnerDetected(aSceneId, new Name('JS')),
                    new SceneFinished(aSceneId, simpleCucumberScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.testSource).to.equal('JS');
                    })
                ;
            });

            it('specifies "JS" test runner for non-Cucumber scenarios', () => {
                const { stage, recorder } = create({ specDirectory: 'spec' }, playwrightWorkspace);

                stage.announce(
                    new SceneStarts(aSceneId, nestedPlaywrightScenario),
                    new TestRunnerDetected(aSceneId, new Name('Playwright')),
                    new SceneFinished(aSceneId, nestedPlaywrightScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.userStory).to.deep.equal({
                            id: 'online-checkout',
                            storyName: 'Online Checkout',           // category name, a.k.a. feature name
                            displayName: 'Online Checkout',         //  repeated here again as display name
                            narrative: '',
                            path: 'payments/express_checkout/default_card',
                            pathElements: [
                                { name: 'payments', description: 'Payments' },
                                { name: 'express_checkout', description: 'Express checkout' },
                                { name: 'default_card', description: 'Default card' },
                            ],
                            type: 'feature',
                        });

                        expect(report.testSource).to.equal('JS');
                    })
                ;
            });

            // todo: add test for FeatureNarrativeDetected

            it('produces path and pathElements required by Serenity BDD 4 to understand the requirements hierarchy', () => {

                const { stage, recorder } = create({ specDirectory: 'spec' }, playwrightWorkspace);

                stage.announce(
                    new SceneStarts(aSceneId, nestedPlaywrightScenario),
                    new SceneFinished(aSceneId, nestedPlaywrightScenario, new ExecutionSuccessful()),
                    new TestRunFinishes(),
                );

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        report = event.artifact.map(_ => _);

                        expect(report.userStory).to.deep.equal({
                            id: 'online-checkout',
                            storyName: 'Online Checkout',           // category name, a.k.a. feature name
                            displayName: 'Online Checkout',         //  repeated here again as display name
                            narrative: '',
                            path: 'payments/express_checkout/default_card',
                            pathElements: [
                                { name: 'payments', description: 'Payments' },
                                { name: 'express_checkout', description: 'Express checkout' },
                                { name: 'default_card', description: 'Default card' },
                            ],
                            type: 'feature',
                        });
                    })
                ;
            });
        });
    });

    describe('error handling', () => {

        describe('complains when ScenarioDetails', () => {

            let stage: Stage;

            beforeEach(() => {
                const env = create({ specDirectory: 'features' }, cucumberWorkspace);
                stage = env.stage;
            });

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
