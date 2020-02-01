import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
        );
    }
}
