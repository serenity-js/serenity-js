import type { test as base, TestInfo } from '@playwright/test';
import type {
    Activity,
    AnswersQuestions,
    PerformsActivities,
    UsesAbilities
} from '@serenity-js/core';
import { d, Interaction, PerformActivities } from '@serenity-js/core';
import type { EmitsDomainEvents } from '@serenity-js/core/lib/events';
import { significantFieldsOf } from 'tiny-types/lib/objects';

export class PerformActivitiesAsPlaywrightSteps extends PerformActivities {

    constructor(
        actor: AnswersQuestions & UsesAbilities & PerformsActivities & { name: string },
        stage: EmitsDomainEvents,
        private readonly test: typeof base,
    ) {
        super(actor, stage);
    }

    override async perform(activity: Activity): Promise<void> {
        const testInfo = this.test.info() as TestInfo & {
            _addStep: (data: TestStepInternal) => TestStepInternal
        };

        // Monkey-patch addStep to allow for passing a pre-computed location
        // see https://github.com/microsoft/playwright/issues/30160
        const originalAddStep = testInfo._addStep;
        testInfo._addStep = (data: TestStepInternal) => {

            data.location = this.locationOf(activity);
            data.params = this.parametersOf(activity);

            return originalAddStep.call(testInfo, data);
        }

        await this.test.step(
            await activity.describedBy(this.actor),
            () => super.perform(activity),
        );

        testInfo._addStep = originalAddStep;
    }

    private parametersOf(activity: Activity): Record<string, any> {
        if (activity instanceof Interaction) {
            return significantFieldsOf(activity).reduce((acc, field) => {
                acc[field] = d`${ activity[field] }`;
                return acc;
            }, {});
        }
        return {};
    }

    private locationOf(activity: Activity): { column: number, file: string, line: number } {
        const instantiationLocation = activity.instantiationLocation();
        return {
            file: instantiationLocation.path.value,
            line: instantiationLocation.line,
            column: instantiationLocation.column
        };
    }
}

// Partial copy of https://github.com/microsoft/playwright/blob/b5e36583f67745fddf32145fa2355e5f122c2903/packages/playwright/src/worker/testInfo.ts#L32
interface TestStepInternal {
    title: string;
    category: string;
    location?: {
        column: number;
        file: string;
        line: number;
    };
    laxParent?: boolean;
    apiName?: string;
    params?: Record<string, any>;
}
