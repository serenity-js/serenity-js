import { serenity } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, Outcome, RecordedActivity, RecordedScene, Result, SceneFinished, SceneStarts, Tag } from '@serenity-js/core/lib/domain';
import { DataTable, DocString, FailureException, Scenario, ScenarioResult, Step, StepArgument, StepResult } from './model';

const CucumberStep = require('cucumber/lib/models/step').default;   // tslint:disable-line:no-var-requires

export class Notifier {
    handleBeforeScenario = (scenario: Scenario) =>
        serenity.notify(new SceneStarts(CucumberScene.from(scenario)));

    handleBeforeStep = (step: Step) =>
        this.isOfInterest(step) && serenity.notify(new ActivityStarts(CucumberTask.from(step)));

    handleStepResult = (result: StepResult) =>
        this.isOfInterest(result.step) && serenity.notify(new ActivityFinished(CucumberOutcome.fromStep(result)));

    handleScenarioResult = (result: ScenarioResult) =>
        serenity.notify(new SceneFinished(CucumberOutcome.fromScenario(result)));

    /**
     * "Before hooks" will also trigger the listeners, but we don't want to report on them
     * https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md
     * @param step
     */
    private isOfInterest = (step: any) => step instanceof CucumberStep && ! step.isHidden;

}

class CucumberOutcome<T> extends Outcome<T> {

    static fromStep = (result: StepResult) => new CucumberOutcome(
        CucumberTask.from(result.step),
        CucumberResult.from(result),
        realErrorFrom(result.failureException),
    );

    static fromScenario = (result: ScenarioResult) => new CucumberOutcome(
        CucumberScene.from(result.scenario),
        CucumberResult.from(result),
        realErrorFrom(result.failureException),
    );

    constructor(subject: T, result: Result, error: Error) {
        super(subject, result, error);
    }
}

function realErrorFrom(pseudoError: FailureException): Error | undefined {
    switch (typeof pseudoError) {
        case 'string': return new Error(pseudoError as string);
        case 'object': return pseudoError as Error;
        default:       return undefined;
    }
}

class CucumberResult {
    static from = (result: StepResult | ScenarioResult) => {
        const isTimeOut = (e: Error) => e && /timed out/.test(e.message);

        const results = {
            undefined: Result.PENDING,
            failed: Result.FAILURE,
            pending: Result.PENDING,
            passed: Result.SUCCESS,
            skipped: Result.SKIPPED,
        };

        if (!results[ result.status ]) {
            throw new Error(`Couldn't map the '${ result.status }' to a Serenity Result`);
        }

        return isTimeOut(realErrorFrom(result.failureException))
            ? Result.ERROR
            : results[ result.status ];
    }
}

class CucumberScene extends RecordedScene {
    static from = (scenario: Scenario) => new CucumberScene(scenario);

    constructor(scenario: Scenario) {
        super(
            scenario.name,
            scenario.feature.name,
            { path: scenario.uri, line: scenario.line },
            scenario.tags.map(tag => Tag.from(tag.name)),
            `${ scenario.feature.name }:${ scenario.line }:${ scenario.name }`,
        );
    }
}

class CucumberTask extends RecordedActivity {
    static from = (step: Step) => new CucumberTask(step);

    private static fullNameOf = (step: Step): string => [
        step.keyword,
        step.name,
        step.arguments.map(argument => SerialisedStepArgument.from(argument)).join('\n'),
    ].join('').trim();

    constructor(step: Step) {
        super(CucumberTask.fullNameOf(step));
    }

}

class SerialisedStepArgument {
    static from = (argument: StepArgument) => {
        switch (argument.constructor.name) { // tslint:disable-line:switch-default
            case 'DataTable': return `\n${ (argument as DataTable).raw().map(row => `| ${ row.join(' | ') } |`).join('\n') }`;
            case 'DocString': return `\n${ (argument as DocString).content }`;
        }
    }
}
