import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Evaluate implements Interaction {
    static script = (script: string) => ({
        on: (target: Target) => new Evaluate(script, target),
    })

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return (BrowseTheWeb.as(actor).locate(this.target).evaluate(this.script) as PromiseLike<any>);
    }

    constructor(private script: string, private target: Target) {
    }
}
