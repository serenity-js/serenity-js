import { BusinessRule, Description, Name } from '@serenity-js/core/lib/model';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function businessRuleOf<Context extends SerenityBDDReportContext>(rule: BusinessRule) {
    return (context: Context): Context => {

        context.report.rule = {
            name: rule.name.value,
            description: rule.description.value,
        };

        return context;
    }
}
