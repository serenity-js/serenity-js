import { serenity } from '@serenity-js/core';
import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

export = function (dependencies: Dependencies) {
    const { Before, AfterAll } = dependencies.cucumber;

    Before(function () {
        return serenity.waitForNextCue();
    });

    AfterAll(function () {
        return serenity.waitForNextCue()
            .then(() => dependencies.notifier.testRunFinished());
    });

    return cucumberEventProtocolAdapter(dependencies);
};
