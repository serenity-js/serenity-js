import { serenity } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityStarts,
    Outcome,
    RecordedActivity,
    RecordedScene,
    Result,
    SceneFinished,
    SceneStarts,
    Tag,
} from '@serenity-js/core/lib/domain';

import * as cucumber from 'cucumber';

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

function handleBeforeScenarioEvent(scenario: cucumber.events.ScenarioPayload, callback: () => void) {

    serenity.notify(new SceneStarts(sceneFrom(scenario)));

    callback();
}

function handleBeforeStepEvent(step: cucumber.events.StepPayload, callback: () => void) {

    if (! step.isHidden()) {
        serenity.notify(new ActivityStarts(activityFrom(step)));
    }

    callback();
}

function handleStepResultEvent(result: cucumber.events.StepResultPayload, callback: () => void) {

    const step = result.getStep();

    // "before" and "after" steps emit an event even if they keywords themselves are not present in the test...
    if (!step.isHidden()) {
        serenity.notify(new ActivityFinished(outcome(activityFrom(step), result.getStatus(), result.getFailureException())));
    }

    callback();
}

function handleScenarioResultEvent(result: cucumber.events.ScenarioResultPayload, callback: () => void) {

    const scenario = result.getScenario();

    serenity.notify(new SceneFinished(outcome(sceneFrom(scenario), result.getStatus(), result.getFailureException())));

    callback();
}

// --

function fullNameOf(step: cucumber.events.StepPayload): string {

    const serialise = (argument: any) => {
        // tslint:disable-next-line:switch-default  - the only possible values are DataTable and DocString
        switch (argument.getType()) {
            case 'DataTable':
                return '\n' + argument.raw().map(row => `| ${row.join(' | ')} |`).join('\n');
            case 'DocString':
                return `\n${ argument.getContent() }`;
        }
    };

    return [
        step.getKeyword(),
        step.getName(),
        (step as any).getArguments().map(serialise).join('\n'),    // todo: submit getArguments() to DefinitelyTyped
    ].join('').trim();
}

function sceneFrom(scenario: cucumber.events.ScenarioPayload): RecordedScene {
    return new CucumberScene(scenario);
}

function activityFrom(step: cucumber.events.StepPayload): RecordedActivity {
    // todo: override RecordedTask::location
    return new RecordedActivity(fullNameOf(step));
}

function outcome<T>(subject: T, stepStatus: string, maybeError?: Error | string | undefined): Outcome<T> {

    const error = errorFrom(maybeError);

    return new Outcome(subject, serenityResultFrom(stepStatus, error), error);
}

function errorFrom(pseudoError: string | Error | undefined): Error {
    switch (typeof pseudoError) {
        case 'string': return new Error(pseudoError as string);
        case 'object': return pseudoError as Error;
        default:       return undefined;
    }
}

function serenityResultFrom(stepStatus: string, error?: Error): Result {
    const timeOut = (e: Error) => e && /timed out/.test(e.message);

    const results = {
        undefined: Result.PENDING,
        failed:    Result.FAILURE,
        pending:   Result.PENDING,
        passed:    Result.SUCCESS,
        skipped:   Result.SKIPPED,
    };

    if (! results[stepStatus]) {
        throw new Error(`Couldn't map the '${ stepStatus }' to a Serenity Result`);
    }

    return timeOut(error)
        ? Result.ERROR
        : results[stepStatus];
}

function toSerenityTag(cucumberTag: cucumber.Tag): Tag {
    return Tag.from(cucumberTag.getName());
}

class CucumberScene extends RecordedScene {
    constructor(scenario: cucumber.events.ScenarioPayload) {
        super(
            scenario.getName(),
            scenario.getFeature().getName(),
            {
                path: scenario.getUri(),
                line: scenario.getLine(),
            },
            scenario.getTags().map(toSerenityTag),
            `${scenario.getFeature().getName()}:${scenario.getLine()}:${scenario.getName()}`,
        );
    }

    // todo: override CucumberScene::location to return the line and column retrieved from cucumber event
}
