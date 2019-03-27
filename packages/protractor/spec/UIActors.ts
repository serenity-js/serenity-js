import { Actor, DressingRoom } from '@serenity-js/core';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../src/screenplay/abilities';

export class UIActors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor.whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
