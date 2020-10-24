import { Outcome } from '@serenity-js/core/lib/model';
import { outcomeReportFrom } from '../mappers';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionFinishedWith<Context extends SerenityBDDReportContext>(outcome: Outcome) {
    return (context: Context): Context => {

        const outcomeReport = outcomeReportFrom(outcome);

        context.report.result = outcomeReport.result;
        context.report.testFailureCause = outcomeReport.error;

        return context;
    }
}
