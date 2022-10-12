import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = function (dependencies: Dependencies) {
    const { BeforeAll, After, AfterAll } = dependencies.cucumber;

    BeforeAll(function () {
        dependencies.notifier.testRunStarts();
    });

    After(function () {
        dependencies.notifier.scenarioFinishes();

        return dependencies.serenity.waitForNextCue();
    });

    AfterAll(function () {
        dependencies.notifier.testRunFinishes();

        return dependencies.serenity.waitForNextCue()
            .then(() => {
                dependencies.notifier.testRunFinished();
            });
    });

    return cucumberEventProtocolAdapter(dependencies);
};
