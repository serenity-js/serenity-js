///<reference path="cucumber.d.ts"/>

import {Listener, Hooks, EventListener, events} from "cucumber";

function createSerenityReporter() : EventListener {

    let self = <any>Listener();

    function inspect(event: events.Event, o: any) {
        console.log("Methods on", event.getName());

        Object.keys(o).forEach((key) => {
            console.log(o[key].toString());
        });
    }

    self.handleBeforeFeaturesEvent = (event: events.Event, callback: ()=>void) => {
        let features = <events.FeaturesPayload>event.getPayloadItem('features');
        
        callback();
    };

    self.handleAfterFeaturesEvent = (event: events.Event, callback: ()=>void) => {
        let features = <events.FeaturesPayload>event.getPayloadItem('features');

        callback();
    };

    self.handleFeaturesResultEvent = (event: events.Event, callback: ()=>void) => {
        let featuresResult = <events.FeaturesResultPayload>event.getPayloadItem('featuresResult');

        callback();
    };

    self.handleBeforeFeatureEvent = (event: events.Event, callback: ()=>void) => {
        let feature = <events.FeaturePayload>event.getPayloadItem('feature');

        callback();
    };

    self.handleAfterFeatureEvent = (event: events.Event, callback: ()=>void) => {
        let feature = <events.FeaturePayload>event.getPayloadItem('feature');

        callback();
    };

    self.handleBeforeScenarioEvent = (event: events.Event, callback: ()=>void) => {
        let scenario = <events.ScenarioPayload>event.getPayloadItem('scenario');

        callback();
    };

    self.handleAfterScenarioEvent = (event: events.Event, callback: ()=>void) => {

        let scenario = <events.ScenarioPayload>event.getPayloadItem('scenario');

        callback();
    };

    self.handleScenarioResultEvent = (event: events.Event, callback: ()=>void) => {
        let scenarioResult = <events.ScenarioResultPayload>event.getPayloadItem('scenarioResult');

        callback();
    };

    self.handleBeforeStepEvent = (event: events.Event, callback: ()=>void) => {
        let step = <events.StepPayload>event.getPayloadItem('step');

        callback();
    };

    self.handleAfterStepEvent = (event: events.Event, callback: ()=>void) => {
        let step = <events.StepPayload>event.getPayloadItem('step');

        callback();
    };

    self.handleStepResultEvent = (event: events.Event, callback: ()=>void) => {
        let stepResult = <events.FeaturesResultPayload>event.getPayloadItem('stepResult');

        callback();
    };


    // event bus
    // http://stackoverflow.com/questions/12881212/does-typescript-support-events-on-classes

    return self;
}


export = function() {
    let hook = <Hooks>this;

    hook.registerListener(createSerenityReporter());
}


// export = function() {
//     var hook = <Hooks>this;
//
//
//
//     hook.Before(function(scenario: Scenario){
//         console.log("[CUCUMBER] Before Scenario '", scenario.getName(), "'");
//     });
//
//     hook.After(function(scenario: Scenario) {
//         console.log("[CUCUMBER] After Scenario '", scenario.getName(), "'");
//     });
//
//     hook.Around(function(scenario: Scenario) {
//         console.log("[CUCUMBER] Around Scenario '", scenario.getName(), "'");
//     });
//
//     hook.registerHandler('BeforeFeatures', function (event, callback) {
//         console.log("[CUCUMBER] Before Features");
//         callback();
//     });
//
//     hook.registerHandler('BeforeFeature', function (event, callback) {
//         let feature = event.getPayloadItem('feature');
//         console.log("[CUCUMBER] Before Feature", event);
//         callback();
//     });
//
//     hook.registerHandler('AfterScenario', function (event, callback) {
//         console.log("[CUCUMBER] After Scenario", event);
//         callback();
//     });
//
//     hook.registerHandler('StepResult', function (event, callback) {
//         var stepResult = event.getPayloadItem('stepResult');
//
//         console.log("[CUCUMBER] Step Result", stepResult);
//         callback();
//     });
// }