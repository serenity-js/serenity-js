import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Target } from '../ui/target';

export class Scroll implements Interaction {

    public static to(target: Target): Scroll {
        return new Scroll(target);
    }

    performAs(actor: UsesAbilities): PromiseLike<void> {
        const browseTheWeb = BrowseTheWeb.as(actor);

        return browseTheWeb.actions().mouseMove(browseTheWeb.locate(this.target)).perform();
    }

    constructor(private target: Target) { }

    toString = () => `#actor scrolls to ${this.target}`;
}
