import { serenity } from '@serenity-js/core';
import * as cucumber from 'cucumber';
import * as gherkin from 'gherkin';

import { Notifier } from './Notifier';

type Callback = (error?: Error) => void;

const notifier = new Notifier(serenity.stageManager);

export const listener = [

    function handleBeforeFeaturesEvent(features: cucumber.events.FeaturesPayload, callback: Callback) {
        callback();
    },

    function handleBeforeFeatureEvent(feature: cucumber.events.FeaturePayload, callback: Callback) {
        callback();
    },

    function handleBeforeScenarioEvent(scenario: cucumber.events.ScenarioPayload, callback: Callback) {
        notifier.scenarioStarts(scenario);
        callback();
    },

    function handleBeforeStepEvent(step: cucumber.events.StepPayload, callback: Callback) {
        notifier.stepStarts(step);
        callback();
    },

    function handleStepResultEvent(result: cucumber.events.StepResultPayload, callback: Callback) {
        notifier.stepFinished(result);
        callback();
    },

    function handleAfterStepEvent(step: cucumber.events.StepPayload, callback: Callback) {
        callback();
    },

    function handleScenarioResultEvent(result: cucumber.events.ScenarioResultPayload, callback: Callback) {
        notifier.scenarioFinished(result);
        callback();
    },

    function handleAfterScenarioEvent(scenario: cucumber.events.ScenarioPayload, callback: Callback) {
        serenity.stageManager.waitForNextCue().then(() => callback, error => callback(error));

        callback();
    },

    function handleAfterFeatureEvent(feature: cucumber.events.FeaturePayload, callback: Callback) {
        callback();
    },

    function handleFeaturesResultEvent(featuresResult: cucumber.events.FeaturesResultPayload, callback: Callback) {
        callback();
    },

    function handleAfterFeaturesEvent(features: cucumber.events.FeaturesPayload, callback: Callback) {
        callback();
    },
].reduce((cucumberListener, handler) => {
    cucumberListener[ handler.name ] = handler;
    return cucumberListener;
}, cucumber.Listener());
