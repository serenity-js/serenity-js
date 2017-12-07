import { scenarioLifeCycleNotifier } from '../../serenity-cucumber/cucumber_serenity_notifier';

import { serenity } from '@serenity-js/core/src';
import { serenityBDDReporter } from '@serenity-js/core/src/reporting/serenity_bdd_reporter';

import * as cucumber from 'cucumber';

serenity.configure({
    crew: [
        serenityBDDReporter(),
    ],
});

export = function() {
    this.registerListener(scenarioLifeCycleNotifier());
    this.registerListener(Object.assign(cucumber.Listener(), {
        handleAfterFeaturesEvent: (features: any, callback: () => void) => {
            serenity.stageManager().waitForNextCue().then(() => {
                callback();
            });
        },
    }));
};
