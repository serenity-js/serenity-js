import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../../abilities';
import { ExecuteScriptWithArguments } from './ExecuteScriptWithArguments';

/**
 * @package
 */
export class ExecuteAsynchronousScript extends ExecuteScriptWithArguments {
    withArguments(...args: Array<Answerable<any>>): Interaction {
        return new ExecuteAsynchronousScript(this.script, args);
    }

    protected executeAs(actor: UsesAbilities & AnswersQuestions, args: any[]): Promise<any> {
        return BrowseTheWeb.as(actor).executeAsyncScript(this.script, ...args);
    }

    toString(): string {
        return this.args.length > 0
            ? formatted `#actor executes an asynchronous script with arguments: ${ this.args }`
            : `#actor executes an asynchronous script`;
    }
}
