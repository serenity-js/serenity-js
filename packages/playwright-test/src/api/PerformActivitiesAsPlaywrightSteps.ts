import type { test as base } from '@playwright/test';
import { Activity, PerformActivities, PerformsActivities } from '@serenity-js/core';
import { EmitsDomainEvents } from '@serenity-js/core/lib/events';

export class PerformActivitiesAsPlaywrightSteps extends PerformActivities {

    constructor(
        actor: PerformsActivities & { name: string },
        stage: EmitsDomainEvents,
        private readonly test: typeof base,
    ) {
        super(actor, stage);
    }

    override async perform(activity: Activity): Promise<void> {
        const testInfo = this.test.info();

        // see https://github.com/microsoft/playwright/issues/23157
        const runAsStep = (testInfo['_runAsStep']).bind(testInfo) as <T>(stepInfo: TestStepInternal, callback: (step: TestStepInternal) => Promise<T>) => Promise<T>;
        const instantiationLocation = activity.instantiationLocation();
        const location = {
            file: instantiationLocation.path.value,
            line: instantiationLocation.line,
            column: instantiationLocation.column
        };

        return runAsStep({ category: 'test.step', title: this.nameOf(activity), location, }, async step_ => {
            await super.perform(activity)
        })
    }
}

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
