import type { BusinessRule } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function businessRuleOf<Context extends SerenityBDDReportContext>(rule: BusinessRule): (context: Context) => Context {
    return (context: Context): Context => {

        context.report.rule = {
            name: rule.name.value,
            description: rule.description.value,
        };

        return context;
    }
}
