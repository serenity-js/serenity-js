import 'mocha';

import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { StandardOutput, TempFileOutput } from '@serenity-js/cucumber/lib/cli'; // tslint:disable-line:no-submodule-imports
import { given } from 'mocha-testdata';
import { TestRunnerDetector } from '../../src/adapter';
import { CucumberTestRunner } from '../../src/adapter/runners/CucumberTestRunner';
import { JasmineTestRunner } from '../../src/adapter/runners/JasmineTestRunner';
import { MochaTestRunner } from '../../src/adapter/runners/MochaTestRunner';
import { Photographer, TakePhotosOfFailures } from '../../src';

describe('TestRunnerDetector', () => {

    let detector: TestRunnerDetector;

    beforeEach(() => {
        detector = new TestRunnerDetector(Path.from(__dirname));
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

    describe('when using CucumberTestRunner', () => {

        given([{
            description: `serenity.crew is not empty and there is no cucumberOpts.format specified`,
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ Photographer.whoWill(TakePhotosOfFailures) ]
                }
            },
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
        }]).
        it('takes over standard output when', ({ config }) => {
            const runner = detector.runnerFor(config);

            // OK, I am being a bit naughty here with checking a private field,
            // but the alternative feels like over-engineering.
            expect((runner as any).output).instanceOf(StandardOutput);
        });

        given([{
            description: 'serenity.crew is empty and there is no Cucumber format specified (indicating that defaults should be used)',
            config: {
                serenity: {
                    runner: 'cucumber',
                    crew: [ ]
                }
            },
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
        }]).
        it('uses a temp file output when', ({ config }) => {
            const runner = detector.runnerFor(config);

            // OK, I am being a bit naughty here with checking a private field,
            // but the alternative feels like over-engineering.
            expect((runner as any).output).instanceOf(TempFileOutput);
        });
    });

    describe('to support test runner options specified in the capabilities section', () => {

        it('merges the cucumberOpts');

        it('merges the mochaOpts');

        it('merges the jasmineNodeOpts');
    });
});
