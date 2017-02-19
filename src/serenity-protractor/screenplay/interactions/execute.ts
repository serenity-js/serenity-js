import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Execute {
    static script = (...lines: string[]) => ({
        on: (target: Target): Interaction => new ExecuteScript(lines, target),
    })

    static asyncScript = (...lines: string[]) => ({
        on: (target: Target): ExecuteAsyncScript => new ExecuteAsyncScript(lines, target),
    })
}

class ExecuteScript implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeScript(this.lines.join('\n'), this.target);
    }

    constructor(private lines: string[], private target: Target) {
    }
}

export class ExecuteAsyncScript implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeAsyncScript(this.lines.join('\n'), this.target, ...this.args);
    }

    withArguments = (...args: any[]): Interaction => new ExecuteAsyncScript(this.lines, this.target, args);

    constructor(private lines: string[], private target: Target, private args: any[] = []) {
    }
}
