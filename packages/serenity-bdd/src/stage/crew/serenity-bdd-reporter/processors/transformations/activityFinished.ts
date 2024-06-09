import { Timestamp } from '@serenity-js/core';
import type { CorrelationId, Name, Outcome } from '@serenity-js/core/lib/model';

import { outcomeReportFrom } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function activityFinished<Context extends SerenityBDDReportContext>(activityId: CorrelationId, name: Name, outcome: Outcome, finishedAt: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        const linkedStep = context.steps.get(activityId.value);
        const outcomeReport = outcomeReportFrom(outcome);

        linkedStep.step.description = name.value;
        linkedStep.step.result = outcomeReport.result;
        linkedStep.step.exception = outcomeReport.error;
        linkedStep.step.duration = Timestamp.fromJSON(linkedStep.step.startTime).diff(finishedAt).inMilliseconds();

        context.currentActivityId = linkedStep.parentActivityId;

        return context;
    }
}
