import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright';
import { Browser } from 'playwright';

export class Actors implements Cast {
    constructor(
        private readonly browser: Browser,
        private readonly options: PlaywrightOptions,
    ) {
    }

    prepare(actor: Actor): Actor {
        if (actor.name === `Adam who can't browse the web`) {
            return actor;
        }

        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, this.options),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
