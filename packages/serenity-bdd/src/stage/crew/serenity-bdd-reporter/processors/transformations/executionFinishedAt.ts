import { Timestamp } from '@serenity-js/core/lib/model';

import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionFinishedAt<Context extends SerenityBDDReportContext>(timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.duration = Timestamp.fromMillisecondTimestamp(context.report.startTime)
            .diff(timestamp)
            .inMilliseconds();

        return context;
    }
}
