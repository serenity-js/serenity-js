import 'sinon-chai';

import { expect } from '@integration/testing-tools';
import { Clock, Serenity } from '@serenity-js/core';
import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter';
import { SceneFinished, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import type { Outcome, ProblemIndication} from '@serenity-js/core/lib/model';
import { Category, CorrelationId, ExecutionFailedWithError, ExecutionIgnored, ExecutionSuccessful, Name, ScenarioDetails } from '@serenity-js/core/lib/model';
import type { StageCrewMember } from '@serenity-js/core/lib/stage';
import { ArtifactArchiver } from '@serenity-js/core/lib/stage';
import { beforeEach, describe, it } from 'mocha';
import type { Config} from 'protractor';
import { Runner } from 'protractor';
import * as sinon from 'sinon';

import { ProtractorFrameworkAdapter, TestRunnerDetector } from '../../src/adapter';

describe('ProtractorFrameworkAdapter', () => {

    /*
     * Protractor spec:
     *  https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/README.md#framework-adapters-for-protractor
     *
     * Jasmine runner:
     *  https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/jasmine.js#L17-L49
     */

    let protractorRunner:   sinon.SinonStubbedInstance<Runner>,
        testRunnerDetector: sinon.SinonStubbedInstance<TestRunnerDetector>,
        testRunnerAdapter:  TestRunnerAdapter,
        serenity:           Serenity,
        adapter:            ProtractorFrameworkAdapter;

    beforeEach(() => {
        const discreteClock: Clock = new Clock(function () {
            let currentTime = 0;
            return () => {
                const now = new Date(currentTime);
                currentTime += 250;
                return now;
            };
        }());

        protractorRunner    = sinon.createStubInstance(Runner);
        testRunnerDetector  = sinon.createStubInstance(TestRunnerDetector);
        serenity            = new Serenity(discreteClock);
        testRunnerAdapter   = new SimpleTestRunnerAdapter(serenity);

        testRunnerDetector.runnerFor.returns(testRunnerAdapter);

        adapter = new ProtractorFrameworkAdapter(serenity, protractorRunner, testRunnerDetector as unknown as TestRunnerDetector);

        protractorRunner.getConfig.returns({ });
    });

    const expectedError = new Error(`We're sorry, something happened`);
    expectedError.stack = `Error: We're sorry, something happened`;

    function sample(type: 'passing.spec.ts' | 'failing.spec.ts' | string) {
        return type === 'passing.spec.ts'
            ? { path: 'passing.spec.ts', name: 'passing test', category: 'samples', description: 'samples passing test', outcome: new ExecutionSuccessful() }
            : { path: 'failing.spec.ts', name: 'failing test', category: 'samples', description: 'samples failing test', outcome: new ExecutionFailedWithError(expectedError) };
    }

    describe('to meet the requirements described in "Framework Adapters for Protractor"', () => {

        describe('produces a Protractor report that', () => {

            it('describes no test results if no tests were executed', () =>
                expect(adapter.run([]))
                    .to.eventually.deep.equal({
                        failedCount: 0,
                        specResults: [],
                    }));

            it('describes successful tests', () =>
                expect(adapter.run([ sample('passing.spec.ts').path ]))
                    .to.eventually.deep.equal({
                        failedCount: 0,
                        specResults: [{
                            description: sample('passing.spec.ts').description,
                            duration: 2000,
                            assertions: [{
                                passed:     true,
                            }],
                        }],
                    }));

            it('describes failing tests', () =>
                expect(adapter.run([ sample('failing.spec.ts').path ]))
                    .to.eventually.deep.equal({
                        failedCount: 1,
                        specResults: [{
                            description: sample('failing.spec.ts').description,
                            duration:    2000,
                            assertions: [{
                                passed:     false,
                                errorMsg:   (sample('failing.spec.ts').outcome as ProblemIndication).error.message,
                                stackTrace: (sample('failing.spec.ts').outcome as ProblemIndication).error.stack,
                            }],
                        }],
                    }));

            it('describes both successful and failing tests', () =>
                expect(adapter.run([ sample('passing.spec.ts').path, sample('failing.spec.ts').path, sample('passing.spec.ts').path ]))
                    .to.eventually.deep.equal({
                        failedCount: 1,
                        specResults: [{
                            description: sample('passing.spec.ts').description,
                            duration: 2000,
                            assertions: [{
                                passed:     true,
                            }],
                        }, {
                            description: sample('failing.spec.ts').description,
                            duration: 2000,
                            assertions: [{
                                passed:     false,
                                errorMsg:   (sample('failing.spec.ts').outcome as ProblemIndication).error.message,
                                stackTrace: (sample('failing.spec.ts').outcome as ProblemIndication).error.stack,
                            }],
                        }, {
                            description: sample('passing.spec.ts').description,
                            duration: 2000,
                            assertions: [{
                                passed:     true,
                            }],
                        }],
                    }));
        });

        it('invokes runner.runTestPreparer before executing the tests', () => {
            const testRunnerRunMethod = sinon.spy(testRunnerAdapter, 'run');

            return expect(adapter.run([])).to.be.fulfilled
                .then(() => {
                    sinon.assert.callOrder(
                        protractorRunner.runTestPreparer,
                        testRunnerRunMethod,
                    );
                });
        });

        it('invokes runner.getConfig().onComplete() after executing the tests', () => {

            const protractorConfig: Partial<Config> = {
                onComplete: sinon.stub().returns(Promise.resolve(void 0)),
            };

            protractorRunner.getConfig.returns(protractorConfig);

            const testRunnerRunMethod = sinon.spy(testRunnerAdapter, 'run');

            return expect(adapter.run([])).to.be.fulfilled
                .then(() => {
                    sinon.assert.callOrder(
                        testRunnerRunMethod,
                        protractorConfig.onComplete as sinon.SinonStub,
                    );
                });
        });

        describe('when a test succeeds', () => {

            it('invokes runner.emit with a "testPass" message', () =>
                expect(adapter.run([
                    sample('passing.spec.ts').path,
                ]))
                .to.be.fulfilled
                .then(() => {
                    expect(protractorRunner.emit).to.have.been.calledWith('testPass', {
                        name:       sample('passing.spec.ts').name,
                        category:   sample('passing.spec.ts').category,
                    });
                }));

            it('invokes runner.afterEach after each test', () =>
                expect(adapter.run([
                    sample('passing.spec.ts').path,
                    sample('passing.spec.ts').path,
                ]))
                .to.be.fulfilled
                .then(() => {
                    expect(protractorRunner.afterEach).to.have.been.calledTwice;
                }));
        });

        describe('when a test fails', () => {

            it('invokes runner.emit with a "testFail" message', () =>
                expect(adapter.run([
                    sample('failing.spec.ts').path,
                ]))
                .to.be.fulfilled
                .then(() => {
                    expect(protractorRunner.emit).to.have.been.calledWith('testFail', {
                        name:       sample('failing.spec.ts').name,
                        category:   sample('failing.spec.ts').category,
                    });
                }));

            it('invokes runner.afterEach after each test', () =>
                expect(adapter.run([
                    sample('failing.spec.ts').path,
                    sample('failing.spec.ts').path,
                ]))
                .to.be.fulfilled            // promise resolved even upon test failure; test suite failure is determined based on the ProtractorReport
                .then(() => {
                    expect(protractorRunner.afterEach).to.have.been.calledTwice;
                }));
        });

        describe('error handling', function () {

            this.timeout(7000);

            it('fails the test run when runner.afterEach errors out', () => {
                protractorRunner.afterEach.throws(expectedError);

                return expect(adapter.run([
                    sample('passing.spec.ts').path,
                ]))
                .to.be.rejectedWith(Error, [
                    `1 async operation has failed to complete:`,
                    `[ProtractorReporter] Invoking ProtractorRunner.afterEach... - ${ expectedError.stack }`,
                    `---`,
                    '',
                ].join('\n'));
            });

            it('fails the test run when runner.afterEach rejects the promise', () => {
                protractorRunner.afterEach.rejects(expectedError);

                return expect(adapter.run([
                    sample('passing.spec.ts').path,
                ]))
                .to.be.rejectedWith(Error, [
                    `1 async operation has failed to complete:`,
                    `[ProtractorReporter] Invoking ProtractorRunner.afterEach... - ${ expectedError.stack }`,
                    `---`,
                    '',
                ].join('\n'));
            });
        });
    });

    describe('configuration', () => {

        // eslint-disable-next-line unicorn/consistent-function-scoping
        function pickOne<T extends StageCrewMember>(type: new (...args: any[]) => T, crew: StageCrewMember[]): T {
            const found = crew.filter(member => member instanceof type);

            if (found.length !== 1) {
                throw new Error(`Found ${ found.length } ${ type.name }s`);
            }

            return found[0] as T;
        }

        it('provides sensible defaults when no explicit configuration is provided', () => {
            protractorRunner.getConfig.returns({});

            return adapter.run([ sample('passing.spec.ts').path ])
                .then(() => {
                    const crew = (serenity as any).stage.manager.subscribers;

                    const archiver = pickOne(ArtifactArchiver, crew);

                    expect((archiver as any).fileSystem.root)
                        .to.equal(new Path(process.cwd() + '/target/site/serenity'));
                });
        });

        it('allows for the defaults to be overridden', () => {
            protractorRunner.getConfig.returns({
                serenity: {
                    crew: [
                        ArtifactArchiver.storingArtifactsAt('./custom/output/path'),
                    ],
                },
            });

            return adapter.run([ sample('passing.spec.ts').path ])
                .then(() => {
                    const crew = (serenity as any).stage.manager.subscribers;

                    const archiver = pickOne(ArtifactArchiver, crew);

                    expect((archiver as any).fileSystem.root)
                        .to.equal(new Path(`./custom/output/path`));
                });
        });
    });

    class SimpleTestRunnerAdapter implements TestRunnerAdapter {

        private scenarios: string[] = [];

        constructor(private readonly serenityInstance: Serenity) {
        }

        scenarioCount() {
            return this.scenarios.length;
        }

        successThreshold(): Outcome | { Code: number } {
            return ExecutionIgnored;
        }

        load(scenarios: string[]): Promise<void> {
            this.scenarios = scenarios;

            return Promise.resolve();
        }

        run(): Promise<void> {

            return this.scenarios
                .reduce((previous, current) => previous.then(() => {

                    const scenario = sample(current);

                    const details = new ScenarioDetails(
                        new Name(scenario.name),
                        new Category(scenario.category),
                        new FileSystemLocation(new Path(scenario.path)),
                    );

                    const sceneId = CorrelationId.create();

                    this.serenityInstance.announce(new SceneStarts(
                        sceneId,
                        details,
                        this.serenityInstance.currentTime(),
                    ));

                    // ... an actual test runner would now execute the test and then announce the outcome

                    this.serenityInstance.announce(
                        new SceneFinishes(sceneId, scenario.outcome, this.serenityInstance.currentTime()),
                    );

                    return this.serenityInstance.waitForNextCue()
                        .then(() => {
                            this.serenityInstance.announce(
                                new SceneFinished(sceneId, details, scenario.outcome, this.serenityInstance.currentTime()),
                            );
                        });

                }), Promise.resolve(void 0));
        }
    }
});
