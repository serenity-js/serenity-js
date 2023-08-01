import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
import { browser } from '@wdio/globals';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        if (actor.name === `Adam who can't browse the web`) {
            return actor;
        }

        return actor.whoCan(
            BrowseTheWebWithWebdriverIO.using(browser),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
