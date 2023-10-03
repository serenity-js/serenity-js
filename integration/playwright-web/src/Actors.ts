import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import * as playwright from 'playwright-core';

export class Actors implements Cast {
    constructor(
        private readonly browser: playwright.Browser,
        private readonly options: PlaywrightOptions,
    ) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, this.options),
            TakeNotes.usingAnEmptyNotepad(),
            CallAnApi.at(this.options.baseURL)
        );
    }
}
