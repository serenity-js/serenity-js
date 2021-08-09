import { ModuleLoader, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { ExecutionIgnored, Outcome } from '@serenity-js/core/lib/model';

import { AcceptingSpecFilter, CustomFunctionSpecFilter, GrepSpecFilter, InvertedGrepSpecFilter, SpecFilter } from './filters';
import { JasmineConfig } from './JasmineConfig';
import reporter = require('../index');

/**
 * @desc
 *  Allows for programmatic execution of Jasmine test scenarios,
 *  using {@link SerenityReporterForJasmine} to report progress.
 *
 * @implements {@serenity-js/core/lib/io~TestRunnerAdapter}
 */
export class JasmineAdapter implements TestRunnerAdapter {

    private runner: any;
    private totalScenarios = 0;

    private static readonly defaultConfig = {
        /*
         * Serenity/JS doesn't use Jasmine's assertions, so this mechanism can be disabled
         */
        oneFailurePerSpec: true,

        /*
         * A spec should stop execution as soon as there's a hook or spec failure
         * See https://github.com/angular/protractor/issues/3234
         */
        stopSpecOnExpectationFailure: true,

        /*
         * Default to not executing tests at random.
         * See https://github.com/angular/protractor/blob/4f74a4ec753c97adfe955fe468a39286a0a55837/lib/frameworks/jasmine.js#L76
         */
        random: false,
    };

    /**
     * @param {JasmineConfig} config
     * @param {@serenity-js/core/lib/io~ModuleLoader} loader
     */
    constructor(
        private readonly config: JasmineConfig,
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
        return ExecutionIgnored;
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
        const JasmineRunner = this.loader.require('jasmine');
        this.runner         = new JasmineRunner({ projectBaseDir: '' });

        if (this.config.defaultTimeoutInterval) {
            this.runner.jasmine.DEFAULT_TIMEOUT_INTERVAL = this.config.defaultTimeoutInterval;
        }

        this.runner.clearReporters();

        this.runner.loadConfig(Object.assign(
            JasmineAdapter.defaultConfig,
            this.config,
        ));

        this.runner.addReporter(reporter(this.runner.jasmine));
        this.runner.configureDefaultReporter(this.config);

        this.configureSpecFilter();

        await this.loadSpecs(pathsToScenarios);

        this.countScenarios(this.runner.env.topSuite())
    }

    private configureSpecFilter(): void {
        /*
         * Configure spec filter
         */
        this.runner.env.configure({
            specFilter: spec => this.specFilter().matches(spec.getFullName()),
        })
    }

    private async loadSpecs(pathsToScenarios: string[]): Promise<void> {
        this.runner.specDir     = '';
        this.runner.specFiles   = [];
        this.runner.addSpecFiles(pathsToScenarios);

        await this.runner.loadSpecs();
    }

    private specFilter(): SpecFilter {
        if (this.config.specFilter) {
            return new CustomFunctionSpecFilter(this.config.specFilter);
        }

        if (this.config.grep) {
            return this.config.invertGrep
                ? new InvertedGrepSpecFilter(this.config.grep)
                : new GrepSpecFilter(this.config.grep);
        }

        return new AcceptingSpecFilter();
    }

    /**
     * @desc
     *  Returns the number of loaded scenarios
     *
     * @returns {number}
     */
    scenarioCount(): number {
        return this.totalScenarios;
    }

    private countScenarios(suite: JasmineSuite): void {
        suite.children?.forEach((child) => {
            if (Array.isArray(child.children)) {
                return this.countScenarios(child)
            }
            if (this.specFilter().matches(child.getFullName())) {
                this.totalScenarios++
            }
        })
    }

    /**
     * @desc
     *  Runs loaded test scenarios.
     *
     * @returns {Promise<void>}
     */
    run(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.runner.onComplete((passed: boolean) => resolve());
            this.runner.execute();
        });
    }
}

/**
 * @package
 */
interface JasmineSuite extends JasmineSpec {
    children?: JasmineSuite[]
}

/**
 * @package
 */
interface JasmineSpec {
    getFullName(): string;
}
