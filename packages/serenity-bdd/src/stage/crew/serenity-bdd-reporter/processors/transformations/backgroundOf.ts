import type { Description, Name } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function backgroundOf<Context extends SerenityBDDReportContext>(name: Name, description: Description): (context: Context) => Context {
    return (context: Context): Context => {

        context.report.backgroundTitle = name.value;
        context.report.backgroundDescription = description.value;

        return context;
    }
}
