import { ActivityFinished, ActivityStarts, SceneFinished, SceneStarts } from '../serenity/domain/events';
import { Activity, Outcome, Result, Scene, Tag } from '../serenity/domain/model';
import { Serenity } from '../serenity/serenity';
import cucumber = require('cucumber');

export function scenarioLifeCycleNotifier(): cucumber.EventListener {

    return Object.assign(cucumber.Listener(), {
        handleBeforeScenarioEvent,
        handleBeforeStepEvent,
        handleStepResultEvent,
        handleScenarioResultEvent,
    });

    // handleAfterStepEvent      (step: events.StepPayload, callback: () => void) => callback();
    // handleBeforeFeaturesEvent (features: events.FeaturesPayload, callback: () => void) => callback();
    // handleBeforeFeatureEvent  (feature: events.FeaturePayload, callback: () => void) => callback();
    // handleAfterScenarioEvent  (scenario: events.ScenarioPayload, callback: () => void) => callback();
    // handleAfterFeatureEvent   (feature: events.FeaturePayload, callback: () => void) => callback();
    // handleFeaturesResultEvent (featuresResult: events.FeaturesResultPayload, callback: () => void) => callback();
    // handleAfterFeaturesEvent  (features: events.FeaturesPayload, callback: () => void) => callback();
}

function handleBeforeScenarioEvent (scenario: cucumber.events.ScenarioPayload, callback: () => void) {

    Serenity.notify(new SceneStarts(sceneFrom(scenario)));

    callback();
}

function handleBeforeStepEvent (step: cucumber.events.StepPayload, callback: () => void) {

    if (! step.isHidden()) {
        Serenity.notify(new ActivityStarts(activityFrom(step)));
    }

    callback();
}

function handleStepResultEvent (result: cucumber.events.StepResultPayload, callback: () => void) {

    let step = result.getStep();

    // "before" and "after" steps emit an event even if they keywords themselves are not present in the test...
    if (!step.isHidden()) {
        Serenity.notify(new ActivityFinished(outcome(activityFrom(step), result.getStatus(), result.getFailureException())));
    }

    callback();
}

function handleScenarioResultEvent (result: cucumber.events.ScenarioResultPayload, callback: () => void) {

    let scenario = result.getScenario();

    Serenity.notify(new SceneFinished(outcome(sceneFrom(scenario), result.getStatus(), result.getFailureException())));

    callback();
}

// --

function sceneFrom(scenario: cucumber.events.ScenarioPayload): Scene {
    return new CucumberScene(scenario);
}

function activityFrom(step: cucumber.events.StepPayload): Activity {
    return new Activity(step.getKeyword() + step.getName());
}

function outcome<T>(subject: T, status: string, error?: Error): Outcome<T> {
    return new Outcome(subject, serenityResultFrom(status), error);
}

function serenityResultFrom(status: string): Result {
    const results = {
        // 'ambiguous':       // todo: do we care? will cucumber ever tell us about ambiguous steps?'
        undefined: Result.PENDING,
        failed:    Result.FAILURE,
        pending:   Result.PENDING,
        passed:    Result.SUCCESS,
        skipped:   Result.SKIPPED,
    };

    if (! results[status]) {
        throw new Error(`Couldn't map the '${ status }' to a Serenity Result`);
    }

    return results[status];
}

function toSerenityTag(cucumberTag: cucumber.Tag): Tag {
    return Tag.from(cucumberTag.getName());
}

class CucumberScene extends Scene {
    constructor(scenario: cucumber.events.ScenarioPayload) {
        super(
            scenario.getName(),
            scenario.getFeature().getName(),
            scenario.getUri(),
            scenario.getTags().map(toSerenityTag),
            `${scenario.getFeature().getName()}:${scenario.getLine()}:${scenario.getName()}`,
        );
    }
}
