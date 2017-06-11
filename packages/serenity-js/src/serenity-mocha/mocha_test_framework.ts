import { serenity } from '@serenity-js/core';
import { attemptToRequire } from '@serenity-js/core/lib/io';

import { TestFrameworkAdapter } from '../serenity-protractor/framework';
import { wrapped } from './controlflow';
import { endOf, ExecutedScenario, isPending, Scenario, startOf } from './model';

import _ = require('lodash');
import glob = require('glob');
import path = require('path');

import { MochaConfig } from './mocha_config';

export class MochaTestFramework implements TestFrameworkAdapter {

    private mocha;

    constructor(private config: MochaConfig) {
        const Mocha = attemptToRequire('mocha');
        this.mocha = new Mocha(config);

        this.registerCompilerIfNeeded(config.compiler);

        this.mocha.suite.on('pre-require', () => {
            const g: any = global;

            g.after      = wrapped(g.after);
            g.afterEach  = wrapped(g.afterEach);
            g.before     = wrapped(g.before);
            g.beforeEach = wrapped(g.beforeEach);

            g.it         = wrapped(g.it);
            g.it.only    = wrapped(g.iit);
            g.it.skip    = wrapped(g.xit);
        });

        this.mocha.loadFiles();
    }

    run(specs: string[]): PromiseLike<any> {

        return new Promise((resolve, reject) => {

            specs.forEach(file => this.mocha.addFile(file));

            this.mocha.addFile(this.stageCue());

            const mochaRunner = this.mocha.run(numberOfFailures => {

                if (numberOfFailures > 0) {
                    reject(`Tests failed: ${ numberOfFailures }`);
                }
                else {
                    resolve();
                }
            });

            mochaRunner.on('test', (scenario: Scenario) => {
                serenity.notify(startOf(scenario));
            });

            mochaRunner.on('test end', (scenario: ExecutedScenario) => {
                if (isPending(scenario)) {
                    serenity.notify(startOf(scenario));
                }

                serenity.notify(endOf(scenario));
            });
        });
    }

    // waits with starting a new scenario until the stage cue
    // see https://github.com/angular/protractor/issues/4087
    private stageCue = () => glob.sync(__dirname + '/stage_cue.?s').pop();

    private registerCompilerIfNeeded(compiler: string): void {
        if (!! compiler && !! ~compiler.indexOf(':')) {
            const [ , module ] = compiler.split(':');

            attemptToRequire(module);
        }
    }
}
