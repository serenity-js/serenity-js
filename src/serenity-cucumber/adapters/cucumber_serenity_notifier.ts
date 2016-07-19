import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts } from '../../serenity/domain/events';
import { Activity, Outcome, Result, Scene } from '../../serenity/domain/model';
import { Serenity } from '../../serenity/serenity';
import { EventListener, Listener, events } from 'cucumber';

export function scenarioLifeCycleNotifier(): EventListener {

    let self = <any> Listener();

    self.handleBeforeScenarioEvent = (scenario: events.ScenarioPayload, callback: () => void) => {

        Serenity.notify(new SceneStarts(sceneFrom(scenario)));

        callback();
    };

    self.handleBeforeStepEvent = (step: events.StepPayload, callback: () => void) => {
        if (!step.isHidden()) {
            Serenity.notify(new ActivityStarts(activityFrom(step)));
        }

        callback();
    };

    self.handleStepResultEvent = (result: events.StepResultPayload, callback: () => void) => {
        let step = result.getStep();

        // "before" and "after" steps emit an event even if they keywords themselves are not present in the test...
        if (!step.isHidden()) {
            Serenity.notify(new ActivityFinished(new Outcome(activityFrom(step), translated(result), result.getFailureException())));
        }

        callback();
    };

    self.handleScenarioResultEvent = (result: events.ScenarioResultPayload, callback: () => void) => {
        let scenario = result.getScenario();

        Serenity.notify(new SceneFinished(new Outcome(sceneFrom(scenario), translated(result), result.getFailureException())));

        callback();
    };

    // self.handleAfterStepEvent = (step: events.StepPayload, callback: () => void) => callback();
    // self.handleBeforeFeaturesEvent = (features: events.FeaturesPayload, callback: () => void) => callback();
    // self.handleBeforeFeatureEvent = (feature: events.FeaturePayload, callback: () => void) => callback();
    // self.handleAfterScenarioEvent = (scenario: events.ScenarioPayload, callback: () => void) => callback();
    // self.handleAfterFeatureEvent = (feature: events.FeaturePayload, callback: () => void) => callback();
    // self.handleFeaturesResultEvent = (featuresResult: events.FeaturesResultPayload, callback: () => void) => callback();
    // self.handleAfterFeaturesEvent = (features: events.FeaturesPayload, callback: () => void) => callback();

    // --

    function sceneFrom(scenario: events.ScenarioPayload): Scene {
        return new CucumberScene(scenario);
    }

    function activityFrom(step: events.StepPayload): Activity {
        return new Activity(step.getKeyword() + step.getName());
    }

    function translated(event: {getStatus(): string}): Result {
        switch (event.getStatus()) {
            // case 'ambiguous':       // todo: do we care? will cucumber ever tell us about ambiguous steps?
            //     return 'ambiguousCucumberStatus';
            case 'undefined':
                return Result.PENDING;
            case 'failed':
                return Result.FAILURE;
            case 'pending':
                return Result.PENDING;
            case 'passed':
                return Result.SUCCESS;
            case 'skipped':
                return Result.SKIPPED;
            default:
                throw new Error(`Couldn't map the '${event.getStatus()}' to a Serenity Result`);
        }
    }

    return self;
}

class CucumberScene extends Scene {
    constructor(scenario: events.ScenarioPayload) {
        super(
            scenario.getName(),
            scenario.getFeature().getName(),
            scenario.getUri(),
            `${scenario.getFeature().getName()}:${scenario.getLine()}:${scenario.getName()}`
        );
    }
}
