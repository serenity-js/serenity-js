import { ModuleLoader } from '@serenity-js/core/lib/io';
import { JasmineAdapter, JasmineConfig } from '@serenity-js/jasmine/lib/adapter';     // tslint:disable-line:no-submodule-imports
import { TestRunner } from './TestRunner';

export class JasmineTestRunner implements TestRunner {
    constructor(
        private readonly config: JasmineConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    run(pathsToScenarios: string[]): Promise<void> {
        return new JasmineAdapter(this.config, this.loader).run(pathsToScenarios);
    }
}
