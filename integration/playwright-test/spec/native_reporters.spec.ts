import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { TestRunFinished, TestRunStarts } from '@serenity-js/core/lib/events';
import * as fs from 'fs';
import { describe, it } from 'mocha';
import * as path from 'path';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60_000);

    describe('supports native Playwright JSON reporter when', () => {

        it('is used with non-Screenplay scenarios', () =>
            playwrightTest('--project=default', '--reporter=json:output/json-reporter/non-screenplay.json', 'native-reporters/passing-non-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/json-reporter/non-screenplay.json');

                    expect(report.errors).to.deep.equal([]);
                }));

        it('is used with Screenplay scenarios', () =>
            playwrightTest('--project=default', '--reporter=json:output/json-reporter/screenplay.json', 'native-reporters/passing-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const report = jsonFrom('output/json-reporter/screenplay.json');

                    expect(report.errors).to.deep.equal([]);
                }));
    });

    describe('supports native Playwright HTML reporter when', () => {

        it('is used with non-Screenplay scenarios', () =>
            playwrightTest('--project=default', '--reporter=html:output/html-reporter/non-screenplay', 'native-reporters/passing-non-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;
                }));

        it('is used with Screenplay scenarios', () =>
            playwrightTest('--project=default', '--reporter=html:output/html-reporter/screenplay', 'native-reporters/passing-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);
                    expect(result.stderr).to.be.equal('');

                    PickEvent.from(result.events)
                    PickEvent.from(result.events)
                        .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;
                }));
    });
});

function jsonFrom(pathToFile: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', pathToFile), { encoding: 'utf8' }));
}
