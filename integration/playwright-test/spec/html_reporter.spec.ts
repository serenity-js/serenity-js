import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { TestRunFinished, TestRunStarts } from '@serenity-js/core/events';
import { beforeEach, describe, it } from 'mocha';

import { playwrightTestWithHtmlReporter } from '../src/playwright-test-with-html-reporter';

describe('@serenity-js/html-reporter', function () {

    this.timeout(60_000);

    const outputDirectory = path.resolve(__dirname, '../output/html-report');

    beforeEach(() => {
        // Clean output directory before each test
        fs.rmSync(outputDirectory, { recursive: true, force: true });
    });

    describe('produces a report when', () => {

        it('a test scenario passes', () =>
            playwrightTestWithHtmlReporter('--project=default', 'native-reporters/passing-non-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(TestRunStarts, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    // Verify output directory structure
                    expect(fs.existsSync(path.join(outputDirectory, 'index.html'))).to.equal(true);
                    expect(fs.existsSync(path.join(outputDirectory, 'data.js'))).to.equal(true);

                    // Verify test-runs directory was created with a timestamped subdirectory
                    const testRunsDirectory = path.join(outputDirectory, 'test-runs');
                    expect(fs.existsSync(testRunsDirectory)).to.equal(true);

                    const runDirectories = fs.readdirSync(testRunsDirectory);
                    expect(runDirectories).to.have.lengthOf(1);

                    // Verify db.json exists in the test run directory
                    const runDirectory = path.join(testRunsDirectory, runDirectories[0]);
                    const databaseJsonPath = path.join(runDirectory, 'db.json');
                    expect(fs.existsSync(databaseJsonPath)).to.equal(true);

                    // Verify db.json content
                    const databaseJson = JSON.parse(fs.readFileSync(databaseJsonPath, 'utf8'));
                    expect(databaseJson).to.have.property('timestamp');
                    expect(databaseJson).to.have.property('scenes').that.is.an('array').with.length.greaterThan(0);
                    expect(databaseJson).to.have.property('testRunner', 'Playwright');
                    expect(databaseJson).to.have.property('testRunnerVersion').that.matches(/^\d+\.\d+\.\d+/);

                    // Verify data.js content
                    const dataJs = fs.readFileSync(path.join(outputDirectory, 'data.js'), 'utf8');
                    expect(dataJs).to.contain('window.__SERENITY_REPORT_DATA__');

                    // Verify index.html is the bundled template (no CDN references)
                    const indexHtml = fs.readFileSync(path.join(outputDirectory, 'index.html'), 'utf8');
                    expect(indexHtml).not.to.contain('cdn.jsdelivr.net');
                    expect(indexHtml).not.to.contain('esm.sh');
                }));

        it('accumulates history across multiple runs', () =>
            playwrightTestWithHtmlReporter('--project=default', 'native-reporters/passing-non-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(() =>
                    // Run a second time
                    playwrightTestWithHtmlReporter('--project=default', 'native-reporters/passing-non-screenplay.spec.ts')
                )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    // Two test run directories should exist
                    const testRunsDirectory = path.join(outputDirectory, 'test-runs');
                    const runDirectories = fs.readdirSync(testRunsDirectory);
                    expect(runDirectories).to.have.lengthOf(2);

                    // data.js should contain history with 2 entries
                    const dataJs = fs.readFileSync(path.join(outputDirectory, 'data.js'), 'utf8');
                    const json = dataJs.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, '');
                    const data = JSON.parse(json);
                    expect(data.history).to.have.lengthOf(2);
                }));

        it('does not destroy existing test run data', () =>
            playwrightTestWithHtmlReporter('--project=default', 'native-reporters/passing-non-screenplay.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    // Get the first run directory and add a marker file
                    const testRunsDirectory = path.join(outputDirectory, 'test-runs');
                    const firstRunDirectory = fs.readdirSync(testRunsDirectory)[0];
                    fs.writeFileSync(path.join(testRunsDirectory, firstRunDirectory, 'marker.txt'), 'do-not-delete');

                    return result;
                })
                .then(() =>
                    playwrightTestWithHtmlReporter('--project=default', 'native-reporters/passing-non-screenplay.spec.ts')
                )
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    // Marker file should still exist in the first run directory
                    const testRunsDirectory = path.join(outputDirectory, 'test-runs');
                    const runDirectories = fs.readdirSync(testRunsDirectory).sort();
                    const firstRunDirectory = runDirectories[0];

                    expect(
                        fs.readFileSync(path.join(testRunsDirectory, firstRunDirectory, 'marker.txt'), 'utf8')
                    ).to.equal('do-not-delete');
                }));
    });
});
