import { serenity } from '@serenity-js/core';
import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

export = function (dependencies: Dependencies) {
    const { After, AfterAll } = dependencies.cucumber;

    After(function () {
        return serenity.waitForNextCue();
    });

    AfterAll(function () {
        dependencies.notifier.testRunFinished();
        return serenity.waitForNextCue();
    });

    return cucumberEventProtocolAdapter(dependencies);
};
