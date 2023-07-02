import type { Outcome } from '@serenity-js/core/lib/model';

import { outcomeReportFrom } from '../../mappers';
import type { SceneSequenceReportContext } from '../SceneSequenceReportContext';

export function sceneSequenceOverallResult(outcome: Outcome) {
    return (context: SceneSequenceReportContext): SceneSequenceReportContext => {

        if (outcome.isWorseThan(context.worstOutcomeSoFar)) {
            const outcomeReport = outcomeReportFrom(outcome);

            context.report.result = outcomeReport.result;
            context.report.testFailureCause = outcomeReport.error;
        }

        return context;
    }
}
