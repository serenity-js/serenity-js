import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Execute {
    static script       = (...lines: string[]) => new ExecuteScript(lines.join('\n'));
    static fn           = (fn: Function)       => new ExecuteScript(fn);
    static asyncScript  = (...lines: string[]) => new ExecuteAsyncScript(lines.join('\n'));
    static asyncFn      = (fn: Function)       => new ExecuteAsyncScript(fn);
}

export class ExecuteScript implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeScript(this.script, ...this.args);
    }

    on            = (target: Target) => new ExecuteScript(this.script, [target].concat(this.args));
    withArguments = (...args: any[]) => new ExecuteScript(this.script, this.args.concat(args));

    constructor(private readonly script: string | Function, private readonly args: any[] = []) {
    }
}

export class ExecuteAsyncScript implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeAsyncScript(this.script, ...this.args);
    }

    on            = (target: Target) => new ExecuteAsyncScript(this.script, [target].concat(this.args));
    withArguments = (...args: any[]) => new ExecuteAsyncScript(this.script, this.args.concat(args));

    constructor(private readonly script: string | Function, private args: any[] = []) {
    }
}
