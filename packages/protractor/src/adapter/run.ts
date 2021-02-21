/* istanbul ignore file */

import { serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Runner } from 'protractor';
import { ProtractorFrameworkAdapter } from './ProtractorFrameworkAdapter';
import { ProtractorReport } from './reporter';
import { TestRunnerDetector, TestRunnerLoader } from './runner';

/**
 * @param {protractor~Runner} runner
 * @param {string[]} specs
 * @returns {Promise<ProtractorReport>}
 *
 * @see https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#framework-adapters-for-protractor
 */
export function run(runner: Runner, specs: string[]): Promise<ProtractorReport> {
    const cwd = Path.from(runner.getConfig().configDir);

    return new ProtractorFrameworkAdapter(
        serenity,
        runner,
        new TestRunnerDetector(new TestRunnerLoader(cwd, process.pid)),
    ).run(specs);
}
