import { serenity } from '@serenity-js/core';
import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

export = function (dependencies: Dependencies) {

    dependencies.cucumber.defineSupportCode(({ Before, AfterAll }) => {
        Before(function () {
            return serenity.waitForNextCue();
        });

        AfterAll(function () {
            return serenity.waitForNextCue()
                .then(() => dependencies.notifier.testRunFinished());
        });
    });

    return cucumberEventProtocolAdapter(dependencies);
};
