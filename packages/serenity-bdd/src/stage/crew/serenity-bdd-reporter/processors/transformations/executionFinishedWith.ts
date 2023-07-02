import type { Outcome } from '@serenity-js/core/lib/model';

import { outcomeReportFrom } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionFinishedWith<Context extends SerenityBDDReportContext>(outcome: Outcome): (context: Context) => Context {
    return (context: Context): Context => {

        const outcomeReport = outcomeReportFrom(outcome);

        context.report.result = outcomeReport.result;

        if (outcomeReport.error) {
            context.report.testFailureCause     = outcomeReport.error;
            context.report.testFailureClassname = outcomeReport.error.errorType;
            context.report.testFailureMessage   = outcomeReport.error.message;
            context.report.testFailureSummary   = [
                outcomeReport.result,
                outcomeReport.error.errorType,
                outcomeReport.error.message,
                outcomeReport.error.stackTrace[1]?.fileName || '',
            ].join(';');
        }

        return context;
    }
}
