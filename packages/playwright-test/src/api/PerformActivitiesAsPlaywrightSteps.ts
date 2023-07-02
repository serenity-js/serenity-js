import type { test as base } from '@playwright/test';
import type { Activity, PerformsActivities } from '@serenity-js/core';
import { d, Interaction, PerformActivities } from '@serenity-js/core';
import type { EmitsDomainEvents } from '@serenity-js/core/lib/events';
import { significantFieldsOf } from 'tiny-types/lib/objects';

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

        return runAsStep({
            category: 'test.step',
            title: this.nameOf(activity),
            location: this.locationOf(activity),
            params: this.parametersOf(activity),
        }, async step_ => {
            await super.perform(activity)
        })
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
