import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { before,describe, it } from 'mocha';

import { wdio } from '../src';

describe('HtmlReporter with parallel WebdriverIO 8 workers', function () {

    this.timeout(60_000);

    const outputDirectory = path.resolve(__dirname, '..', 'target', 'html-report-parallel');

    before(() => {
        fs.rmSync(outputDirectory, { recursive: true, force: true });
    });

    it('produces data.js containing all scenarios from multiple workers', () =>
        wdio(
            './examples/wdio.html-reporter-parallel.conf.ts',
            '--spec=examples/parallel_worker_a.spec.ts',
            '--spec=examples/parallel_worker_b.spec.ts',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))  // exitCode 1 because one test deliberately fails
        .then(result => {

            expect(result.exitCode).to.equal(1);

            // Verify data.js was produced
            const dataJsPath = path.join(outputDirectory, 'data.js');
            expect(fs.existsSync(dataJsPath)).to.equal(true);

            // Parse the report data
            const content = fs.readFileSync(dataJsPath, 'utf8');
            const json = content
                .replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '')
                .replace(/;\s*$/, '');
            const reportData = JSON.parse(json);

            // All 4 scenarios from both workers should be present in a single run
            expect(reportData.scenarios).to.have.lengthOf(4);

            const names = reportData.scenarios.map((s: { name: string }) => s.name).sort();
            expect(names).to.deep.equal([
                'Worker A passes test A1',
                'Worker A passes test A2',
                'Worker B fails test B2',
                'Worker B passes test B1',
            ]);

            // Outcomes should reflect all workers' results
            expect(reportData.summary.outcomes.passed).to.equal(3);
            expect(reportData.summary.outcomes.failed).to.equal(1);
            expect(reportData.summary.totalScenarios).to.equal(4);

            // Should be a single run, not multiple phantom history entries
            expect(reportData.history).to.have.lengthOf(1);
        }));
});
