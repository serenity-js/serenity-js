import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithProtractor } from '@serenity-js/protractor';
import { protractor } from 'protractor';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        if (actor.name === `Adam who can't browse the web`) {
            return actor;
        }

        return actor.whoCan(
            BrowseTheWebWithProtractor.using(protractor.browser),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
