import { BrowseTheWeb } from '@serenity-js/webdriverio';

export class Actors {
    prepare(actor) {
        return actor.whoCan(
            BrowseTheWeb.using(browser)
        );
    }
}
