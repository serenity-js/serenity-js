import { serenity } from '@serenity-js/core';
import { ModuleLoader } from '@serenity-js/core/lib/io';
import { Runner } from 'protractor';
import { ProtractorFrameworkAdapter } from './ProtractorFrameworkAdapter';
import { ProtractorReport } from './reporter';
import { TestRunnerDetector } from './TestRunnerDetector';

/**
 * todo: write integration tests
 *
 * @see https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/README.md#framework-adapters-for-protractor
 */
export function run(runner: Runner, specs: string[]): Promise<ProtractorReport> {
    return new ProtractorFrameworkAdapter(
        serenity,
        runner,
        new TestRunnerDetector(new ModuleLoader(process.cwd())),
    ).run(specs);
}
