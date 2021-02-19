import { FileFinder, FileSystem, ModuleLoader, Path, TestRunnerAdapter } from '@serenity-js/core/lib/io';
import { StandardOutput, TempFileOutput } from '@serenity-js/cucumber/lib/cli'; // tslint:disable-line:no-submodule-imports
import { isPlainObject } from 'is-plain-object';
import { Config } from 'protractor';

import deepmerge = require('deepmerge');
import { TestRunnerLoader } from './TestRunnerLoader';

/**
 * @private
 */
export class TestRunnerDetector {

    private readonly finder: FileFinder;
    private readonly fileSystem: FileSystem;

    static protractorCliOptions() {
        return [
            'cucumberOpts',
            'jasmineNodeOpts',
            'mochaOpts',
        ];
    }

    constructor(cwd: Path, private readonly testRunnerLoader: TestRunnerLoader = new TestRunnerLoader(new ModuleLoader(cwd.value))) {
        this.finder     = new FileFinder(cwd);
        this.fileSystem = new FileSystem(cwd);
    }

    runnerFor(config: Config): TestRunnerAdapter {

        const
            specifiesRunnerFor = (type: string) =>
                !!config.serenity &&
                !!config.serenity.runner &&
                config.serenity.runner === type;

        switch (true) {
            case specifiesRunnerFor('cucumber'):
                return this.useCucumber(config);
            case specifiesRunnerFor('jasmine'):
                return this.useJasmine(config);
            case specifiesRunnerFor('mocha'):
                return this.useMocha(config);
            case !! config.cucumberOpts:
                return this.useCucumber(config);
            case !! config.mochaOpts:
                return this.useMocha(config);
            case !! config.jasmineNodeOpts:
            default:
                return this.useJasmine(config);
        }
    }

    private useCucumber(config: Config): TestRunnerAdapter {
        const shouldUseSerenityReportingServices   = config?.serenity?.crew?.length > 0;

        /*
         * If we should use Serenity/JS reporting services, take over standard output,
         * so that Cucumber.js progress formatter doesn't pollute the log.
         */
        const output = shouldUseSerenityReportingServices
            ? new StandardOutput()
            : new TempFileOutput(this.fileSystem);

        const correctedConfig = this.withTransformedField(
            config.cucumberOpts || {},
            'require',
            requires => this.asAbsolutePaths(requires),
        );

        return this.testRunnerLoader.forCucumber(correctedConfig, output);
    }

    private useJasmine(config: Config): TestRunnerAdapter {
        return this.testRunnerLoader.forJasmine(config.jasmineNodeOpts || {});
    }

    private useMocha(config: Config): TestRunnerAdapter {
        return this.testRunnerLoader.forMocha(config.mochaOpts || {});
    }

    private withTransformedField<T extends object, K extends keyof T>(obj: T, key: K, fn: (value: T[K]) => T[K]): T {
        if (! obj[key]) {
            return obj;
        }

        const override = {
            [key]: fn(obj[key]),
        } as unknown as Partial<T>;

        return deepmerge<T>(obj, override, {
            isMergeableObject: isPlainObject,
        });
    }

    private asAbsolutePaths(requires: string[] | string | undefined): string[] {
        return this.finder.filesMatching(requires).map(p => p.value);
    }
}
