import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { StandardOutput, TempFileOutput } from '@serenity-js/cucumber/lib/cli'; // tslint:disable-line:no-submodule-imports
import { given } from 'mocha-testdata';
import { TestRunnerDetector, TestRunnerLoader } from '../../../src/adapter/runner';
import { Photographer, TakePhotosOfFailures } from '../../../src';
import * as sinon from 'sinon';

/** @test {TestRunnerDetector} */
describe('TestRunnerDetector', () => {

    let detector: TestRunnerDetector,
        testRunnerLoader: sinon.SinonStubbedInstance<TestRunnerLoader>;

    beforeEach(() => {
        testRunnerLoader    = sinon.createStubInstance(TestRunnerLoader);
        detector            = new TestRunnerDetector(Path.from(__dirname), testRunnerLoader as unknown as TestRunnerLoader);
    });

    describe('when configured with a specific runner', () => {

        it('uses Cucumber TestRunnerAdapter', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
            });

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith({}, sinon.match.instanceOf(TempFileOutput));
        });

        it('uses Cucumber TestRunnerAdapter even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
            });

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith({}, sinon.match.instanceOf(TempFileOutput));
        });

        it('uses Jasmine TestRunnerAdapter', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'jasmine',
                },
            });

            expect(testRunnerLoader.forJasmine).to.have.been.calledWith({});
        });

        it('uses Jasmine TestRunnerAdapter even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'jasmine',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
            });

            expect(testRunnerLoader.forJasmine).to.have.been.calledWith({});
        });

        it('uses Mocha TestRunnerAdapter', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'mocha',
                },
            });

            expect(testRunnerLoader.forMocha).to.have.been.calledWith({});
        });

        it('uses Mocha TestRunnerAdapter even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'mocha',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
            });

            expect(testRunnerLoader.forMocha).to.have.been.calledWith({});
        });
    });

    describe('when no specific test runner is set', () => {

        it('uses Cucumber TestRunnerAdapter when cucumberOpts are specified', () => {
            const cucumberOpts = {
                'require-module': [
                    'ts-node/register'
                ]
            };

            const runner = detector.runnerFor({
                cucumberOpts,
            });

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith(cucumberOpts, sinon.match.instanceOf(TempFileOutput));
        });

        it('uses Jasmine TestRunnerAdapter when jasmineNodeOpts are specified', () => {
            const jasmineNodeOpts = {
                grep: 'some spec.*',
            };

            const runner = detector.runnerFor({
                jasmineNodeOpts,
            });

            expect(testRunnerLoader.forJasmine).to.have.been.calledWith(jasmineNodeOpts);
        });

        it('uses Jasmine TestRunnerAdapter when no other runners are specified', () => {
            const runner = detector.runnerFor({});

            expect(testRunnerLoader.forJasmine).to.have.been.calledWith({});
        });

        it('uses Mocha TestRunnerAdapter when mochaOpts are specified', () => {
            const mochaOpts = {
                require: 'ts:ts-node/register',
            };

            const runner = detector.runnerFor({
                mochaOpts,
            });

            expect(testRunnerLoader.forMocha).to.have.been.calledWith(mochaOpts);
        });
    });

    describe('when Cucumber TestRunnerAdapter is detected', () => {

        it('resolves any glob patterns under `require` to absolute paths', () => {
            const runner = detector.runnerFor({
                cucumberOpts: {
                    require: [
                        'features/**/*.steps.ts',
                    ]
                },
            });

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith({
                require: [
                    absolutePathTo('features/example.steps.ts'),
                ]
            }, sinon.match.instanceOf(TempFileOutput));
        });

        given([{
            description: `serenity.crew is not empty and there is no cucumberOpts.format specified`,
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ Photographer.whoWill(TakePhotosOfFailures) ]
                }
            },
            expectedCucumberOpts: { },
        }, {
            description: 'serenity.crew is not empty and there is a cucumberOpts.format specified',
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ Photographer.whoWill(TakePhotosOfFailures) ]
                },
                cucumberOpts: {
                    format: 'pretty'
                }
            },
            expectedCucumberOpts: { format: 'pretty' },
        }]).
        it('takes over standard output when', ({ config, expectedCucumberOpts }) => {
            const runner = detector.runnerFor(config);

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith(expectedCucumberOpts, sinon.match.instanceOf(StandardOutput));
        });

        given([{
            description: 'serenity.crew is empty and there is no Cucumber format specified (indicating that defaults should be used)',
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ ]
                }
            },
            expectedCucumberOpts: { },
        }, {
            description: 'serenity.crew is empty and a custom Cucumber format specified',
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ ]
                },
                cucumberOpts: {
                    format: 'pretty'
                }
            },
            expectedCucumberOpts: { format: 'pretty' },
        }]).
        it('uses a temp file output when', ({ config, expectedCucumberOpts}) => {
            const runner = detector.runnerFor(config);

            expect(testRunnerLoader.forCucumber).to.have.been.calledWith(expectedCucumberOpts, sinon.match.instanceOf(TempFileOutput));
        });
    });

    function absolutePathTo(relativePath: string): string {
        return Path.from(__dirname, relativePath).value;
    }
});
