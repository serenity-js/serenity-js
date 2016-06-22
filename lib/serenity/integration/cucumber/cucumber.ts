///<reference path="cucumber.d.ts"/>

import {Listener, Hooks, EventListener, events} from "cucumber";
import {Serenity} from "../../serenity";
import {
    TestIsStarted, TestIsFinished, TestStepIsStarted, TestStepIsFinished,
    TestIsCompleted
} from "../../events/test_lifecycle";
import {Test, TestOutcome, TestResult} from "../../domain";


function createListener() : EventListener {

    let self = <any>Listener();

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

        // todo: StartedTest.of(...)
        // todo: FinishedTest.of(...)
            // todo: StartedTestStep.of(...)
            // todo: FinishedTestStep.of(...)
        
        Serenity.instance.domainEvents().trigger(new TestIsStarted(new Test(
            scenario.getName(),
            scenario.getUri()
        )), TestIsStarted.interface);

        callback();
    };


    function translateToSerenityResult(cucumberStatus: string): TestResult {
        // https://github.com/cucumber/cucumber-js/blob/dc698bf5bc10d591fa7adeec5fa21b2d90dc9679/lib/cucumber/status.js
        switch(cucumberStatus) {
            // case 'ambiguous':       // todo: do we care? will cucumber ever tell us about ambiguous steps?
            //     return 'ambiguousCucumberStatus';
            // case 'undefined':
            //     return 'undefinedCucumberStatus';
            case 'failed':  return TestResult.Failure;
            case 'pending': return TestResult.Pending;
            case 'passed':  return TestResult.Success;
            case 'skipped': return TestResult.Skipped;
        }
    }

    self.handleScenarioResultEvent = (event: events.Event, callback: ()=>void) => {
        let scenarioResult = <events.ScenarioResultPayload>event.getPayloadItem('scenarioResult');

        Serenity.instance.domainEvents().trigger(new TestIsCompleted(new TestOutcome(
            new Test(
                scenarioResult.getScenario().getName(),
                scenarioResult.getScenario().getUri()
            ),
            translateToSerenityResult(scenarioResult.getStatus())
        )), TestIsCompleted.interface);
        
        callback();
    };

    self.handleAfterScenarioEvent = (event: events.Event, callback: ()=>void) => {

        let scenario = <events.ScenarioPayload>event.getPayloadItem('scenario');

        Serenity.instance.domainEvents().trigger(new TestIsFinished(new Test(
            scenario.getName(),
            scenario.getUri()
        )), TestIsFinished.interface);

        callback();
    };

    self.handleBeforeStepEvent = (event: events.Event, callback: ()=>void) => {
        let step = <events.StepPayload>event.getPayloadItem('step');

        // Serenity.instance.domainEvents().trigger(new TestStepIsStarted(), TestStepIsStarted.interface);

        callback();
    };

    self.handleAfterStepEvent = (event: events.Event, callback: ()=>void) => {
        let step = <events.StepPayload>event.getPayloadItem('step');

        // Serenity.instance.domainEvents().trigger(new TestStepIsFinished(), TestStepIsFinished.interface);

        callback();
    };

    self.handleStepResultEvent = (event: events.Event, callback: ()=>void) => {
        let stepResult = <events.FeaturesResultPayload>event.getPayloadItem('stepResult');

        callback();
    };

    return self;
}


export = function() {
    let hook = <Hooks>this;

    hook.registerListener(createListener());
}


// function inspect(event: events.Event, o: any) {
//     console.log("Methods on", event.getName());
//
//     Object.keys(o).forEach((key) => {
//         console.log(o[key].toString());
//     });
// }


// export = function() {
//     var hook = <Hooks>this;
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