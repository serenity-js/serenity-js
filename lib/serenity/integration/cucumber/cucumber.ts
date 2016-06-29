///<reference path="cucumber.d.ts"/>

import {Listener, EventListener, events} from "cucumber";
import {Serenity} from "../../serenity";
import {Result} from "../../domain";

export function createSerenityListener() : EventListener {

    let self = <any>Listener();

    let feature = null;

    self.handleBeforeFeaturesEvent = (event: events.Event, callback: ()=>void) => {
        // let features = <events.FeaturesPayload>event.getPayloadItem('features');
        
        callback();
    };

    self.handleBeforeFeatureEvent = (event: events.Event, callback: ()=>void) => {
        // todo: is this not available for scenario outlines?
        feature = <events.FeaturePayload>event.getPayloadItem('feature');

        callback();
    };

    self.handleBeforeScenarioEvent = (event: events.Event, callback: ()=>void) => {
        let scenario = <events.ScenarioPayload>event.getPayloadItem('scenario');

        Serenity.instance.scenarioStarts(
            scenario.getName(),
            feature.getName(),  // todo: should this be a "user story" object?
            scenario.getUri()
        );

        callback();
    };

    self.handleBeforeStepEvent = (event: events.Event, callback: ()=>void) => {
        let step = <events.StepPayload>event.getPayloadItem('step');

        Serenity.instance.stepStarts(`${step.getKeyword()} ${step.getName()}`);

        callback();
    };

    self.handleStepResultEvent = (event: events.Event, callback: ()=>void) => {
        let result = <events.StepResultPayload>event.getPayloadItem('stepResult'),
            step   = result.getStep();

        // "before" and "after" steps emit an event, even if they keywords themselves are not present in the test...
        if (! step.isHidden()) {

            Serenity.instance.stepCompleted(
                `${step.getKeyword()} ${step.getName()}`,
                asSerenity(result),
                result.getFailureException()
            );
        }

        callback();
    };

    self.handleAfterStepEvent = (event: events.Event, callback: ()=>void) => {
        // let step = <events.StepPayload>event.getPayloadItem('step');

        callback();
    };

    self.handleScenarioResultEvent = (event: events.Event, callback: ()=>void) => {
        let result = <events.ScenarioResultPayload>event.getPayloadItem('scenarioResult'),
            scenario = result.getScenario();

        Serenity.instance.scenarioCompleted(
            scenario.getName(),
            feature.getName(),
            scenario.getUri(),
            asSerenity(result),
            result.getFailureException()
        );

        callback();
    };

    self.handleAfterScenarioEvent = (event: events.Event, callback: ()=>void) => {
        let scenario = <events.ScenarioPayload>event.getPayloadItem('scenario');

        Serenity.instance.scenarioFinished(
            scenario.getName(),
            feature.getName(),
            scenario.getUri()
        );

        callback();
    };

    self.handleAfterFeatureEvent = (event: events.Event, callback: ()=>void) => {
        // let feature = <events.FeaturePayload>event.getPayloadItem('feature');

        callback();
    };

    self.handleFeaturesResultEvent = (event: events.Event, callback: ()=>void) => {
        let featuresResult = <events.FeaturesResultPayload>event.getPayloadItem('featuresResult');

        callback();
    };

    self.handleAfterFeaturesEvent = (event: events.Event, callback: ()=>void) => {
        let features = <events.FeaturesPayload>event.getPayloadItem('features');

        callback();
    };

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