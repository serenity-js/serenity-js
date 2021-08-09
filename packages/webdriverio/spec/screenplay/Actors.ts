import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { Browser } from 'webdriverio';

import { BrowseTheWeb } from '../../src';

/*
 * NYC confuses WebdriverIO's ts-node loader (probably because it runs in a child process https://github.com/istanbuljs/nyc/issues/635)
 * Because of this, worker processes can't find 'webdriverio/async', which then leads to TypeScript complaining about the global "browser" being undefined.
 *
 * This type definition works around this problem.
 */
declare global {
    namespace NodeJS {      // eslint-disable-line @typescript-eslint/no-namespace
        interface Global {
            browser: Browser<'async'>
        }
    }
}

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(global.browser),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
