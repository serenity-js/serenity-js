import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/webdriverio';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(browser),
        );
    }
}
