import { Timestamp } from '@serenity-js/core';
import { CorrelationId, Name } from '@serenity-js/core/lib/model';

import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function activityStarted<Context extends SerenityBDDReportContext>(activityId: CorrelationId, name: Name, startedAt: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        const step = {
            number: context.steps.size + 1,
            description: name.value,
            startTime: startedAt.toMilliseconds(),
            children: [],
            reportData: [],
            screenshots: [],
            duration: 0,
            result: undefined,
        };

        context.steps.set(activityId.value, {
            step,
            parentActivityId: context.currentActivityId,
        });

        context.currentActivityId = activityId;

        return context;
    }
}
