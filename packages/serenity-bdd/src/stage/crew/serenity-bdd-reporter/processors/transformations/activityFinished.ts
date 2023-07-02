import { Timestamp } from '@serenity-js/core';
import { CorrelationId, Outcome } from '@serenity-js/core/lib/model';

import { outcomeReportFrom } from '../mappers';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function activityFinished<Context extends SerenityBDDReportContext>(activityId: CorrelationId, outcome: Outcome, finishedAt: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        const linkedStep = context.steps.get(activityId.value);
        const outcomeReport = outcomeReportFrom(outcome);

        linkedStep.step.result = outcomeReport.result;
        linkedStep.step.exception = outcomeReport.error;
        linkedStep.step.duration = Timestamp.fromTimestampInMilliseconds(linkedStep.step.startTime).diff(finishedAt).inMilliseconds();

        context.currentActivityId = linkedStep.parentActivityId;

        return context;
    }
}
