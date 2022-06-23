import { Actor, Cast, Duration, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Browser } from 'playwright';

export class Actors implements Cast {
    constructor(
        private readonly browser: Browser,
        private readonly baseURL: string,
    ) {
    }

    prepare(actor: Actor): Actor {
        if (actor.name === `Adam who can't browse the web`) {
            return actor;
        }

        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, {
                baseURL:                    this.baseURL,
                defaultNavigationTimeout:   Duration.ofSeconds(2).inMilliseconds(),
                defaultTimeout:             Duration.ofSeconds(2).inMilliseconds(),
            }),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
