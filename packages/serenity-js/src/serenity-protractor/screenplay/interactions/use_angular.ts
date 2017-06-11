import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { BrowseTheWeb } from '../abilities/browse_the_web';

export class UseAngular {
    static disableSynchronisation = (): Interaction => new EnableAngularSynchronisation(false);
    static enableSynchronisation  = (): Interaction => new EnableAngularSynchronisation(true);
}

class EnableAngularSynchronisation implements Interaction {
    performAs(actor: UsesAbilities): PromiseLike<any> {
        return BrowseTheWeb.as(actor).enableAngularSynchronisation(this.enable);
    }

    constructor(private enable: boolean) {
    }
}
