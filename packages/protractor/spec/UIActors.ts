import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../src/screenplay/abilities';

export class UIActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
            TakeNotes.usingAnEmptyNotepad());
    }
}
