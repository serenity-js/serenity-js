import { FileFinder, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import { isPlainObject } from 'is-plain-object';
import * as path from 'path'
import { Config } from 'protractor';
import deepmerge = require('deepmerge');

import { TestRunner } from './runners/TestRunner';

/**
 * @private
 */
export class TestRunnerDetector {

    private readonly loader: ModuleLoader;
    private readonly finder: FileFinder;

    static protractorCliOptions() {
        return [
            'cucumberOpts',
            'jasmineNodeOpts',
            'mochaOpts',
        ];
    }

    constructor(cwd: Path) {
        this.loader = new ModuleLoader(cwd.value);
        this.finder = new FileFinder(cwd);
    }

    // todo: when invoking, merge config
    //      Object.assign(
    //          {},
    //          config.cucumberOpts,
    //          config.capabilities.cucumberOpts
    //      )
    runnerFor(config: Config): TestRunner {

        // todo: simplify and introduce a config object with "as(String)", "as(Object)", etc. to avoid issues with undefined
        // todo: and config merge too, using on deepmerge

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

    private useCucumber(config: Config): TestRunner {
        const { CucumberTestRunner } = require('./runners/CucumberTestRunner');

        const correctedConfig = this.withTransformedField(
            config.cucumberOpts || {},
            'require',
            requires => this.asAbsolutePaths(requires),
        );

        return new CucumberTestRunner(
            correctedConfig,
            this.loader,
        );
    }

    private useJasmine(config: Config): TestRunner {
        const { JasmineTestRunner } = require('./runners/JasmineTestRunner');
        return new JasmineTestRunner(config.jasmineNodeOpts, this.loader);
    }

    private useMocha(config: Config): TestRunner {
        const { MochaTestRunner } = require('./runners/MochaTestRunner');
        return new MochaTestRunner(config.mochaOpts, this.loader);
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
