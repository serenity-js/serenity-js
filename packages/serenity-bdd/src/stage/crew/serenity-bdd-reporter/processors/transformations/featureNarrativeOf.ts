import type { Description } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function featureNarrativeOf<Context extends SerenityBDDReportContext>(description: Description): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.userStory = {
            ...context.report.userStory,
            narrative: description.value,
        }

        return context;
    }
}
