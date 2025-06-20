import type { Description } from '@serenity-js/core/lib/model';

import { escapeHtml } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function featureNarrativeOf<Context extends SerenityBDDReportContext>(description: Description): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.userStory = {
            ...context.report.userStory,
            narrative: escapeHtml(description.value),
        }

        return context;
    }
}
