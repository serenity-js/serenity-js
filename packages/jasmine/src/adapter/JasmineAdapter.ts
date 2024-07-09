import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter/index.js';
import type { ModuleLoader } from '@serenity-js/core/lib/io/index.js';
import type { Outcome } from '@serenity-js/core/lib/model/index.js';
import { ExecutionIgnored } from '@serenity-js/core/lib/model/index.js';

import type { SerenityReporterForJasmineConfig } from '../bootstrap.js';
import reporter from '../index.js';
import type { SpecFilter } from './filters/index.js';
import { AcceptingSpecFilter, CustomFunctionSpecFilter, GrepSpecFilter, InvertedGrepSpecFilter } from './filters/index.js';
import type { JasmineConfig } from './JasmineConfig.js';

/**
 * Allows for programmatic execution of Jasmine test scenarios,
 * using [`SerenityReporterForJasmine`](https://serenity-js.org/api/jasmine/function/default/) to report progress.
 *
 * ## Learn more
 * - [`TestRunnerAdapter`](https://serenity-js.org/api/core-adapter/interface/TestRunnerAdapter/)
 *
 * @group Integration
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

    constructor(
        private readonly config: JasmineConfig,
        private readonly loader: ModuleLoader,
    ) {
    }

    /**
     * Scenario success threshold for this test runner.
     */
    successThreshold(): Outcome | { Code: number } {
        return ExecutionIgnored;
    }

    /**
     * Loads test scenarios.
     *
     * @param pathsToScenarios
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

        const reporterConfig: SerenityReporterForJasmineConfig = this.config.specDir ? { specDirectory: this.config.specDir } : {};
        this.runner.addReporter(reporter(reporterConfig, this.runner.jasmine));

        if (this.config.reporters) {
            this.config.reporters.forEach(reporter => {
                this.runner.addReporter(reporter)
            });
        }

        this.runner.configureDefaultReporter(this.config);

        this.runner.loadRequires();
        this.runner.loadHelpers();

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
        this.runner.addMatchingSpecFiles(pathsToScenarios);

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
     * Returns the number of loaded scenarios
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
     * Runs loaded test scenarios.
     */
    async run(): Promise<void> {
        this.runner.exitOnCompletion = false;
        await this.runner.execute();
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
