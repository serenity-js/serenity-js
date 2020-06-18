import { ModuleLoader } from '@serenity-js/core/lib/io';
import { MochaAdapter, MochaConfig } from '@serenity-js/mocha/lib/adapter';     // tslint:disable-line:no-submodule-imports
import { TestRunner } from './TestRunner';

/**
 * @private
 */
export class MochaTestRunner implements TestRunner {
    constructor(
        private readonly config: MochaConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    run(pathsToScenarios: string[]): Promise<void> {
        return new MochaAdapter(this.config, this.loader).run(pathsToScenarios);
    }
}
