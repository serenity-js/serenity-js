import { Actor, Cast } from '@serenity-js/core';
import { BrowseTheWebWithProtractor } from '@serenity-js/protractor';
import { protractor } from 'protractor';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithProtractor.using(protractor.browser),
        );
    }
}
