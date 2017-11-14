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
                    reject(new Error('Cucumber test run has failed.'));
                }
            });
        });
    }

    private serenityCucumberModule = () => glob.sync(path.resolve(__dirname, '../serenity-cucumber') + '/index.?s').pop();
    private stageCue = () => glob.sync(path.resolve(__dirname, '../serenity-cucumber') + '/stage_cue.?s').pop();

    private argumentsFrom(config: CucumberConfig): string[] {
        const resolveGlobs = (path: string)       => glob.sync(path, { cwd: this.requireRoot });
        const resolvePaths = (globPath: string[]) => _.chain(globPath).map(resolveGlobs).flatten().value();

        const resolvedConfig = Object.assign({}, config, { require: resolvePaths(config.require || []) } );

        const cleanUpFlags = (option: [string, string]) => {
            switch (option[1]) {
                case 'true':  return [option[0]];
                case 'false': return [option[0], false];
                default:      return option;
            }
        };

        const onlyApplicableOptions = (option: [string, any]) => option[1] !== false;

        return _.chain(resolvedConfig).toPairs().
            flatMap(option => _.castArray(option[1]).map(param => [`--${ option[0]}`, param])).
            map(cleanUpFlags).filter(onlyApplicableOptions).
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
     * @link https://github.com/angular/protractor/blob/e5a5d59fcabe15860b30944e714bbd8e81ceaeae/docs/frameworks.md#using-cucumber
     */
    strict?: boolean;

    'no-colors'?: boolean;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: string;
}
