import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithWebdriverIO.using(browser)
        );
    }
}
