import { Timestamp } from '@serenity-js/core/lib/model';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionStartedAt<Context extends SerenityBDDReportContext>(timestamp: Timestamp) {
    return (context: Context): Context => {
        context.report.startTime = context.report.startTime || timestamp.toMillisecondTimestamp();

        return context;
    }
}
