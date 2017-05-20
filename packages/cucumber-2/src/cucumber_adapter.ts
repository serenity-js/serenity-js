import { SerenityConfig } from '@serenity-js/core';
import { TestFrameworkAdapter } from '@serenity-js/core/lib/integration';

import { CucumberOptions } from './cucumber_options';

import _ = require('lodash');
import glob = require('glob');
import path = require('path');

const Cucumber = require('cucumber');   // tslint:disable-line:no-var-requires

export class CucumberAdapter implements TestFrameworkAdapter {

    private argv: string[] = [];

    constructor(private config: SerenityConfig<CucumberOptions>) {
        this.argv = [ 'node', 'cucumberjs' ]
            .concat([ '--require', this.notifier() ])
            .concat([ '--require', this.stageCue() ])
            .concat(this.argumentsFrom(config));
    }

    run = (specs: string[]): PromiseLike<any> => new Cucumber.Cli({
            argv:   this.argv.concat(this.resolved(specs)),
            cwd:    this.config.cwd,
            stdout: process.stdout,
        }).run().then(this.booleanToPromise)

    private notifier = () => glob.sync(path.resolve(__dirname) + '/register.?s').pop();
    private stageCue = () => glob.sync(path.resolve(__dirname) + '/stage_cue.?s').pop();

    private booleanToPromise = (result: boolean) => result ? Promise.resolve(result) : Promise.reject(result);

    private argumentsFrom(config: SerenityConfig<CucumberOptions>): string[] {
        const resolvedConfig = Object.assign({}, config.parameters, { require: this.resolved(config.parameters.require || []) });

        const toCLIArgument  = option => (value: string) => !! value
            ? [ `--${ option }`, value ]
            : [ `--no-${ option }` ];

        return _.chain(resolvedConfig).toPairs().
            flatMap(option => _.castArray(option[ 1 ]).map(toCLIArgument(option[0]))).
            flatten().
            value() as string[];
    }

    private resolved(paths: string[]): string[] {
        const resolveGlobs = (path: string) => glob.sync(path, { cwd: this.config.cwd });

        return _.chain(paths).map(resolveGlobs).flatten().value() as string[];
    }
}
