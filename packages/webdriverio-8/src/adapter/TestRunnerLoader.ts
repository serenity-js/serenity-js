import { ConfigurationError } from '@serenity-js/core';
import type { TestRunnerAdapter } from '@serenity-js/core/lib/adapter/index.js';
import type { ModuleLoader} from '@serenity-js/core/lib/io/index.js';
import { Config, FileFinder, FileSystem, Path } from '@serenity-js/core/lib/io/index.js';

import type { WebdriverIOConfig } from '../config/index.js';

// We define TestRunnerOptions to avoid importing the global WebdriverIO namespace.
// WebdriverIO v8 doesn't offer any more precise type declarations anyway.
interface TestRunnerOptions {
    [key: string]: any;
}

export class TestRunnerLoader {
    private readonly fileSystem: FileSystem;
    private readonly finder: FileFinder;

    constructor(
        private readonly loader: ModuleLoader,
        private readonly cwd: Path,
        private readonly cid: string,
    ) {
        this.fileSystem = new FileSystem(cwd);
        this.finder     = new FileFinder(cwd);
    }

    runnerAdapterFor(config: WebdriverIOConfig): TestRunnerAdapter {
        switch (config?.serenity?.runner) {
            case 'cucumber':
                return this.cucumberAdapter(config?.cucumberOpts);

            case 'jasmine':
                return this.jasmineAdapter(config?.jasmineOpts);

            case 'mocha':
            case undefined:
                return this.mochaAdapter(config?.mochaOpts);

            default:
                throw new ConfigurationError(`"${ config?.serenity?.runner }" is not a supported test runner. Please use "mocha", "jasmine", or "cucumber"`);
        }
    }

    private cucumberAdapter(cucumberOptions?: TestRunnerOptions): TestRunnerAdapter {
        const { CucumberCLIAdapter, CucumberFormat, StandardOutput, TempFileOutput } = this.loader.require('@serenity-js/cucumber/lib/adapter/index.js');

        delete cucumberOptions?.timeout;   // todo: support setting a timeout via config?
        delete cucumberOptions?.parallel;  // WebdriverIO handles that already

        const cleanedCucumberOptions = new Config(cucumberOptions)
            .where('format', values =>
                [].concat(values).map(value => {
                    const format = new CucumberFormat(value);

                    if (format.output === '') {
                        return format.value;
                    }

                    const basename = Path.from(format.output).basename();
                    const filenameParts = basename.split('.');

                    if (filenameParts[0] === basename) {
                        return `${ format.formatter }:${ format.output }.${ this.cid }`;
                    }

                    filenameParts.splice(-1, 0, `${ this.cid }`);

                    return `${ format.formatter }:${ format.output.replace(basename, filenameParts.join('.')) }`;
                })
            ).object();

        // check if we need to free up stdout for any native reporters
        const output = cleanedCucumberOptions?.format?.some(format => new CucumberFormat(format).output === '')
            ? new TempFileOutput(this.fileSystem)
            : new StandardOutput();

        return new CucumberCLIAdapter(cleanedCucumberOptions, this.loader, this.fileSystem, output);
    }

    private jasmineAdapter(jasmineOptions: TestRunnerOptions): TestRunnerAdapter {
        const { JasmineAdapter } = this.loader.require('@serenity-js/jasmine/adapter')
        return new JasmineAdapter(jasmineOptions, this.loader);
    }

    private mochaAdapter(mochaOptions: TestRunnerOptions): TestRunnerAdapter {
        // todo: update path to mocha adapter too
        const { MochaAdapter } = this.loader.require('@serenity-js/mocha/lib/adapter/index.js')
        return new MochaAdapter(mochaOptions, this.loader);
    }
}
