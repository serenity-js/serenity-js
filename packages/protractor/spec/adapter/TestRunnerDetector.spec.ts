import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import { TestRunnerDetector } from '../../src/adapter';
import { CucumberTestRunner } from '../../src/adapter/runners/CucumberTestRunner';
import { JasmineTestRunner } from '../../src/adapter/runners/JasmineTestRunner';

describe('TestRunnerDetector', () => {

    let detector: TestRunnerDetector;

    beforeEach(() => {
        detector = new TestRunnerDetector(new ModuleLoader(process.cwd()));
    });

    describe('when configured with a specific runner', () => {

        it('uses the CucumberTestRunner', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
            });

            expect(runner).to.be.instanceOf(CucumberTestRunner);
        });

        it('uses the CucumberTestRunner even when the Jasmine config is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
            });

            expect(runner).to.be.instanceOf(CucumberTestRunner);
        });

        it('uses the JasmineTestRunner', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'jasmine',
                },
            });

            expect(runner).to.be.instanceOf(JasmineTestRunner);
        });

        it('uses the JasmineTestRunner even when the Cucumber config is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'jasmine',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
            });

            expect(runner).to.be.instanceOf(JasmineTestRunner);
        });

        it('uses the MochaTestRunner');
    });

    describe('when no specific test runner is set', () => {

        it('uses the CucumberTestRunner when cucumberOpts are specified', () => {
            const runner = detector.runnerFor({
                cucumberOpts: {
                    require: [
                        'ts-node/register',
                        'features/**/*.steps.ts',
                    ],
                },
            });

            expect(runner).to.be.instanceOf(CucumberTestRunner);
        });

        it('uses the JasmineTestRunner when jasmineNodeOpts are specified', () => {
            const runner = detector.runnerFor({
                jasmineNodeOpts: {
                    grep: 'some spec.*',
                },
            });

            expect(runner).to.be.instanceOf(JasmineTestRunner);
        });

        it('uses the JasmineTestRunner when no other runners are specified', () => {
            const runner = detector.runnerFor({});

            expect(runner).to.be.instanceOf(JasmineTestRunner);
        });

        it('uses the MochaTestRunner when mochaOpts are specified');
    });

    describe('to support test runner options specified in the capabilities section', () => {

        it('merges the cucumberOpts');

        it('merges the mochaOpts');

        it('merges the jasmineNodeOpts');
    });
});
