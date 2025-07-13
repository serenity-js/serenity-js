import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { TestRunFinished, TestRunStarts } from '@serenity-js/core/lib/events';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60_000);

    describe('reports Screenplay Tasks as Playwright Test steps when', () => {

        it('used with Playwright test.step', () =>
            playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/vanilla-steps.json',
                'screenplay/step-reporting/vanilla-steps.spec.ts'
            )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/screenplay/vanilla-steps.json');

                    const step = report.suites[0].suites[0].suites[0].specs[0].tests[0].results[0].steps[0];

                    expect(step.duration).to.be.greaterThanOrEqual(0);
                    expect(step.title).to.equal('outer');
                    expect(step.steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(step.steps[0].title).to.equal('inner');
                }));

        it('used with Serenity/JS interactions', () =>
            playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/interactions-as-steps.json',
                'screenplay/step-reporting/interactions-as-steps.spec.ts'
            )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/screenplay/interactions-as-steps.json');

                    const step = report.suites[0].suites[0].suites[0].specs[0].tests[0].results[0].steps[0]

                    expect(step.duration).to.be.greaterThanOrEqual(0);
                    expect(step.title).to.equal(`Alice logs: 'Hello World!'`);

                }));

        it('used with custom tasks', () =>
            playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/tasks-as-steps.json',
                'screenplay/step-reporting/tasks-as-steps.spec.ts'
            )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/screenplay/tasks-as-steps.json');

                    const step = report.suites[0].suites[0].suites[0].specs[0].tests[0].results[0].steps[0]

                    expect(step.duration).to.be.greaterThanOrEqual(0);
                    expect(step.title).to.equal(`Alice greets the World`);

                    expect(step.steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(step.steps[0].title).to.equal(`Alice logs: 'Hello World!'`);
                }));

        it('used with custom nested tasks', () =>
            playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/nested-tasks-as-steps.json',
                'screenplay/step-reporting/nested-tasks-as-steps.spec.ts'
            )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/screenplay/nested-tasks-as-steps.json');

                    const step = report.suites[0].suites[0].suites[0].specs[0].tests[0].results[0].steps[0]

                    expect(step.duration).to.be.greaterThanOrEqual(0);
                    expect(step.title).to.equal(`Alice greets the World`);

                    expect(step.steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(step.steps[0].title).to.equal(`Alice prints: Hello World!`);

                    expect(step.steps[0].steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(step.steps[0].steps[0].title).to.equal(`Alice logs: 'Hello World!'`);
                }));

        it('used with custom tasks with nested web interactions', () =>
            playwrightTest(
                '--project=default',
                '--reporter=json:output/screenplay/nested-tasks-with-web-interactions-as-steps.json',
                '--reporter=html:output/screenplay/nested-tasks-with-web-interactions-as-steps',
                'screenplay/step-reporting/nested-tasks-with-web-interactions-as-steps.spec.ts'
            )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/screenplay/nested-tasks-with-web-interactions-as-steps.json');

                    const steps = report.suites[0].suites[0].suites[0].specs[0].tests[0].results[0].steps

                    expect(steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(steps[0].title).to.equal(`Serena starts local server on a random port`);

                    expect(steps[1].duration).to.be.greaterThanOrEqual(0);
                    expect(steps[1].title).to.equal(`Serena opens website at the URL of the local server`);

                    expect(steps[1].steps[0].duration).to.be.greaterThanOrEqual(0);
                    expect(steps[1].steps[0].title).to.equal(`Serena navigates to the URL of the local server`);
                }));
    })
});

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', pathToFile), { encoding: 'utf8' }));
}
