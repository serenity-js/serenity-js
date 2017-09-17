import { serenity } from '@serenity-js/core';

import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts } from '@serenity-js/core/lib/domain';
import * as Cucumber from 'cucumber';

import { activityFrom, errorIfPresentIn, outcome, sceneFrom } from './adapters';

const cucumber = require('cucumber');   // tslint:disable-line:no-var-requires

type Callback = (error?: Error) => void;

export const adapter = cucumber.Listener({ timeout: serenity.config.stageCueTimeout });

adapter.handleBeforeScenarioEvent = function(scenario: Cucumber.events.ScenarioPayload, callback: Callback) {
    serenity.notify(new SceneStarts(sceneFrom(scenario)));

    callback();
};

adapter.handleBeforeStepEvent = function(step: Cucumber.events.StepPayload, callback: () => void) {
    if (! step.isHidden()) {
        serenity.notify(new ActivityStarts(activityFrom(step)));
    }

    callback();
};

adapter.handleStepResultEvent = function(result: Cucumber.events.StepResultPayload, callback: () => void) {
    const step = result.getStep();

    // "before" and "after" steps emit an event even if the keywords themselves are not present in the scenario...
    if (!step.isHidden()) {
        serenity.notify(new ActivityFinished(outcome(activityFrom(step), result.getStatus(), errorIfPresentIn(result))));
    }

    callback();
};

adapter.handleScenarioResultEvent = function(result: Cucumber.events.ScenarioResultPayload, callback: () => void) {
    const scenario = result.getScenario();

    serenity.notify(new SceneFinished(outcome(sceneFrom(scenario), result.getStatus(), errorIfPresentIn(result))));

    callback();
};

adapter.handleAfterScenarioEvent = function(scenario: Cucumber.events.ScenarioPayload, callback: Callback) {
    serenity.stageManager().waitForNextCue().then(() => callback(), error => callback(error));
};

// cucumber.Listener API:
//   handleAfterStepEvent      (step: events.StepPayload, callback: () => void) => callback();
//   handleBeforeFeaturesEvent (features: events.FeaturesPayload, callback: () => void) => callback();
//   handleBeforeFeatureEvent  (feature: events.FeaturePayload, callback: () => void) => callback();
//   handleAfterScenarioEvent  (scenario: events.ScenarioPayload, callback: () => void) => callback();
//   handleAfterFeatureEvent   (feature: events.FeaturePayload, callback: () => void) => callback();
//   handleFeaturesResultEvent (featuresResult: events.FeaturesResultPayload, callback: () => void) => callback();
//   handleAfterFeaturesEvent  (features: events.FeaturesPayload, callback: () => void) => callback();
