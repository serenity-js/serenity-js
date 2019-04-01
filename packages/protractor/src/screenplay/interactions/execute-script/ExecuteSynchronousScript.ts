import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { BrowseTheWeb } from '../../abilities';
import { ExecuteScriptWithArguments } from './ExecuteScriptWithArguments';

/**
 * @package
 */
export class ExecuteSynchronousScript extends ExecuteScriptWithArguments {

    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteSynchronousScript(this.script, args);
    }

    protected executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        return BrowseTheWeb.as(actor).executeScript(this.toString(), this.script, ...args);
    }

    toString(): string {
        return this.args.length > 0
            ? formatted `#actor executes a synchronous script with arguments: ${ this.args }`
            : `#actor executes a synchronous script`;
    }
}
