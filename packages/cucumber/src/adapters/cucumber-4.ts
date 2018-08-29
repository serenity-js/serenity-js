import { serenity } from '@serenity-js/core';
import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

export = function(dependencies: Dependencies) {
    const { After, AfterAll } = dependencies.cucumber;

    After(function() {
        return serenity.stageManager.waitForNextCue();
    });

    AfterAll(function() {
        dependencies.notifier.testRunFinished();
        return serenity.stageManager.waitForNextCue();
    });

    return cucumberEventProtocolAdapter(dependencies);
};
