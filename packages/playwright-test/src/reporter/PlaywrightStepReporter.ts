import { TestInfo } from '@playwright/test';
import { Location, TestError } from '@playwright/test/reporter';
import { Stage, StageCrewMember } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityRelatedArtifactGenerated,
    AsyncOperationAborted,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
    InteractionStarts,
    SceneTagged,
    TaskStarts,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { ActivityDetails, BrowserTag, CorrelationId, Description, Name, Photo, PlatformTag, ProblemIndication } from '@serenity-js/core/lib/model';
import { Photographer } from '@serenity-js/web';
import { match } from 'tiny-types';

const genericPathToPhotographer = Path.from(require.resolve('@serenity-js/web'))

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

        match<DomainEvent, void>(event)
            .when(TaskStarts, (e: TaskStarts) => {
                this.steps.set(e.activityId.value, this.createStep(e.details, 'task'))
            })
            .when(InteractionStarts, (e: InteractionStarts) => {
                this.steps.set(e.activityId.value, this.createStep(e.details, 'interaction'));
            })
            .when(AsyncOperationAttempted, (e: AsyncOperationAttempted) => {
                if (this.isAPhotoAttempt(e)) {
                    this.steps.set(e.correlationId.value, this.createStep(new ActivityDetails(
                        new Name(`${ Photographer.name }: ${ e.description.value }`),
                        new FileSystemLocation(genericPathToPhotographer)
                    ), 'crew'));
                }
            })
            .when(ActivityFinished, (e: ActivityFinished) => {
                const error = e.outcome instanceof ProblemIndication
                    ? e.outcome.error
                    : undefined;

                this.steps.get(e.activityId.value).complete({ error });
            })
            .when(ActivityRelatedArtifactGenerated, (e: ActivityRelatedArtifactGenerated) => {
                if (e.artifact instanceof Photo) {
                    this.attachPhotoFrom(e);
                }
            })
            .when(SceneTagged, (e: SceneTagged) => {
                // don't include platform and browser tags as Playwright already includes them
                if (! (e.tag instanceof PlatformTag || e.tag instanceof BrowserTag)) {
                    this.testInfo.annotations.push({ type: e.tag.type, description: e.tag.name });
                }
            })
            .else(e => {
                if (this.indicatesCompletionOfAnAsyncOperation(e) && this.steps.has(e.correlationId.value)) {
                    const error = event instanceof AsyncOperationFailed
                        ? event.error
                        : undefined;

                    this.steps.get(e.correlationId.value).complete({ error })
                }
            })
    }

    private isAPhotoAttempt(event: AsyncOperationAttempted): event is AsyncOperationAttempted {
        return event.name.value.startsWith(Photographer.name);
    }

    private indicatesCompletionOfAnAsyncOperation(event: DomainEvent): event is AsyncOperationCompleted | AsyncOperationAborted | AsyncOperationFailed {
        return event instanceof AsyncOperationCompleted
            || event instanceof AsyncOperationAborted
            || event instanceof AsyncOperationFailed
    }

    private attachPhotoFrom(event: ActivityRelatedArtifactGenerated) {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description(`Attaching screenshot of '${ event.name.value }'...`),
            id,
            this.stage.currentTime(),
        ));

        this.testInfo.attach(event.name.value, { body: Buffer.from(event.artifact.base64EncodedValue, 'base64'), contentType: 'image/png' })
            .then(() => {
                this.stage.announce(new AsyncOperationCompleted(
                    id,
                    this.stage.currentTime()
                ));
            });
    }

    private createStep(activityDetails: ActivityDetails, type: 'task' | 'interaction' | 'crew'): TestStepInternal {
        // https://github.com/microsoft/playwright/blob/04f77f231981780704a3a5e2cea93e3c420809a0/packages/playwright-test/src/expect.ts#L200-L206
        return (this.testInfo as any)._addStep({
            location: activityDetails.location
                ? { file: activityDetails.location.path.value, line: activityDetails.location.line, column: activityDetails.location.column }
                : undefined,
            category: `serenity-js:${ type }`,
            title: activityDetails.name.value,
            canHaveChildren: true,
            forceNoParent: false,
        }) as TestStepInternal;
    }
}
