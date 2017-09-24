import mocha = require('mocha');
import { serenity } from '@serenity-js/core';
import { endOf, ExecutedScenario, isPending, Scenario, startOf } from './model';

export function SerenityMochaReporter(runner) {
    mocha.reporters.Base.call(this, runner);

    runner.on('test', (scenario: Scenario) => {
        serenity.notify(startOf(scenario));
    });

    runner.on('test end', (scenario: ExecutedScenario) => {
        if (isPending(scenario)) {
            serenity.notify(startOf(scenario));
        }

        serenity.notify(endOf(scenario));
    });
}
