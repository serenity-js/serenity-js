import type { Name } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function testRunnerCalled<Context extends SerenityBDDReportContext>(name: Name): (context: Context) => Context {
    return (context: Context): Context => {
        context.report.testSource = name.value === 'Cucumber' ? name.value : 'JS';

        return context;
    }
}