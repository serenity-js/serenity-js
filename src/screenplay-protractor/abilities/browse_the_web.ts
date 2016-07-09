import { defer } from '../../serenity/recording/async';
import { Ability } from '../../serenity/screenplay/ability';
import { PerformsTasks, UsesAbilities } from '../../serenity/screenplay/actor';

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
    static as(actor: UsesAbilities & PerformsTasks): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    findElement(locator: webdriver.Locator): protractor.ElementFinder {
        return this.browser.element(locator);
    }

    findElements(locator: webdriver.Locator): protractor.ElementArrayFinder {
        return element.all(locator);
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
