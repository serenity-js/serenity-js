import { CorrelationId } from '@serenity-js/core/lib/model';

import { SerenityBDDReport } from '../SerenityBDDJsonSchema';
import { LinkedTestStep } from './LinkedTestStep';

/**
 * @package
 */
export abstract class SerenityBDDReportContext {

    public readonly report: Partial<SerenityBDDReport> = {};
    public readonly steps: Map<string, LinkedTestStep> = new Map();
    public currentActivityId: CorrelationId = undefined;

    with(fn: (report: this) => this): this {
        return fn(this);
    }

    build(): SerenityBDDReport {

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
        } as SerenityBDDReport;
    }
}
