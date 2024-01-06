import { Timestamp } from '@serenity-js/core';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionFinishedAt<Context extends SerenityBDDReportContext>(timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.duration = Timestamp.fromJSON(context.report.startTime)
            .diff(timestamp)
            .inMilliseconds();

        return context;
    }
}
