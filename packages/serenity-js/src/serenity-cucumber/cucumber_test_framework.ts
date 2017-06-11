import { attemptToRequire } from '@serenity-js/core/lib/io/attempt_require';
import { TestFrameworkAdapter } from '../serenity-protractor/framework';

import _ = require('lodash');
import glob = require('glob');
import path = require('path');

export class CucumberTestFramework implements TestFrameworkAdapter {

    private args: string[] = [];

    constructor(private requireRoot: string, config: CucumberConfig) {
        this.args = ['node', 'cucumberjs'].
            concat([ '--require', this.serenityCucumberModule() ]).
            concat([ '--require', this.stageCue() ]).
            concat(this.argumentsFrom(config));
    }

    run(specs: string[]): PromiseLike<any> {

        return new Promise((resolve, reject) => {
            const Cucumber = attemptToRequire('cucumber');

            Cucumber.Cli(this.args.concat(specs)).run(wasSuccessful => {
                if (wasSuccessful) {
                    resolve(wasSuccessful);
                } else {
                    reject(wasSuccessful);
                }
            });
        });
    }

    private serenityCucumberModule = () => glob.sync(path.resolve(__dirname, '../serenity-cucumber') + '/index.?s').pop();
    private stageCue = () => glob.sync(path.resolve(__dirname, '../serenity-cucumber') + '/stage_cue.?s').pop();

    private argumentsFrom(config: CucumberConfig): string[]{
        const resolveGlobs = (path: string)       => glob.sync(path, { cwd: this.requireRoot });
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
    format?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#format-options
     */
    formatOptions?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#running-specific-features
     */
    name?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#profiles
     */
    profile?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#requiring-support-files
     */
    require?: string[];

    /**
     * @link https://docs.cucumber.io/tag-expressions/
     */
    tags?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: string;
}
