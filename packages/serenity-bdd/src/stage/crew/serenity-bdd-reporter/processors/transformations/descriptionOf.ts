import type { Description } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function descriptionOf<Context extends SerenityBDDReportContext>(description: Description): (context: Context) => Context {
    return (context: Context): Context => {

        context.report.description = description.value;

        return context;
    }
}
