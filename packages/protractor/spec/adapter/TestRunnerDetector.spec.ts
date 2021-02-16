import 'mocha';

import { expect } from '@integration/testing-tools';
import { OperatingSystem, Path } from '@serenity-js/core/lib/io';
import { TestRunnerDetector } from '../../src/adapter';
import { CucumberTestRunner } from '../../src/adapter/runners/CucumberTestRunner';
import { JasmineTestRunner } from '../../src/adapter/runners/JasmineTestRunner';
import { MochaTestRunner } from '../../src/adapter/runners/MochaTestRunner';

describe('TestRunnerDetector', () => {

    const
        macos = { platform: () => 'darwin' } as any,
        proc  = { env: {} } as any;

    let detector: TestRunnerDetector;

    beforeEach(() => {
        detector = new TestRunnerDetector(Path.from(__dirname), new OperatingSystem(macos, proc));
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

        it('uses the CucumberTestRunner even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'cucumber',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
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

        it('uses the JasmineTestRunner even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'jasmine',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
            });

            expect(runner).to.be.instanceOf(JasmineTestRunner);
        });

        it('uses the MochaTestRunner', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'mocha',
                },
            });

            expect(runner).to.be.instanceOf(MochaTestRunner);
        });

        it('uses the MochaTestRunner even when config for other runners is present as well', () => {
            const runner = detector.runnerFor({
                serenity: {
                    runner: 'mocha',
                },
                cucumberOpts: {},
                jasmineNodeOpts: {},
                mochaOpts: {},
            });

            expect(runner).to.be.instanceOf(MochaTestRunner);
        });
    });

    describe('when no specific test runner is set', () => {

        it('uses the CucumberTestRunner when cucumberOpts are specified', () => {
            const runner = detector.runnerFor({
                cucumberOpts: {
                    require: [
                        'features/**/*.steps.ts',
                    ],
                    'require-module': [
                        'ts-node/register'
                    ]
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

        it('uses the MochaTestRunner when mochaOpts are specified', () => {
            const runner = detector.runnerFor({
                mochaOpts: {
                    require: 'ts:ts-node/register',
                },
            });

            expect(runner).to.be.instanceOf(MochaTestRunner);
        });
    });

    describe('to support test runner options specified in the capabilities section', () => {

        it('merges the cucumberOpts');

        it('merges the mochaOpts');

        it('merges the jasmineNodeOpts');
    });
});
