import { Actor, DressingRoom } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';

export class Actors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
        );
    }
}
