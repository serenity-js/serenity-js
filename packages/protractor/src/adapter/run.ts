/* istanbul ignore file */

import { serenity } from '@serenity-js/core';
import { FileFinder, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import { Runner } from 'protractor';
import { ProtractorFrameworkAdapter } from './ProtractorFrameworkAdapter';
import { ProtractorReport } from './reporter';
import { TestRunnerDetector } from './TestRunnerDetector';

/**
 * @param {protractor~Runner} runner
 * @param {string[]} specs
 * @returns {Promise<ProtractorReport>}
 *
 * @see https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#framework-adapters-for-protractor
 */
export function run(runner: Runner, specs: string[]): Promise<ProtractorReport> {
    return new ProtractorFrameworkAdapter(
        serenity,
        runner,
        new TestRunnerDetector(Path.from(runner.getConfig().configDir)),
    ).run(specs);
}
