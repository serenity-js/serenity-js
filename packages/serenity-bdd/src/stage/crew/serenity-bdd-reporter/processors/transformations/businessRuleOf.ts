import type { BusinessRule } from '@serenity-js/core/lib/model';

import { escapeHtml } from '../mappers';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function businessRuleOf<Context extends SerenityBDDReportContext>(rule: BusinessRule): (context: Context) => Context {
    return (context: Context): Context => {

        context.report.rule = {
            name: escapeHtml(rule.name.value),
            description: escapeHtml(rule.description.value),
        };

        return context;
    }
}
