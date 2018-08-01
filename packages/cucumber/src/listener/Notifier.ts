import {
    ActivityFinished,
    ActivityStarts,
    DomainEvent,
    SceneDescriptionDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    Category,
    Description,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    ImplementationPending,
    Name,
    Outcome,
    ScenarioDetails,
    Tags,
} from '@serenity-js/core/lib/model';
import { StageManager } from '@serenity-js/core/lib/stage';
import * as cucumber from 'cucumber';

const flatten = <T>(acc: T[], list: T[]): T[] => acc.concat(list);
const notEmpty = <T>(list: T[]) => list.filter(item => !! item);

export class Notifier {
    constructor(private readonly stageManager: StageManager) {
    }

    scenarioStarts(scenario: cucumber.events.ScenarioPayload) {
        const details = this.scenarioDetailsOf(scenario);

        this.emit(...notEmpty([
            new SceneStarts(details),
            new TestRunnerDetected(new Name('Cucumber')),
            new SceneTagged(details, new FeatureTag(scenario.getFeature().getName())),
            !! scenario.getDescription() && new SceneDescriptionDetected(new Description(scenario.getDescription())),
            ...scenario.getTags()
                .map(cucumberTag => Tags.from(cucumberTag.getName()))
                .reduce(flatten, [])
                .map(tag => new SceneTagged(details, tag)),
        ]));
    }

    stepStarts(step: cucumber.events.StepPayload) {
        if (! step.isHidden()) {                                                            // "before" and "after" steps emit a 'hidden' event, which we ignore
            this.emit(
                new ActivityStarts(this.activityDetailsOf(step)),
            );
        }
    }

    stepFinished(result: cucumber.events.StepResultPayload) {
        if (! result.getStep().isHidden()) {                                                // "before" and "after" steps emit a 'hidden' event, which we ignore
            this.emit(
                new ActivityFinished(
                    this.activityDetailsOf(result.getStep()),
                    this.stepOutcomeFrom(result),
                ),
            );
        }
    }

    scenarioFinished(result: cucumber.events.ScenarioResultPayload) {
        this.emit(
            new SceneFinished(
                this.scenarioDetailsOf(result.getScenario()),
                this.scenarioOutcomeFrom(result),
            ),
        );
    }

    private scenarioDetailsOf(scenario: cucumber.events.ScenarioPayload): ScenarioDetails {
        return new ScenarioDetails(
            new Name(scenario.getName()),
            new Category(scenario.getFeature().getName()),
            new FileSystemLocation(
                new Path(scenario.getUri()),
                scenario.getLine(),
            ),
        );
    }

    private activityDetailsOf(step: cucumber.events.StepPayload): ActivityDetails {

        const serialise = (argument: any) => {
            // tslint:disable:switch-default  - the only possible values are DataTable and DocString
            switch (argument.getType()) {
                case 'DataTable':
                    return '\n' + argument.raw().map(row => `| ${row.join(' | ')} |`).join('\n');
                case 'DocString':
                    return `\n${ argument.getContent() }`;
            }
            // tslint:enable:switch-default
        };

        const name = new Name([
            step.getKeyword(),
            step.getName(),
            (step as any).getArguments().map(serialise).join('\n'),
        ].join('').trim());

        return new ActivityDetails(name);
    }

    private scenarioOutcomeFrom(result: cucumber.events.ScenarioResultPayload): Outcome {
        const
            status: string = result.getStatus(),
            error: Error   = this.errorFrom(result.getFailureException());

        return this.outcomeFrom(status, error);
    }

    private stepOutcomeFrom(result: cucumber.events.StepResultPayload): Outcome {
        const
            status: string                          = result.getStatus(),
            ambiguousStepsError: Error | undefined  = this.ambiguousStepsDetectedIn(result),
            error: Error | undefined                = this.errorFrom(result.getFailureException());

        return this.outcomeFrom(status, error || ambiguousStepsError);
    }

    private ambiguousStepsDetectedIn(result: cucumber.events.StepResultPayload): Error | undefined {
        const ambiguousStepDefinitions = result.getAmbiguousStepDefinitions() || [];

        if (ambiguousStepDefinitions.length === 0) {
            return void 0;
        }

        return ambiguousStepDefinitions
                .map(step => `${step.getPattern().toString()} - ${step.getUri()}:${step.getLine()}`)
                .reduce((err: Error, issue) => {
                    err.message += `\n${issue}`;
                    return err;
                }, new Error('Each step should have one matching step definition, yet there are several:'));
    }

    private errorFrom(error: Error | string | undefined): Error | undefined {
        switch (typeof error) {
            case 'string':   return new Error(error as string);
            case 'object':   return error as Error;
            case 'function': return error as Error;
            default:         return void 0;
        }
    }

    private outcomeFrom(status: string, error?: Error) {
        if (error && /timed out/.test(error.message)) {
            return new ExecutionFailedWithError(error);
        }

        // tslint:disable:switch-default
        switch (true) {
            case status === 'undefined':
                return new ImplementationPending();

            case status === 'ambiguous':
                if (! error) {
                    // Only the step result contains the "ambiguous step def error", the scenario itself doesn't
                    return new ExecutionFailedWithError(new Error('Ambiguous step definition detected'));
                }

                return new ExecutionFailedWithError(error);

            case status === 'failed':
                return new ExecutionFailedWithError(error);

            case status === 'pending':
                return new ImplementationPending();

            case status === 'passed':
                return new ExecutionSuccessful();

            case status === 'skipped':
                return new ExecutionSkipped();
        }
        // tslint:enable:switch-default
    }

    private emit(...events: DomainEvent[]) {
        events.forEach(event => this.stageManager.notifyOf(event));
    }
}
