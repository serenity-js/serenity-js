import { LogicError } from '@serenity-js/core';
import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter';
import type { ModuleLoader } from '@serenity-js/core/lib/io';
import type { Outcome } from '@serenity-js/core/lib/model';
import { ExecutionIgnored, ImplementationPending } from '@serenity-js/core/lib/model';
import * as fs from 'fs';
import * as path from 'path'; // eslint-disable-line unicorn/import-style

import type { MochaConfig } from './MochaConfig';
import type Mocha = require('mocha');

/**
 * Allows for programmatic execution of Mocha test scenarios,
 * using [`SerenityReporterForMocha`](https://serenity-js.org/api/mocha/function/export=/) to report progress.
 *
 * ## Learn more
 * - [`TestRunnerAdapter`](https://serenity-js.org/api/core-adapter/interface/TestRunnerAdapter/)
 *
 * @group Integration
 */
export class MochaAdapter implements TestRunnerAdapter {

    private mocha: Mocha;
    private totalScenarios: number;

    constructor(
        private readonly config: MochaConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    /**
     * Scenario success threshold for this test runner.
     */
    successThreshold(): Outcome | { Code: number } {
        return this.config.strict
            ? ExecutionIgnored
            : ImplementationPending;
    }

    /**
     * Loads test scenarios.
     *
     * @param pathsToScenarios
     */
    async load(pathsToScenarios: string[]): Promise<void> {
        const _Mocha = this.loader.require('mocha');

        this.mocha = new _Mocha({
            ...this.config,
            reporter: require.resolve('../index'),
        });

        this.mocha.fullTrace();

        this.mocha.files = pathsToScenarios;

        this.mocha.suite.on('pre-require', (context: Mocha.MochaGlobals, file: string, mocha: Mocha) => {
            this.requireAny(this.config.require);
        });

        await this.mocha.loadFilesAsync()

        const mochaRunner = new _Mocha.Runner(this.mocha.suite, {
            delay: false,
        });

        if (this.config.grep) {
            mochaRunner.grep(this.mocha.options.grep as RegExp, this.config.invert);
        }

        this.totalScenarios = mochaRunner.total;
    }

    /**
     * Returns the number of loaded scenarios
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If called before `load`
     */
    scenarioCount(): number {
        if (this.totalScenarios === undefined) {
            throw new LogicError('Make sure to call `load` before calling `scenarioCount`');
        }

        return this.totalScenarios;
    }

    /**
     * Runs loaded test scenarios.
     *
     * @throws [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     *  If called before `load`
     */
    run(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.mocha === undefined) {
                throw new LogicError('Make sure to call `load` before calling `run`');
            }

            this.mocha.run(numberOfFailures => resolve())
        });
    }

    private requireAny(filesOrModules: string | string[]) {
        const requires = filesOrModules
            ? [].concat(filesOrModules).filter(item => !! item)
            : [];

        requires.forEach(fileOrModule => {
            const required = fs.existsSync(fileOrModule) || fs.existsSync(`${ fileOrModule }.js`)
                ? path.resolve(fileOrModule)    // local file
                : fileOrModule;                 // module

            require(required);
        });
    }
}
