import { Timestamp } from '@serenity-js/core';

import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionStartedAt<Context extends SerenityBDDReportContext>(timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.startTime = context.report.startTime || timestamp.toMilliseconds();

        return context;
    }
}
