import { BusinessRule, Description, Name } from '@serenity-js/core/lib/model';
import { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function businessRuleOf<Context extends SerenityBDDReportContext>(rule: BusinessRule) {
    return (context: Context): Context => {

        context.report.rule = rule.name.value;

        // todo: Serenity BDD v. 2.3.10 doesn't support business rule descriptions yet
        //  context.report.?? = rule.description.value;

        return context;
    }
}
