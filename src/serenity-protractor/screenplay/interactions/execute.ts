import { Interaction, UsesAbilities } from '../../../serenity/screenplay';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Execute {
    static theScript(script: string) {
        return { on: (target: Target): Interaction => new ExecuteScript(script, target) };
    }
}

class ExecuteScript implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).executeScript(this.script, this.target);
    }

    constructor(private script: string, private target: Target) {
    }
}
