import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { keyNameOf } from '../../keys';
import { BrowseTheWeb } from '../abilities';
import { Target } from '../ui/target';

export class Hit {
    static the = (key: string) => ({
        into: (target: Target): Interaction => new HitKeyIntoTarget(target, key),
    })
}

class HitKeyIntoTarget implements Interaction {

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).locate(this.target).sendKeys(this.key);
    }

    constructor(private target: Target, private key: string) {}

    toString = () => `#actor hits the ${keyNameOf(this.key)} key`;
}
