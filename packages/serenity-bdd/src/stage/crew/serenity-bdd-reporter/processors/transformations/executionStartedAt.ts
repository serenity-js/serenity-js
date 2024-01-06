import type { Timestamp } from '@serenity-js/core';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function executionStartedAt<Context extends SerenityBDDReportContext>(timestamp: Timestamp): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.startTime = context.report.startTime || timestamp.toISOString();

        return context;
    }
}
