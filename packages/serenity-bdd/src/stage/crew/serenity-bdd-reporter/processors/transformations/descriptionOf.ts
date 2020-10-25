import { Description } from '@serenity-js/core/lib/model';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function descriptionOf<Context extends SerenityBDDReportContext>(description: Description) {
    return (context: Context): Context => {

        context.report.description = description.value;

        return context;
    }
}
