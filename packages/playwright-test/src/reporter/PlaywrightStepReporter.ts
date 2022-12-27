import { TestError, TestInfo } from '@playwright/test';
import { Stage, StageCrewMember } from '@serenity-js/core';
import { DomainEvent, InteractionFinished, InteractionStarts, TaskFinished, TaskStarts } from '@serenity-js/core/lib/events';
import { ActivityDetails, ProblemIndication } from '@serenity-js/core/lib/model';

// https://github.com/microsoft/playwright/blob/04f77f231981780704a3a5e2cea93e3c420809a0/packages/playwright-test/types/testReporter.d.ts#L524
interface Location {
    /**
     * Path to the source file.
     */
    file: string;

    /**
     * Line number in the source file.
     */
    line: number;

    /**
     * Column number in the source file.
     */
    column: number;
}

// https://github.com/microsoft/playwright/blob/04f77f231981780704a3a5e2cea93e3c420809a0/packages/playwright-test/src/types.ts#L30
interface TestStepInternal {
    complete(result: { error?: Error | TestError }): void;
    title: string;
    category: string;
    canHaveChildren: boolean;
    forceNoParent: boolean;
    location?: Location;
    refinedTitle?: string;
}

export class PlaywrightStepReporter implements StageCrewMember {

    private readonly steps: Map<string, TestStepInternal> = new Map();

    constructor(
        private readonly testInfo: TestInfo,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (event instanceof TaskStarts) {
            this.steps.set(event.activityId.value, this.createStep(event.details, 'task'));
        }

        if (event instanceof InteractionStarts) {
            this.steps.set(event.activityId.value, this.createStep(event.details, 'interaction'));
        }

        if (event instanceof InteractionFinished || event instanceof TaskFinished) {
            if (event.outcome instanceof ProblemIndication) {
                this.steps.get(event.activityId.value).complete({ error: event.outcome.error })
            }
            else {
                this.steps.get(event.activityId.value).complete({})
            }
        }
    }

    private createStep(activityDetails: ActivityDetails, type: 'task' | 'interaction'): TestStepInternal {
        // https://github.com/microsoft/playwright/blob/04f77f231981780704a3a5e2cea93e3c420809a0/packages/playwright-test/src/expect.ts#L200-L206
        return (this.testInfo as any)._addStep({
            location: activityDetails.location
                ? { file: activityDetails.location.path.value, line: activityDetails.location.line, column: activityDetails.location.column }
                : undefined,
            category: `serenity-js:${ type }`,
            title: activityDetails.name.value,
            canHaveChildren: true,
            forceNoParent: false
        }) as TestStepInternal;
    }
}
