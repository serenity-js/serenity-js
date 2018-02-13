import { Outcome, RecordedActivity, RecordedScene, Result, Tag } from '@serenity-js/core/lib/domain';
import path = require('path');

import * as Cucumber from 'cucumber';

export function sceneFrom(scenario: Cucumber.events.ScenarioPayload): RecordedScene {
    return new CucumberScene(scenario);
}

export function activityFrom(step: Cucumber.events.StepPayload): RecordedActivity {
    // todo: override RecordedTask::location
    return new RecordedActivity(fullNameOf(step));
}

export function outcome<T>(subject: T, stepStatus: string, error: Error | undefined): Outcome<T> {
    return new Outcome(subject, serenityResultFrom(stepStatus, error), error);
}

function catchProblemsWithAmbiguousStepDefinitions(result: Cucumber.events.StepResultPayload): Error | undefined {
    const ambiguousStepDefinitions = (result.getAmbiguousStepDefinitions() || []).map(stepDefinition => {
        const pattern = stepDefinition.getPattern().toString();
        const relativeUri = path.relative(process.cwd(), stepDefinition.getUri());
        const line = stepDefinition.getLine();
        return `${pattern} - ${relativeUri}:${line}`;
    });

    if (!! ambiguousStepDefinitions.length) {
        return new Error(ambiguousStepDefinitions.reduce(
            (message, issueLocation) => `${message}\n${issueLocation}`,
            'There should be only one step definition matching a given step, yet there seem to be several:',
        ));
    }

    return undefined;
}

export function errorIfPresentIn(result: Cucumber.events.StepResultPayload | Cucumber.events.ScenarioResultPayload): Error | undefined {

    const error: Error | string | undefined = result.getFailureException() as any;

    switch (typeof error) { // tslint:disable-line:switch-default
        case 'string':   return new Error(error as string);
        case 'object':   return error as Error;
        case 'function': return error as Error;
    }

    return (!! result['getAmbiguousStepDefinitions'])   // tslint:disable-line:no-string-literal
        ? catchProblemsWithAmbiguousStepDefinitions(result as Cucumber.events.StepResultPayload)
        : undefined;
}

// ---

function fullNameOf(step: Cucumber.events.StepPayload): string {

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

function serenityResultFrom(stepStatus: string, error?: Error): Result {
    const timeOut = (e: Error) => e && /timed out/.test(e.message);

    const results = {
        undefined: Result.PENDING,
        ambiguous: Result.ERROR,
        failed:    Result.FAILURE,
        pending:   Result.PENDING,
        passed:    Result.SUCCESS,
        skipped:   Result.SKIPPED,
    };

    if (! results[stepStatus]) {
        throw new Error(`Couldn't map '${ stepStatus }' to a Serenity Result`);
    }

    return timeOut(error)
        ? Result.ERROR
        : results[stepStatus];
}

function toSerenityTag(cucumberTag: Cucumber.Tag): Tag {
    return Tag.from(cucumberTag.getName());
}

class CucumberScene extends RecordedScene {
    constructor(scenario: Cucumber.events.ScenarioPayload) {
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
