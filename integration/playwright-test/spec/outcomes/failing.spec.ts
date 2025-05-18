import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError, ConfigurationError, LogicError, TestCompromisedError, Timestamp } from '@serenity-js/core';
import {
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import {
    CapabilityTag,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    FeatureTag,
    Name,
    ProblemIndication,
    ThemeTag
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Failing', () => {

    describe('Test scenario is reported as failing when', () => {

        it('throws an error', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/outcomes/failing/error.json',
                'outcomes/failing/error.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/outcomes/failing/error.json');
            const errorInPlaywrightReport: { message: string; stack: string } = report
                .suites[0].suites[0].suites[0].specs[0].tests[0].results[0].error;

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails because of an error')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Error')))
                .next(SceneFinished, event => {
                    const outcome: ProblemIndication = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect(outcome.error.name).to.equal('Error');
                    expect(outcome.error.message).to.equal('Error: Example error');

                    expect(outcome.error.message).to.equal(errorInPlaywrightReport.message);
                    expect(outcome.error.stack).to.equal(errorInPlaywrightReport.stack);
                })
            ;
        });

        it('has a failing Playwright assertion', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/playwright_assertion.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails when the assertion fails')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Playwright assertion')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    expect(error.name).to.equal('Error');

                    expect(error.message.split('\n')).to.deep.equal([
                        'Error: expect(received).toEqual(expected) // deep equality',
                        '',
                        'Expected: false',
                        'Received: true',
                    ]);
                })
            ;
        });

        it('has a failing Serenity/JS assertion', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/serenity-js_assertion.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails when the Serenity/JS assertion fails')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS assertion error')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    // Playwright doesn't serialise expected and actual fields on AssertionError
                    expect(error.name).to.equal('Error');
                    expect(error.message).to.equal('AssertionError: Expected true to equal false');
                })
            ;
        });

        it('has a failing Serenity/JS Screenplay assertion', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/serenity-js_screenplay_assertion.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails when the Serenity/JS Screenplay assertion fails')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS assertion')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                    const error = outcome.error as AssertionError;

                    expect(error.name).to.equal('AssertionError');
                    expect(outcome.error.message).to.match(new RegExp(trimmed`
                        | Expected "Hello" to equal "Hola"
                        |
                        | Expectation: equals\\('Hola'\\)
                        |
                        | \\[32mExpected string: Hola\\[39m
                        | \\[31mReceived string: Hello\\[39m
                        |
                        | \\s{4}at .*outcomes/failing/serenity-js_screenplay_assertion.spec.ts:10:24`));
                })
            ;
        });

        it('is compromised', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/serenity-js_screenplay_compromised.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario is compromised')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS assertion')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionCompromised);

                    const error = outcome.error as TestCompromisedError;

                    expect(error).to.be.instanceof(TestCompromisedError);
                    expect(error.message).to.match(new RegExp(trimmed`
                        | Translation DB is down, please cheer it up
                        | \\s{4}at .*failing/serenity-js_screenplay_compromised.spec.ts:11:24
                    `));
                })
            ;
        });

        it('is marked as failing but passes', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/unexpected_pass.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario is marked as failing but passes')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Unexpected pass')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as LogicError;

                    expect(error).to.be.instanceof(LogicError);
                    expect(error.message).to.equal(`Scenario expected to fail, but passed`);
                })
            ;
        });

        it('fails as expected', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/expected_failure.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            // Expected failures result in a zero exit code
            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails as expected')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Expected failure')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    expect(error).to.be.instanceof(Error);
                    expect(error.message).to.equal(`Error: Expected failure`);
                })
            ;
        });

        it('fails with a global, worker-level beforeAll error', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/failing/error_worker_beforeAll.json',
                'outcomes/failing/error_worker_beforeAll.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/failing/error_worker_beforeAll.json');
            const testId = report.suites[0].suites[0].suites[0].specs[0].id;

            const expectedTestId = new CorrelationId(testId);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.sceneId).to.equal(expectedTestId);
                    expect(event.details.name).to.equal(new Name('Test scenario fails because of a global, worker-level error'));
                })
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Error worker beforeAll')))
                .next(SceneFinished, event => {
                    expect(event.sceneId).to.equal(expectedTestId);

                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    expect(error).to.be.instanceof(Error);
                    expect(error.message).to.equal(`Error: Example worker-level error`);
                })
            ;
        });

        it('fails with a global, worker-level afterAll error', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/failing/error_worker_afterAll.json',
                'outcomes/failing/error_worker_afterAll.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/failing/error_worker_afterAll.json');
            const testId = report.suites[0].suites[0].suites[0].specs[0].id;

            const expectedTestId = new CorrelationId(testId);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.sceneId).to.equal(expectedTestId);
                    expect(event.details.name).to.equal(new Name('Test scenario fails because of a global, worker-level error'));
                })
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Error worker afterAll')))
                .next(SceneFinished, event => {
                    expect(event.sceneId).to.equal(expectedTestId);

                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    expect(error).to.be.instanceof(Error);
                    expect(error.message).to.equal(`Error: Example worker-level error`);
                })
            ;
        });

        it('fails with a global, worker-level error preventing tests from being generated', async () => {
            const result = await playwrightTest(
                '--project=default',
                '--reporter=json:output/failing/error_worker_generator.json',
                'outcomes/failing/error_worker_generator.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            const report = jsonFrom('output/failing/error_worker_generator.json');
            expect(report.suites).to.have.lengthOf(0);
            expect(report.errors).to.have.lengthOf(2);
            // there should be no tests reported since the generator failed
            expect(result.events).to.have.lengthOf(3);

            const errorMessages = report.errors
                .map((error: { message: string, stack: string }) => error.message)
                .map((message: string) => /^(.*?)(\.|$)/.exec(message)?.[1]);

            expect(errorMessages).to.deep.equal([
                'Error: Worker-level error preventing test generation',
                'Error: No tests found'
            ]);

            PickEvent.from(result.events)
                .next(TestRunStarts, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinishes, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as Error;

                    expect(error).to.be.instanceof(Error);
                    expect(error.message).to.equal('Error: Worker-level error preventing test generation');
                    expect(error.stack).to.equal(report.errors[0].stack);
                })
            ;
        });

        it('fails with a Serenity/JS ConfigurationError', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/failing/error_configuration.spec.ts',
            ).then(ifExitCodeIsOtherThan(1, logOutput));

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('Test scenario fails with a Serenity/JS ConfigurationError')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new ThemeTag('Outcomes')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new CapabilityTag('Failing')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Error configuration')))
                .next(SceneFinished, event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = outcome.error as ConfigurationError;

                    expect(error.name).to.equal('Error');
                    expect(error.message).to.equal('ConfigurationError: Example configuration error; Example nested error');

                    const stack = error.stack.split('\n');

                    expect(stack).to.include.members([
                        'ConfigurationError: Example configuration error; Example nested error',
                        'Caused by: Error: Example nested error',
                    ]);
                })
            ;
        });
    });
});

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../', pathToFile), { encoding: 'utf8' }));
}
