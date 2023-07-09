import { Actor, Cast } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright';
import * as playwright from 'playwright-core';

import { server } from './server';

export class ActorsWithLocalServer extends Cast {
    constructor(private readonly page: playwright.Page, private readonly contextOptions: PlaywrightOptions) {
        super();
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            ManageALocalServer.runningAHttpListener(server),
            BrowseTheWebWithPlaywright.usingPage(this.page, {
                userAgent: `${ actor.name }`,
                ...this.contextOptions,
            }),
        );
    }
}
