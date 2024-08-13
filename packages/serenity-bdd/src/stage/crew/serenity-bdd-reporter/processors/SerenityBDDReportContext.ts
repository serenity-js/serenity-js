import type { SerialisedActor } from '@serenity-js/core';
import type { RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { CorrelationId } from '@serenity-js/core/lib/model';

import type { SerenityBDD4ReportSchema } from '../serenity-bdd-report-schema';
import type { LinkedTestStep } from './LinkedTestStep';

/**
 * @package
 */
export abstract class SerenityBDDReportContext {

    public readonly report: Partial<SerenityBDD4ReportSchema> = {};
    public readonly steps: Map<string, LinkedTestStep> = new Map();
    public readonly actors: Map<string, SerialisedActor> = new Map();   // sceneId -> actor
    public currentActivityId: CorrelationId = undefined;

    constructor(public readonly requirementsHierarchy: RequirementsHierarchy) {
    }

    with(fn: (report: this) => this): this {
        return fn(this);
    }

    build(): SerenityBDD4ReportSchema {

        const eraseDuplicateExceptionReportFromParentSteps = (current: LinkedTestStep) => {
            if (current.parentActivityId) {
                const parent = this.steps.get(current.parentActivityId.value);
                delete parent.step.exception;

                return eraseDuplicateExceptionReportFromParentSteps(parent);
            }
        }

        const testSteps = [];

        this.steps.forEach(current => {
            if (current.parentActivityId) {
                this.steps.get(current.parentActivityId.value).step.children.push(current.step);

                if (current.step.exception) {
                    eraseDuplicateExceptionReportFromParentSteps(current);
                }
            }
            else {
                testSteps.push(current.step);
            }
        });

        return {
            ...this.report,
            testSteps,
        } as SerenityBDD4ReportSchema;
    }
}
