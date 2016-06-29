///<reference path="cucumber.d.ts"/>

import {Listener, EventListener, events} from "cucumber";
import {Serenity} from "../../serenity";
import {Result} from "../../domain";

export function createSerenityListener() : EventListener {

    let self = <any>Listener();

    self.handleBeforeFeaturesEvent = (features: events.FeaturesPayload, callback: ()=>void) => {
        callback();
    };

    self.handleBeforeFeatureEvent = (feature: events.FeaturePayload, callback: ()=>void) => {
        // todo: is this not available for scenario outlines?
        // feature = <events.FeaturePayload>event.getPayloadItem('feature');

        callback();
    };

    self.handleBeforeScenarioEvent = (scenario: events.ScenarioPayload, callback: ()=>void) => {

        Serenity.instance.scenarioStarts(
            scenario.getName(),
            scenario.getFeature().getName(),
            scenario.getUri()
        );

        callback();
    };

    self.handleBeforeStepEvent = (step: events.StepPayload, callback: ()=>void) => {
        if (! step.isHidden()) {
            Serenity.instance.stepStarts(fullNameOf(step));
        }

        callback();
    };

    self.handleStepResultEvent = (result: events.StepResultPayload, callback: ()=>void) => {
        let step   = result.getStep();

        // "before" and "after" steps emit an event, even if they keywords themselves are not present in the test...
        if (! step.isHidden()) {

            Serenity.instance.stepCompleted(
                fullNameOf(step),
                asSerenity(result),
                result.getFailureException()
            );
        }

        callback();
    };

    self.handleAfterStepEvent = (step: events.StepPayload, callback: ()=>void) => {
        callback();
    };

    self.handleScenarioResultEvent = (result: events.ScenarioResultPayload, callback: ()=>void) => {
        let scenario = result.getScenario();

        Serenity.instance.scenarioCompleted(
            scenario.getName(),
            scenario.getFeature().getName(),
            scenario.getUri(),
            asSerenity(result),
            result.getFailureException()
        );

        callback();
    };

    self.handleAfterScenarioEvent = (scenario: events.ScenarioPayload, callback: ()=>void) => {
        Serenity.instance.scenarioFinished(
            scenario.getName(),
            scenario.getFeature().getName(),
            scenario.getUri()
        );

        callback();
    };

    self.handleAfterFeatureEvent = (feature: events.FeaturePayload, callback: ()=>void) => {
        callback();
    };

    self.handleFeaturesResultEvent = (featuresResult: events.FeaturesResultPayload, callback: ()=>void) => {
        callback();
    };

    self.handleAfterFeaturesEvent = (features: events.FeaturesPayload, callback: ()=>void) => {
        callback();
    };

    // --

    function fullNameOf(step: events.StepPayload): string {
        return step.getKeyword() + step.getName()
    }

    function asSerenity(event: {getStatus(): string}): Result {
        switch(event.getStatus()) {
            // case 'ambiguous':       // todo: do we care? will cucumber ever tell us about ambiguous steps?
            //     return 'ambiguousCucumberStatus';
            // case 'undefined':
            //     return 'undefinedCucumberStatus';
            case 'failed':  return Result.FAILURE;
            case 'pending': return Result.PENDING;
            case 'passed':  return Result.SUCCESS;
            case 'skipped': return Result.SKIPPED;
            default: throw new Error(`Couldn't map the '${event.getStatus()}' to a Serenity Result`);
        }
    }

    return self;
}