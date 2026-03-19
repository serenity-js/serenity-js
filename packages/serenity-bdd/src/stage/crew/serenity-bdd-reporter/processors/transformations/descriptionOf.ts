import type { Description } from '@serenity-js/core/model';

import { escapeHtml } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function descriptionOf<Context extends SerenityBDDReportContext>(description: Description): (context: Context) => Context {
    return (context: Context): Context => {

        context.report.description = escapeHtml(description.value);

        return context;
    }
}
