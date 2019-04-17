import { expect } from '@integration/testing-tools';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import { TestRunnerDetector } from '../../src/adapter';
import { CucumberTestRunner } from '../../src/adapter/runners/CucumberTestRunner';

describe(`TestRunnerDetector`, () => {

    let detector: TestRunnerDetector;

    beforeEach(() => {
        detector = new TestRunnerDetector(new ModuleLoader(process.cwd()));
    });

    describe(`when configured with a specific runner`, () => {

        it(`uses the CucumberTestRunner`, () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
            });

            expect(runner).to.be.instanceOf(CucumberTestRunner);
        });

        it(`uses the MochaTestRunner`);

        it(`uses the JasmineTestRunner`);
    });

    describe(`when no relevant configuration is provided`, () => {

        it(`uses the CucumberTestRunner when cucumberOpts are specified`, () => {
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

        it(`uses the MochaTestRunner when mochaOpts are specified`);

        it(`uses the JasmineTestRunner when jasmineNodeOpts are specified`);

        it(`uses the JasmineTestRunner when no other runners are specified`);
    });

    describe('to support test runner options specified in the capabilities section', () => {

        it('merges the cucumberOpts');

        it('merges the mochaOpts');

        it('merges the jasmineNodeOpts');
    });
});
