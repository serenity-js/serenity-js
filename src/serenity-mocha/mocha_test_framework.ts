import { serenity } from '..';
import { TestFramework } from '../serenity-protractor/framework';
import { wrapped } from './controlflow';
import { endOf, ExecutedScenario, isPending, Scenario, startOf } from './model';

import _ = require('lodash');
import glob = require('glob');
import path = require('path');
import { MochaConfig } from './mocha_config';

export class MochaTestFramework implements TestFramework {

    private mocha;

    constructor(private config: MochaConfig) {
        let Mocha = require('mocha');

        this.mocha = new Mocha(config);

        this.mocha.suite.on('pre-require', function () {
            let g: any = global;

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

            let mochaRunner = this.mocha.run(function (numberOfFailures) {

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
}
