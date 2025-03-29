import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, ExtraBrowserContextOptions } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import * as playwright from 'playwright';

export class Actors implements Cast {
    constructor(
        private readonly browser: playwright.Browser,
        private readonly contextOptions: playwright.BrowserContextOptions,
        private readonly extraContextOptions: ExtraBrowserContextOptions,
    ) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, this.contextOptions, this.extraContextOptions),
            TakeNotes.usingAnEmptyNotepad(),
            CallAnApi.at(this.contextOptions.baseURL)
        );
    }
}
