import { ActivityFinished, ActivityStarts, DomainEvent, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ActivityDetails,
    Category,
    ErrorOccurred,
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

export class Notifier {
    constructor(private readonly stageManager: StageManager) {
    }

    scenarioStarts(scenario: cucumber.events.ScenarioPayload) {
        const details = this.scenarioDetailsOf(scenario);
        const path    = new Path(scenario.getUri());

        this.emit(...[
            new SceneStarts(details),
            new TestRunnerDetected(new Name('Cucumber')),
            new SceneTagged(details, new FeatureTag(scenario.getFeature().getName())),

            ...scenario.getTags()
                .map(cucumberTag => Tags.from(cucumberTag.getName()))
                .reduce(flatten, [])
                .map(tag => new SceneTagged(details, tag)),
        ].filter(event => !! event));
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
        return new ActivityDetails(
            new Name(`${ step.getKeyword()}${step.getName()}`),
        );
    }

    private scenarioOutcomeFrom(result: cucumber.events.ScenarioResultPayload): Outcome {
        const
            status: string = result.getStatus(),
            error: Error   = result.getFailureException();

        return this.outcomeFrom(status, error);
    }

    private stepOutcomeFrom(result: cucumber.events.StepResultPayload): Outcome {
        // todo: catchProblemsWithAmbiguousStepDefinitions

        const
            status: string = result.getStatus(),
            error: Error   = result.getFailureException();

        return this.outcomeFrom(status, error);
    }

    private outcomeFrom(status: string, error?: Error) {
        if (error && /timed out/.test(error.message)) {
            return new ErrorOccurred(error);
        }

        switch (true) {
            case status === 'undefined':
                return new ImplementationPending();

            case status === 'ambiguous':
                return new ErrorOccurred(error);    // todo: does this throw the error?

            case status === 'failed':
                return new ErrorOccurred(error);

            case status === 'pending':
                return new ImplementationPending();

            case status === 'passed':
                return new ExecutionSuccessful();

            case status === 'skipped':
                return new ExecutionSkipped();
        }
    }

    private emit(...events: DomainEvent[]) {
        events.forEach(event => this.stageManager.notifyOf(event));
    }
}
