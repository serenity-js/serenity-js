import { Interaction } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

export class UseAngular {
    static disableSynchronisation(): Interaction {
        return Interaction.where(`#actor disables synchronisation with Angular`, actor =>
            BrowseTheWeb.as(actor).enableAngularSynchronisation(false).then(() => void 0));
    }

    static enableSynchronisation(): Interaction {
        return Interaction.where(`#actor enables synchronisation with Angular`, actor =>
            BrowseTheWeb.as(actor).enableAngularSynchronisation(true).then(() => void 0));
    }
}
