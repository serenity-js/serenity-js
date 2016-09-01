import { defer } from '../../../serenity/recording/async';
import { Ability, UsesAbilities } from '../../../serenity/screenplay';
import { Target } from '../ui/target';

import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';

import * as webdriver from 'selenium-webdriver';

export class BrowseTheWeb implements Ability {

    private actor: UsesAbilities;

    /**
     * Instantiates the Ability to PlayAnInstrument an Instrument, allowing the Actor to PerformASong
     *
     * @param browser
     * @return {BrowseTheWeb}
     */
    static using(browser: ProtractorBrowser) {
        return new BrowseTheWeb(browser);
    }

    /**
     * Used to access the Actor's ability to BrowseTheWeb from within the Interaction classes, such as Click or Enter
     *
     * @param actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    locate(target: Target): ElementFinder {
        return target.resolveUsing(this.browser.element);
    }

    locateAll(target: Target): ElementArrayFinder {
        return target.resolveAllUsing(<any> this.browser.element);      // see: https://github.com/angular/protractor/issues/3350
    }

    takeScreenshot(): Promise<String> {
        return defer(() => this.browser.takeScreenshot());
    }

    get(destination: string, timeout?: number): PromiseLike<void> {
        return this.browser.get(destination, timeout);
    }

    manage(): webdriver.WebDriverOptions {
        return this.browser.driver.manage();
    }

    // todo: is this needed?
    usedBy<U extends UsesAbilities>(actor: U): BrowseTheWeb {
        this.actor = actor;

        return this;
    }

    constructor(private browser: ProtractorBrowser) {
    }
}
