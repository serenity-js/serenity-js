import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';

export class Actors {
    prepare(actor) {
        return actor.whoCan(
            BrowseTheWebWithWebdriverIO.using(browser)
        );
    }
}
