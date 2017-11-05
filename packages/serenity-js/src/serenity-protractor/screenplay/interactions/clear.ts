import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Clear implements Interaction {

    static theValueOf = (field: Target): Interaction => new Clear(field);

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).clear();
    }

    constructor(private target: Target) {
    }

    toString = () => `#actor clears ${this.target}`;
}
