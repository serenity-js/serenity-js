import { SerenityProtractorFramework, TestFramework } from '../serenity-protractor/framework';

import _ = require('lodash');
import glob = require('glob');
import path = require('path');

// todo: maybe some conditional loading, checking if the module exists?
const Cucumber: any = require('cucumber');   // tslint:disable-line:no-var-requires

export class CucumberTestFramework implements TestFramework {

    constructor(private serenity: SerenityProtractorFramework, private config: CucumberConfig) {
    }

    run(specs: string[]): PromiseLike<any> {

        // so that it works with ts-node and with TypeScript transpiled to JavaScript
        let serenityCucumber = glob.sync(path.resolve(__dirname, '../serenity-cucumber') + '/index.?s').pop();

        let args = ['node', 'cucumberjs'].
            concat([ '--require', serenityCucumber ]).
            concat(this.argumentsFrom(this.config)).
            concat(specs);

        return new Promise((resolve, reject) => {
            Cucumber.Cli(args).run(wasSuccessful => {
                if (wasSuccessful) {
                    resolve(wasSuccessful);
                } else {
                    reject(wasSuccessful);
                }
            });
        });
    }

    private argumentsFrom (config: CucumberConfig): string[]{
        const resolveGlobs = (path: string)       => glob.sync(path, { cwd: this.serenity.config.configDir });
        const resolvePaths = (globPath: string[]) => _.chain(globPath).map(resolveGlobs).flatten().value();

        const resolvedConfig = Object.assign({}, config, { require: resolvePaths(config.require || []) } );

        return _.chain(resolvedConfig).toPairs().
            flatMap(option => _.castArray(option[1]).map(param => [`--${ option[0]}`, param])).
            flatten().
            value() as string[];
    }
}

export interface CucumberConfig {
    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#transpilers
     */
    compiler?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats
     */
    format?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#format-options
     */
    formatOptions: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#running-specific-features
     */
    name?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#profiles
     */
    profile: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#requiring-support-files
     */
    require?: string[];

    /**
     * @link https://docs.cucumber.io/tag-expressions/
     */
    tags: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters: string;
}
