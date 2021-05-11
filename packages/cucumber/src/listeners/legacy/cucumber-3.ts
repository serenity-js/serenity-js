import { cucumberEventProtocolAdapter } from './CucumberEventProtocolAdapter';
import { Dependencies } from './Dependencies';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = function (dependencies: Dependencies) {

    dependencies.cucumber.defineSupportCode(({ BeforeAll, After, AfterAll }) => {
        BeforeAll(function () {
            dependencies.notifier.testRunStarts();
        });

        After(function (event) {
            dependencies.notifier.currentScenarioFinishes(
                dependencies.resultMapper.outcomeFor(
                    event.result.status,
                    event.result.exception,
                )
            );

            return dependencies.serenity.waitForNextCue();
        });

        AfterAll(function () {
            dependencies.notifier.testRunFinishes();

            return dependencies.serenity.waitForNextCue()
                .then(() => {
                    dependencies.notifier.testRunFinished();
                });
        });
    });

    return cucumberEventProtocolAdapter(dependencies);
};
