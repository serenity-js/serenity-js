/* istanbul ignore file */

import { serenity } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { Runner } from 'protractor';

import { ProtractorFrameworkAdapter } from './ProtractorFrameworkAdapter';
import { ProtractorReport } from './reporter';
import { TestRunnerDetector, TestRunnerLoader } from './runner';

/**
 * ## Learn more
 * - [Protractor framework adapters](https://github.com/angular/protractor/blob/master/lib/frameworks/README.md#framework-adapters-for-protractor)
 *
 * @param runner
 * @param specs
 *
 * @group Integration
 */
export function run(runner: Runner, specs: string[]): Promise<ProtractorReport> {
    const cwd = Path.from(runner.getConfig().configDir);

    return new ProtractorFrameworkAdapter(
        serenity,
        runner,
        new TestRunnerDetector(new TestRunnerLoader(cwd, process.pid)),
    ).run(specs);
}
