import { Name } from '@serenity-js/core/lib/model';

import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function testRunnerCalled<Context extends SerenityBDDReportContext>(name: Name): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.testSource = name.value;

        return context;
    }
}
