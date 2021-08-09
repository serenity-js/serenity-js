/* istanbul ignore file */
import { LogicError } from '@serenity-js/core';
import { ModuleLoader, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { ExecutionIgnored, ImplementationPending, Outcome } from '@serenity-js/core/lib/model';
import * as fs from 'fs';
import * as path from 'path'; // eslint-disable-line unicorn/import-style

import { MochaConfig } from './MochaConfig';
import type Mocha = require('mocha');

/**
 * @desc
 *  Allows for programmatic execution of Mocha test scenarios,
 *  using {@link SerenityReporterForMocha} to report progress.
 *
 * @implements {@serenity-js/core/lib/io~TestRunnerAdapter}
 */
export class MochaAdapter implements TestRunnerAdapter {

    private mocha: Mocha;
    private totalScenarios: number;

    /**
     * @desc
     *  test
     * @param {MochaConfig} config
     * @param {@serenity-js/core/lib/io~ModuleLoader} loader
     */
    constructor(
        private readonly config: MochaConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    /**
     * @desc
     *  Scenario success threshold for this test runner.
     *
     * @returns {Outcome | { Code: number }}
     */
    successThreshold(): Outcome | { Code: number } {
        return this.config.strict
            ? ExecutionIgnored
            : ImplementationPending;
    }

    /**
     * @desc
     *  Loads test scenarios.
     *
     * @param {string[]} pathsToScenarios
     *
     * @returns {Promise<void>}
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

        const mochaRunner = new _Mocha.Runner(this.mocha.suite, false);

        if (this.config.grep) {
            mochaRunner.grep(this.mocha.options.grep as RegExp, this.config.invert);
        }

        this.totalScenarios = mochaRunner.total;
    }

    /**
     * @desc
     *  Returns the number of loaded scenarios
     *
     * @throws {@serenity-js/core/lib/errors~LogicError}
     *  If called before `load`
     *
     * @returns {number}
     */
    scenarioCount(): number {
        if (this.totalScenarios === undefined) {
            throw new LogicError('Make sure to call `load` before calling `scenarioCount`');
        }

        return this.totalScenarios;
    }

    /**
     * @desc
     *  Runs loaded test scenarios.
     *
     * @throws {LogicError}
     *  If called before `load`
     *
     *
     * @returns {Promise<void>}
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
