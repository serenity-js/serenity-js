import type { Timestamp } from '@serenity-js/core';
import type { CorrelationId, Name } from '@serenity-js/core/lib/model';

import type { TestStepSchema } from '../../serenity-bdd-report-schema';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function activityStarted<Context extends SerenityBDDReportContext>(activityId: CorrelationId, name: Name, startedAt: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {

        const step: TestStepSchema = {
            number: context.steps.size + 1,
            /**
             * It doesn't look like the TestStep.level was used anywhere in the Serenity BDD Reporter,
             * https://github.com/serenity-bdd/serenity-core/blob/5bebe8e77cf0c4ea99e0d3d1035d54822bcde9af/serenity-model/src/main/java/net/thucydides/model/domain/TestStep.java
             */
            // level: 0,
            // precondition: false,
            description: name.value,
            startTime: startedAt.toISOString(),
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
