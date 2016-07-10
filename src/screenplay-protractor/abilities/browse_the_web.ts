import { defer } from '../../serenity/recording/async';
import { Ability } from '../../serenity/screenplay/ability';
import { UsesAbilities } from '../../serenity/screenplay/actor';

export class BrowseTheWeb implements Ability {

    /**
     * Instantiates the Ability to PlayAnInstrument an Instrument, allowing the Actor to PerformASong
     *
     * @param browser
     * @return {BrowseTheWeb}
     */
    static using(browser: protractor.Protractor) {
        return new BrowseTheWeb(browser);
    }

    /**
     * Used to access the Actor's ability to BrowseTheWeb from within the Action classes, such as Click or Enter
     *
     * @param actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    findElement(locator: webdriver.Locator): protractor.ElementFinder {
        return this.browser.element(locator);
    }

    findElements(locator: webdriver.Locator): protractor.ElementArrayFinder {
        // fixme: this will only work when a single browser is used within a test
        return element.all(locator);
    }

    takeScreenshot(): Promise<String> {
        return defer(this.browser.takeScreenshot());
    }

    get(destination: string, timeout?: number): Promise<void> {
        return defer(browser.get(destination, timeout));
    }

    // todo: is this needed?
    usedBy<U extends UsesAbilities>(actor: U): BrowseTheWeb {
        return this;
    }

    constructor(private browser: protractor.Protractor) {
    }
}
